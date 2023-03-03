import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";
import MyPuzzle from "../Game/mypuzzle";
import PeerPuzzle from "../Game/peerpuzzle";
import useSound from "use-sound";
import { useDispatch } from "react-redux";
import { indexBGMElement, indexBGMState, gameBGMElement, gameBGMState } from "@/components/Game/atom";
import { useRecoilState, useRecoilValue } from "recoil";
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
  const [gameBGM, setGameBGM] = useRecoilState(gameBGMElement);
  const [isGameBGMPlaying, setIsGameBGMPlaying] = useRecoilState(gameBGMState);

  //나의 ready 상태와 상대방 ready 상태를 확인하여 gameReady 상태를 결정
  useEffect(() => {
    if (gameBGM && !isGameBGMPlaying) {
      (gameBGM as HTMLAudioElement).loop = true;
      // (gameBGM as HTMLAudioElement).play();
      setIsPlaying(true);
    }
  }, [gameBGM]);

  useEffect(() => {
    readySoundPlay();
    setGameReadyState(myReadyState && peerReadyState);

    if (myReadyState && peerReadyState) {
      if (indexBGM && isPlaying) {
        setIsPlaying(false);
        (indexBGM as HTMLAudioElement).pause();
        if (!gameBGM) {
          const newAudio = new Audio("/sounds/gameBGM.mp3");
          //@ts-ignore
          setGameBGM(newAudio);
        }
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
    //상대방 Ready 상태 확인을 위해 데이터 채널에 EventListener 추가
    if (dataChannel) {
      dataChannel!.addEventListener("message", function peerData(event: any) {
        if (event.data) {
          var dataJSON = JSON.parse(event.data);
          switch (dataJSON.type) {
            case "ready":
              setPeerReadyState(dataJSON.peerReady);
              break;
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
        <div className="flex flex-col w-1/2 h-screen">
          {!gameReadyState && (
            <div className="flex justify-center items-center w-1/2 absolute h-[100px]">
              <div
                className={`${styles.ready} ${!myReadyState ? (peerReadyState ? "bg-green-500" : "") : "bg-red-900"}`}
                id="myReadyButton"
                onClick={changeMyReadyState}
              >
                {!myReadyState ? (peerReadyState ? "Start" : "Ready") : "Cancel"}
              </div>
            </div>
          )}
          {gameReadyState && dataChannel && (
            <div className="flex justify-center">
              <MyPuzzle auth={true} videoId={"peerface"} dataChannel={dataChannel} />
            </div>
          )}
          <div className="h-[480px] w-[640px] mt-[100px] self-center" id={styles.gamepan}>
            {!(myReadyState && peerReadyState) && (
              <div className="absolute h-[480px] justify-center items-center w-[640px] flex">
                <div className="absolute text-7xl text-red-600"> MY PUZZLE </div>
              </div>
            )}
            <div className="flex flex-row h-1/3">
              <div className={`w-1/3 ${styles.eachpan}`}></div>
              <div className={`w-1/3 ${styles.eachpan}`}></div>
              <div className={`w-1/3 ${styles.eachpan}`}></div>
            </div>
            <div className="flex flex-row h-1/3">
              <div className={`w-1/3 ${styles.eachpan}`}></div>
              <div className={`w-1/3 ${styles.eachpan}`}></div>
              <div className={`w-1/3 ${styles.eachpan}`}></div>
            </div>
            <div className="flex flex-row h-1/3">
              <div className={`w-1/3 ${styles.eachpan}`}></div>
              <div className={`w-1/3 ${styles.eachpan}`}></div>
              <div className={`w-1/3 ${styles.eachpan}`}></div>
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
              <div className={`${styles.ready} ${!peerReadyState ? "" : "bg-red-900"}`}>{!peerReadyState ? "Not Ready" : "Peer Ready"}</div>
            </div>
          )}
          {gameReadyState && dataChannel && (
            <div className="flex justify-center">
              <PeerPuzzle auth={false} videoId={"myface"} dataChannel={dataChannel} />
            </div>
          )}
          <div className="h-[480px] w-[640px] mt-[100px] self-center" id={styles.gamepan}>
            {!(myReadyState && peerReadyState) && (
              <div className="absolute h-[480px] justify-center items-center w-[640px] flex">
                <div className="absolute text-7xl text-blue-600"> PEER PUZZLE </div>
              </div>
            )}
            <div className="flex flex-row h-1/3">
              <div className={`w-1/3 ${styles.eachpan}`}></div>
              <div className={`w-1/3 ${styles.eachpan}`}></div>
              <div className={`w-1/3 ${styles.eachpan}`}></div>
            </div>
            <div className="flex flex-row h-1/3">
              <div className={`w-1/3 ${styles.eachpan}`}></div>
              <div className={`w-1/3 ${styles.eachpan}`}></div>
              <div className={`w-1/3 ${styles.eachpan}`}></div>
            </div>
            <div className="flex flex-row h-1/3">
              <div className={`w-1/3 ${styles.eachpan}`}></div>
              <div className={`w-1/3 ${styles.eachpan}`}></div>
              <div className={`w-1/3 ${styles.eachpan}`}></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
