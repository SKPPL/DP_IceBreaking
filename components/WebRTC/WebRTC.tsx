import React from "react";
import { useRouter } from "next/router";
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import useSocket from "../../pages/hooks/useSocket";
import dynamic from "next/dynamic";

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
  const moveChannel = useRef<RTCDataChannel>();


  //State
  const [micSetting, setMicSetting] = useState(true);
  const [cameraSetting, setCameraSetting] = useState(true);
  const [roomName, setRoomName] = useState<string | string[] | undefined>("");
  const [nickName, setNickName] = useState("");
  const [peerNickName, setPeerNickName] = useState("");
  const [socketConnect, setSocketConnect] = useState<any>();
  const [peerPosition, setPeerPosition] = useState({ i: -1, peerx: 0, peery: 0 });

  useEffect(() => {
    if (typeof socketConnect !== "undefined") {
      console.log("[roomName] : ", roomName);
      socketConnect.on("created", handleRoomCreated);
      socketConnect.emit("join", roomName);
      socketConnect.on("joined", handleRoomJoined);
      socketConnect.on("ready", initiateCall);
      socketConnect.on("leave", onPeerLeave);
      socketConnect.on("full", () => {
        alert("참가하려는 room을이 가득 찼습니다.");
      });
      socketConnect.on("offer", handleReceivedOffer);
      socketConnect.on("answer", handleAnswer);
      socketConnect.on("ice-candidate", handlerNewIceCandidateMsg);

      // unmmount시 소켓을 끊는다
      return () => socketConnect.disconnect();
    }
  }, [socketConnect]);

  //처음 마운트시에 호출
  useEffect(() => {
    // 서버 <-> 브라우저 간 socket io 통신 연결
    setSocketConnect(io());
    // 초기 room을이름 설정
    setRoomName(router.query.roomName);
  }, []);

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

        cameras.forEach((camera) => {
          const option = document.createElement("option");
          option.value = camera.deviceId;
          option.innerText = camera.label;

          if (currentCamera.label === camera.label) {
            option.selected = true;
          }
          selectRef.current.appendChild(option);
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  const handleSelect = (e: { target: { value: string } }): void => {
    handleCameraChange(e.target.value);
    selectRef.current = e.target.value;
  };

  async function handleCameraChange(selected: string): Promise<any> {
    await getMedia(selected);
    if (webRTCConnRef.current && typeof userStreamRef.current !== "undefined") {
      const videoTrack = userStreamRef.current.getVideoTracks()[0];
      const videoSender = webRTCConnRef.current.getSenders().find((sender: RTCRtpSender) => {
        if (sender.track !== null) {
          sender.track.kind === "video";
        }
      });
      videoSender.replaceTrack(videoTrack);
    }
  }

  async function getMedia(deviceId?: string): Promise<void> {
    const initialConstraints: MyConstraints = {
      audio: true,
      // video: { facingMode: "user" },
      video: { width: 640, height: 480 },
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
        moveChannel.current = webRTCConnRef.current.createDataChannel("move");

        if (typeof nickNameChannel.current !== "undefined") {
          //Client A에서 동작하는 코드 데이터 채널에 이벤트 리스너를 달아서 이벤트가 들어오면 
          //들어오는 데이터로 상대방 닉네임을 설정
          nickNameChannel.current.addEventListener("message", (event: MessageEvent<any>): void => {
            setPeerNickName(event.data);
          });
        }

        if (typeof moveChannel.current !== "undefined") {
          moveChannel.current.addEventListener("message", (event: MessageEvent<any>): void => {
            if (event.data) {
              console.log(event.data, 'in initiateCall')
              setPeerPosition(JSON.parse(event.data));
            }
          });
        }

        const offer = await webRTCConnRef.current.createOffer();
        webRTCConnRef.current.setLocalDescription(offer);
        socketConnect.emit("offer", offer, roomName);
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
    if (userVideoRef.current.srcObject) {
      userVideoRef.current.srcObject.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    }
    if (peerVideoRef.current.srcObject) {
      peerVideoRef.current.srcObject.getTracks().forEach((track: MediaStreamTrack) => track.stop());
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
          case "move":
            moveChannel.current = event.channel;
            console.log(peerPosition, 'in handleReceivedOffer')
            if (event.data)
              setPeerPosition(JSON.parse(event.data));
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

    <div className="flex flex-col bg-black h-screen">
      <div className="p-10 flex basis-1/4 flex-row">
        <div className="flex flex-row basis-1/2 justify-center">
          <div className="flex flex-row">
            <div className="flex flex-col grow-0 w-60 box-border border-4 text-white text-center">
              <video className="w-96" id="myface" autoPlay playsInline ref={userVideoRef}></video>
              <p className="flex text-3xl justify-center text-white">{nickName}</p>
              {(moveChannel.current?.readyState === 'open') && [...Array(9)].map((_, i) => (
                <PuzzleSegment key={i} i={i} videoId={'myface'} peerxy={undefined} initx={0} inity={0} moveChannel={moveChannel.current} />
              ))}
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
              <video className="w-96" id="myface" autoPlay playsInline ref={peerVideoRef}></video>
              <p className="flex text-3xl justify-center text-white">{peerNickName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
