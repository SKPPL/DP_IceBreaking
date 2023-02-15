import React, { useRef, useEffect, useState, memo } from 'react'
import { useSpring, animated, to } from '@react-spring/web'
import { useGesture } from 'react-use-gesture'
import { Provider, useSelector, useDispatch } from 'react-redux'
import itemStore from '@/pages/rooms/itemStore'
import styles from './styles.module.css'
import dynamic from 'next/dynamic'
import Rocket from './rocket'

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


    // segmentState for item use
    const [mySegmentState, setMySegmentState] = useState({ type: "item", segementState: 'default' });
    // using after store value changed, for restoring purpose
    const makeMyDefaultSegment = () => { setMySegmentState({ type: "item", segementState: "default" }) }

    //dataChannel에 addEventListner 붙이기 (하나의 dataChannel에 이벤트리스너를 여러번 붙이는 것은 문제가 없다.)
    dataChannel!.addEventListener("message", (event: MessageEvent<any>): void => {
        if (event.data) {
            var dataJSON = JSON.parse(event.data);
            switch (dataJSON.type) {
                case "item": // 상대방이 아이템을 사용했을 때, 그 아이템을 받아와서 내 퍼즐에 동기화 시킨다. 5초 후 원상복귀 시킨다. 

                    setMySegmentState(dataJSON);
                    //TODO : 5초 후 원상복귀 시키는 코드, 좌표도 원상복귀 시켜야함 -> 좌표 store에 저장시켜놓고
                    setTimeout(() => { makeMyDefaultSegment() }, 5000);
                    break;
            }
        }
    })


    return (
        <>
            {
                [...Array(9)].map((_, i) => {
                    switch (mySegmentState.segementState) {
                        case "default":
                            return <PuzzleSegment key={i} i={i} auth={auth} videoId={videoId} peerxy={undefined} dataChannel={dataChannel} segmentState={mySegmentState.segementState} />
                        case "rocket":
                            if (i == 0) {
                                return <Rocket auth={true} peerxy={undefined} dataChannel={dataChannel} />
                            }
                        //TODO : 나머지 아이템 추가
                    }
                })
            }
        </>
    )
}


export default memo(MyPuzzle);