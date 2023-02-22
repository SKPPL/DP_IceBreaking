import React, { useRef, useEffect, useState, memo } from 'react'
import { useSpring, animated, to, Spring } from '@react-spring/web'
import { useGesture } from 'react-use-gesture'
import { Provider, useSelector, useDispatch } from 'react-redux'
import itemStore from '@/components/Game/store'
import styles from './styles.module.css'
import dynamic from 'next/dynamic'
import Rocket from './SegmentState/rocket'
import { useRouter } from 'next/router'
import Modal from '../PageElements/ItemAlert/Modal'
import MyBar from '../PageElements/ProgressBar/MyBar'
import { myWaitState } from "./atom";
import { useRecoilState } from 'recoil'

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
    // segmentState for item use
    const [mySegmentState, setMySegmentState] = useState({ type: "item", segementState: "default" });
    // using after store value changed, for restoring purpose
    const makeMyDefaultSegment = () => { setMySegmentState({ type: "item", segementState: "default" }) }
    const dispatch = useDispatch();

    const puzzleCompleteCounter = useSelector((state: any) => state.puzzleComplete);
    const router = useRouter();

    //dataChannel에 addEventListner 붙이기 (하나의 dataChannel에 이벤트리스너를 여러번 붙이는 것은 문제가 없다.)

    

    useEffect(() => {
        if (dataChannel) {
            dataChannel!.addEventListener("message", function myData(event: MessageEvent<any>) {
                if (event.data) {
                    var dataJSON = JSON.parse(event.data);
                    switch (dataJSON.type) {
                        case "item": // 상대방이 아이템을 사용했을 때, 그 아이템을 받아와서 내 퍼즐에 동기화 시킨다. 5초 후 원상복귀 시킨다. 
                            setMySegmentState(dataJSON);
                            if (dataJSON.segementState === "rocket" || dataJSON.segementState === "magnet") {
                                dispatch({ type: "puzzleComplete/init_mine" })
                            }
                            //TODO : 5초 후 원상복귀 시키는 코드, 좌표도 원상복귀 시켜야함 -> 좌표 store에 저장시켜놓고
                            setTimeout(() => {
                                makeMyDefaultSegment()
                            }, 8000);
                    }
                }
            })
        }
    }, []);

    useEffect(() => {
        if (puzzleCompleteCounter.mine === 9) {
            const myface = document.getElementById("myface");
            myface!.style.display = "block";
            document.getElementById("fullscreen")!.style.display = "none";
            setTimeout(() => {
                router
                    .replace({
                        pathname: "/ready",
                    })
                    .then(() => router.reload());
            }, 15000);
        }
    }, [puzzleCompleteCounter.mine])
    
    const [myWait, setMyWait] = useRecoilState(myWaitState)
    switch (mySegmentState.segementState) {
        case "rocket": setMyWait(true); break;
        case "magnet": setMyWait(true); break;
    }

    return (
        <>
            {
                [...Array(9)].map((_, i) => {
                    return (
                        <>
                            <div className={styles.c1}>
                                <PuzzleSegment key={`my${i}`} i={i} auth={auth} videoId={videoId} peerxy={undefined} dataChannel={dataChannel} segmentState={mySegmentState.segementState} />
                            </div>
                            </>
                    )
                }
                )
            }
            <Modal segmentState={mySegmentState.segementState}/>
            <MyBar score={puzzleCompleteCounter.mine}/>
        </>
    )
}


export default memo(MyPuzzle);