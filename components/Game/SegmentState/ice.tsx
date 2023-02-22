import React, { useRef, useEffect, useState, memo } from "react";
import { useSpring, animated, to } from "@react-spring/web";
import { Provider, useSelector, useDispatch } from "react-redux";
import styles from "../styles.module.css";
import useSound from "use-sound"

interface Props {
    i: number;
    auth: boolean;
    segmentState: string;
    videoId: string;
}

const img = new Image();
img.src = "../images/new_ice.png";
img.width= 640
img.height = 480

const iceCrackSoundUrl = '/sounds/can.wav'

function Ice({ i, auth, segmentState, videoId }: Props) {
    //퍼즐 데이터 스토어와 연결 react-redux
    const dispatch = useDispatch();
    const storedPosition = useSelector((state: any) => {
        return auth ? state.myPuzzle : state.peerPuzzle;
    });


    //아래 조건문 위로 올리면 안됨
    if (segmentState === "ice") {
        auth = false;
    }

    const domTarget = useRef<HTMLDivElement>(null);
    const [{ x, y, rotateX, rotateY, rotateZ, zoom, scale }, api] = useSpring(() => {
        return {
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            scale: 1,
            zoom: 0,
            x: storedPosition[i][0],
            y: storedPosition[i][1],
            config: { mass: 2, tension: 750, friction: 50 },
        };
    });

    var iceCount = 2;
    const [iceCrackSoundPlay] = useSound(iceCrackSoundUrl, {playbackRate: 1})

    function breakTheIce(){
        if (iceCount > 0) {
            iceCount -= 1
            iceCrackSoundPlay();
        }
    }

    function IcedVideo() {
        var cloneRef = useRef<HTMLCanvasElement>(null);
        var ctx: CanvasRenderingContext2D | null = null;
        var unmountCheck = false;
        useEffect(() => {
            unmountCheck = false;
            if (!cloneRef.current) return
            ctx = cloneRef.current.getContext('2d');

            return () => {
                unmountCheck = true;
            }
        }, [cloneRef])
    
        const video = document.getElementById(videoId) as HTMLVideoElement;
        const draw = () => {
            if (!unmountCheck) {
                ctx!.drawImage(video, 640 / 3 * (i % 3), 160 * ((i - i % 3) / 3), 640 / 3, 160, 0, 0, 640, 480);
                if (segmentState === 'ice' && iceCount > 0){
                    ctx!.drawImage(img, 0, 0)
                }
                setTimeout(draw, 16.666);
            }
        }
        
        useEffect(() => {
            if (!video) return;
            if (!ctx) return;
            draw();
        }, [video])
    
        return (
            <>
                <canvas id={`${auth ? 'my' : 'peer'}_${i}`} width="640" height="480" ref={cloneRef} ></canvas>
            </>
        )
    }

    return (
        <>
            <div className="">
                <div className={styles.container} onClick={breakTheIce}>
                    <animated.div
                        ref={domTarget}
                        className={styles.card}
                        style={{
                            transform: "perspective(600px)",
                            x,
                            y,
                            scale: to([scale, zoom], (s, z) => s + z),
                            rotateX,
                            rotateY,
                            rotateZ,
                        }}
                    >
                        <animated.div>
                            <IcedVideo/>
                        </animated.div>
                    </animated.div>
                </div>
            </div>
        </>
    );
}

export default memo(Ice);