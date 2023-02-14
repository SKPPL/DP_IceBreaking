import React from "react";
import { io } from "socket.io-client";
import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/router";
import useSocket from "../../pages/hooks/useSocket";
import WebRTC from "./WebRTC";

interface RoomInfoResponse {
    success: boolean;
    payload: string;
}

const RoomList = () => {
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
        const roomName = prompt("방 이름을 입력해 주세요.");
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

    return (
        <>
            <button onClick={onClickCreateRoom}>채팅방 생성</button>
            <h3>채팅방 목록</h3>
            <table>
                <thead>
                    <tr>
                        <th>방번호</th>
                        <th>방이름</th>
                        <th>입장</th>
                    </tr>
                </thead>
                <tbody>
                    {rooms?.map((room, index) => (
                        <tr key={room}>
                            <td>{index + 1}</td>
                            <td>{room}</td>
                            <td>
                                <button onClick={onClickJoinRoom(room)}>입장하기</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
};

export default RoomList;
