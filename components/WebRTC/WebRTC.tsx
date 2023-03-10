import React from "react";
import { useRouter } from "next/router";
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import useSocket from "../../pages/hooks/useSocket";

import Waiting from "../PageElements/Waiting";
import Loading from "../PageElements/Loading";
import styles from "./styles.module.css";
import Ceremony from "../Game/Ceremony";
import { useRecoilState } from "recoil";
import { dataChannelState } from "../Game/atom";
import CheckReady from "./CheckReady";
import FaceLandMarkMy from "../FaceDetection/FaceLandMarkMy";
import FaceLandMarkPeer from "../FaceDetection/FaceLandMarkPeer";
import GameBGM from "../PageElements/GameBGM";

import { isLoadMy } from "../FaceDetection/FaceLandMarkMy";
import { isLoadPeer } from "../FaceDetection/FaceLandMarkPeer";

const ICE_SERVERS = {
  iceServers: [
    {
      urls: [
        "stun:openrelay.metered.ca:80",
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun01.sipphone.com",
        "stun:stun.ekiga.net",
        "stun:stun.fwdnet.net",
        "stun:stun.ideasip.com",
        "stun:stun.iptel.org",
        "stun:stun.rixtelecom.se",
        "stun:stun.schlund.de",
        "stun:stunserver.org",
        "stun:stun.softjoys.com",
        "stun:stun.voiparound.com",
        "stun:stun.voipbuster.com",
        "stun:stun.voipstunt.com",
        "stun:stun.voxgratia.org",
        "stun:stun.xten.com",
      ],
    },
  ],
};
interface MyConstraints {
  audio?: boolean | MediaTrackConstraints;
  video?: boolean | MediaTrackConstraints;
}

