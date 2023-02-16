import React, { useRef, useEffect, useState } from 'react'
import { useSpring, animated, to, config } from '@react-spring/web'
import { useDrag } from 'react-use-gesture'
import { scale, dist } from 'vec-la'
import { Provider, useSelector, useDispatch } from 'react-redux'

import styles from './styles.module.css'
import CloneVideo from './CloneVideo'
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
                config: { velocity: scale(direction, velocity), decay: true },
            })
            if (dist(xy, previous) > 10 || !down)
                angleApi.start({ angle: Math.atan2(direction[0], -direction[1]) })
        },
        { initial: () => pos.get() }
    )
    // 상대가 발생시킨 이벤트를 받아서 그대로 원래 useDrag에서 실행하던 것처럼 실행
    dataChannel!.addEventListener("message", (event: any) => {
        if (event.data) {
            var dataJSON = JSON.parse(event.data);
            switch (dataJSON.type) {
                case "rocket":
                    if (i !== dataJSON.i || auth) return
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
    })



    // // 상대방이 움직일 때
    // const bind2 = useDrag(
    //     ({ xy, previous, down, movement: pos, velocity, direction }) => {
    //         if (auth) return
    //         api.start({
    //             pos,
    //             immediate: down,
    //             config: { velocity: scale(direction, velocity), decay: true },
    //         })

    //         if (dist(xy, previous) > 10 || !down)
    //             angleApi.start({ angle: Math.atan2(direction[0], -direction[1]) })
    //     },
    //     { initial: () => pos.get() }
    // )
    // useEffect(() => {
    //     if (peerxy !== undefined) {
    //         api.start({ [peerxy.peerx, peerxy.peery], immediate: down, config: { velocity: scale(direction, velocity), decay: true }})
    //     }
    // }, [peerxy])
    // console.log(storedPosition[i][0], storedPosition[i][1])
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