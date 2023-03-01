import React, { useRef, useEffect, useState, memo, useCallback } from "react";
import { useSpring, animated, to } from "@react-spring/web";
import { Provider, useSelector, useDispatch } from "react-redux";
import styles from "../styles.module.css";
import useSound from "use-sound"
import { useSetRecoilState } from "recoil";
import { myWaitState, peerWaitState } from "../atom";
import IcedVideo from "../IcedVideo";
import { useDrag, useGesture } from "@use-gesture/react";
import CloneVideo from "../CloneVideo";
const calcX = (y: number, ly: number) => -(y - ly - window.innerHeight / 2) / 20;
const calcY = (x: number, lx: number) => (x - lx - window.innerWidth / 2) / 20;
const puzzleSoundUrl = '/sounds/puzzleHit.mp3'

interface Props {
    i: number;
    videoId: string;
    auth: boolean;
    peerxy: { peerx: number; peery: number } | undefined;
    dataChannel: RTCDataChannel | undefined;
    segmentState: string;
}


function Ice({ i, auth, videoId, peerxy, dataChannel, segmentState }: Props) {

    //TODO ice 버그 수정하기

    const iceCrackSoundUrl = '/sounds/can.wav'



    const [iceCount, setIceCount] = useState(2);
    const [iceCrackSoundPlay] = useSound(iceCrackSoundUrl, { playbackRate: 1 })

    function breakTheIce() {
        if (!auth) return;
        if (iceCount > 0) {
            if (dataChannel) dataChannel.send(JSON.stringify({ type: "ice", i: i, auth: auth, iceCount: iceCount - 1 }));
            setIceCount(iceCount - 1);
            iceCrackSoundPlay();
        }
    }
    useEffect(() => {
        if (dataChannel) {
            dataChannel!.addEventListener("message", function ice(event: MessageEvent<any>) {
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
            });
        }
    }, []);
    //퍼즐 데이터 스토어와 연결 react-redux
    const dispatch = useDispatch();
    const storedPosition = useSelector((state: any) => {
        return auth ? state.myPuzzle : state.peerPuzzle;
    });
    const [isRightPlace, setIsRightPlace] = useState(false);

    const [zindex, setZindex] = useState(Math.floor(Math.random() * 10));
    // const videoElement = document.getElementById(videoId) as HTMLVideoElement;
    // const [width, height] = [videoElement.videoWidth / 3 * (i % 3), videoElement.videoHeight / 3 * ((i - i % 3) / 3)]
    const d = 1;
    // 현재 좌표 받아와서 퍼즐을 끼워맞출 곳을 보정해줄 값을 widthOx, heightOx에 저장
    const [widthOx, heightOx] = [(640 / 3) * d, (480 / 3) * d];
    const [width, height] = [(640 / 3) * (i % 3) - widthOx * 1.5, (480 / 3) * ((i - (i % 3)) / 3) + heightOx];
    const [puzzleSoundPlay] = useSound(puzzleSoundUrl);

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


    const target = useRef<HTMLDivElement>(null);
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

    const positionDataSend = useCallback(() => {
        if (dataChannel?.readyState === "open") {
            dataChannel.send(JSON.stringify({ type: "move", i: i, peerx: x.get(), peery: y.get() }));
        }
    }, [dataChannel]);
    //for bounding puzzle peace to board / 움직임에 관한 모든 컨트롤은 여기서
    let isDataIn:boolean = false;
    let isRigthPlaceForSetTimeout = isRightPlace;

    useDrag(
        (params) => {
            if (isRightPlace) return;
            if (!auth) return;
            if (iceCount !== 0) return;
            if (isSameOutline(x.get(), y.get(), width, height)) return;
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
                    puzzleSoundPlay();
                    if (dataChannel) dataChannel.send(JSON.stringify({ type: "cnt", isRightPlace: true, i: i }));
                    dispatch({ type: "puzzleComplete/plus_mine" });
                    setZindex(0);
                    dispatch({ type: `${auth ? "myPuzzle" : "peerPuzzle"}/${i}`, payload: { x: width, y: height } });
                    if (dataChannel?.readyState === "open") {
                        dataChannel.send(JSON.stringify({ type: "move", i: i, peerx: width, peery: height }));
                        return;
                    }
                }
                positionDataSend();
                dispatch({ type: `${!auth ? "peerPuzzle" : "myPuzzle"}/setPosition`, payload: { index: i, position: [storedPosition[i][0] + params.offset[0], storedPosition[i][1] + params.offset[1]] } });
                //마우스 떼면 offset 아예 초기화
                params.offset[0] = 0;
                params.offset[1] = 0;
            }

            if(!isDataIn){
                isDataIn = true;
                setTimeout(function noName(){
                    if (isRigthPlaceForSetTimeout) return;
                    positionDataSend();
                    isDataIn = false;
                }, 16);
            }
        },
        {
            target,
            bounds: { top: 0 - storedPosition[i][1], bottom: heightOx * 4 - storedPosition[i][1], left: -widthOx * 2 - storedPosition[i][0], right: widthOx * 1 - storedPosition[i][0] },
            rubberband: 0.8,
        }
    );


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
        { target, eventOptions: { passive: false } }
    );


    var memo = useRef({ x: storedPosition[i][0], y: storedPosition[i][1] })
    const setMyWait = useSetRecoilState(myWaitState)
    const setPeerWait = useSetRecoilState(peerWaitState)
    useEffect(() => {
        return () => {
            if (isRightPlace) {
                dispatch({ type: `${!auth ? "peerPuzzle" : "myPuzzle"}/setPosition`, payload: { index: i, position: [width, height] } });
            }
            else {
                dispatch({ type: `${!auth ? "peerPuzzle" : "myPuzzle"}/setPosition`, payload: { index: i, position: [memo.current.x, memo.current.y] } });
            }
            auth ? setMyWait(false) : setPeerWait(false);
        };
    }, [])
    return (
        <>
            <div className="">
                <div className={styles.container} onClick={breakTheIce}>
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
                                return s + z
                            }),
                            rotateX,
                            rotateY,
                            rotateZ,
                            zIndex: zindex,
                        }}
                    >
                        <animated.div>
                            {(iceCount <= 0) ? <CloneVideo key={i} id={i} auth={auth} videoId={videoId} segmentState={segmentState} /> : <IcedVideo iceCount={iceCount} id={i} auth={auth} videoId={videoId} segmentState={segmentState} />}
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


export default memo(Ice);