import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";
import MyPuzzle from "../Game/mypuzzle";
import PeerPuzzle from "../Game/peerpuzzle";
import useSound from "use-sound";
import { useDispatch, useSelector } from "react-redux";
import { indexBGMElement, indexBGMState } from "@/components/Game/atom";
import { useRecoilState, useRecoilValue } from "recoil";
import GameBGM from "../PageElements/GameBGM";
interface Props {
  dataChannel: RTCDataChannel | undefined;
}

export default function CheckReady({ dataChannel }: Props) {
  const [myReadyState, setMyReadyState] = useState(false);
  const [peerReadyState, setPeerReadyState] = useState(false);
  const [gameReadyState, setGameReadyState] = useState(false);
  const dispatch = useDispatch();

  const readySoundUrl = "/sounds/ready.mp3";
  const [readySoundPlay] = useSound(readySoundUrl);

  const indexBGM = useRecoilValue(indexBGMElement);
  const [isPlaying, setIsPlaying] = useRecoilState(indexBGMState);

  const arr = useSelector((state: any) => state.puzzleOrder);

  useEffect(() => {
    readySoundPlay();
    setGameReadyState(myReadyState && peerReadyState);

    if (myReadyState && peerReadyState) {
      if (indexBGM && isPlaying) {
        setIsPlaying(false);
        (indexBGM as HTMLAudioElement).pause();
      }

      document.getElementById("itembar")!.classList.remove("invisible");
      document.getElementById("itembar")!.classList.add("visible");

      setTimeout(() => {
        dispatch({ type: "myPuzzle/start" });
        dispatch({ type: "peerPuzzle/start" });
      }, 1000);
    }
  }, [myReadyState, peerReadyState]);

  //ready 버튼 누를 시 myReady 상태 변경 및 상대방 전송
  const changeMyReadyState = (): void => {
    if (dataChannel && dataChannel?.readyState === "open") {
      dataChannel.send(JSON.stringify({ type: "ready", peerReady: !myReadyState }));
    }
    setMyReadyState((prevSetting) => !prevSetting);
  };

  useEffect(() => {
    if (dataChannel && dataChannel?.readyState === "open") {
      dataChannel.send(JSON.stringify({ type: "setArr", Arr: arr }));
    }
    //상대방 Ready 상태 확인을 위해 데이터 채널에 EventListener 추가
    if (dataChannel) {
      dataChannel!.addEventListener("message", function peerData(event: any) {
        if (event.data) {
          var dataJSON = JSON.parse(event.data);
          switch (dataJSON.type) {
            case "ready":
              setPeerReadyState(dataJSON.peerReady);
              break;
            case "setArr":
              dispatch({ type: "puzzleOrder2/setArr", payload: { arr: dataJSON.Arr } });
          }
        }
      });
    }
  }, []);
  return (
    <>
      {/* <button onClick={leaveRoom} type="button" className="bg-black hidden text-9xl box-border height width-4 text-white">
        Leave
    </button> */}
      <div className="flex flex-row" id="fullscreen">
        {gameReadyState && <GameBGM prevPlayingState={false} />}
        <div className="flex flex-col w-1/2 h-screen">
          {!gameReadyState && (
            <div className="flex justify-center items-center w-1/2 absolute h-[100px]">
              <div
                className={`${styles.readyMy} ${!myReadyState ? (peerReadyState ? "bg-green-500" : "") : "bg-red-900"}`}
                id="myReadyButton"
                onClick={changeMyReadyState}
              >
                {!myReadyState ? (peerReadyState ? "시작" : "준비") : "취소"}
              </div>
            </div>
          )}
          {gameReadyState && dataChannel && (
            <div className="flex justify-center">
              <MyPuzzle auth={true} videoId={"peerface"} dataChannel={dataChannel} />
            </div>
          )}
          <div className={`h-[480px] w-[640px] mt-[100px] self-center ${styles.gamepanMy}`}>
            {!(myReadyState && peerReadyState) && (
              <div className="absolute h-[480px] justify-center items-center w-[640px] flex">
                <div className={`absolute text-7xl text-center ${styles.lose}`}>
                  내가 상대 얼굴을 <br/> <br/> &nbsp;&nbsp;&nbsp;&nbsp;맞춥니다. &nbsp;😏
                </div>
              </div>
            )}
            <div className="flex flex-row h-1/3">
              <div className={`w-1/3 ${styles.eachpanMy}`}></div>
              <div className={`w-1/3 ${styles.eachpanMy}`}></div>
              <div className={`w-1/3 ${styles.eachpanMy}`}></div>
            </div>
            <div className="flex flex-row h-1/3">
              <div className={`w-1/3 ${styles.eachpanMy}`}></div>
              <div className={`w-1/3 ${styles.eachpanMy}`}></div>
              <div className={`w-1/3 ${styles.eachpanMy}`}></div>
            </div>
            <div className="flex flex-row h-1/3">
              <div className={`w-1/3 ${styles.eachpanMy}`}></div>
              <div className={`w-1/3 ${styles.eachpanMy}`}></div>
              <div className={`w-1/3 ${styles.eachpanMy}`}></div>
            </div>
          </div>
          {/* <button id="cameraBtn" onClick={changeCameraSetting} type="button" className="hidden box-border height width mb-5-4 text-white">
            {cameraSetting ? "화면 끄기" : "화면 켜기"}
          </button>
          <select className="hidden" onChange={handleSelect} ref={selectRef}></select> */}
        </div>
        <div className="flex flex-col w-1/2 h-screen">
          {(!myReadyState || !peerReadyState) && (
            <div className="flex justify-center items-center w-1/2 absolute h-[100px]">
              <div className={`${styles.readyPeer} ${!peerReadyState ? "" : "bg-red-900"}`}>{!peerReadyState ? "준비 중" : "준비 완료"}</div>
            </div>
          )}
          {gameReadyState && dataChannel && (
            <div className="flex justify-center">
              <PeerPuzzle auth={false} videoId={"myface"} dataChannel={dataChannel} />
            </div>
          )}
          <div className={`h-[480px] w-[640px] mt-[100px] self-center ${styles.gamepanPeer}`}>
            {!(myReadyState && peerReadyState) && (
              <div className="absolute h-[480px] justify-center items-center w-[640px] flex">
                <div className={`absolute text-7xl text-center ${styles.win}`}> 상대가 내 얼굴을 <br /> <br /> &nbsp;&nbsp;&nbsp;&nbsp;맞춥니다. &nbsp;🤗 </div>
              </div>
            )}
            <div className="flex flex-row h-1/3">
              <div className={`w-1/3 ${styles.eachpanPeer}`}></div>
              <div className={`w-1/3 ${styles.eachpanPeer}`}></div>
              <div className={`w-1/3 ${styles.eachpanPeer}`}></div>
            </div>
            <div className="flex flex-row h-1/3">
              <div className={`w-1/3 ${styles.eachpanPeer}`}></div>
              <div className={`w-1/3 ${styles.eachpanPeer}`}></div>
              <div className={`w-1/3 ${styles.eachpanPeer}`}></div>
            </div>
            <div className="flex flex-row h-1/3">
              <div className={`w-1/3 ${styles.eachpanPeer}`}></div>
              <div className={`w-1/3 ${styles.eachpanPeer}`}></div>
              <div className={`w-1/3 ${styles.eachpanPeer}`}></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
