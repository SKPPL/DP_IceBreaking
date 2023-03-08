import React, { useRef, useEffect, useState, memo, useCallback } from "react";
import { useSpring, animated, to } from "@react-spring/web";
import { useDrag, useGesture } from "@use-gesture/react";
import { useSelector, useDispatch } from "react-redux";
import styles from "../styles.module.css";
import CloneVideo from "../VideoDivide/CloneVideo";
import useSound from 'use-sound';
import { useRecoilValue, useSetRecoilState } from "recoil";
import { myWaitState, peerWaitState, myItemState, peerItemState } from "../atom";
import LipVideo from "../VideoDivide/LipVideo";
import TwirlVideo from "@/components/Game/VideoDivide/TwirlVideo";

const calcX = (y: number, ly: number) => -(y - ly - window.innerHeight / 2) / 20;
const calcY = (x: number, lx: number) => (x - lx - window.innerWidth / 2) / 20;
const puzzleSoundUrl = '/sounds/puzzleHit.mp3';

let isStart = true;
let myPuzzleRight = [false, false, false, false, false, false, false, false, false];
let isDataIn = [false, false, false, false, false, false, false, false, false];

interface Props {
    i: number;
    videoId: string;
    auth: boolean;
    peerxy: { peerx: number; peery: number; } | undefined;
    dataChannel: RTCDataChannel | undefined;
    segmentState: string;
    isRightCard: boolean;
}

