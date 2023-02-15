import React, { useRef, useEffect, useState, memo } from 'react'
import { useSpring, animated, to } from '@react-spring/web'
import { useGesture } from 'react-use-gesture'
import { Provider, useSelector, useDispatch } from 'react-redux'
import itemStore from '@/pages/rooms/store'
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
function PeerPuzzle({ auth, videoId, dataChannel }: Props) {

    // peerPosition for concurrent position sync 
    const [peerPosition, setPeerPosition] = useState({ type: "move", i: -1, peerx: 0, peery: 0 });
    // for peer Item state 
    const [peerSegmentState, setPeerSegmentState] = useState({ type: "item", segementState: "default" });

    const [cnt, setCnt] = useState(1)

    const makePeerDefaultSegment = () => { setPeerSegmentState({ type: "item", segementState: "default" }) }

    //dataChannel에 addEventListner 붙이기 (하나의 dataChannel에 이벤트리스너를 여러번 붙이는 것은 문제가 없다.)
    dataChannel!.addEventListener("message", (event: any) => {
        if (event.data) {
            var dataJSON = JSON.parse(event.data);
            switch (dataJSON.type) {
                case "move": // 상대방이 움직였을 때 , 그 좌표를 받아와서 상대방 퍼즐에 동기화 시킨다. 
                    // TODO : 상대방 퍼즐이 로켓 상태인 경우, 그 외의 경우로 나눠야함
                    setPeerPosition(dataJSON);
                    break;
                case "cnt": // 상대방이 퍼즐을 하나 맞출 때 마다 카운트 증가 
                    setCnt(cnt + 1)
                    if (cnt === 9) {
                        const peer = document.getElementById('peerface')
                        peer!.style.display = "block"
                        document.getElementById('fullscreen')!.style.display = "none"
                    }
                    break;
            }
        }
    })




    //item 사용을 위한 코드
    const itemList = useSelector((state: any) => { return state.item });

    const [itemListBefore, setItemListBefore] = useState(itemList);
    const keys = Object.keys(itemList);


    // 상대의 퍼즐 변경은 useEffect로 처리하면서 데이터채널로 뭐 변했는지 보내자
    useEffect(() => {
        for (var cnt = 0; cnt < 6; cnt++) {
            if (itemListBefore[keys[cnt]] !== itemList[keys[cnt]]) {
                dataChannel?.send(JSON.stringify({ type: "item", segementState: keys[cnt] }))
                setItemListBefore(itemList);
                setPeerSegmentState({ type: "item", segementState: keys[cnt] })
                setTimeout(() => { makePeerDefaultSegment() }, 5000);
                console.log(keys[cnt])
            }
            // peerface쪽 segmentState를 변경
            // 무엇의 상태가 변했는지 알려줘야함
            //TODO 아이템 사용 도중일 땐 눌러도 소용 없게하는 로직 추가해야함 -> itemBar쪽에서 처리하자
        }
    }, [itemList]);


    return (
        <>
            {
                [...Array(9)].map((_, i) => {
                    return (
                        <>
                            {(peerPosition.i === i) ? <PuzzleSegment key={i} i={i} auth={auth} videoId={videoId} peerxy={{ peerx: peerPosition.peerx, peery: peerPosition.peery }} dataChannel={dataChannel} segmentState={peerSegmentState.segementState} /> : <PuzzleSegment key={i} i={i} auth={auth} videoId={videoId} peerxy={undefined} dataChannel={dataChannel} segmentState={peerSegmentState.segementState} />}

                            {(peerSegmentState.segementState === 'rocket') && <Rocket key={`rocket_${i}_peerface`} i={i} auth={auth} peerxy={undefined} dataChannel={dataChannel} />}
                        </>
                    )
                }
                )
            }
        </>
    )

}


export default memo(PeerPuzzle);