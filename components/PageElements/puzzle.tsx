import Head from "next/head";
import React, { ReactNode, useState, useEffect, useRef } from 'react'
import { useSpring, animated, to } from '@react-spring/web'
import { useDrag, useGesture } from 'react-use-gesture'
import styles from "./styles.module.css";
import { useRouter } from "next/router";


const backgroundImageUrl = '/images/transparentPuzzle.png'

const calcX = (y: number, ly: number) => -(y - ly - window.innerHeight / 2) / 20
const calcY = (x: number, lx: number) => (x - lx - window.innerWidth / 2) / 20


export default function PuzzleScreen() {

    const [targetX, setTargetX] = useState();
    const [targetY, setTargetY] = useState();
    const router = useRouter();
    
    useEffect(() => {
        const preventDefault = (e: Event) => e.preventDefault()
        document.addEventListener('gesturestart', preventDefault)
        document.addEventListener('gesturechange', preventDefault)
        const startButtonPosition = document.getElementById("startButton")?.getBoundingClientRect();
        setTargetX(startButtonPosition?.x);
        setTargetY(startButtonPosition?.y);
    
        return () => {
          document.removeEventListener('gesturestart', preventDefault)
          document.removeEventListener('gesturechange', preventDefault)
        }
      }, [])

    const domTarget = useRef(null);
    const [{ x, y,rotateX, rotateY, rotateZ, zoom, scale }, api] = useSpring(
        () => ({
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            scale: 1,
            zoom: 0,
            x: 0,
            //TODO: 시작위치는 왼쪽으로 조정이 되는데, 처음 잡았을때 다시 0/0으로 돌아간 다음에 시작함. 수정하자.
            y: 0,
            config: { mass: 5, tension: 350, friction: 50 },
        })
        )
    
    
        const bind = useDrag(
            (params) => {
                if(!params.down) {
                    console.log(x.get(), y.get(), targetX, targetY);
                    console.log(targetX, targetY);
                }
                if(!params.down && isPuzzleMatched(x.get(), y.get(), targetX, targetY)) {
                    router.push({
                        pathname: '/ready',
                    })
                }
            }
        );

    useGesture(
        {
            onDrag: ({active, offset: [x,y]}) =>
                api.start({ x, y, rotateX: 0, rotateY: 0, scale: active ? 1 : 1.1 }),
            onPinch: ({ offset: [d, a] }) => api({ zoom: d / 200, rotateZ: a }),
            onMove: ({ xy: [px, py], dragging }) =>
                !dragging &&
                api({
                rotateX: calcX(py, y.get()),
                rotateY: calcY(px, x.get()),
                scale: 1.1,
                }),
            onHover: ({ hovering }) =>
                !hovering && api({ rotateX: 0, rotateY: 0, scale: 1 }),
        },
        { domTarget, eventOptions: { passive: false } }
    )


    return (
        <>
            <div className="flex flex-row place-items-center">
                <div className={styles.container}>
                    <animated.div
                    ref={domTarget}
                    className={styles.card}
                    {...bind()}
                    style={{
                        transform: 'perspective(600px)',
                        x,
                        y,
                        scale: to([scale, zoom], (s, z) => s + z),
                        rotateX,
                        rotateY,
                        rotateZ,
                    }}>
                    <animated.div>
                        <div style={{ backgroundImage: `url(${backgroundImageUrl})` }} />
                    </animated.div>
                    </animated.div>
                </div>
            </div>
            
            <div className={styles.startButton}>
                <div id="startButton" ></div>
            </div>
        </>
    )
}


export function isPuzzleMatched(x: number, y: number, positionx: number | undefined, positiony: number | undefined) {
    const diff = 60;
    if (x > positionx -360 - diff && x < positionx -360 + diff && y > positiony - 443 - diff && y < positiony - 443 + diff) {
        return true;
    } else if( x > 0 - diff && x < 0+ diff && y > 240- diff && y < 240 + diff ) {
        return true;
    } else return false;
}
