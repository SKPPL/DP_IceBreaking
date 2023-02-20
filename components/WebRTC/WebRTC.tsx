import React from "react";
import { useRouter } from "next/router";
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import useSocket from "../../pages/hooks/useSocket";
import dynamic from "next/dynamic";
import { Provider, useSelector, useDispatch } from "react-redux";
import itemStore from "@/components/Game/store";
import rocket from "../Game/rocket";
import { useTimeout } from "usehooks-ts";
import Rocket from "../Game/rocket";
import MyPuzzle from "../Game/mypuzzle";
import PeerPuzzle from "../Game/peerpuzzle";
import Waiting from "../PageElements/Waiting";

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
  const nickNameChannel = useRef<RTCDataChannel>();

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
      // socketConnect.disconnect();
      setTimeout(() => {
        router
          .replace({
            pathname: "/ready",
          })
          .then(() => router.reload());
      }, 15000);
    }
    return () => {
      mounted = false;
    };
  }, [checkLeave]);

  const handleBackButton = () => {
    leaveRoom();
  };

  //닉네임 설정
  const handleNickName = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setNickName(e.currentTarget.value);
    // console.log(nickNameChannel);

    if (typeof nickNameChannel.current !== "undefined" && nickNameChannel.current.label == "nickname") {
      nickNameChannel.current.send(e.currentTarget.value);
    } else {
      console.log("[No data Channel]");
    }
  };

  async function getCameras(): Promise<void> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === "videoinput");
      if (typeof userStreamRef.current !== "undefined") {
        //TODO: 예외처리
        const currentCamera = userStreamRef.current.getVideoTracks()[0];
      }
    } catch (e) {
      console.log(e);
    }
  }

  async function getMedia(deviceId?: string): Promise<void> {
    const initialConstraints: MyConstraints = {
      audio: false,
      // video: { facingMode: "user" },
      video: { width: 640, height: 480 },
    };
    const cameraConstraints: MyConstraints = {
      audio: false,
      video: { deviceId: { exact: deviceId } },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(deviceId ? cameraConstraints : initialConstraints);
      userStreamRef.current = stream;
      userVideoRef.current.srcObject = stream;
      userVideoRef.current.onloadedmetadata = () => {
        userVideoRef.current.play();
      };
      if (!deviceId) {
        console.log("[get Cameras]");
        await getCameras();
      }
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
        nickNameChannel.current = webRTCConnRef.current.createDataChannel("nickname");
        dataChannel = webRTCConnRef.current.createDataChannel("data");
        if (typeof nickNameChannel.current !== "undefined") {
          //Client A에서 동작하는 코드 데이터 채널에 이벤트 리스너를 달아서 이벤트가 들어오면
          //들어오는 데이터로 상대방 닉네임을 설정
          nickNameChannel.current.addEventListener("message", (event: MessageEvent<any>): void => {
            setPeerNickName(event.data);
          });
        }
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

        nickNameChannel.current = event.channel;
        // on guest side, guest -> host
        switch (event.channel.label) {
          case "nickname":
            nickNameChannel.current = event.channel;
            nickNameChannel.current!.addEventListener("message", (event: any) => {
              setPeerNickName(event.data);
            });

            break;
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

  //마이크 셋팅 변경 버튼 클릭 시
  const changeMicSetting = (): void => {
    toggleMediaStream("audio", micSetting);
    setMicSetting((prevSetting) => !prevSetting);
  };
  //카메라 셋팅 변경 버튼 클릭 시
  const changeCameraSetting = (): void => {
    toggleMediaStream("video", cameraSetting);
    setCameraSetting((prevSetting) => !prevSetting);
  };

  //미디어스트리미 옵션 값 변경
  const toggleMediaStream = (type: string, state: boolean): void => {
    if (typeof userStreamRef.current !== "undefined") {
      userStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => {
        if (track.kind === type) {
          track.enabled = !state;
        }
      });
    }
  };

  return (
    <>
      <button onClick={leaveRoom} type="button" className="bg-black hidden text-9xl box-border height width border-4 text-white">
        Leave
      </button>
      <video className="w-full hidden" id="peerface" autoPlay playsInline ref={peerVideoRef}></video>
      <video className="w-full hidden " id="myface" autoPlay playsInline ref={userVideoRef}></video>
      {!dataChannel && <Waiting />}
      <div className="flex flex-row" id="fullscreen">
        <div className="flex flex-col w-1/2 h-screen">
          {dataChannel && (
            <div className="flex justify-center h-[160px]">
              <MyPuzzle auth={true} videoId={"peerface"} dataChannel={dataChannel} />
            </div>
          )}
          <div className="h-[480px] w-[640px] self-center border border-black">
            <div className="flex flex-row h-1/3">
              <div className="w-1/3 border border-dotted border-r-gray-400 border-b-gray-400"></div>
              <div className="w-1/3 border border-dotted border-r-gray-400 border-b-gray-400"></div>
              <div className="w-1/3 border border-dotted border-b-gray-400"></div>
            </div>
            <div className="flex flex-row h-1/3">
              <div className="w-1/3 border border-dotted border-r-gray-400 border-b-gray-400"></div>
              <div className="w-1/3 border border-dotted border-r-gray-400 border-b-gray-400"></div>
              <div className="w-1/3 border border-dotted border-b-gray-400"></div>
            </div>
            <div className="flex flex-row h-1/3">
              <div className="w-1/3 border border-dotted border-r-gray-400 "></div>
              <div className="w-1/3 border border-dotted border-r-gray-400 "></div>
            </div>
          </div>
          {/* <button id="cameraBtn" onClick={changeCameraSetting} type="button" className="hidden box-border height width mb-5 border-4 text-white">
            {cameraSetting ? "화면 끄기" : "화면 켜기"}
          </button>
          <select className="hidden" onChange={handleSelect} ref={selectRef}></select> */}
        </div>
        <div className="flex flex-col w-1/2 h-screen">
          {dataChannel && (
            <div className="flex justify-center h-[160px]">
              <PeerPuzzle auth={false} videoId={"myface"} dataChannel={dataChannel} />
            </div>
          )}
          <div className="h-[480px] w-[640px] self-center border border-black">
            <div className="flex flex-row h-1/3">
              <div className="w-1/3 border border-dotted border-r-gray-400 border-b-gray-400"></div>
              <div className="w-1/3 border border-dotted border-r-gray-400 border-b-gray-400"></div>
              <div className="w-1/3 border border-dotted border-b-gray-400"></div>
            </div>
            <div className="flex flex-row h-1/3">
              <div className="w-1/3 border border-dotted border-r-gray-400 border-b-gray-400"></div>
              <div className="w-1/3 border border-dotted border-r-gray-400 border-b-gray-400"></div>
              <div className="w-1/3 border border-dotted border-b-gray-400"></div>
            </div>
            <div className="flex flex-row h-1/3">
              <div className="w-1/3 border border-dotted border-r-gray-400 "></div>
              <div className="w-1/3 border border-dotted border-r-gray-400 "></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
