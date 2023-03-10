import React, { useEffect, useState, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./styles.module.css";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import ModalPeer from "../PageElements/ItemAlertPeer/ModalPeer";
import Bar from "@/components/PageElements/ProgressBar/Bar";
import useSound from 'use-sound';
import { startItem, stopItem } from "../FaceDetection/FaceLandMarkMy";
import MakeVideoTwirl from "../FaceDetection/MakeVideoTwirl";
import MakeVideoLip from "../FaceDetection/MakeVideoLip";
import { useSetRecoilState } from 'recoil';
import { peerItemState } from "../Game/atom";

let isRightPlace: boolean[] = [false, false, false, false, false, false, false, false, false];
let i: number;

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
const loseSoundUrl = '/sounds/YouLose.mp3';
const ceremonySoundUrl = '/sounds/ceremonysound.mp3';

function PeerPuzzle({ auth, videoId, dataChannel }: Props) {
  // peerPosition for concurrent position sync
  const [peerPosition, setPeerPosition] = useState({ type: "move", i: -1, peerx: 0, peery: 0 });
  // for peer Item state
  const [peerSegmentState, setPeerSegmentState] = useState({ type: "item", segmentState: "default" });
  const [isFinished, setIsFinished] = useState(false);

  const dispatch = useDispatch();
  const puzzleCompleteCounter = useSelector((state: any) => state.puzzleComplete);

  const makePeerDefaultSegment = () => {
    setPeerSegmentState({ type: "item", segmentState: "default" });
  };
  const router = useRouter();

  const [fanFareSoundPlay] = useSound(fanFareSoundUrl);
  const [loseSoundPlay] = useSound(loseSoundUrl);
  const [ceremonySoundPlay] = useSound(ceremonySoundUrl);
  //dataChannel에 addEventListner 붙이기 (하나의 dataChannel에 이벤트리스너를 여러번 붙이는 것은 문제가 없다.)

  const [peerWinFlag, setPeerWin] = useState(false);

  const setPeerItemState = useSetRecoilState(peerItemState);

  useEffect(() => {
    if (dataChannel) {
      dataChannel!.addEventListener("message", function peerData(event: any) {
        if (event.data) {
          let dataJSON = JSON.parse(event.data);
          switch (dataJSON.type) {
            case "move": // 상대방이 움직였을 때 , 그 좌표를 받아와서 상대방 퍼즐에 동기화 시킨다.
              // TODO : 상대방 퍼즐이 로켓 상태인 경우, 그 외의 경우로 나눠야함
              setPeerPosition(dataJSON);
              break;

            case "item":
              if (dataJSON.segmentState === "magnet") {
                setPeerPosition({ type: "move", i: -1, peerx: 0, peery: 0 });
              }
              break;
            case "cnt": // 상대방이 퍼즐을 하나 맞출 때 마다 카운트 증가
              if(peerSegmentState.segmentState !== 'magnet' && peerSegmentState.segmentState !== 'rocket'){
                dispatch({ type: `puzzleComplete/plus_peer` });
                i = dataJSON.i;
                { dataJSON.isRightPlace ? isRightPlace[i] = true : false; }
              }
              break;
            case "itemExecuted":
              setPeerSegmentState({ type: "item", segmentState: dataJSON.segmentState });
              if (dataJSON.segmentState === "rocket" || dataJSON.segmentState === "magnet") {
                dispatch({ type: `puzzleComplete/init_peer` });
                isRightPlace = [false, false, false, false, false, false, false, false, false];
              }
              break;
            case "itemTimeout":
              switch (dataJSON.segmentState) {
                case "rocket":
                  // default에서 마지막으로 세팅되어있던 peerposition이 다시 default로 돌아왔을때 영향을 주게하지 못하게 다른 아이템으로 넘어갈 때 peerposition을 초기화시키고 넘기기
                  setPeerPosition({ type: "move", i: -1, peerx: 0, peery: 0 });
                  makePeerDefaultSegment();
                  break;
                  case "magnet":
                    setPeerPosition({ type: "move", i: -1, peerx: 0, peery: 0 });
                    makePeerDefaultSegment();
                    break;
                case "ice": 
                    makePeerDefaultSegment(); 
                    setPeerItemState(false);
                    break;
                case "lip": makePeerDefaultSegment(); break;
                case "twirl": makePeerDefaultSegment(); break;
              }
              break;
            case "peerWin":
              if (dataJSON.won === true){
                setPeerWin(true);
              }
          }
        }
      });
    }
  }, []);



  //useSelector는 state가 변경되었다면 functional component가 render한 이후에 실행됩니다.
  useEffect(() => {
    if ((puzzleCompleteCounter.peer === 9 && puzzleCompleteCounter.mine !== 9) || peerWinFlag) {
      setIsFinished(true);
      loseSoundPlay();
      setTimeout(() => {
        const peer = document.getElementById("peerface");
        peer!.style.display = "block";
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
  }, [puzzleCompleteCounter.peer, peerWinFlag]);

  //item 사용을 위한 코드
  const itemList = useSelector((state: any) => {
    return state.item;
  });

  const [itemListBefore, setItemListBefore] = useState(itemList);
  const keys = Object.keys(itemList);

  // 상대의 퍼즐 변경은 useEffect로 처리하면서 데이터채널로 뭐 변했는지 보내자

  // 상대의 퍼즐 변경은 시간으로하지않고 상대가 시간이 끝났음을 send 받았을 떄만 해야한다.
  useEffect(() => {
    for (let cnt = 0; cnt < keys.length; cnt++) {
      if (itemListBefore[keys[cnt]] !== itemList[keys[cnt]]) {
        if (dataChannel) dataChannel.send(JSON.stringify({ type: "item", segmentState: keys[cnt] }));
        setItemListBefore(itemList);
        if (keys[cnt] === "ice"){
          setPeerItemState(true);
        }
      }
    }
  }, [itemList]);

  if (peerSegmentState.segmentState === 'lip') {
    startItem();
    setTimeout(() => { stopItem(); }, 10000);
  }

  return (
    <>
      {isFinished && <>
        <div className={`fixed mr-[50vw] mt-[270px] w-[100vw] text-center text-9xl z-50 text-blue-900 ${styles.lose}`}> YOU LOSE </div>
        <div className="fixed h-screen w-[200vw] z-[9999]"></div>
      </>}
      {[...Array(9)].map((_, i) => {
        return (
          <>
            <div className={`${styles[`c${i}`]}`} key={`peerpuzzle_${i}`}>
              {(peerPosition.i === i) && <PuzzleSegment key={`peer${i}`} i={i} auth={auth} videoId={videoId} peerxy={{ peerx: peerPosition.peerx, peery: peerPosition.peery }} dataChannel={dataChannel} segmentState={peerSegmentState.segmentState} isRightCard={isRightPlace[i]} />}
              {(peerPosition.i !== i) &&
                <PuzzleSegment key={`peer${i}`} i={i} auth={auth} videoId={videoId} peerxy={undefined} dataChannel={dataChannel} segmentState={peerSegmentState.segmentState} isRightCard={isRightPlace[i]} />
              }
            </div>
          </>
        );
      })}

      {/* 상대가 카드를 맞췄을 때 나오는 효과 */}
      {isFinished &&
        <div className={`absolute flex justify-center items-center w-[640px] h-[480px] mt-[100px] ${styles.finish}`}>
          <img src="../images/finish.gif" className={`z-40 ${styles.gif}`} draggable="false" style={{ pointerEvents: "none" }} />
        </div>
      }

      {/* 아이템 쓸 때 나오는 효과 */}
      <div className="absolute grid w-[640px] h-[480px] mt-[100px]" style={{ pointerEvents: "none" }}>
        {peerSegmentState.segmentState === 'ice' && (<div className={`flex fill`} style={{ pointerEvents: "none" }} > <img src="../images/icepeer.gif" className={`z-50 ${styles.gif}`} draggable="false" style={{ pointerEvents: "none" }} /> </div>)}
        {peerSegmentState.segmentState === 'magnet' && (<div className={`flex fill`} style={{ pointerEvents: "none" }} > <img src="../images/blackholepeer.gif" className={`z-50 ${styles.gif}`} draggable="false" style={{ pointerEvents: "none" }} /> </div>)}
        {peerSegmentState.segmentState === 'lip' && (<div className={`flex fill`} style={{ pointerEvents: "none" }} > <img src="../images/lippeer.gif" className={`z-50 ${styles.gif2}`} draggable="false" style={{ pointerEvents: "none" }} /> </div>)}
        {peerSegmentState.segmentState === 'twirl' && (<div className={`flex fill`} style={{ pointerEvents: "none" }} >  </div>)}
        {peerSegmentState.segmentState === 'rocket' && (<div className={`flex fill`} style={{ pointerEvents: "none" }} > <img src="../images/rocketpeer.gif" className={`z-50 ${styles.gif}`} draggable="false" style={{ pointerEvents: "none" }} /> </div>)}

      </div>

      <Bar score={puzzleCompleteCounter.peer} />
      <ModalPeer segmentState={peerSegmentState.segmentState} />
      {peerSegmentState.segmentState === 'lip' && <MakeVideoLip auth={auth} />}
      {peerSegmentState.segmentState === 'twirl' && <MakeVideoTwirl videoId={videoId} auth={auth} />}

    </>
  );
}

export default memo(PeerPuzzle);