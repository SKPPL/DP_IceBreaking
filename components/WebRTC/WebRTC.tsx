import React from "react";
import { useRouter } from "next/router";
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import useSocket from "../../pages/hooks/useSocket";
import Waiting from "../PageElements/Waiting";
import styles from "./styles.module.css";
import Ceremony from "../Game/Ceremony";
import { useRecoilState } from "recoil";
import { dataChannelState } from "../Game/atom";
import CheckReady from "./CheckReady";
import FaceLandMarkMy from "../FaceDetection/FaceLandMarkMy";
import FaceLandMarkPeer from "../FaceDetection/FaceLandMarkPeer";

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
  const selectRef = useRef<any>();
  const hostRef = useRef(false);
  const userStreamRef = useRef<MediaStream>();
  // call setDataChannel when dataChannel created
  var [dataChannel, setDataChannel] = useState<RTCDataChannel>();
  //State
  const [micSetting, setMicSetting] = useState(true);
  const [cameraSetting, setCameraSetting] = useState(true);
  const [roomName, setRoomName] = useState<string | string[] | undefined>("");
  const [nickName, setNickName] = useState("");
  const [peerNickName, setPeerNickName] = useState("");
  const [socketConnect, setSocketConnect] = useState<any>();
  const [checkLeave, setCheckLeave] = useState<boolean>(false);
  //segementState is for item using, owner is my or peer
  useEffect(() => {
    if (typeof socketConnect !== "undefined") {
      console.log("[roomName] : ", roomName);
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
      socketConnect.on("reload", () => {
        leaveRoom();
      });
      window.addEventListener("popstate", handleBackButton);
      // unmmount시 소켓을 끊는다
      return () => {
        socketConnect.emit("peerleave", roomName);
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
  const handleBackButton = () => {
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
      console.log(e);
    }
  }
  const handleRoomCreated = async (): Promise<void> => {
    try {
      console.log("[room created]");
      hostRef.current = true;
      await getMedia();
    } catch (e) {
      console.log(e);
    }
  };
  const handleRoomJoined = async (): Promise<void> => {
    try {
      await getMedia();
      socketConnect.emit("ready", roomName);
      console.log("[emit ready]");
    } catch (e) {
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
        console.log(e);
      }
    }
  };
  const onPeerLeave = (): void => {
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
  };
  //room을 떠날 때
  const leaveRoom = (): void => {
    socketConnect.emit("leave", roomName);
    console.log("[emit leave]");
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
      webRTCConnRef.current.addEventListener("datachannel", (event: any) => {
        console.log("[offer]", event);
        // on guest side, guest -> host
        switch (event.channel.label) {
          case "data":
            setDataChannel(event.channel);
            break;
        }
      });
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
    if (dataChannel) setDataChannelExist(true);
  }, [dataChannel]);

  return (
    <>
      {/* <button onClick={leaveRoom} type="button" className="bg-black hidden text-9xl box-border height width-4 text-white">
        Leave
      </button> */}
      <div className="hidden h-screen" id="face">
        <Ceremony />
        <div className={`flex justify-center`}>
          <video className={`${styles.gamepan} w-1/2 hidden rounded-2xl`} id="peerface" autoPlay playsInline ref={peerVideoRef}></video>
          <video className={`${styles.gamepan} w-1/2 hidden rounded-2xl`} id="myface" autoPlay playsInline ref={userVideoRef}></video>
        </div>
      </div>
      {!dataChannel && (
        <div className="h-screen">
          <Waiting />
        </div>
      )}
      {dataChannel && <CheckReady dataChannel={dataChannel} />}
      {dataChannel && <FaceLandMarkMy />}
      {dataChannel && <FaceLandMarkPeer />}
    </>
  );
}
