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
export default function rocket({ i, auth, dataChannel }: Props) {
    const storedPosition = useSelector((state: any) => { return auth ? state.myPuzzle : state.peerPuzzle });
    const dispatch = useDispatch();

    // storedPosition[i][0], storedPosition[i][1]] 
    const [{ pos }, api] = useSpring(() => ({ pos: [storedPosition[i][0], storedPosition[i][1]] }))
    const [{ angle }, angleApi] = useSpring(() => ({
        angle: 0,
        config: config.wobbly,
    }))
    // direction calculates pointer direction
    // memo is like a cache, it contains the values that you return inside "set"
    // this way we can inject the springs current coordinates on the initial event and
    // add movement to it for convenience
    var memo = useRef({ x: 0, y: 0 })
    const d = 1;
    // 현재 좌표 받아와서 퍼즐을 끼워맞출 곳을 보정해줄 값을 widthOx, heightOx에 저장
    const [widthOx, heightOx] = [(640 / 3) * d, (480 / 3) * d];
    const [width, height] = [(640 / 3) * (i % 3) - widthOx * 1.5, (480 / 3) * ((i - (i % 3)) / 3) + heightOx];

    // var r = Math.random()
    // console.log(r)
    // var xdirection = 0;
    // var ydirection = 0;
    // if (r > 0.75) { xdirection = 1, ydirection = 0 }
    // else if (r > 0.5) { xdirection = -1, ydirection = 0 }
    // else if (r > 0.25) { xdirection = 0, ydirection = 1 }
    // else { xdirection = 0, ydirection = -1 }
    // var direction = [xdirection, ydirection];
    // for (var j = 0; j < 20; j++) {
    //     setTimeout(function autoRocket() {
    //         var xy = [storedPosition[i][0] + 0.01 * (j - 1), storedPosition[i][1] + 0.01 * (j - 1)];
    //         var previous = [storedPosition[i][0] + 0.01 * j, storedPosition[i][1] + 0.01 * j];
    //         const down = true;
    //         var velocity = Math.random() * 5 * j;
    //         api.start({
    //             pos: [pos.get()[0] + storedPosition[i][0], pos.get()[1] + storedPosition[i][1]],
    //             immediate: down,
    //             config: { velocity: scale(direction, velocity), decay: true },
    //         })
    //         if (dist(xy, previous) > 10 || !down)
    //             angleApi.start({ angle: Math.atan2(direction[0], -direction[1]) })

    //         if (dataChannel)
    //             dataChannel.send(JSON.stringify({ type: 'rocket', i: i, auth: auth, xy: xy, previous: previous, down: down, pos: pos, velocity: velocity, direction: direction }));
    // pos.set([pos.get()[0] + 0.01 * j, pos.get()[1] + 0.01 * j]);
    //         console.log('틱톡')
    //     }, 300)
    // }


    const bind = useDrag(
        ({ xy, previous, down, movement: pos, velocity, direction }) => {
            // 내꺼든 상대방 것이든 아무튼 움직일 수 있음
            // if (!auth) return
            // 상대방에게 내가 발생시킨 이벤트를 모두 전달
            api.start({
                pos: [pos[0] + storedPosition[i][0], pos[1] + storedPosition[i][1]],
                immediate: down,
                config: { velocity: scale(direction, velocity), decay: true },
            })
            if (dist(xy, previous) > 10 || !down)
                angleApi.start({ angle: Math.atan2(direction[0], -direction[1]) })

            if (dataChannel)
                dataChannel.send(JSON.stringify({ type: 'rocket', i: i, auth: auth, xy: xy, previous: previous, down: down, pos: pos, velocity: velocity, direction: direction }));
        },
        {
            initial: () => pos.get(),
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
                            if (i === dataJSON.i && auth === !dataJSON.auth) {
                                api.start({
                                    pos: dataJSON.pos,
                                    immediate: dataJSON.down,
                                    config: { velocity: scale(dataJSON.direction, dataJSON.velocity), decay: true },
                                })
                                if (dist(dataJSON.xy, dataJSON.previous) > 10 || !dataJSON.down)
                                    angleApi.start({ angle: Math.atan2(dataJSON.direction[0], -dataJSON.direction[1]) })
                                break;
                            }
                    }
                }
            });
        }
    }, []);

    useEffect(() => {
        return () => {
            dispatch({ type: `${!auth ? "peerPuzzle" : "myPuzzle"}/setPosition`, payload: { index: i, position: [memo.current.x, memo.current.y] } });
        }
    },)

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
                    ([x, y], a) => {
                        x = Math.min(Math.max(x, -widthOx * 1.5 - storedPosition[i][0]), widthOx * 1.5 - storedPosition[i][0]);
                        y = Math.min(Math.max(y, 0 - storedPosition[i][1]), heightOx * 3.5 - storedPosition[i][1]);
                        memo.current = { x: storedPosition[i][0] + x, y: storedPosition[i][1] + y }
                        return `translate3d(${x}px,${y}px,0) rotate(${a}rad)`
                    },
                ),
            }}
        />
    )
}