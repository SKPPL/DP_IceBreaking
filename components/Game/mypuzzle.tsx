import React, { useRef, useEffect, useState, memo } from 'react'
import { useSpring, animated, to, Spring } from '@react-spring/web'
import { useGesture } from 'react-use-gesture'
import { Provider, useSelector, useDispatch } from 'react-redux'
import itemStore from '@/components/Game/store'
import styles from './styles.module.css'
import dynamic from 'next/dynamic'
import Rocket from './SegmentState/rocket'
// import Segment from './Segment'
const PuzzleSegment = dynamic(
    import('@/components/Game/Segment'), {
    loading: () => (<div></div>),
    ssr: false,
},
);
interface Props {
    videoId: string
    auth: boolean
    dataChannel: RTCDataChannel | undefined
}
function MyPuzzle({ auth, videoId, dataChannel }: Props) {

    const storedPosition = useSelector((state: any) => { return auth ? state.myPuzzle : state.peerPuzzle });

    // segmentState for item use
    const [mySegmentState, setMySegmentState] = useState({ type: "item", segementState: "default" });
    // using after store value changed, for restoring purpose
    const makeMyDefaultSegment = () => { setMySegmentState({ type: "item", segementState: "default" }) }

    //dataChannel에 addEventListner 붙이기 (하나의 dataChannel에 이벤트리스너를 여러번 붙이는 것은 문제가 없다.)

    useEffect(() => {
        if (dataChannel) {
            dataChannel!.addEventListener("message", function myData(event: MessageEvent<any>) {
                let count = 0
                if (event.data) {
                    var dataJSON = JSON.parse(event.data);
                    console.log(count++);
                    switch (dataJSON.type) {
                        case "item": // 상대방이 아이템을 사용했을 때, 그 아이템을 받아와서 내 퍼즐에 동기화 시킨다. 5초 후 원상복귀 시킨다. 
                            setMySegmentState(dataJSON);
                            console.log(dataJSON);

                            //TODO : 5초 후 원상복귀 시키는 코드, 좌표도 원상복귀 시켜야함 -> 좌표 store에 저장시켜놓고
                            setTimeout(() => { makeMyDefaultSegment() }, 8000);
                    }
                }
            })
        }
    }, []);



    return (
        <>
            {
                [...Array(9)].map((_, i) => {
                    return (
                        <>
                            <Spring from={{ x: -500, scale: 1.5 }} to={{ x: 0, scale:1}} delay={150*i}>
                            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            @ts-ignore */}    
                                {style => <animated.div style={style}>
                            <PuzzleSegment key={`my${i}`} i={i} auth={auth} videoId={videoId} peerxy={undefined} dataChannel={dataChannel} segmentState={mySegmentState.segementState} />
                            </animated.div>}
                            </Spring>
                        </>
                    )
                }
                )
            }
        </>
    )
}


export default memo(MyPuzzle);