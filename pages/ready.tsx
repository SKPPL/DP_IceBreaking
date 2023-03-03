import Head from "next/head";
import RoomList from "@/components/WebRTC/RoomList";
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { indexBGMElement, indexBGMState } from "@/components/Game/atom";

export default function Ready() {
  const [indexBGM, setIndexBGM] = useRecoilState(indexBGMElement);
  const [isPlaying, setIsPlaying] = useRecoilState(indexBGMState);

  useEffect(() => {
    if (!indexBGM) {
      const newAudio = new Audio("/sounds/bgm.mp3");
      //@ts-ignore
      setIndexBGM(newAudio);
    }
    if (indexBGM && !isPlaying) {
      (indexBGM as HTMLAudioElement).loop = true;
      (indexBGM as HTMLAudioElement).volume = 0.5;
      (indexBGM as HTMLAudioElement).play();
      setIsPlaying(true);
    }
  }, [indexBGM]);

  return (
    <>
      <Head>
        <title>Ready</title>
      </Head>
      <RoomList />
    </>
  );
}
