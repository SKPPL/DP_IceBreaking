import React from "react";
import { io } from "socket.io-client";
import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/router";
import useSocket from "../../pages/hooks/useSocket";
import { animated, useSpring } from "@react-spring/web";
import WebRTC from "./WebRTC";
import RoomMake from "./MakeRoom";
import styles from "./styles.module.css";
import Tutorial from "@/components/PageElements/Modal/Tutorial";

interface RoomInfoResponse {
  success: boolean;
  payload: string;
}

interface roomsInfo {
  roomName: string;
  roomSize: number;
}

const RoomList = () => {
  useSocket();
  const router = useRouter();
  const [rooms, setRooms] = useState<roomsInfo[]>([]);
  const [socketConnect, setSocketConnect] = useState<any>();

  useEffect(() => {
    if (typeof socketConnect !== "undefined") {
      console.log("[emit room-list]");
      socketConnect.emit("room-list");
      socketConnect.on("room-list", handleRoomList);
      return () => {
        socketConnect.off("roomlist", handleRoomList);
        socketConnect.disconnect();
      };
    }
  }, [socketConnect]);

  //처음 mount 시에만 호출
  useEffect(() => {
    setSocketConnect(io());
  }, []);

  const handleRoomList = (rooms: roomsInfo[]) => {
    console.log("[handleRoomList]", rooms);
    setRooms(rooms);
  };

  const onClickCreateRoom = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const roomName = document.getElementById("roomInput").value;
    if (!roomName) {
      alert("방 이름은 반드시 입력해야 합니다.");
      socketConnect.emit("room-list");
    } else {
      if (typeof socketConnect !== "undefined") {
        console.log("[emit request-create-room]");
        socketConnect.emit("request-create-room", roomName, (response: RoomInfoResponse) => {
          console.log("[request-create-room]");
          if (!response.success) {
            alert(response.payload);
            socketConnect.emit("room-list");
          } else {
            router.push({
              pathname: `/rooms/${response.payload}`,
            });
          }
        });
      } else {
        console.log("socketConnect undefined");
      }
    }
  }, [socketConnect]);

  const onClickJoinRoom = useCallback(
    (roomName: string) => () => {
      if (typeof socketConnect !== "undefined") {
        socketConnect.emit("request-join-room", roomName, (response: RoomInfoResponse) => {
          console.log("[request-join-room]");
          //방이 없거나 가득 찼을 경우
          if (!response.success) {
            alert(response.payload);
            socketConnect.emit("room-list");
          } else {
            router.push({
              pathname: `/rooms/${response.payload}`,
            });
          }
        });
      }
    },
    [socketConnect]
  );

  return (
    <>
      <div className={styles.readyContainer}>
        <div className={styles.readypan}>
          <div className={styles.btnReady}>
            <Tutorial />
            <RoomMake onClickCreateRoom={onClickCreateRoom} />
          </div>
          <table className={styles.readyTable}>
            <thead>
              <tr>
                <th scope="col" className="text-center text-3xl px-10 py-3">
                  방 제목
                </th>
                <th scope="col" className="text-center text-3xl px-10 py-3">
                  참가 인원
                </th>
                <th scope="col" className="text-center text-3xl px-10 py-3">
                  Enter
                </th>
              </tr>
            </thead>
            <tbody>
              {rooms?.map((room, index) => (
                <tr key={index} className={styles.readyTbody} onClick={onClickJoinRoom(room.roomName)}>
                  <td className="text-3xl px-10 py-4">{room.roomName}</td>
                  <td className="text-3xl px-10 py-4">({room.roomSize}/2)</td>
                  <td className="text-3xl px-10 py-4">
                    {room.roomSize < 2 ? (
                      <button className={styles.joinBtn} onClick={onClickJoinRoom(room.roomName)}>
                        입장하기
                      </button>
                    ) : (
                      <button className="text-red-600">입장하기</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default RoomList;
