import React, { useRef, useEffect, useState, memo } from "react";
import { useSpring, animated, to, Spring } from "@react-spring/web";
import { useGesture } from "react-use-gesture";
import { Provider, useSelector, useDispatch } from "react-redux";
import itemStore from "@/components/Game/store";
import styles from "./styles.module.css";
import dynamic from "next/dynamic";
import Rocket from "./SegmentState/rocket";
import { useRouter } from "next/router";
import Modal from "../PageElements/ItemAlert/Modal";
import MyBar from "../PageElements/ProgressBar/MyBar";
import { myWaitState } from "./atom";
import { useRecoilState, useRecoilValue } from "recoil";
import useSound from "use-sound";
import MyIceFlakeParticles from "../PageElements/Particles/myiceFlakeParticles";
import MyBlackhallParticles from "../PageElements/Particles/myblackhallParticles";
import { getGuestLip, startItem, stopItem } from "../FaceDetection/FaceLandMarkPeer";
import MyLipParticles from "../PageElements/Particles/mylipParticles";
import MakeVideoTwirl from "../FaceDetection/MakeVideoTwirl";
import MyTwirlParticles from "../PageElements/Particles/mytwirlParticles";
import MyRocketParticles from "../PageElements/Particles/myrocketParticles";
import MakeVideoLip from "../FaceDetection/MakeVideoLip";
import GameBGM from "../PageElements/GameBGM";

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
const fanFareSoundUrl = "/sounds/Fanfare.mp3";

function MyPuzzle({ auth, videoId, dataChannel }: Props) {
  // segmentState for item use
  const [mySegmentState, setMySegmentState] = useState({ type: "item", segementState: "default" });
  // using after store value changed, for restoring purpose
  const makeMyDefaultSegment = () => {
    setMySegmentState({ type: "item", segementState: "default" });
  };
  const dispatch = useDispatch();

  const puzzleCompleteCounter = useSelector((state: any) => state.puzzleComplete);
  const router = useRouter();
  const [fanFareSoundPlay] = useSound(fanFareSoundUrl);

  //dataChannel에 addEventListner 붙이기 (하나의 dataChannel에 이벤트리스너를 여러번 붙이는 것은 문제가 없다.)

  useEffect(() => {
    if (dataChannel) {
      dataChannel!.addEventListener("message", function myData(event: MessageEvent<any>) {
        if (event.data) {
          var dataJSON = JSON.parse(event.data);
          switch (dataJSON.type) {
            case "item":
              setMySegmentState(dataJSON);
              if (dataJSON.segementState === "rocket" || dataJSON.segementState === "magnet") {
                dispatch({ type: "puzzleComplete/init_mine" });
                dispatch({ type: "defaultSegmentRightPlace/init" });
              }
              switch (dataJSON.segementState) {
                case "rocket":
                  setTimeout(() => {
                    makeMyDefaultSegment();
                  }, 9000);
                  break;
                case "ice":
                  setTimeout(() => {
                    makeMyDefaultSegment();
                  }, 15000);
                  break;
                case "magnet":
                  setTimeout(() => {
                    makeMyDefaultSegment();
                  }, 7000);
                  break;
                case "lip":
                  setTimeout(() => {
                    makeMyDefaultSegment();
                  }, 10000);
                  break;
                case "twirl":
                  setTimeout(() => {
                    makeMyDefaultSegment();
                  }, 10000);
                  break;
              }
          }
        }
      });
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
  }, [puzzleCompleteCounter.mine]);

  if (mySegmentState.segementState === "lip" || mySegmentState.segementState === "twirl") {
    startItem();
    setTimeout(() => {
      stopItem();
    }, 10000);
  }

  return (
    <>
      {[...Array(9)].map((_, i) => {
        return (
          <>
            <div className={`${styles[`c${i}`]}`} key={`mypuzzle_${i}`}>
              <PuzzleSegment
                key={`my${i}`}
                i={i}
                auth={auth}
                videoId={videoId}
                peerxy={undefined}
                dataChannel={dataChannel}
                segmentState={mySegmentState.segementState}
                isRightCard={false}
              />
            </div>
          </>
        );
      })}
      {/* 아이템 쓸 때 나오는 효과 */}
      <div className="absolute grid w-[640px] h-[480px] mt-[100px]" style={{ pointerEvents: "none" }}>
        {mySegmentState.segementState === "ice" && (
          <div id="myice" className={`flex fill`} style={{ pointerEvents: "none" }}>
            {" "}
            <MyIceFlakeParticles /> <img
              src="../images/icemine.gif"
              className={`z-50 ${styles.gif}`}
              draggable="false"
              style={{ pointerEvents: "none" }}
            />{" "}
          </div>
        )}
        {mySegmentState.segementState === "magnet" && (
          <div id="mymagnet" className={`flex fill`} style={{ pointerEvents: "none" }}>
            {" "}
            <MyBlackhallParticles />{" "}
            <img src="../images/blackholemine.gif" className={`z-50 ${styles.gif}`} draggable="false" style={{ pointerEvents: "none" }} />{" "}
          </div>
        )}
        {mySegmentState.segementState === "lip" && (
          <div id="mylip" className={`flex fill`} style={{ pointerEvents: "none" }}>
            {" "}
            <MyLipParticles /> <img src="../images/lipmine.gif" className={`z-50 ${styles.gif2}`} draggable="false" style={{ pointerEvents: "none" }} />{" "}
          </div>
        )}
        {mySegmentState.segementState === "twirl" && (
          <div id="mytwirl" className={`flex fill`} style={{ pointerEvents: "none" }}>
            {" "}
            <MyTwirlParticles />{" "}
          </div>
        )}
        {mySegmentState.segementState === "rocket" && (
          <div id="myrocket" className={`flex fill`} style={{ pointerEvents: "none" }}>
            {" "}
            <MyRocketParticles />{" "}
          </div>
        )}
      </div>
      <MyBar score={puzzleCompleteCounter.mine} />
      <Modal segmentState={mySegmentState.segementState} />
      {mySegmentState.segementState === "lip" && <MakeVideoLip auth={auth} />}
      {mySegmentState.segementState === "twirl" && <MakeVideoTwirl videoId={videoId} auth={auth} />}
    </>
  );
}

export default memo(MyPuzzle);
