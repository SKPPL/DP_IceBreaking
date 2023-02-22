import React, { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "../styles.module.css";
import useMeasure from "react-use-measure";
import { useTrail, animated } from "@react-spring/web";
import dynamic from "next/dynamic";
import CloneVideo from "../CloneVideo";
import useMousePosition from "./useMousePosition";
import { useWindowSize } from "usehooks-ts";
// const trans = (x: number, y: number) => `translate3d(${x}px,${y}px,0) translate3d(-50%,-50%,0)`;
const trans = (x: number, y: number) => `translate3d(${x}px,${y}px,0) translate3d(-50%,-50%,0)`;
import { myWaitState, peerWaitState } from "../atom";
import { useSetRecoilState } from "recoil";
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
let dataTransferCount = 0;
const [widthOx, heightOx] = [640 / 3, 480 / 3];
export default function magnet({ i, auth, videoId, peerxy, dataChannel, segmentState }: Props) {
    //퍼즐 데이터 스토어와 연결 react-redux
    const dispatch = useDispatch();
    const storedPosition = useSelector((state: any) => {
        return auth ? state.myPuzzle : state.peerPuzzle;
    });
    //마우스포인터가 카드의 left, top을 가리킴
    const [ref, { left, top }] = useMeasure();
    //마우스 포인터를 따라 카드 이동, 카드의 초기위치는 저장된 카드 위치
    const [trail, api] = useTrail(1, () => ({
        x: storedPosition[i][0],
        y: storedPosition[i][1],
        xy: [0, 0],
        config: { mass: 7, tension: 200, friction: 40 },
    }));
    //카드 이동 범위를 지정하기위해 사용
    const { width, height } = useWindowSize();
    //현재 마우스 포인터 위치 계산
    const mousePosition = useMousePosition();
    const setMyWait = useSetRecoilState(myWaitState)
    const setPeerWait = useSetRecoilState(peerWaitState)
    useEffect(() => {
        if (!auth) return;
        dataTransferCount += 1;
        if (dataTransferCount < 100 || dataTransferCount % 20 === 0) {
            //나의 범위 안에서 카드가 움직이도록 설정
            mpx = Math.min(mousePosition.clientX - left, width / 6);
            mpx = Math.max(mpx, -left);
            mpy = Math.max(mousePosition.clientY - top, top);
            mpy = Math.min(mpy, height);
            //useTail을 사용하여 마우스 움직임
            api.start({ xy: [mpx, mpy], delay: 0 });
            //나의 움직임을 상대방에게 그리기 위해 정보전달
            if (dataChannel) {
                dataChannel.send(JSON.stringify({ type: "move", i: i, peerx: mpx, peery: mpy }));
                console.log(1)
                dataChannel.send(
                    JSON.stringify({
                        type: "magnet",
                        i: i,
                        xy: [mpx, mpy],
                    })
                );
            }
            dispatch({
                type: `${auth ? "myPuzzle" : "peerPuzzle"}/setPosition`,
                payload: { index: i, position: [mpx - widthOx / 2, mpy - heightOx / 2] },
            });
        }
        return () => { };
    }, [mousePosition]);
    //상대방쪽은 위에서 발생시킨 이벤트를 받아서 똑같이 그려줘야 함
    useEffect(() => {
        if (dataChannel) {
            dataChannel!.addEventListener("message", function magnet(event: MessageEvent<any>) {
                if (event.data) {
                    let dataJSON = JSON.parse(event.data);
                    switch (dataJSON.type) {
                        case "magnet":
                            if (i !== dataJSON.i || auth === !dataJSON.auth) return;
                            // console.log("상대방 위치 드로잉 : ", dataJSON.xy, dataJSON.xy[0], dataJSON.xy[1]);
                            //상대방에게 전송받은 마우스포인터로 상대방 위치 드로잉
                            api.start({ xy: dataJSON.xy, delay: 0 });
                            //상대방이 이동한 위치를 계속 store에 저장 -> 마지막에 해당자리에 카드를 두기 위해 사용
                            dispatch({
                                type: `${auth ? "myPuzzle" : "peerPuzzle"}/setPosition`,
                                payload: { index: i, position: [dataJSON.xy[0] - widthOx / 2, dataJSON.xy[1] - heightOx / 2] },
                            });
                            break;
                    }
                }
            });
        }
    }, []);
    useEffect(() => {
        return () => {
            auth ? setMyWait(false) : setPeerWait(false);
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