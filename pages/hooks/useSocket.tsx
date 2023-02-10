// hooks/useSocket.js
import { useEffect, useRef } from "react";

const useSocket = (): any => {
  const socketCreated = useRef(false);
  //의존성 배열 없이 useEffect 을 사용하면 react DOM이 변경된 이후에 해당 effect 함수를 실행하라는 의미로 받아들임
  useEffect(() => {
    //소켓이 만들어지지 않은 상태이면 /api/socket.js에서 백엔드와 소켓을 연결
    if (!socketCreated.current) {
      const socketInitializer = async () => {
        await fetch('/api/webRTC/socket');
      };
      try {
        socketInitializer();
        socketCreated.current = true;
      } catch (error) {
        console.log(error);
      }
    }
  }, []);
};

export default useSocket;
