import React, { useRef, useEffect, useState } from 'react'
import { useSpring, animated, to, config } from '@react-spring/web'
import { useDrag } from 'react-use-gesture'
import { scale, dist } from 'vec-la'

import styles from './styles.module.css'
import CloneVideo from './CloneVideo'
import { useWindowSize } from 'usehooks-ts'

interface Props {
    peerxy: { peerx: number, peery: number } | undefined
    dataChannel: RTCDataChannel | undefined

    auth: boolean
}
export default function rocket({ auth, peerxy, dataChannel }: Props) {
    const [{ pos }, api] = useSpring(() => ({ pos: [0, 0] }))
    const [{ angle }, angleApi] = useSpring(() => ({
        angle: 0,
        config: config.wobbly,
    }))
    // direction calculates pointer direction
    // memo is like a cache, it contains the values that you return inside "set"
    // this way we can inject the springs current coordinates on the initial event and
    // add movement to it for convenience

    // 유저가 움직일 때
    const bind = useDrag(
        ({ xy, previous, down, movement: pos, velocity, direction }) => {
            if (!auth) return
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

    return (
        <animated.div
            className={styles.rocket}
            {...bind()}
            style={{
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