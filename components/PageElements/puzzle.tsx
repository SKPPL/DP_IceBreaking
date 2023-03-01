import Head from "next/head";
import React, { ReactNode, useState, useEffect, useRef } from 'react'
import { useSpring, animated, to } from '@react-spring/web'
import { useDrag, useGesture } from 'react-use-gesture'
import styles from "./styles.module.css";
import { useRouter } from "next/router";

const puzzleImageUrl = '/images/currentSmallPiece.png'

const calcX = (y: number, ly: number) => -(y - ly - window.innerHeight / 2) / 20
const calcY = (x: number, lx: number) => (x - lx - window.innerWidth / 2) / 20



interface MyConstraints {
    audio?: boolean | MediaTrackConstraints;
    video?: boolean | MediaTrackConstraints;
}


export default function PuzzleScreen() {
    
    const router = useRouter();
    // const userVideoRef = useRef<any>();
    const userStreamRef = useRef<MediaStream>();
    var cloneRef = useRef<HTMLCanvasElement>(null);
    var ctx: CanvasRenderingContext2D | null = null;
    const puzzleImage = new Image();
    puzzleImage.src = puzzleImageUrl;
    const [innerWidth, setInnerWidth] = useState(window.innerWidth);
    const [innerHeight, setInnerHeight] = useState(window.innerHeight);
    const movingRef = useRef<HTMLDivElement>(null);
    const [divX, setDivX] = useState(0); //퍼즐의 절대위치 X
    const [divY, setDivY] = useState(0); //퍼즐의 절대위치 y
    const [puzzleHoleX,setHoleX] = useState(1); //퍼즐 구멍의 화면 절대위치 X
    const [puzzleHoleY,setHoleY] = useState(1); //퍼즐 구멍의 화면 절대위치 Y
    const puzzleWidth = 230/1440*innerWidth;
    const puzzleHeight = 255/781*innerHeight;


    function findPosition() {
        if (!movingRef.current) return;
        setDivX(movingRef.current!.getBoundingClientRect().x);
        setDivY(movingRef.current!.getBoundingClientRect().y);
        setHoleX(innerWidth*(1250/1440));
        setHoleY(innerHeight*(640/780));
        console.log("innerWidth", innerWidth, "innerHeight", innerHeight);
        console.log("puzzleW", puzzleWidth, "puzzleH", puzzleHeight);
    }



    function draw(){
        ctx!.drawImage(puzzleImage,0,0, puzzleWidth, puzzleHeight);
        setTimeout(() => {
            draw()
        }, 40);
    }

    useEffect(() => {
        if (!cloneRef) return;

        ctx = cloneRef.current!.getContext('2d');
        
        const preventDefault = (e: Event) => e.preventDefault();
        document.addEventListener('gesturestart', preventDefault);
        document.addEventListener('gesturechange', preventDefault);

        draw()
        findPosition();

    
        return () => {
          document.removeEventListener('gesturestart', preventDefault);
          document.removeEventListener('gesturechange', preventDefault);
        }
      }, [cloneRef, puzzleHoleX])

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
                    console.log(x.get(), y.get());
                }
                if(!params.down && isPuzzleMatched(x.get(), y.get(), puzzleHoleX, puzzleHoleY, divX, divY)) {
                    // router.push({
                    //     pathname: '/ready',
                    // })
                    console.log('성공')
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
            <div className={styles.container} id="movingPiece" ref={movingRef}>
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
                    <canvas id="puzzlePiece" width={puzzleWidth} height={puzzleHeight} ref={cloneRef}></canvas>
                </animated.div>
                </animated.div>
            </div>
        </>
    )
}


export function isPuzzleMatched(x: number, y: number, holeX: number, holeY: number, divX:number, divY: number) {
    const diff = 90;
    if( x+ divX > holeX - diff && x + divX < holeX + diff && y + divY > holeY - diff && y + divY < holeY + diff ) {
        return true;
    } else return false;
}
