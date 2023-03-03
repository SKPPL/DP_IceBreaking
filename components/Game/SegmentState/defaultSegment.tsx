import React, { useRef, useEffect, useState, memo, useCallback } from "react";
import { useSpring, animated, to } from "@react-spring/web";
import { useDrag, useGesture } from "@use-gesture/react";
import { Provider, useSelector, useDispatch } from "react-redux";
import styles from "../styles.module.css";
import CloneVideo from "../VideoDivide/CloneVideo";
import useSound from 'use-sound';
import { useRecoilValue, useSetRecoilState } from "recoil";
import { myFaceLandMarkState, myLipState, myTwirlState, myWaitState, peerFaceLandMarkState, peerLipState, peerTwirlState, peerWaitState } from "../atom";
import LipVideo from "../VideoDivide/LipVideo";
import TwirlVideo from "@/components/Game/VideoDivide/TwirlVideo";

const calcX = (y: number, ly: number) => -(y - ly - window.innerHeight / 2) / 20;
const calcY = (x: number, lx: number) => (x - lx - window.innerWidth / 2) / 20;
const puzzleSoundUrl = '/sounds/puzzleHit.mp3';

let isStart = true;

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
    const [isRightPlace, setIsRightPlace] = useState(false);
    //아래 조건문 위로 올리면 안됨

    const arr = useSelector((state: any) => state.puzzleOrder);
    const firstlocation = [arr[0] * 50 - 50, arr[1] * 50 - 100, arr[2] * 50 - 150, arr[3] * 50 - 200, arr[4] * 50 - 250, arr[5] * 50 - 300, arr[6] * 50 - 350, arr[7] * 50 - 400, arr[8] * 50 - 450];
    const [zindex, setZindex] = useState(arr[i]);

    // const videoElement = document.getElementById(videoId) as HTMLVideoElement;
    // const [width, height] = [videoElement.videoWidth / 3 * (i % 3), videoElement.videoHeight / 3 * ((i - i % 3) / 3)]
    const d = 1;
    // 현재 좌표 받아와서 퍼즐을 끼워맞출 곳을 보정해줄 값을 widthOx, heightOx에 저장
    const [widthOx, heightOx] = [(640 / 3) * d, (480 / 3) * d];
    const [width, height] = [(640 / 3) * (i % 3) - widthOx * 1.5, (480 / 3) * ((i - (i % 3)) / 3) + heightOx];
    const [puzzleSoundPlay] = useSound(puzzleSoundUrl);

    // isRight인 경우 안정적으로 고정 width, heigth에서 시작하게 하기 (얼음깨고 다시 맞출때 위치가 비정상적으로 저장중 (default로 돌아오기 직전만 api.start가 옮겨서 맞춰주기 전 위치로 돌아온다. 기능적인 문제는 없음))
    let startXY = storedPosition[i];
    if (isRight && auth) {
        startXY = [width, height];
    }

    // TODO : 옆으로 init 시 api.start 이동

    useEffect(() => {
        if (isRight) {
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
            x: startXY[0], // 초기 기준 좌표를 말하는 것 같음, offset은 상관없는듯
            y: startXY[1],
            config: { mass: 2, tension: 750, friction: 30 },
        };
    });

    useEffect(() => {
        if (peerxy !== undefined) {
            dispatch({ type: `${peerxy ? "peerPuzzle" : "myPuzzle"}/setPosition`, payload: { index: i, position: [peerxy.peerx, peerxy.peery] } });
            api.start({ x: peerxy.peerx, y: peerxy.peery, rotateX: 0, rotateY: 0 });
        }
    }, [peerxy]);

    const positionDataSend = useCallback(() => {
        if (dataChannel?.readyState === "open") {
            dataChannel.send(JSON.stringify({ type: "move", i: i, peerx: x.get(), peery: y.get() }));
        }
    }, [dataChannel]);

    //for bounding puzzle peace to board / 움직임에 관한 모든 컨트롤은 여기서
    let isDataIn: boolean = false;
    let isRigthPlaceForSetTimeout = isRightPlace;
    useDrag(
        (params) => {
            if (isRightPlace) return;
            if (!auth) return;
            if (isSameOutline(x.get(), y.get(), width, height)) return;
            if (isRight) return;
            x.set(storedPosition[i][0] + params.offset[0]);
            y.set(storedPosition[i][1] + params.offset[1]);
            // !params.down : 마우스를 떼는 순간
            if (!params.down) {
                //알맞은 위치에 놓았을 때
                if (!isRightPlace && isNearOutline(x.get(), y.get(), width, height)) {
                    target.current!.setAttribute("style", "z-index: 0");
                    isRigthPlaceForSetTimeout = true;
                    api.start({ x: width, y: height });
                    setIsRightPlace(true);
                    dispatch({ type: `defaultSegmentRightPlace/setRight`, payload: { index: i, isRight: true } });
                    puzzleSoundPlay();
                    if (dataChannel) dataChannel.send(JSON.stringify({ type: "cnt", isRightPlace: true, i: i }));
                    dispatch({ type: "puzzleComplete/plus_mine" });
                    setZindex(0);
                    dispatch({
                        type: `${!auth ? "peerPuzzle" : "myPuzzle"}/setPosition`,
                        payload: { index: i, position: [width, height] },
                    });
                    if (dataChannel?.readyState === "open") {
                        dataChannel.send(JSON.stringify({ type: "move", i: i, peerx: width, peery: height }));
                        return;
                    }
                } else {
                    dispatch({
                        type: `${!auth ? "peerPuzzle" : "myPuzzle"}/setPosition`,
                        payload: { index: i, position: [storedPosition[i][0] + params.offset[0], storedPosition[i][1] + params.offset[1]] },
                    });
                }
                positionDataSend();
                //마우스 떼면 offset 아예 초기화
                params.offset[0] = 0;
                params.offset[1] = 0;
                // 마우스를 떼는 순간에는 무조건 좌표+offset한 값을 저장하고 데이터를 보냄
            }

            if (!isDataIn) {
                isDataIn = true;
                setTimeout(function noName() {
                    if (isRigthPlaceForSetTimeout) return;
                    positionDataSend();
                    isDataIn = false;
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
            setTimeout(() => api.start({ x: x.get() + firstlocation[i], y: y.get() }), 5000);
            setTimeout(() => isStart = false, 1000);
        }
        return () => {
            // unmount될 떄, 즉 아이템을 써서 segmentState가 변할 때 좌표를 저장함에 있어 오차가 없도록 하기 위해 isRightPlace가 true인 경우와 아닌 경우로 나눠서 저장함
            if (isRightPlace) {
                dispatch({ type: `${!auth ? "peerPuzzle" : "myPuzzle"}/setPosition`, payload: { index: i, position: [width, height] } });
            }
            else {
                //isRightPlace가 false인 경우, 마지막으로 저장된 좌표를 저장함, 이는 부정확해도 되므로 아래 animated.div에서 memo를 매번 저장하지 않도록 함. 8번에 한 번씩만 저장함
                dispatch({ type: `${!auth ? "peerPuzzle" : "myPuzzle"}/setPosition`, payload: { index: i, position: [memo.current.x, memo.current.y] } });
            }
            auth ? setMyWait((prev) => prev + 1) : setPeerWait((prev) => prev + 1);
        };
    }, []);

    useEffect(() => {
        if (isRightCard)
            setZindex(0);
    }, [isRightCard]);




    const faceLandMarkReady = useRecoilValue(auth ? myFaceLandMarkState : peerFaceLandMarkState);
    const lipReady = useRecoilValue(auth ? myLipState : peerLipState);
    const twirlReady = useRecoilValue(auth ? myTwirlState : peerTwirlState);
    return (
        <>
            <div className="">
                <div className={styles.container}>
                    <animated.div
                        ref={target}
                        className={isRightPlace ? `${styles.rightCard}` : `${styles.card}`}
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
                            {(segmentState === "default" || (!faceLandMarkReady || !lipReady) && !twirlReady) && <CloneVideo key={i} id={i} auth={auth} videoId={videoId} segmentState={segmentState} />}
                            {segmentState === "lip" && faceLandMarkReady && lipReady && <LipVideo auth={auth} />}
                            {segmentState === "twirl" && twirlReady && <TwirlVideo auth={auth} />}
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
export function isSameOutline(x: number, y: number, positionx: number, positiony: number) {
    const diff = 0;
    if (x === positionx && y === positiony) {
        return true;
    } else return false;
}

export default memo(DefaultSegment);
