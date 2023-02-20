import React, { useRef, useEffect, useState, memo } from 'react'
import { useSpring, animated, to } from '@react-spring/web'
import { useDrag, useGesture } from 'react-use-gesture'
import { Provider, useSelector, useDispatch } from 'react-redux'
import itemStore from '@/components/Game/store'
import { useRouter } from 'next/router'
import styles from './styles.module.css'
import CloneVideo from './CloneVideo'

let mycnt = 0


const calcX = (y: number, ly: number) => -(y - ly - window.innerHeight / 2) / 20
const calcY = (x: number, lx: number) => (x - lx - window.innerWidth / 2) / 20

const wheel = (y: number) => {
    const imgHeight = window.innerWidth * 0.3 - 20
    return `translateY(${-imgHeight * (y < 0 ? 6 : 1) - (y % (imgHeight * 5))}px`
}

interface Props {
    i: number
    videoId: string
    auth: boolean
    peerxy: { peerx: number, peery: number } | undefined
    dataChannel: RTCDataChannel | undefined
    segmentState: string
}
function Segment({ i, auth, videoId, peerxy, dataChannel, segmentState }: Props) {

    //퍼즐 데이터 스토어와 연결 react-redux
    const dispatch = useDispatch();
    const storedPosition = useSelector((state: any) => { return auth ? state.myPuzzle : state.peerPuzzle });

    const router = useRouter();

    const [isRightPlace, setIsRightPlace] = useState(!auth)
    //아래 조건문 위로 올리면 안됨
    if (segmentState === 'ice') {
        auth = false;
    }
    const [zindex, setZindex] = useState(Math.floor(Math.random() * 10))
    // const videoElement = document.getElementById(videoId) as HTMLVideoElement;
    // const [width, height] = [videoElement.videoWidth / 3 * (i % 3), videoElement.videoHeight / 3 * ((i - i % 3) / 3)]
    const d = 1;
    // 현재 좌표 받아와서 퍼즐을 끼워맞출 곳을 보정해줄 값을 widthOx, heightOx에 저장
    const [widthOx, heightOx] = [640 / 3 * d, 480 / 3 * d]
    const [width, height] = [640 / 3 * (i % 3) - widthOx * 1.5, 480 / 3 * ((i - i % 3) / 3) + heightOx]

    // TODO : 옆으로 init 시 api.start 이동

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
        () => {
            return ({
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0,
                scale: 1,
                zoom: 0,
                x: storedPosition[i][0],
                y: storedPosition[i][1],
                config: { mass: 2, tension: 750, friction: 50 },
            })
        }
    )
    // api.start({ x: storedPosition[i][0], y: storedPosition[i][1] })

    useEffect(() => {
        if (peerxy !== undefined) {
            dispatch({ type: `${peerxy ? 'peerPuzzle' : 'myPuzzle'}/setPosition`, payload: { index: i, position: [peerxy.peerx, peerxy.peery] } });
            api.start({ x: peerxy.peerx, y: peerxy.peery, rotateX: 0, rotateY: 0 })
        }
    }, [peerxy])


    const [{ wheelY }, wheelApi] = useSpring(() => ({ wheelY: 0 }))

    //for bounding puzzle peace to board
    const boardPos = useSpring({ x: x, y: y })
    const bindBoardPos = useDrag((params) => {
        //     console.log('뜨냐 유즈드랙??')
        if (isRightPlace) return;
        //     // params.offset[0] = storedPosition[i][0];
        //     // params.offset[1] = storedPosition[i][1];
        //     // boardPos.x.set(params.offset[0]);
        x.set(params.offset[0]);
        y.set(params.offset[1]);
        //     console.log('params.offset[0] : ', params.offset[0], 'params.offset[1] : ', params.offset[1])
        //     // console.log(storedPosition[i][0], storedPosition[i][1], 'storred')
        // if (init) {
        //     x.set(init.initx);
        //     y.set(init.inity);
        //     init = undefined
        // }
        // else {
        // x.set(params.offset[0]);
        // // boardPos.y.set(params.offset[1]);
        // y.set(params.offset[1]);
        // }

        dispatch({ type: `${!auth ? 'peerPuzzle' : 'myPuzzle'}/setPosition`, payload: { index: i, position: [params.offset[0], params.offset[1]] } });
        // !params.down : 마우스를 떼는 순간
        if (!params.down && !isRightPlace && isNearOutline(x.get(), y.get(), width, height)) {
            domTarget.current!.setAttribute('style', 'z-index: 0')
            api.start({ x: width, y: height })
            setIsRightPlace(true)
            if (dataChannel)
                dataChannel.send(JSON.stringify({ type: 'cnt' }))
            mycnt += 1
            if (mycnt == 9) {
                const myface = document.getElementById('myface')
                myface!.style.display = 'block'
                document.getElementById('fullscreen')!.style.display = "none"
                setTimeout(() => {
                    router.push({
                        pathname: '/ready',
                    })
                }, 15000)

            }
            setZindex(0)
            dispatch({ type: `${auth ? 'myPuzzle' : 'peerPuzzle'}/${i}`, payload: { x: width, y: height } });
            if (dataChannel?.readyState === 'open') {
                dataChannel.send(JSON.stringify({ type: 'move', i: i, peerx: width, peery: height }));
                return
            }
        }
        if (dataChannel?.readyState === 'open') {
            // 데이터 공통 저장소에 저장해야함
            dataChannel.send(JSON.stringify({ type: 'move', i: i, peerx: x.get(), peery: y.get() }))
        }
    },
        {
            bounds: { top: 0, bottom: heightOx * 4, left: -widthOx * 2, right: widthOx * 1 },
            rubberband: 1
        }
    )



    useGesture(
        {
            onDrag: ({ active, offset: [x, y] }) => {

                if (isRightPlace) return;

                //TODO : active 신경써서 수치 변경
                api.start({ x: x, y: y, rotateX: 0, rotateY: 0, scale: active ? 1 : 1.05 })
                dispatch({ type: `${!auth ? 'peerPuzzle' : 'myPuzzle'}/setPosition`, payload: { index: i, position: [x, y] } });

                if (dataChannel?.readyState === 'open') {

                    dataChannel.send(JSON.stringify({ type: 'move', i: i, peerx: x, peery: y }))
                }
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
            // onDragEnd: ({ offset: [ox, oy] }) => {
            //     if (!isRightPlace && isNearOutline(ox, oy, width, height)) {
            //         domTarget.current!.setAttribute('style', 'z-index: 0')
            //         api.start({ x: width, y: height })
            //         setIsRightPlace(true)
            //         //TODO : 종료조건 넣어두기
            //         setZindex(0)
            //         if (dataChannel?.readyState === 'open') {
            //             dataChannel.send(JSON.stringify({ type: 'move', i: i, peerx: width, peery: height }));
            //         }
            //     }
            // },
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
            <div className={(segmentState === "rocket") ? 'hidden' : ''}>
                <div className={styles.container}>
                    <animated.div
                        ref={domTarget}
                        className={styles.card}
                        {...bindBoardPos()}
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
                            {(segmentState === "ice") && <img src="/images/ice.png" width={640 / 3} height={160} />}
                            {(segmentState === "default") && <CloneVideo key={i} id={i} videoId={videoId} segmentState={segmentState} />}
                        </animated.div>
                    </animated.div>
                </div>
            </div>

        </>
    )
}

export function isNearOutline(x: number, y: number, positionx: number, positiony: number) {
    const diff = 30;
    if (x > positionx - diff && x < positionx + diff && y > positiony - diff && y < positiony + diff) {
        return true;
    }
    else
        return false;
}



export default memo(Segment);