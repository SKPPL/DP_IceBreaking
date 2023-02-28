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
import { useRecoilState, useRecoilValue } from 'recoil'
import useSound from 'use-sound'
import IceFlakeParticles from '../PageElements/Particles/iceFlakeParticles'
import BlackhallParticles from '../PageElements/Particles/blackhallParticles'
import { getGuestLip, startItem, stopItem } from "../FaceDetection/FaceLandMarkPeer";
import LipParticles from '../PageElements/Particles/lipParticles'
import MakeVideoTwirl from '../FaceDetection/MakeVideoTwirl'

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

const fanFareSoundUrl = '/sounds/Fanfare.mp3';
const shuffleSoundUrl = '/sounds/shuffle.mp3';
let isStart = true;

function MyPuzzle({ auth, videoId, dataChannel }: Props) {
    // segmentState for item use
    const [mySegmentState, setMySegmentState] = useState({ type: "item", segementState: "default" });
    // using after store value changed, for restoring purpose
    const makeMyDefaultSegment = () => { setMySegmentState({ type: "item", segementState: "default" }) }
    const dispatch = useDispatch();

    const puzzleCompleteCounter = useSelector((state: any) => state.puzzleComplete);
    const router = useRouter();
    const [fanFareSoundPlay] = useSound(fanFareSoundUrl);
    const [shuffleSoundPlay] = useSound(shuffleSoundUrl);

    if (isStart) {
        shuffleSoundPlay()
        setTimeout(() => isStart = false, 1000)
    }

    //dataChannel에 addEventListner 붙이기 (하나의 dataChannel에 이벤트리스너를 여러번 붙이는 것은 문제가 없다.)


    const [myWait, setMyWait] = useRecoilState(myWaitState)

    useEffect(() => {
        if (dataChannel) {
            dataChannel!.addEventListener("message", function myData(event: MessageEvent<any>) {
                if (event.data) {
                    var dataJSON = JSON.parse(event.data);
                    switch (dataJSON.type) {
                        case "item":
                            setMySegmentState(dataJSON);
                            if (dataJSON.segementState === "rocket" || dataJSON.segementState === "magnet") {
                                dispatch({ type: "puzzleComplete/init_mine" })
                            }
                            switch (dataJSON.segementState) {
                                case "rocket": setTimeout(() => { makeMyDefaultSegment() }, 9000); break;
                                case "ice": setTimeout(() => { makeMyDefaultSegment() }, 15000); break;
                                case "magnet": setTimeout(() => { makeMyDefaultSegment() }, 7000); break;
                                case "lip": setTimeout(() => { makeMyDefaultSegment() }, 10000); break;
                                case "twirl": setTimeout(() => { makeMyDefaultSegment() }, 10000); break;

                            }
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
            document.getElementById("itembar")!.style.display = "none";
            document.getElementById("face")!.style.display = "block";
            fanFareSoundPlay();
            setTimeout(() => {
                router
                    .replace({
                        pathname: "/ready",
                    })
                    .then(() => router.reload());
            }, 15000);
        }
    }, [puzzleCompleteCounter.mine])

    if (mySegmentState.segementState === 'lip' || mySegmentState.segementState === 'twirl') {
        startItem();
        setTimeout(() => { stopItem() }, 10000);
    }


    return (
        <>
            {
                [...Array(9)].map((_, i) => {
                    return (
                        <>
                            <div className={styles.c1} key={`mypuzzle_${i}`}>
                                <PuzzleSegment key={`my${i}`} i={i} auth={auth} videoId={videoId} peerxy={undefined} dataChannel={dataChannel} segmentState={mySegmentState.segementState} />
                            </div>
                        </>
                    )
                }
                )
            }
            {/* 아이템 쓸 때 나오는 효과 */}
            <div className="absolute grid w-[640px] h-[480px] mt-[160px]" style={{ pointerEvents: "none" }}>
                {mySegmentState.segementState === 'ice' && (<div className={`flex fill`} style={{ pointerEvents: "none" }} > <IceFlakeParticles /> <img src="../images/icemine.gif" className={`z-50 ${styles.gif}`} draggable="false" style={{ pointerEvents: "none" }} /> </div>)}
                {mySegmentState.segementState === 'magnet' && (<div className={`flex fill`} style={{ pointerEvents: "none" }} > <BlackhallParticles /> <img src="../images/blackholemine.gif" className={`z-50 ${styles.gif}`} draggable="false" style={{ pointerEvents: "none" }} /> </div>)}
                {mySegmentState.segementState === 'lip' && (<div className={`flex fill`} style={{ pointerEvents: "none" }} > <LipParticles /> <img src="../images/lipmine.gif" className={`z-50 ${styles.gif}`} draggable="false" style={{ pointerEvents: "none" }} /> </div>)}
                {mySegmentState.segementState === 'twirl' && (<div className={`flex fill`} style={{ pointerEvents: "none" }} >  </div>)}

            </div>
            <MyBar score={puzzleCompleteCounter.mine} />
            <Modal segmentState={mySegmentState.segementState} />
            {mySegmentState.segementState === 'twirl' && <MakeVideoTwirl videoId={videoId} auth={auth} />}

        </>
    )
}


export default memo(MyPuzzle);
