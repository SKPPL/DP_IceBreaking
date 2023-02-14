import { NextApiResponse } from "next";
import { Server as NetServer, Socket } from "net";
import { Server as SocketIOServer } from "socket.io";

type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

// let createdRooms: string[] = [];
const SocketHandler = (_, res: NextApiResponseServerIO): any => {
  if (res.socket.server.io) {
    console.log("Socket is already attached");
    return res.end();
  }

  const io = new SocketIOServer(res.socket.server as any);
  res.socket.server.io = io;

  function publicRooms() {
    const {
      sockets: {
        adapter: { sids, rooms },
      },
    } = io;
    const publicRooms: string[] = [];
    rooms.forEach((_, key) => {
      if (sids.get(key) === undefined) {
        publicRooms.push(key);
      }
    });
    return publicRooms;
  }

  io.on("connection", (socket) => {
    console.log(`[User Connected] : ${socket.id}`);

    //peer가 room join 버튼을 눌렀을 경우 클라이언트에서 join이 트리거 되어 서버에 전달
    socket.on("join", (roomName) => {
      console.log("[join]");
      const { rooms } = io.sockets.adapter;
      const room = rooms.get(roomName);
      //방이 없는 경우
      if (room === undefined) {
        console.log("[emit create]");
        socket.join(roomName);
        socket.emit("created");
      } else if (room.size === 1) {
        //방에 한 명만 있을 경우
        console.log("[emit joined]");
        socket.join(roomName);
        socket.emit("joined");
      } else {
        //방에 두명인 경우 (full)
        console.log("[emit full]");
        socket.emit("full");
      }
      console.log("[room info] : ", rooms);
    });
    //방에 참여한 사람이 connection 준비가 되면 ready가 트리거 됨
    socket.on("ready", (roomName) => {
      console.log("[emit ready]");
      socket.broadcast.to(roomName).emit("ready");
    });
    //서버가 room의 peer로부터 "icecandidate"를 받을 때 트리거
    socket.on("ice-candidate", (candidate, roomName) => {
      console.log("[emit ice-candidate]");
      socket.broadcast.to(roomName).emit("ice-candidate", candidate); // room에 있는 다른 peer에게 "candidate" emit
    });
    //서버가 room에 있는 peer로부터 "offer"를 받을 때 트리거
    socket.on("offer", (offer, roomName) => {
      console.log("[emit offer]");
      socket.broadcast.to(roomName).emit("offer", offer); // room에 있는 다른 peer에게 "offer" emit
    });
    //서버가 room에 있는 peer로부터 "answer"를 받을 때 트리거
    socket.on("answer", (answer, roomName) => {
      console.log("[emit answer]");
      socket.broadcast.to(roomName).emit("answer", answer); // room에 있는 다른 peer에게 "answer" emit
    });
    //서버가 room에 있는 peer로부터 "leave"를 받을 때 트리거
    socket.on("leave", (roomName) => {
      console.log("[emit leave]", roomName);
      socket.leave(roomName);

      socket.broadcast.to(roomName).emit("leave"); // room에 있는 다른 peer에게 "leave" emit
    });

    socket.on("room-list", () => {
      socket.emit("room-list", publicRooms());
      console.log("[room-list]", publicRooms());
    });

    socket.on("request-create-room", (roomName: string, done) => {
      console.log("[request-create-room]", roomName);
      const exists = publicRooms().find((createdRoom) => createdRoom === roomName);
      if (exists) {
        console.log("[emit request-create-room : false]");
        done({ success: false, payload: `${roomName}라는 방이 이미 존재합니다.` });
      } else {
        console.log("[emit request-create-room : true]");
        done({ success: true, payload: roomName });
      }
    });

    socket.on("request-join-room", (roomName: string, done) => {
      console.log("[request-join-room]", roomName);

      const { rooms } = io.sockets.adapter;
      const room = rooms.get(roomName);

      if (room === undefined || room.size >= 2) {
        console.log("[emit request-join-room : false]");
        done({ success: false, payload: `방이 없거나 가득 찼습니다.` });
      } else {
        console.log("[emit request-join-room : true]");
        done({ success: true, payload: roomName });
      }
    });
  });
  return res.end();
};

export default SocketHandler;
