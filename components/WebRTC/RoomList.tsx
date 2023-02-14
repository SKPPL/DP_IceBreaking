import React from "react";
import { io } from "socket.io-client";
import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/router";
import useSocket from "../../pages/hooks/useSocket";
import { animated, useSpring } from "@react-spring/web";
import WebRTC from "./WebRTC";
import RoomMake from "../PageElements/MakeRoom";

interface RoomInfoResponse {
    success: boolean;
    payload: string;
}

const RoomList = ({ nickName } : any) => {
    useSocket();
    const router = useRouter();
    const [rooms, setRooms] = useState<string[]>([]);
    const [socketConnect, setSocketConnect] = useState<any>();

    useEffect(() => {
        if (typeof socketConnect !== "undefined") {
            console.log("[emit room-list]");
            socketConnect.emit("room-list");
            socketConnect.on("room-list", handleRoomList);
            socketConnect.on("request-create-room", handleCreateRoom);
            socketConnect.on("delete-room", handleDeleteRoom);
            return () => {
                socketConnect.off("roomlist", handleRoomList);
                socketConnect.off("request-create-room", handleCreateRoom);
                socketConnect.off("delete-room", handleDeleteRoom);
                socketConnect.disconnect();
            };
        }
    }, [socketConnect]);

    //처음 mount 시에만 호출
    useEffect(() => {
        setSocketConnect(io());
    }, []);

    const handleRoomList = (rooms: string[]) => {
        console.log("[handleRoomList]", rooms);
        setRooms(rooms);
    };
    const handleCreateRoom = (newRoom: string) => {
        console.log("[handleCreateRoom]");
        setRooms((prevRooms) => [...prevRooms, newRoom]);
    };
    const handleDeleteRoom = (roomName: string) => {
        console.log("[handleDeleteRoom]");
        setRooms((prevRooms) => prevRooms.filter((room) => room !== roomName));
    };

    const onClickCreateRoom = useCallback(() => {
        const roomName = document.getElementById('roomInput').value;
        if (!roomName) {
            alert("방 이름은 반드시 입력해야 합니다.");
        } else {
            if (typeof socketConnect !== "undefined") {
                console.log("[emit request-create-room]");
                socketConnect.emit("request-create-room", roomName, (response: RoomInfoResponse) => {
                    console.log("[request-create-room]");
                    if (!response.success) {
                        alert(response.payload);
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

    const [props, api] = useSpring(
        () => ({
          from: { opacity : 0 },
          to: { opacity : 1 },
        }),
        []
      )

    return (
        <>
        <div className="flex-col w-1/3 mt-10 p-5 relative inline-flex mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400" >
          <animated.div className="w-32 text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2" style={props}>{nickName} </animated.div>
            <div className="place-self-end mb-5">
              <RoomMake onClickCreateRoom = {onClickCreateRoom}/>
              </div>
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                      <th scope="col" className="text-center px-10 py-3">
                          방 번호
                      </th>
                      <th scope="col" className="text-center px-10 py-3">
                          방 제목
                      </th>
                      <th scope="col" className="text-center px-10 py-3">
                          <span className="sr-only">Enter</span>
                      </th>
                  </tr>
              </thead>
                <tbody>
                  {rooms?.map((room, index) => (
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <th scope="row" className="text-center px-10 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {index+1}
                    </th>
                    <td className="text-center px-10 py-4">
                        {room}
                    </td>
                    <td className="text-center px-10 py-4">
                        <button onClick={onClickJoinRoom(room)}>입장하기</button>
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