function DefaultSegment({ i, auth, videoId, peerxy, dataChannel, segmentState, isRightCard }: Props) {
    //퍼즐 데이터 스토어와 연결 react-redux
    const dispatch = useDispatch();
    const storedPosition = useSelector((state: any) => {
        return auth ? state.myPuzzle : state.peerPuzzle;
    });
    const isRight = useSelector((state: any) => {
        return state.defaultSegmentRightPlace[i];
    });
    myPuzzleRight[i] = isRight;
    //아래 조건문 위로 올리면 안됨
    const arr = useSelector((state: any) => state.puzzleOrder);
    const arr2 = useSelector((state: any) => state.puzzleOrder2);
    const firstlocation = [arr[0] * 50 - 50, arr[1] * 50 - 100, arr[2] * 50 - 150, arr[3] * 50 - 200, arr[4] * 50 - 250, arr[5] * 50 - 300, arr[6] * 50 - 350, arr[7] * 50 - 400, arr[8] * 50 - 450];
    const firstlocation2 = [arr2[0] * 50 - 50, arr2[1] * 50 - 100, arr2[2] * 50 - 150, arr2[3] * 50 - 200, arr2[4] * 50 - 250, arr2[5] * 50 - 300, arr2[6] * 50 - 350, arr2[7] * 50 - 400, arr2[8] * 50 - 450];

    const [zindex, setZindex] = useState(auth ? arr[i] : arr2[i]);

    
    const d = 1;
    // 현재 좌표 받아와서 퍼즐을 끼워맞출 곳을 보정해줄 값을 widthOx, heightOx에 저장
    const [widthOx, heightOx] = [(640 / 3) * d, (480 / 3) * d];
    const [width, height] = [(640 / 3) * (i % 3) - widthOx * 1.5, (480 / 3) * ((i - (i % 3)) / 3) + heightOx - 60];
    const [puzzleSoundPlay] = useSound(puzzleSoundUrl);
    
    // TODO : 옆으로 init 시 api.start 이동
    
    //ice 관련

    const iceCrackSoundUrl = "/sounds/can.wav";
    const [iceCount, setIceCount] = useState((isRight && auth) || (isRightCard && !auth) ? 0 : 4);
    const [iceCrackSoundPlay] = useSound(iceCrackSoundUrl, { playbackRate: 1 });

    const breakTheIce = () => {
        if (!auth) return;
        if (segmentState !== "ice") return;
        if (iceCount > 0) {
            if (dataChannel) dataChannel.send(JSON.stringify({ type: "ice", i: i, auth: auth, iceCount: iceCount - 1 }));
            setIceCount(iceCount - 1);
            iceCrackSoundPlay();
        }
    }

    //ice EventListener 추가와 제거 
    useEffect(() => {
        const ice = (event: MessageEvent<any>) => {
            if (event.data) {
                let dataJSON = JSON.parse(event.data);
                switch (dataJSON.type) {
                    case "ice":
                        if (i === dataJSON.i && auth !== dataJSON.auth) {
                            setIceCount(dataJSON.iceCount);
                            // console.log(iceCount, dataJSON.iceCount, '왜 실행안해')
                            iceCrackSoundPlay();
                        }
                        break;
                }
            }
        };
        if (dataChannel) {
            dataChannel!.addEventListener("message", ice);
        }
        return () => {
            if (dataChannel) {
                dataChannel!.removeEventListener("message", ice);
            }
        };
    }, []);

    useEffect(() => {
        if ((isRight && auth) || (isRightCard && !auth)) {
            setZindex(0);
        }
        const preventDefault = (e: Event) => e.preventDefault();
        document.addEventListener("gesturestart", preventDefault);
        document.addEventListener("gesturechange", preventDefault);
        return () => {
            document.removeEventListener("gesturestart", preventDefault);
            document.removeEventListener("gesturechange", preventDefault);
        };
    }, []);

    const target = useRef<HTMLDivElement>(null);
    const [{ x, y, rotateX, rotateY, rotateZ, zoom, scale }, api] = useSpring(() => {
        return {
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            scale: 1,
            zoom: 0,
            x: (auth && isRight) || (!auth && isRightCard) ? width : storedPosition[i][0], // 초기 기준 좌표를 말하는 것 같음, offset은 상관없는듯
            y: (auth && isRight) || (!auth && isRightCard) ? height : storedPosition[i][1],
            config: { mass: 2, tension: 750, friction: 30 },
        };
    });

    useEffect(() => {
        if (peerxy !== undefined) {
            if (isRightCard) {
                api.start({ x: width, y: height, rotateX: 0, rotateY: 0 });
                setZindex(0);
                setIceCount(0);
            } else {
                api.start({ x: peerxy.peerx, y: peerxy.peery, rotateX: 0, rotateY: 0 });
            }
        }
    }, [peerxy]);

    const positionDataSend = useCallback(() => {
        if (dataChannel?.readyState === "open") {
            dataChannel.send(JSON.stringify({ type: "move", i: i, peerx: x.get(), peery: y.get() }));
        }
    }, [dataChannel]);

    //for bounding puzzle peace to board / 움직임에 관한 모든 컨트롤은 여기서

    useDrag(
        (params) => {
            if (!auth) return;
            if (isRight) return;
            if (segmentState === "ice" && iceCount > 0) {
                params.offset[0] = 0;
                params.offset[1] = 0;
                return;
            }
            x.set(storedPosition[i][0] + params.offset[0]);
            y.set(storedPosition[i][1] + params.offset[1]);
            setZindex(10);
            // !params.down : 마우스를 떼는 순간
            if (!params.down) {
                //알맞은 위치에 놓았을 때
                if (isNearOutline(x.get(), y.get(), width, height)) {
                    target.current!.setAttribute("style", "z-index: 0");
                    api.start({ x: width, y: height });
                    myPuzzleRight[i] = true;
                    dispatch({ type: `defaultSegmentRightPlace/setRight`, payload: { index: i, isRight: true } });
                    puzzleSoundPlay();
                    if (dataChannel) dataChannel.send(JSON.stringify({ type: "cnt", isRightPlace: true, i: i }));
                    dispatch({ type: "puzzleComplete/plus_mine" });
                    setZindex(0);
                    setIceCount(0);
                    dispatch({
                        type: `${auth ? "myPuzzle" : "peerPuzzle"}/setPosition`,
                        payload: { index: i, position: [width, height] },
                    });
                    if (dataChannel?.readyState === "open") {
                        dataChannel.send(JSON.stringify({ type: "move", i: i, peerx: width, peery: height }));
                        return;
                    }
                } else {
                    dispatch({
                        type: `${auth ? "myPuzzle" : "peerPuzzle"}/setPosition`,
                        payload: { index: i, position: [storedPosition[i][0] + params.offset[0], storedPosition[i][1] + params.offset[1]] },
                    });
                }
                positionDataSend();
                //마우스 떼면 offset 아예 초기화
                params.offset[0] = 0;
                params.offset[1] = 0;
                setZindex(auth ? arr[i] : arr2[i]);
                // 마우스를 떼는 순간에는 무조건 좌표+offset한 값을 저장하고 데이터를 보냄
            }

            if (!isDataIn[i]) {
                isDataIn[i] = true;
                setTimeout(function noName() {
                    if (myPuzzleRight[i]) return;
                    positionDataSend();
                    isDataIn[i] = false;
                }, 16);
            }
        },
        {
            target,
            bounds: {
                top: 0 - storedPosition[i][1],
                bottom: heightOx * 4 - storedPosition[i][1],
                left: -widthOx * 2 - storedPosition[i][0],
                right: widthOx * 1 - storedPosition[i][0],
            },
            rubberband: 0.8,
            delay: true,
            pointer: { capture: true },
        }
    );

    const memo = useRef({ x: storedPosition[i][0], y: storedPosition[i][1], cnt: 0 }); // 이름은 memo인데 useRef해서 ㅈㅅ

    //useGesture는 움직임의 디테일을 위해서 있음
    useGesture(
        {
            // onDrag: (active) => {
            //     api.start({ rotateX: 0, rotateY: 0, scale: active ? 1 : 1.03 });
            // },
            onMove: ({ xy: [px, py], dragging, down }) => {
                !dragging &&
                    api.start({
                        rotateX: calcX(py, y.get()),
                        rotateY: calcY(px, x.get()),
                        scale: 1.03,
                    });
            },
            onHover: (params) => {
                !params.hovering && api.start({ rotateX: 0, rotateY: 0, scale: 1 });
            },

        },
        { target, eventOptions: { passive: false }, }
    );



    const setMyWait = useSetRecoilState(myWaitState);
    const setPeerWait = useSetRecoilState(peerWaitState);

    useEffect(() => {
        if (isStart) {
            if (auth) {
                setTimeout(() => {
                    const tmpx = x.get() + firstlocation[i];
                    memo.current.x = tmpx;
                    api.start({ x: tmpx });
                }, 5000);
            }
            else {
                setTimeout(() => {
                    const tmpx = x.get() + firstlocation2[i];
                    memo.current.x = tmpx;
                    api.start({ x: tmpx });
                }, 5000);
            }
            setTimeout(() => {
                const tmpy = y.get() + 90;
                memo.current.y = tmpy;
                api.start({ y: tmpy });
            }, 5300);
            setTimeout(() => isStart = false, 1000);
        }
        return () => {
            // unmount될 떄, 즉 아이템을 써서 segmentState가 변할 때 좌표를 저장함에 있어 오차가 없도록 하기 위해 isRightPlace가 true인 경우와 아닌 경우로 나눠서 저장함
            if ((isRightCard && !auth) || (isRight && auth)) {
                dispatch({ type: `${auth ? "myPuzzle" : "peerPuzzle"}/setPosition`, payload: { index: i, position: [width, height] } });
            }
            else {
                //isRightPlace가 false인 경우, 마지막으로 저장된 좌표를 저장함, 이는 부정확해도 되므로 아래 animated.div에서 memo를 매번 저장하지 않도록 함. 8번에 한 번씩만 저장함
                dispatch({ type: `${auth ? "myPuzzle" : "peerPuzzle"}/setPosition`, payload: { index: i, position: [x.get(), y.get()] } });
            }
            auth ? setMyWait((prev) => prev + 1) : setPeerWait((prev) => prev + 1);
        };
    }, []);




    const itemReady = useRecoilValue(auth ? myItemState : peerItemState);

    return (
        <>
            <div className={styles.container} onClick={breakTheIce}>
                <animated.div
                    ref={target}
                    className={((isRightCard && !auth) || (isRight && auth)) ? `${styles.rightCard}` : (auth ? `${styles.myCard}` : `${styles.peerCard}`)}
                    style={{
                        transform: "perspective(600px)",
                        x,
                        y,
                        scale: to([scale, zoom], (s, z) => {
                            memo.current.x = x.get();
                            memo.current.y = y.get();
                            return s + z;
                        }),
                        rotateX,
                        rotateY,
                        rotateZ,
                        zIndex: zindex,
                    }}
                >
                    <animated.div>
                        {/* segmentState가 lip, 또는 twirl로 될 때, 완벽히 준비된 상태가 아닌 경우 default를 계속 보여주도록 함(그래야 div가 비어서 세로줄만 나오는 것 방지 가능) */}
                        {(segmentState === "default" || segmentState === "ice" || !itemReady) &&
                            <div className="flex text-center justify-center items-center">
                                {iceCount > 0 && segmentState === "ice" &&
                                    <>
                                        <img src="/images/new_ice.png" className="absolute z-0 select-none pointer-events-none" />
                                        <div className={`${styles.iced} absolute text-center select-none text-9xl z-10 pointer-events-none`}>{iceCount}</div>
                                    </>}
                                <CloneVideo key={i} id={i} auth={auth} videoId={videoId} segmentState={segmentState} />
                            </div>
                        }
                        {segmentState === "lip" && itemReady && <LipVideo auth={auth} />}
                        {segmentState === "twirl" && itemReady && <TwirlVideo auth={auth} />}
                    </animated.div>
                </animated.div>
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