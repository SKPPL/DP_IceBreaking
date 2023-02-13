import React, { useRef, useEffect, useState } from 'react'
import { useSpring, animated, to } from '@react-spring/web'
import { useGesture } from 'react-use-gesture'

import styles from './styles.module.css'
import CloneVideo from './CloneVideo'
import { useWindowSize } from 'usehooks-ts'

const calcX = (y: number, ly: number) => -(y - ly - window.innerHeight / 2) / 20
const calcY = (x: number, lx: number) => (x - lx - window.innerWidth / 2) / 20

const wheel = (y: number) => {
    const imgHeight = window.innerWidth * 0.3 - 20
    return `translateY(${-imgHeight * (y < 0 ? 6 : 1) - (y % (imgHeight * 5))}px`
}

interface Props {
    i: number
    videoId: string
    initx: number
    inity: number
}
export default function Segment({ i, videoId, initx, inity }: Props) {
    const [isRightPlace, setIsRightPlace] = useState(false)
    const [zindex, setZindex] = useState(Math.floor(Math.random() * 10))
    const windowSize = useWindowSize();
    const divRef = useRef<HTMLDivElement>(null);
    // const videoElement = document.getElementById(videoId) as HTMLVideoElement;
    // const [width, height] = [videoElement.videoWidth / 3 * (i % 3), videoElement.videoHeight / 3 * ((i - i % 3) / 3)]
    const d = 1;
    // 현재 좌표 받아와서 퍼즐을 끼워맞출 곳을 보정해줄 값을 widthOx, heightOx에 저장
    const [widthOx, heightOx] = [640 / 3 * d, 480 / 3 * d]
    const [width, height] = [640 / 3 * (i % 3) - widthOx / 1, 480 / 3 * ((i - i % 3) / 3) + heightOx]
    // const [width, height] = [windowSize.width / 3 * (i % 3), windowSize.height / 3 * ((i - i % 3) / 3)]

    useEffect(() => {
        const preventDefault = (e: Event) => e.preventDefault()
        document.addEventListener('gesturestart', preventDefault)
        document.addEventListener('gesturechange', preventDefault)
        return () => {
            document.removeEventListener('gesturestart', preventDefault)
            document.removeEventListener('gesturechange', preventDefault)
        }
    }, [])

    const domTarget = useRef<HTMLDivElement>(null)
    const [{ x, y, rotateX, rotateY, rotateZ, zoom, scale }, api] = useSpring(
        () => ({
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            scale: 1,
            zoom: 0,
            x: 0,
            y: 0,

            config: { mass: 2, tension: 750, friction: 50 },
        })
    )

    const [{ wheelY }, wheelApi] = useSpring(() => ({ wheelY: 0 }))

    useGesture(
        {
            onDrag: ({ active, offset: [x, y], previous: [prex, prey] }) => {

                if (isRightPlace) return;
                api.start({ x: x, y: y, rotateX: 0, rotateY: 0, scale: active ? 1 : 1.05 })
            },
            onPinch: ({ offset: [d, a] }) => api.start({ zoom: d / 10000, rotateZ: a }),
            onPinchEnd: () => api.start({ zoom: 0, rotateZ: 0 }),
            onMove: ({ xy: [px, py], dragging }) => {
                !dragging &&
                    api.start({
                        rotateX: calcX(py, y.get()),
                        rotateY: calcY(px, x.get()),
                        scale: 1.05,
                    });
            },
            onDragEnd: ({ offset: [ox, oy] }) => {

                if (!isRightPlace && isNearOutline(ox, oy, width, height)) {
                    domTarget.current!.setAttribute('style', 'z-index: 0')
                    api.start({ x: width, y: height })
                    setIsRightPlace(true)
                    setZindex(0)
                    //TODO: zIndex관련 수정 필요

                }

            },
            onHover: ({ hovering }) =>
                !hovering && api.start({ rotateX: 0, rotateY: 0, scale: 1 }),
            onWheel: ({ event, offset: [, y] }) => {
                event.preventDefault()
                wheelApi.set({ wheelY: y })
            },
        },
        { domTarget, eventOptions: { passive: false } }
    )


    return (
        <>
            {/* zIndex관련 수정 필요 */}
            <div className=''>
                <div className={styles.container}>
                    <animated.div
                        ref={domTarget}
                        className={styles.card}
                        style={{
                            transform: 'perspective(600px)',
                            x,
                            y,
                            scale: to([scale, zoom], (s, z) => s + z),
                            rotateX,
                            rotateY,
                            rotateZ,
                            zIndex: zindex
                        }}>
                        <animated.div>
                            <CloneVideo key={i} id={i} videoId={videoId} />
                        </animated.div>
                    </animated.div>
                </div>
            </div>

        </>
    )
}

export function isNearOutline(x: number, y: number, positionx: number, positiony: number) {
    const diff = 40;
    if (x > positionx - diff && x < positionx + diff && y > positiony - diff && y < positiony + diff) {
        return true;
    }
    else
        return false;
}

