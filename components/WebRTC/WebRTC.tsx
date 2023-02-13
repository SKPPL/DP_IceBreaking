import React, { memo, useCallback } from "react";
import { useRouter } from "next/router";
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import useSocket from "../../pages/hooks/useSocket";
import dynamic from "next/dynamic";
import { useWindowSize } from "usehooks-ts";
import Rocket from "../Game/rocket";

const PuzzleSegment = dynamic(
  import('@/components/Game/Segment'), {
  loading: () => (<div></div>),
  ssr: false,
},
);

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
  const windowSize = useWindowSize();

  useSocket();
  const router = useRouter();
  //useRef은 특정컴포넌트에 접근할 수 있는 객체, 초기값 null
  //userRef hook은 내부 데이터가 변경되었을 때 별도로 알리지 않음
  const userVideoRef = useRef<any>();
  const peerVideoRef = useRef<any>();
  const userStreamRef = useRef<any>();
  const webRTCConnRef = useRef<any>();
  const socketRef = useRef<any>();
  const hostRef = useRef(false);
  const selectRef = useRef<any>();
  const nickNameChannel = useRef<RTCDataChannel>();
  const moveChannel = useRef<RTCDataChannel>();
  var recievedPosition = useRef<JSON>();

  //State
  const [micSetting, setMicSetting] = useState(true);
  const [cameraSetting, setCameraSetting] = useState(true);
  const [roomName, setRoomName] = useState("");
  const [nickName, setNickName] = useState("");
  const [peerNickName, setPeerNickName] = useState("");
  const [peerPosition, setPeerPosition] = useState({ i: 100, peerx: 0, peery: 0 });
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

  //사이드 이펙트를 수행하기 위한 훅
  //videoRef가 create,update 될 때 실행된다. (props, state가 바뀔 때 마다 getUserCamera함수를 호출한다)
  // umount 시에 실행하고 싶은 함수는 return 함수를 달아준다
  useEffect(() => {
    // 서버 <-> 브라우저 간 socket io 통신 연결

    socketRef.current = io();
    // 초기 room을이름 설정
    setRoomName("Room1");
    console.log("RoomName :", roomName);
    socketRef.current.on("created", handleRoomCreated);

    socketRef.current.emit("join", roomName);
    socketRef.current.on("joined", handleRoomJoined);
    // roomName으로 room을이 없으면 서버는 'created'를 emit한다.
    // room을이 만들어졌고, 다음 사람이 참가하면 서버는 'ready'를 emit한다.
    socketRef.current.on("ready", initiateCall);

    // 참가자가 room을을 떠나면 'leave'를 emit한다.
    socketRef.current.on("leave", onPeerLeave);

    //room을이 가득 찼으면 서버는 'full'을 emit한다.
    socketRef.current.on("full", () => {
      alert("참가하려는 room을이 가득 찼습니다.");
    });

    // client- signaling server 간 offer , answer, ice-candidate 과정
    socketRef.current.on("offer", handleReceivedOffer);
    socketRef.current.on("answer", handleAnswer);
    socketRef.current.on("ice-candidate", handlerNewIceCandidateMsg);

    // unmmount시 소켓을 끊는다
    return () => socketRef.current.disconnect();
  }, [roomName]);

  async function getCameras(): Promise<void> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === "videoinput");
      const currentCamera = userStreamRef.current.getVideoTracks()[0];

      cameras.forEach((camera) => {
        const option = document.createElement("option");
        option.value = camera.deviceId;
        option.innerText = camera.label;

        if (currentCamera.label === camera.label) {
          option.selected = true;
        }
        selectRef.current.appendChild(option);
      });
    } catch (e) {
      console.log('getCameras error', e);
    }
  }

  const handleSelect = (e: { target: { value: string } }): void => {
    handleCameraChange(e.target.value);
    selectRef.current = e.target.value;
  };

  async function handleCameraChange(selected: string): Promise<any> {
    await getMedia(selected);
    if (webRTCConnRef.current) {
      const videoTrack = userStreamRef.current.getVideoTracks()[0];
      const videoSender = webRTCConnRef.current.getSenders().find((sender) => sender.track.kind === "video");
      videoSender.replaceTrack(videoTrack);
    }
  }

  async function getMedia(deviceId?: string): Promise<void> {
    const initialConstraints: MyConstraints = {
      audio: true,
      video: { facingMode: "user" },
    };
    const cameraConstraints: MyConstraints = {
      audio: true,
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
      console.log('navigator getUserMedia error', e);
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
      socketRef.current.emit("ready", roomName);
      console.log("[emit ready]");
    } catch (e) {
      console.log('handleRoomJoined error', e);
    }
  };
  //peer와 연결 생성 시작, eventlisten을 호스트에서 실행
  const initiateCall = async (): Promise<void> => {
    console.log("[initiateCall]");
    if (hostRef.current) {
      webRTCConnRef.current = makeConnection();
      userStreamRef.current.getTracks().forEach((track) => webRTCConnRef.current.addTrack(track, userStreamRef.current));
      try {
        console.log("[emit offer]");
        //DataChannel create and label setting
        nickNameChannel.current = webRTCConnRef.current.createDataChannel("nickname");
        moveChannel.current = webRTCConnRef.current.createDataChannel("move");

        //Client B -> Client A  message
        nickNameChannel.current.addEventListener("message", (event) => {
          // setPeerNickName(event.data);
          // console.log(JSON.parse(event.data));
        });
        moveChannel.current.addEventListener("message", (event) => {
          // recievedPosition = JSON.parse(event.data);
          if (event.data) {
            console.log(event.data, 'in initiateCall')
            setPeerPosition(JSON.parse(event.data));
          }
        })

        const offer = await webRTCConnRef.current.createOffer();
        webRTCConnRef.current.setLocalDescription(offer);
        socketRef.current.emit("offer", offer, roomName);
      } catch (e) {
        console.log('initialCall error', e);
      }
    }
  };

  const onPeerLeave = (): void => {
    //room을에 혼자 남아 있을 경우, 남아 있는 사람이 room을의 주인이 됨
    hostRef.current = true;
    if (peerVideoRef.current.srcObject) {
      // peer의 모든 track 수신을 중지
      peerVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
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
    socketRef.current.emit("leave", roomName);
    console.log("[emit leave]");
    //유저와 peer 모든 media 수신을 중지
    if (userVideoRef.current.srcObject) {
      userVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    if (peerVideoRef.current.srcObject) {
      peerVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }

    //connect이 있는지 확인하고 피어와 기존 연결을 종료
    if (webRTCConnRef.current) {
      webRTCConnRef.current.ontrack = null;
      webRTCConnRef.current.onicecandidate = null;
      webRTCConnRef.current.close();
      webRTCConnRef.current = null;
    }
    router.push("/");
  };

  const makeConnection = (): RTCPeerConnection => {
    // RTC Peer Connection 생성
    const connection = new RTCPeerConnection(ICE_SERVERS);
    //icecandidate, track listener 추가
    connection.onicecandidate = handleICECandidateEvent;
    connection.ontrack = handleTrackEvent;
    return connection;
  };

  const handleICECandidateEvent = (event: RTCPeerConnectionIceEvent): void => {
    if (event.candidate) {
      console.log("[emit ice-candidate]");
      socketRef.current.emit("ice-candidate", event.candidate, roomName);
    }
  };

  const handleTrackEvent = (event: RTCTrackEvent): void => {
    peerVideoRef.current.srcObject = event.streams[0];
  };
  //peer로부터 offer를 받았을 때
  const handleReceivedOffer = async (offer: any[]): Promise<void> => {
    if (!hostRef.current) {
      webRTCConnRef.current = makeConnection();
      webRTCConnRef.current.addEventListener("datachannel", (event: any) => {
        // console.log(event.channel.label)
        switch (event.channel.label) {
          case "nickname":
            nickNameChannel.current = event.channel;
            break;
          case "move":
            moveChannel.current = event.channel;
            console.log(peerPosition, 'in handleReceivedOffer')
            if (event.data)
              setPeerPosition(JSON.parse(event.data));
            break;
        }
      })

      userStreamRef.current.getTracks().forEach((track) => webRTCConnRef.current.addTrack(track, userStreamRef.current));
      webRTCConnRef.current.setRemoteDescription(offer);

      const answer = await webRTCConnRef.current.createAnswer();

      try {
        webRTCConnRef.current.setLocalDescription(answer);
        socketRef.current.emit("answer", answer, roomName);
        console.log("[emit answer]");
      } catch (e) {
        // console.log(e);
      }
    }
  };

  const handleAnswer = (answer) => {
    webRTCConnRef.current.setRemoteDescription(answer).catch((err) => console.log(err));
  };

  // 들어오는 "candidate"를 RTCIceCandidate로 casting
  const handlerNewIceCandidateMsg = (incoming: RTCIceCandidate): void => {
    const candidate = new RTCIceCandidate(incoming);
    webRTCConnRef.current.addIceCandidate(candidate).catch((e) => console.log(e));
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
    userStreamRef.current.getTracks().forEach((track) => {
      if (track.kind === type) {
        track.enabled = !state;
      }
    });
  };

  return (
    <div className=" flex flex-col bg-black h-screen">
      <div className="p-10 flex basis-1/4 flex-row">
        <div className="flex flex-row basis-1/2 justify-center">
          <div className="flex flex-row">
            <div className="flex flex-col grow-0 w-60 box-border border-4 text-white text-center">
              <video className="w-96" id="myface" autoPlay playsInline ref={userVideoRef}></video>
              <p className="flex text-3xl justify-center text-white">{nickName}</p>

              {[...Array(9)].map((_, i) => (
                <PuzzleSegment key={i} i={i} videoId={'myface'} peerxy={undefined} initx={(Math.random() * 0.6 + 0.2) * windowSize.width / 2} inity={(Math.random() * 0.6 + 0.2) * windowSize.height} moveChannel={moveChannel.current} />
              ))}
              <Rocket />
            </div>

            <div className="flex flex-col basis-1/5 justify-evenly">
              <input className="mb-5 rounded-full text-center" value={nickName} onChange={handleNickName} placeholder="닉네임을 입력하세요." />
              <button id="muteBtn" onClick={changeMicSetting} type="button" className="box-border height width mb-5 border-4 text-white">
                {micSetting ? "마이크 음소거" : "마이크 음소거 해제"}
              </button>
              <button id="cameraBtn" onClick={changeCameraSetting} type="button" className="box-border height width mb-5 border-4 text-white">
                {cameraSetting ? "화면 끄기" : "화면 켜기"}
              </button>
              <button onClick={leaveRoom} type="button" className="box-border height width mb-5 border-4 text-white">
                Leave
              </button>
              <select onChange={handleSelect} ref={selectRef}></select>
            </div>

          </div>



        </div>


        <div className="flex flex-row basis-1/2 justify-center">

          <div className="flex flex-row">
            <div className="flex flex-col grow-0 w-60 box-border border-4 text-white text-center">
              <video className="w-96" id="peerface" autoPlay playsInline ref={peerVideoRef}></video>
              <p className="flex text-3xl justify-center text-white">{peerNickName}</p>

              {[...Array(9)].map((_, i) => {
                // console.log(peerPosition, 'if문에서 찍음');
                if (i === peerPosition.i) {
                  // console.log(peerPosition.i, '현재 상대가 움직이고 있는 카드번호');
                  return (<PuzzleSegment key={i} i={i} videoId={'peerface'} peerxy={{ peerx: peerPosition.peerx, peery: peerPosition.peery }} initx={(Math.random() * 0.6 + 0.2) * windowSize.width / 2} inity={(Math.random() * 0.6 + 0.2) * windowSize.height} moveChannel={moveChannel.current} />)
                }
                else {
                  return (<PuzzleSegment key={i} i={i} peerxy={undefined} videoId={'peerface'} initx={(Math.random() * 0.6 + 0.2) * windowSize.width / 2} inity={(Math.random() * 0.6 + 0.2) * windowSize.height} moveChannel={moveChannel.current} />)
                }
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}