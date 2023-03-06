import React, { useRef, useEffect, useState } from 'react';
import { useSpring, animated, to, config } from '@react-spring/web';
import { useDrag } from 'react-use-gesture';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { scale, dist } from 'vec-la';
import { Provider, useSelector, useDispatch } from 'react-redux';
import styles from '../styles.module.css';
import { useWindowSize } from 'usehooks-ts';
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil';
import { myWaitState, peerWaitState } from '../atom';
interface Props {
    i: number;
    peerxy: { peerx: number, peery: number; } | undefined;
    dataChannel: RTCDataChannel | undefined;
    auth: boolean;
}

let clickedMy = [false, false, false, false, false, false, false, false, false];
let clickedPeer = [false, false, false, false, false, false, false, false, false];

export default function rocket({ i, auth, dataChannel }: Props) {

    const storedPosition = useSelector((state: any) => { return auth ? state.myPuzzle : state.peerPuzzle; });
    const dispatch = useDispatch();
    const [{ pos }, api] = useSpring(() => ({ pos: [25, 25] }));
    const [{ angle }, angleApi] = useSpring(() => ({
        angle: 0,
        config: config.slow,
    }));
    const [flipped, setFlip] = useState(false);
    const { transform } = useSpring({
        transform: `rotateY(${flipped ? 180 : 0}deg)`,
    });
    // direction calculates pointer direction
    // memo is like a cache, it contains the values that you return inside "set"
    // this way we can inject the springs current coordinates on the initial event and
    // add movement to it for convenience
    var memo = useRef({ x: storedPosition[i][0], y: storedPosition[i][1] });
    const d = 1;
    // 현재 좌표 받아와서 퍼즐을 끼워맞출 곳을 보정해줄 값을 widthOx, heightOx에 저장
    const [widthOx, heightOx] = [213 * d, 160 * d];
    const [width, height] = [213 * (i % 3) - widthOx * 1.5, 160 * ((i - (i % 3)) / 3) + heightOx];

    const bind = useDrag(
        ({ xy, previous, down, movement: pos, velocity, direction }) => {
            if ((auth && clickedMy[i]) || (!auth && clickedPeer[i])) return;
            // 내꺼든 상대방 것이든 아무튼 움직일 수 있음
            // if (!auth) return
            // 상대방에게 내가 발생시킨 이벤트를 모두 전달
            api.start({
                pos: [Math.min(Math.max(pos[0], -widthOx * 2 - storedPosition[i][0]), widthOx * 1 - storedPosition[i][0]), Math.min(Math.max(pos[1], 0 - storedPosition[i][1]), heightOx * 3.5 - storedPosition[i][1])],
                immediate: down,
                config: { velocity: scale(direction, velocity), decay: true },
            });

            if (direction[0] < 0 && flipped === false) { setFlip(true); }
            if (direction[0] > 0 && flipped === true) { setFlip(false); }
            if (dist(xy, previous) > 10 || !down)
                angleApi.start({ angle: flipped ? (Math.atan2(direction[0], 1) + 0.5) : (Math.atan2(direction[0], 1) - 0.5) });
            if (dataChannel) {
                dataChannel.send(JSON.stringify({ type: 'rocket', i: i, auth: auth, xy: xy, previous: previous, down: down, pos: pos, velocity: velocity, direction: direction, flipped: flipped }));
            }
        },
        {
            initial: () => pos.get(),
            rubberband: 1,
        }
    );
    // 상대가 발생시킨 이벤트를 받아서 그대로 원래 useDrag에서 실행하던 것처럼 실행
    useEffect(() => {
        if (dataChannel) {
            dataChannel!.addEventListener("message", function rocket(event: MessageEvent<any>) {
                if (event.data) {
                    let dataJSON = JSON.parse(event.data);
                    switch (dataJSON.type) {
                        case "rocket":
                            if (i === dataJSON.i && auth === !dataJSON.auth) {
                                if(auth){
                                    clickedMy[i] = dataJSON.down;
                                }else{
                                    clickedPeer[i] = dataJSON.down;
                                }
                                if (dataJSON.direction[0] < 0 && dataJSON.flipped === false) { setFlip(true); }
                                else if (dataJSON.direction[0] > 0 && dataJSON.flipped === true) { setFlip(false); }
                                api.start({
                                    pos: [Math.min(Math.max(dataJSON.pos[0], -widthOx * 2 - storedPosition[i][0]), widthOx * 1 - storedPosition[i][0]), Math.min(Math.max(dataJSON.pos[1], 0 - storedPosition[i][1]), heightOx * 3.5 - storedPosition[i][1])],
                                    immediate: dataJSON.down,
                                    config: { velocity: scale(dataJSON.direction, dataJSON.velocity), decay: true },
                                });
                                if (dist(dataJSON.xy, dataJSON.previous) > 10 || !dataJSON.down)
                                    angleApi.start({ angle: dataJSON.flipped ? (Math.atan2(dataJSON.direction[0], 1) + 0.5) : (Math.atan2(dataJSON.direction[0], 1) - 0.5) });
                                break;
                            }
                    }
                }
            });
        }
    }, []);
    const setMyWait = useSetRecoilState(myWaitState);
    const setPeerWait = useSetRecoilState(peerWaitState);
    useEffect(() => {
        return () => {
            dispatch({ type: `${!auth ? "peerPuzzle" : "myPuzzle"}/setPosition`, payload: { index: i, position: [memo.current.x, memo.current.y] } });
            auth ? setMyWait((prev) => prev - 1) : setPeerWait((prev) => prev - 1);
        };
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
                    [pos, angle, transform],
                    // @ts-ignore
                    ([x, y], a) => {
                        x = Math.min(Math.max(x, -widthOx * 2 - storedPosition[i][0]), widthOx * 1 - storedPosition[i][0]);
                        y = Math.min(Math.max(y, 0 - storedPosition[i][1]), heightOx * 4 - storedPosition[i][1]);
                        memo.current.x = storedPosition[i][0] + x;
                        memo.current.y = storedPosition[i][1] + y;
                        return `translate3d(${x}px,${y}px,0) rotate(${a}rad) rotateY(${flipped ? 180 : 0}deg)`;
                    },
                ),
            }}
        />
    );
}