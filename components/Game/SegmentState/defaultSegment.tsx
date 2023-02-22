import React, { useRef, useEffect, useState, memo } from "react";
import { useSpring, animated, to } from "@react-spring/web";
import { useDrag, useGesture } from "react-use-gesture";
import { Provider, useSelector, useDispatch } from "react-redux";
import itemStore from "@/components/Game/store";
import { useRouter } from "next/router";
import styles from "../styles.module.css";
import CloneVideo from "../CloneVideo";
import { useIsMounted } from "usehooks-ts";
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const calcX = (y: number, ly: number) => -(y - ly - window.innerHeight / 2) / 20;
const calcY = (x: number, lx: number) => (x - lx - window.innerWidth / 2) / 20;

interface Props {
    i: number;
    videoId: string;
    auth: boolean;
    peerxy: { peerx: number; peery: number } | undefined;
    dataChannel: RTCDataChannel | undefined;
    segmentState: string;
}

function DefaultSegment({ i, auth, videoId, peerxy, dataChannel, segmentState }: Props) {

    //퍼즐 데이터 스토어와 연결 react-redux
    const dispatch = useDispatch();
    const storedPosition = useSelector((state: any) => {
        return auth ? state.myPuzzle : state.peerPuzzle;
    });
    const [isRightPlace, setIsRightPlace] = useState(false);
    //아래 조건문 위로 올리면 안됨
    if (segmentState === "ice") {
        auth = false;
    }
    const [zindex, setZindex] = useState(Math.floor(Math.random() * 10));
    // const videoElement = document.getElementById(videoId) as HTMLVideoElement;
    // const [width, height] = [videoElement.videoWidth / 3 * (i % 3), videoElement.videoHeight / 3 * ((i - i % 3) / 3)]
    const d = 1;
    // 현재 좌표 받아와서 퍼즐을 끼워맞출 곳을 보정해줄 값을 widthOx, heightOx에 저장
    const [widthOx, heightOx] = [(640 / 3) * d, (480 / 3) * d];
    const [width, height] = [(640 / 3) * (i % 3) - widthOx * 1.5, (480 / 3) * ((i - (i % 3)) / 3) + heightOx];

    // TODO : 옆으로 init 시 api.start 이동

    useEffect(() => {
        const preventDefault = (e: Event) => e.preventDefault();
        document.addEventListener("gesturestart", preventDefault);
        document.addEventListener("gesturechange", preventDefault);
        return () => {
            document.removeEventListener("gesturestart", preventDefault);
            document.removeEventListener("gesturechange", preventDefault);
        };
    }, []);
    
    const domTarget = useRef<HTMLDivElement>(null);
    const [{ x, y, rotateX, rotateY, rotateZ, zoom, scale }, api] = useSpring(() => {
        return {
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            scale: 1,
            zoom: 0,
            x: storedPosition[i][0], // 초기 기준 좌표를 말하는 것 같음, offset은 상관없는듯
            y: storedPosition[i][1],
            config: { mass: 2, tension: 750, friction: 50 },
        };
    });

    useEffect(() => {
        if (peerxy !== undefined) {
            dispatch({ type: `${peerxy ? "peerPuzzle" : "myPuzzle"}/setPosition`, payload: { index: i, position: [peerxy.peerx, peerxy.peery] } });
            api.start({ x: peerxy.peerx, y: peerxy.peery, rotateX: 0, rotateY: 0 });
        }
    }, [peerxy]);


    //for bounding puzzle peace to board / 움직임에 관한 모든 컨트롤은 여기서
    const bindBoardPos = useDrag(
        (params) => {
            if (isRightPlace) return;
            if (!auth) return;
            // 저장된 좌표에 마우스의 움직임을 더해줌
            x.set(storedPosition[i][0] + params.offset[0]);
            y.set(storedPosition[i][1] + params.offset[1]);
            // !params.down : 마우스를 떼는 순간
            if (!params.down) {
                // 마우스를 떼는 순간에 좌표+offset한 값을 저장
                dispatch({ type: `${!auth ? "peerPuzzle" : "myPuzzle"}/setPosition`, payload: { index: i, position: [storedPosition[i][0] + params.offset[0], storedPosition[i][1] + params.offset[1]] } });
                //마우스 떼면 offset 아예 초기화
                params.offset[0] = 0;
                params.offset[1] = 0;
            }

            //알맞은 위치에 놓았을 때
            if (!params.down && !isRightPlace && isNearOutline(x.get(), y.get(), width, height)) {
                domTarget.current!.setAttribute("style", "z-index: 0");
                api.start({ x: width, y: height });
                setIsRightPlace(true);
                if (dataChannel) dataChannel.send(JSON.stringify({ type: "cnt", isRightPlace : true, i: i }));
                dispatch({ type: "puzzleComplete/plus_mine" });
                setZindex(0);
                dispatch({ type: `${auth ? "myPuzzle" : "peerPuzzle"}/${i}`, payload: { x: width, y: height } });
                if (dataChannel?.readyState === "open") {
                    dataChannel.send(JSON.stringify({ type: "move", i: i, peerx: width, peery: height }));
                    return;
                }
            }
            // 알맞은 위치에 놓지 않더라도 아무튼 좌표 보냄
            if (dataChannel?.readyState === "open") {
                dataChannel.send(JSON.stringify({ type: "move", i: i, peerx: x.get(), peery: y.get() }));
            }
        },
        {
            bounds: { top: 0 - storedPosition[i][1], bottom: heightOx * 4 - storedPosition[i][1], left: -widthOx * 2 - storedPosition[i][0], right: widthOx * 1 - storedPosition[i][0] },
            rubberband: 0.8,
        }
    );


    //useGesture는 움직임의 디테일을 위해서 있음
    useGesture(
        {
            onDrag: ({ active }) => {
                if (isRightPlace) return;
                api.start({ rotateX: 0, rotateY: 0, scale: active ? 1 : 1.05 });

            },
            onMove: ({ xy: [px, py], dragging }) => {
                !dragging &&
                    api.start({
                        rotateX: calcX(py, y.get()),
                        rotateY: calcY(px, x.get()),
                        scale: 1.05,
                    });
            },
            onHover: ({ hovering }) => !hovering && api.start({ rotateX: 0, rotateY: 0, scale: 1 }),

        },
        { domTarget, eventOptions: { passive: false } }
    );
    


    return (
        <>
            <div className="">
                <div className={styles.container}>
                        <animated.div
                            ref={domTarget}
                            className={isRightPlace?`${styles.rightCard}`:`${styles.card}`}
                            {...bindBoardPos()}
                            style={{
                                transform: "perspective(600px)",
                                x,
                                y,
                                scale: to([scale, zoom], (s, z) => s + z),
                                rotateX,
                                rotateY,
                                rotateZ,
                                zIndex: zindex,
                            }}
                        >
                            <animated.div>
                                <CloneVideo key={i} id={i} auth={auth} videoId={videoId} segmentState={segmentState} />
                            </animated.div>
                        </animated.div>
                    </div>
            </div>
        </>
    );
}

export function isNearOutline(x: number, y: number, positionx: number, positiony: number) {
    const diff = 30;
    if (x > positionx - diff && x < positionx + diff && y > positiony - diff && y < positiony + diff) {
        return true;
    } else return false;
}

export default memo(DefaultSegment);
