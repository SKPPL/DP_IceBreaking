import React, { useRef, useEffect, useState, memo } from "react";
import { useSpring, animated, to } from "@react-spring/web";
import { Provider, useSelector, useDispatch } from "react-redux";
import styles from "../styles.module.css";

interface Props {
    i: number;
    auth: boolean;
    segmentState: string;
}
function Ice({ i, auth, segmentState }: Props) {
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

    return (
        <>
            <div className="">
                <div className={styles.container}>
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
                            <img src="/images/ice.png" width={640 / 3} height={160} />
                        </animated.div>
                    </animated.div>
                </div>
            </div>
        </>
    );
}

export default memo(Ice);
