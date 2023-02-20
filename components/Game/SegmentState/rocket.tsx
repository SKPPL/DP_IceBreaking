import React, { useRef, useEffect, useState } from 'react'
import { useSpring, animated, to, config } from '@react-spring/web'
import { useDrag } from 'react-use-gesture'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { scale, dist } from 'vec-la'
import { Provider, useSelector, useDispatch } from 'react-redux'

import styles from '../styles.module.css'
import { useWindowSize } from 'usehooks-ts'

interface Props {
    i: number
    peerxy: { peerx: number, peery: number } | undefined
    dataChannel: RTCDataChannel | undefined

    auth: boolean
}
export default function rocket({ i, auth, peerxy, dataChannel }: Props) {
    const storedPosition = useSelector((state: any) => { return auth ? state.myPuzzle : state.peerPuzzle });
    const dispatch = useDispatch();


    const [{ pos }, api] = useSpring(() => ({ pos: [0, 0] }))
    const [{ angle }, angleApi] = useSpring(() => ({
        angle: 90,
        config: config.wobbly,
    }))
    // direction calculates pointer direction
    // memo is like a cache, it contains the values that you return inside "set"
    // this way we can inject the springs current coordinates on the initial event and
    // add movement to it for convenience

    const d = 1;
    // 현재 좌표 받아와서 퍼즐을 끼워맞출 곳을 보정해줄 값을 widthOx, heightOx에 저장
    const [widthOx, heightOx] = [(640 / 3) * d, (480 / 3) * d];
    const [width, height] = [(640 / 3) * (i % 3) - widthOx * 1.5, (480 / 3) * ((i - (i % 3)) / 3) + heightOx];

    // 유저가 움직일 때
    const bind = useDrag(
        ({ xy, previous, down, movement: pos, velocity, direction }) => {
            // 내 소유가 아니면 못움직이게
            if (!auth) return
            // 상대방에게 내가 발생시킨 이벤트를 모두 전달
            if (dataChannel)
                dataChannel.send(JSON.stringify({ type: 'rocket', i: i, xy: xy, previous: previous, down: down, pos: pos, velocity: velocity, direction: direction }));
            api.start({
                pos,
                immediate: down,
                config: { velocity: scale(direction, velocity), decay: false },
            })
            if (dist(xy, previous) > 10 || !down)
                angleApi.start({ angle: Math.atan2(direction[0], -direction[1]) })
            dispatch({ type: `${!auth ? "peerPuzzle" : "myPuzzle"}/setPosition`, payload: { index: i, position: [pos[0], pos[1]] } });
        },
        // { },
        {
            initial: () => pos.get(),
            bounds: { top: -storedPosition[i][1], bottom: heightOx * 4 - storedPosition[i][1], left: -widthOx * 2 - storedPosition[i][0], right: widthOx * 1 - storedPosition[i][0] },
            rubberband: 1,
        }
    )

    // 상대가 발생시킨 이벤트를 받아서 그대로 원래 useDrag에서 실행하던 것처럼 실행
    useEffect(() => {
        if (dataChannel) {
            dataChannel!.addEventListener("message", function rocket(event: MessageEvent<any>) {
                if (event.data) {
                    let dataJSON = JSON.parse(event.data);
                    switch (dataJSON.type) {
                        case "rocket":
                            if (i !== dataJSON.i || auth) return
                            api.start({
                                pos: dataJSON.pos,
                                immediate: dataJSON.down,
                                config: { velocity: scale(dataJSON.direction, dataJSON.velocity), decay: false },
                            })
                            if (dist(dataJSON.xy, dataJSON.previous) > 10 || !dataJSON.down)
                                angleApi.start({ angle: Math.atan2(dataJSON.direction[0], -dataJSON.direction[1]) })
                            dispatch({ type: `${!auth ? "peerPuzzle" : "myPuzzle"}/setPosition`, payload: { index: i, position: [storedPosition[i][0] + dataJSON.pos[0], storedPosition[i][1] + dataJSON.pos[1]] } });
                            break;
                    }
                }
            });
        }
    }, []);


    return (
        <animated.div
            className={styles.rocket}
            {...bind()}
            style={{
                x: storedPosition[i][0],
                y: storedPosition[i][1],
                zIndex: 100,

                transform: to(
                    [pos, angle],
                    // @ts-ignore
                    ([x, y], a) => `translate3d(${x}px,${y}px,0) rotate(${a}rad)`
                ),
            }}
        />
    )
}