export default function WebRTC() {
  useSocket();
  const router = useRouter();
  //useRef은 특정컴포넌트에 접근할 수 있는 객체, 초기값 null
  //userRef hook은 내부 데이터가 변경되었을 때 별도로 알리지 않음
  const userVideoRef = useRef<any>();
  const peerVideoRef = useRef<any>();
  const webRTCConnRef = useRef<any>();
  const hostRef = useRef(false);
  const userStreamRef = useRef<MediaStream>();
  // call setDataChannel when dataChannel created
  let [dataChannel, setDataChannel] = useState<RTCDataChannel>();
  //State
  const [roomName, setRoomName] = useState<string | string[] | undefined>("");
  const [socketConnect, setSocketConnect] = useState<any>();
  const [checkLeave, setCheckLeave] = useState<boolean>(false);
  const [myLoading, setMyLoading] = useState<boolean>(false);
  const [peerLoading, setPeerLoading] = useState<boolean>(false);

  //segmentState is for item using, owner is my or peer
  useEffect(() => {
    if (typeof socketConnect !== "undefined") {
      console.log("[roomName] : ", roomName);

      if (roomName == undefined) {
        alert("비정상적으로 방을 생성하였습니다. 방을 종료합니다.");
        leaveRoom();
      }

      socketConnect.on("created", handleRoomCreated);
      socketConnect.emit("join", roomName);
      socketConnect.on("joined", handleRoomJoined);
      socketConnect.on("ready", initiateCall);
      socketConnect.on("leave", onPeerLeave);
      socketConnect.on("full", () => {
        alert("참가하려는 room이 가득 찼습니다.");
      });
      socketConnect.on("offer", handleReceivedOffer);
      socketConnect.on("answer", handleAnswer);
      socketConnect.on("ice-candidate", handlerNewIceCandidateMsg);
      socketConnect.on("disconnecting", () => {
        socketConnect.emit("disconnecting");
      });

      window.addEventListener("popstate", handleBackSpace);

      // unmmount시 소켓을 끊는다
      return () => {
        window.removeEventListener("popstate", handleBackSpace);

        socketConnect.disconnect();
      };
    }
  }, [socketConnect]);
  //처음 마운트시에 호출
  useEffect(() => {
    // 서버 <-> 브라우저 간 socket io 통신 연결
    setSocketConnect(io());
    // 초기 room이름 설정
    setRoomName(router.query.roomName);
  }, []);

  useEffect(() => {
    let mounted = true;
    if (mounted && checkLeave) {
      router
        .replace({
          pathname: "/ready",
        })
        .then(() => router.reload());
    }
    return () => {
      mounted = false;
    };
  }, [checkLeave]);

  //뒤로가기는 Cancelable 하지 않아 e.preventDefault()메소드로 동작을 막을 수 없음.
  const handleBackSpace = (event) => {
    alert("뒤로가기를 눌러 방을 떠납니다. 현재 방은 종료됩니다");
    leaveRoom();
  };

  async function getMedia(): Promise<void> {
    const initialConstraints: MyConstraints = {
      audio: false,
      // video: { facingMode: "user" },
      video: { width: 640, height: 480 },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(initialConstraints);
      userStreamRef.current = stream;
      userVideoRef.current.srcObject = stream;
      userVideoRef.current.onloadedmetadata = () => {
        userVideoRef.current.play();
      };
    } catch (e) {
      alert("정상적으로 카메라를 가져오지 못하였습니다. 대기실로 이동합니다.");
      leaveRoom();
      console.log(e);
    }
  }
  const handleRoomCreated = async (): Promise<void> => {
    try {
      console.log("[room created]");
      hostRef.current = true;
      await getMedia();
    } catch (e) {
      alert("정상적으로 카메라를 가져오지 못하였습니다. 대기실로 이동합니다.");
      leaveRoom();
      console.log(e);
    }
  };
  const handleRoomJoined = async (): Promise<void> => {
    try {
      await getMedia();
      socketConnect.emit("ready", roomName);
      console.log("[emit ready]");
    } catch (e) {
      alert("정상적으로 카메라를 가져오지 못하였습니다. 대기실로 이동합니다.");
      leaveRoom();
      console.log(e);
    }
  };
  //peer와 연결 생성 시작
  const initiateCall = async (): Promise<void> => {
    console.log("[initiateCall]");
    if (hostRef.current && typeof webRTCConnRef !== "undefined") {
      webRTCConnRef.current = makeConnection();

      if (typeof userStreamRef.current !== "undefined") {
        userStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => webRTCConnRef.current.addTrack(track, userStreamRef.current));
      }
      try {
        console.log("[emit offer]");
        //DataChannel
        dataChannel = webRTCConnRef.current.createDataChannel("data");

        const offer = await webRTCConnRef.current.createOffer();
        webRTCConnRef.current.setLocalDescription(offer);
        socketConnect.emit("offer", offer, roomName);
        setDataChannel(dataChannel);
      } catch (e) {
        alert("정상적으로 상대방과 연결하지 못했습니다. 대기실로 이동합니다.");
        leaveRoom();
        console.log(e);
      }
    }
  };
  const onPeerLeave = (): void => {
    alert("상대방이 떠났습니다. 새로운 게임을 즐기기 위해 방을 다시 만들어주세요.");
    //room을에 혼자 남아 있을 경우, 남아 있는 사람이 room을의 주인이 됨
    hostRef.current = true;
    if (peerVideoRef.current.srcObject) {
      // peer의 모든 track 수신을 중지
      peerVideoRef.current.srcObject.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    // leave 한 peer와 연결을 종료
    if (webRTCConnRef.current) {
      webRTCConnRef.current.ontrack = null;
      webRTCConnRef.current.onicecandidate = null;
      webRTCConnRef.current.close();
      webRTCConnRef.current = null;
    }
    leaveRoom();
  };
  //room을 떠날 때
  const leaveRoom = (): void => {
    //유저와 peer 모든 media 수신을 중지
    if (userVideoRef.current && userVideoRef.current.srcObject) {
      userVideoRef.current.srcObject.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    if (peerVideoRef.current && peerVideoRef.current.srcObject) {
      peerVideoRef.current.srcObject.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    //connect이 있는지 확인하고 피어와 기존 연결을 종료
    if (webRTCConnRef.current) {
      webRTCConnRef.current.ontrack = null;
      webRTCConnRef.current.onicecandidate = null;
      webRTCConnRef.current.close();
      webRTCConnRef.current = null;
    }
    // console.log("leavRoom 아래 ");
    setCheckLeave(true);
  };
  const makeConnection = (): RTCPeerConnection => {
    // RTC Peer Connection 생성
    const connection = new RTCPeerConnection(ICE_SERVERS);

    //icecandidate, track listener 추가
    connection.onicecandidate = handleICECandidateEvent;
    connection.ontrack = handleTrackEvent;
    // TODO: handleTrackEvent 예외처리 고려
    return connection;
  };
  const handleICECandidateEvent = (event: RTCPeerConnectionIceEvent): void => {
    if (event.candidate) {
      console.log("[emit ice-candidate]");
      socketConnect.emit("ice-candidate", event.candidate, roomName);
    }
  };
  const handleTrackEvent = (event: RTCTrackEvent): void => {
    peerVideoRef.current.srcObject = event.streams[0];
  };
  const handleReceivedOffer = async (offer: any[]): Promise<void> => {
    if (!hostRef.current) {
      webRTCConnRef.current = makeConnection();

      const handleOffer = (event: any): void => {
        console.log("[offer]", event);
        // on guest side, guest -> host
        switch (event.channel.label) {
          case "data":
            setDataChannel(event.channel);
            break;
        }
      };
      webRTCConnRef.current.addEventListener("datachannel", handleOffer);

      if (typeof userStreamRef.current !== "undefined") {
        userStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => webRTCConnRef.current.addTrack(track, userStreamRef.current));
      }
      webRTCConnRef.current.setRemoteDescription(offer);
      const answer = await webRTCConnRef.current.createAnswer();
      try {
        webRTCConnRef.current.setLocalDescription(answer);
        socketConnect.emit("answer", answer, roomName);
        console.log("[emit answer]");
      } catch (e) {
        console.log(e);
      }
    }
  };
  const handleAnswer = (answer: any): void => {
    webRTCConnRef.current.setRemoteDescription(answer).catch((err: Error) => console.log(err));
  };
  // 들어오는 "candidate"를 RTCIceCandidate로 casting
  const handlerNewIceCandidateMsg = (incoming: RTCIceCandidate): void => {
    const candidate = new RTCIceCandidate(incoming);
    webRTCConnRef.current.addIceCandidate(candidate).catch((e: Event) => console.log(e));
  };

  const [dataChannelExist, setDataChannelExist] = useRecoilState(dataChannelState);
  useEffect(() => {
    if (dataChannel) {
      let checkLoading = setInterval(() => {
        //나의 브라우저에서 나와 상대방 얼굴인식 모델이 로드가 완료가 된 경우
        if (isLoadMy() && isLoadPeer()) {
          dataChannel!.send(JSON.stringify({ type: "peerLoad", status: "ok" }));
          //나의 로딩은 완료
          setMyLoading(true);
          clearInterval(checkLoading);
        }
      }, 1000);

      const peerload = (event: MessageEvent<any>) => {
        if (event.data) {
          let dataJSON = JSON.parse(event.data);
          switch (dataJSON.type) {
            case "peerLoad":
              //상대방 브라우저에서 나와 상대방 얼굴인식 모델이 로드가 완료된 경우
              if (dataJSON.status == "ok") setPeerLoading(true);
              break;
          }
        }
      };

      dataChannel!.addEventListener("message", peerload);
      return () => {
        dataChannel!.removeEventListener("message", peerload);
      };
    }
  }, [dataChannel]);

  return (
    <>
      {/* <button onClick={leaveRoom} type="button" className="bg-black hidden text-9xl box-border height width-4 text-white">
        Leave
      </button> */}
      <div className="hidden h-screen" id="face">
        <Ceremony />
        <GameBGM prevPlayingState={true} />
        <div className={`flex justify-center`}>
          <video className={`${styles.gamepanMy} w-1/2 hidden rounded-2xl z-50`} id="peerface" autoPlay playsInline ref={peerVideoRef}></video>
          <video className={`${styles.gamepanPeer} w-1/2 hidden rounded-2xl z-50`} id="myface" autoPlay playsInline ref={userVideoRef}></video>
        </div>
      </div>
      {!dataChannel && (
        <div className="h-screen">
          <Waiting />
        </div>
      )}
      {dataChannel && <FaceLandMarkMy />}
      {dataChannel && <FaceLandMarkPeer />}
      {dataChannel && (!myLoading || !peerLoading) && <Loading />}
      {dataChannel && myLoading && peerLoading && <CheckReady dataChannel={dataChannel} />}
      <canvas id="my_lip" width="213" height="160" style={{ display: "none" }}></canvas>
      <canvas id="peer_lip" width="213" height="160" style={{ display: "none" }}></canvas>
      <canvas id="myface_twirl" width="320" height="240" style={{ display: "none" }}></canvas>
      <canvas id="peerface_twirl" width="320" height="240" style={{ display: "none" }}></canvas>
    </>
  );
}
