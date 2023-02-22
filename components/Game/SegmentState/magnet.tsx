import React, { useRef, useEffect, useState } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Provider, useSelector, useDispatch } from "react-redux";

import styles from "../styles.module.css";
import useMeasure from "react-use-measure";
import { useTrail, animated } from "@react-spring/web";
import dynamic from "next/dynamic";
import CloneVideo from "../CloneVideo";
import useMousePosition from "./useMousePosition";
import { useWindowSize } from "usehooks-ts";
// const trans = (x: number, y: number) => `translate3d(${x}px,${y}px,0) translate3d(-50%,-50%,0)`;
const trans = (x: number, y: number) => `translate3d(${x}px,${y}px,0) translate3d(-50%,-50%,0)`;

interface Props {
    i: number;
    videoId: string;
    auth: boolean;
    peerxy: { peerx: number; peery: number } | undefined;
    dataChannel: RTCDataChannel | undefined;
    segmentState: string;
}

let mpx: number;
let mpy: number;
const [widthOx, heightOx] = [640 / 3, 480 / 3];
export default function magnet({ i, auth, videoId, peerxy, dataChannel, segmentState }: Props) {
    //퍼즐 데이터 스토어와 연결 react-redux
    const dispatch = useDispatch();
    const storedPosition = useSelector((state: any) => {
        return auth ? state.myPuzzle : state.peerPuzzle;
    });

    const [mPosition, setmPosition] = useState({
        clientX: 0,
        clientY: 0,
    });
    var memo = useRef({ x: 0, y: 0 })

    const [ref, { left, top }] = useMeasure();
    const [trail, api] = useTrail(1, () => ({
        x: storedPosition[i][0],
        y: storedPosition[i][1],
        xy: [0, 0],
        config: { mass: 5, tension: 300, friction: 40 },
    }));
    const { width, height } = useWindowSize();
    const mousePosition = useMousePosition();

    useEffect(() => {
        //   //유저가 움직일 때 마우스 포인터에 따라 아직 맞춰지지 않은 퍼즐이 움직이도록 설정
        if (!auth) return;
        mpx = Math.min(mousePosition.clientX - left, width / 6);
        mpx = Math.max(mpx, -left);

        mpy = Math.max(mousePosition.clientY - top, top);
        mpy = Math.min(mpy, height);
        memo.current = { x: mpx, y: mpy }
        console.log(memo.current.x, memo.current.y)
        setmPosition({ clientX: mpx, clientY: mpy });
        api.start({ xy: [mpx, mpy], delay: 0 });

        if (dataChannel) {
            dataChannel.send(
                JSON.stringify({
                    type: "magnet",
                    i: i,
                    xy: [mpx, mpy],
                    auth: auth, //움직이는 사람이 auth를 보내니까 true
                })
            );
        }
        return () => { };
    }, [mousePosition]);


    //상대방쪽은 위에서 발생시킨 이벤트를 받아서 똑같이 그려줘야 함
    //상대가 발생시킨 이벤트를 받아서 그대로 원래 useDrag에서 실행하던 것처럼 실행
    useEffect(() => {
        if (dataChannel) {
            dataChannel!.addEventListener("message", function magnet(event: MessageEvent<any>) {
                if (event.data) {
                    let dataJSON = JSON.parse(event.data);
                    switch (dataJSON.type) {
                        case "magnet":
                            if (i === dataJSON.i && auth === !dataJSON.auth) { //상대방이 움직이는 퍼즐인 경우만 움직여야하고 auth==false 이므로 auth!=dataJSON.auth
                                api.start({ xy: dataJSON.xy, delay: 0 });
                                dispatch({ type: `${!auth ? "peerPuzzle" : "myPuzzle"}/setPosition`, payload: { index: i, position: [dataJSON.xy[0] - widthOx / 2, dataJSON.xy[1] - heightOx / 2] } });
                            }
                            break;
                    }
                }
            });
        }

    }, []);
    useEffect(() => {
        return () => {
            if (dataChannel) {
                dataChannel.send(
                    JSON.stringify({
                        type: "magnet",
                        i: i,
                        xy: [mpx, mpy],
                        auth: auth, //움직이는 사람이 auth를 보내니까 true
                    })
                );
            }
            dispatch({ type: `${!auth ? "peerPuzzle" : "myPuzzle"}/setPosition`, payload: { index: i, position: [memo.current.x - widthOx / 2, memo.current.y - heightOx / 2] } });
        }
    }, [])

    return (
        <div>
            <div className={styles.container}>
                {trail.map((props, index) => (
                    <animated.div
                        ref={ref}
                        key={index}
                        className={styles.card}
                        style={{
                            zIndex: 100,
                            transform: props.xy.to(trans),
                        }}
                    >
                        <animated.div>
                            <CloneVideo key={i} id={i} auth={auth} videoId={videoId} segmentState={segmentState} />
                        </animated.div>
                    </animated.div>
                ))}
            </div>
        </div>
    );
}