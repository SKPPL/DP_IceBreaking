import React, { useEffect, useState, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./styles.module.css";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Modal from "../PageElements/ItemAlert/Modal";
import MyBar from "../PageElements/ProgressBar/MyBar";
import useSound from "use-sound";
import { startItem, stopItem } from "../FaceDetection/FaceLandMarkPeer";
import MakeVideoTwirl from "../FaceDetection/MakeVideoTwirl";
import MakeVideoLip from "../FaceDetection/MakeVideoLip";
import MyGameParticles from "../PageElements/Particles/gameParticles";


// import Segment from './Segment'
const PuzzleSegment = dynamic(import("@/components/Game/Segment"), {
    loading: () => <div></div>,
    ssr: false,
});

interface Props {
    videoId: string;
    auth: boolean;
    dataChannel: RTCDataChannel | undefined;
}
const fanFareSoundUrl = '/sounds/Fanfare.mp3';
const winSoundUrl = '/sounds/YouWin.mp3';
const ceremonySoundUrl = '/sounds/ceremonysound.mp3';


function MyPuzzle({ auth, videoId, dataChannel }: Props) {
    // segmentState for item use
    const [mySegmentState, setMySegmentState] = useState({ type: "item", segmentState: "default" });
    // using after store value changed, for restoring purpose
    const makeMyDefaultSegment = () => {
        setMySegmentState({ type: "item", segmentState: "default" });
    };
    const dispatch = useDispatch();

    const puzzleCompleteCounter = useSelector((state: any) => state.puzzleComplete);
    const router = useRouter();
    const [fanFareSoundPlay] = useSound(fanFareSoundUrl);
    const [winSoundPlay] = useSound(winSoundUrl);
    const [ceremonySoundPlay] = useSound(ceremonySoundUrl);
    const [isFinished, setIsFinished] = useState(false);
    const [isStart, setIsStart] = useState(true);

    //dataChannel에 addEventListner 붙이기 (하나의 dataChannel에 이벤트리스너를 여러번 붙이는 것은 문제가 없다.)


    useEffect(() => {
        setTimeout(() => {
            setIsStart(false);
        }, 5800);
        if (dataChannel) {
            dataChannel!.addEventListener("message", function myData(event: MessageEvent<any>) {
                if (event.data) {
                    let dataJSON = JSON.parse(event.data);
                    switch (dataJSON.type) {
                        case "item":
                            setMySegmentState(dataJSON);
                            if (dataJSON.segmentState === "rocket" || dataJSON.segmentState === "magnet") {
                                setTimeout(()=>{
                                    dispatch({ type: "puzzleComplete/init_mine" });
                                    dispatch({ type: "defaultSegmentRightPlace/init" });
                                }, 200);
                            }
                            dataChannel.send(JSON.stringify({ type: "itemExecuted", segmentState: dataJSON.segmentState }));
                            switch (dataJSON.segmentState) {

                                case "rocket":
                                    setTimeout(() => {
                                        makeMyDefaultSegment();
                                        if (dataChannel) dataChannel.send(JSON.stringify({ type: "itemTimeout", segmentState: dataJSON.segmentState }));
                                    }, 9000);
                                    break;
                                case "ice":
                                    setTimeout(() => {
                                        makeMyDefaultSegment();
                                        if (dataChannel) dataChannel.send(JSON.stringify({ type: "itemTimeout", segmentState: dataJSON.segmentState }));
                                    }, 10000);
                                    break;
                                case "magnet":
                                    setTimeout(() => {
                                        makeMyDefaultSegment();
                                        if (dataChannel) dataChannel.send(JSON.stringify({ type: "itemTimeout", segmentState: dataJSON.segmentState }));
                                    }, 7000);
                                    break;
                                case "lip":
                                    setTimeout(() => {
                                        makeMyDefaultSegment();
                                        if (dataChannel) dataChannel.send(JSON.stringify({ type: "itemTimeout", segmentState: dataJSON.segmentState }));
                                    }, 10000);
                                    break;
                                case "twirl":
                                    setTimeout(() => {
                                        makeMyDefaultSegment();
                                        if (dataChannel) dataChannel.send(JSON.stringify({ type: "itemTimeout", segmentState: dataJSON.segmentState }));
                                    }, 10000);

                                    break;
                            }
                    }
                }
            });
        }
    }, []);

    useEffect(() => {
        if (puzzleCompleteCounter.mine === 9 && puzzleCompleteCounter.peer !== 9) {
            if (dataChannel) dataChannel.send(JSON.stringify({ type: "peerWin", won: true }));
            setIsFinished(true);
            winSoundPlay();
            setTimeout(() => {
                const myface = document.getElementById("myface");
                myface!.style.display = "block";
                document.getElementById("fullscreen")!.style.display = "none";
                document.getElementById("itembar")!.style.display = "none";
                document.getElementById("face")!.style.display = "block";
                fanFareSoundPlay();
                ceremonySoundPlay();
                setTimeout(() => {
                    router
                        .replace({
                            pathname: "/ready",
                        })
                        .then(() => router.reload());
                }, 15000);
            }, 5000);

        }
    }, [puzzleCompleteCounter.mine]);

    if (mySegmentState.segmentState === "lip") {
        startItem();
        setTimeout(() => {
            stopItem();
        }, 10000);
    }

    return (
        <>
            {isStart && <div className="fixed h-screen w-[200vw] z-[9999]"></div>}
            {isFinished && <>
                <div className={`fixed ml-[50vw] mt-[270px] w-[100vw] text-center text-9xl z-50 ${styles.win}`}> YOU WIN </div>
                <div className="fixed h-screen w-[200vw] z-[9999]"></div>
            </>}
            {
                [...Array(9)].map((_, i) => {
                    return (
                        <>
                            <div className={`${styles[`c${i}`]}`} key={`mypuzzle_${i}`}>
                                <PuzzleSegment key={`my${i}`} i={i} auth={auth} videoId={videoId} peerxy={undefined} dataChannel={dataChannel} segmentState={mySegmentState.segmentState} isRightCard={false} />
                            </div>
                        </>
                    );
                }
                )
            }
            {isFinished &&
                <>
                    <div className={`absolute flex justify-center items-center w-[640px] h-[480px] mt-[100px] ${styles.finish}`}>
                        <img src="../images/finish.gif" className={`z-40 ${styles.gif}`} draggable="false" style={{ pointerEvents: "none" }} />
                    </div>
                </>
            }

            {/* 아이템 쓸 때 나오는 효과 */}
            <div className="absolute grid w-[640px] h-[480px] mt-[100px]" style={{ pointerEvents: "none" }}>
                <MyGameParticles mysegmentState={mySegmentState.segmentState} />
                {mySegmentState.segmentState === 'ice' && (<div id="myice" className={`flex fill`} style={{ pointerEvents: "none" }} > <img src="../images/icemine.gif" className={`z-50 ${styles.gif}`} draggable="false" style={{ pointerEvents: "none" }} /> </div>)}
                {mySegmentState.segmentState === 'magnet' && (<div id="mymagnet" className={`flex fill`} style={{ pointerEvents: "none" }} > <img src="../images/blackholemine.gif" className={`z-50 ${styles.gif}`} draggable="false" style={{ pointerEvents: "none" }} /> </div>)}
                {mySegmentState.segmentState === 'lip' && (<div id="mylip" className={`flex fill`} style={{ pointerEvents: "none" }} > <img src="../images/lipmine.gif" className={`z-50 ${styles.gif2}`} draggable="false" style={{ pointerEvents: "none" }} /> </div>)}
                {mySegmentState.segmentState === 'twirl' && (<div id="mytwirl" className={`flex fill`} style={{ pointerEvents: "none" }} > </div>)}
                {mySegmentState.segmentState === 'rocket' && (<div id="myrocket" className={`flex fill`} style={{ pointerEvents: "none" }} > <img src="../images/rocketmine.gif" className={`z-50 ${styles.gif}`} draggable="false" style={{ pointerEvents: "none" }} /> </div>)}
            </div>
            <MyBar score={puzzleCompleteCounter.mine} />
            <Modal segmentState={mySegmentState.segmentState} />
            {mySegmentState.segmentState === 'lip' && <MakeVideoLip auth={auth} />}
            {mySegmentState.segmentState === 'twirl' && <MakeVideoTwirl videoId={videoId} auth={auth} />}
        </>
    );
}

export default memo(MyPuzzle);