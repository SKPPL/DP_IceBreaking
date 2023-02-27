import React, { useState, useEffect } from "react";

import styles from "./styles.module.css";
import MyPuzzle from "../Game/mypuzzle";
import PeerPuzzle from "../Game/peerpuzzle";

interface Props {
  dataChannel: RTCDataChannel | undefined;
}

export default function CheckReady({ dataChannel }: Props) {
  const [myReadyState, setMyReadyState] = useState(false);
  const [peerReadyState, setPeerReadyState] = useState(false);
  const [gameReadyState, setGameReadyState] = useState(false);

  //나의 ready 상태와 상대방 ready 상태를 확인하여 gameReady 상태를 결정
  useEffect(() => {
    setGameReadyState(myReadyState && peerReadyState);
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
      <button className="text-white" id="myReadyButton" onClick={changeMyReadyState}>
        My Ready Button
      </button>

      <div className="flex flex-row" id="fullscreen">
        <div className="flex flex-col w-1/2 h-screen">
          {gameReadyState && dataChannel && (
            <div className="flex justify-center h-[160px]">
              <MyPuzzle auth={true} videoId={"peerface"} dataChannel={dataChannel} />
            </div>
          )}
          <div className="h-[480px] w-[640px] self-center" id={styles.gamepan}>
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
          {gameReadyState && dataChannel && (
            <div className="flex justify-center h-[160px]">
              <PeerPuzzle auth={false} videoId={"myface"} dataChannel={dataChannel} />
            </div>
          )}
          <div className="h-[480px] w-[640px] self-center" id={styles.gamepan}>
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
