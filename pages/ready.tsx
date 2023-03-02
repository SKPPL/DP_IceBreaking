import Head from "next/head";
import RoomList from "@/components/WebRTC/RoomList";
import useSound from "use-sound";
import { useState } from "react";

const bgmUrl = "/sounds/bgm.mp3"


export default function Ready() {
  function BackgroundMusic() {
    const [bgmPlay, {stop}] = useSound(bgmUrl, {loop: true});
    const [isBgmPlaying, setBgmPlaying] = useState(false);
    
    const handlePlay = () => {
      if (!isBgmPlaying) {
        bgmPlay();
        setBgmPlaying(true);
      } else {
        stop();
        setBgmPlaying(false);
      }
    };
    
  
    return (
      <>
        {/* <div className="absolute top-0 m-[20px] w-12 h-12 bg-[url('../public/images/whitevolume.png')] bg-cover" > */}
          <button className="absolute top-0 m-[20px] w-12 h-12 bg-[url('../public/images/whitevolume.png')] bg-cover" onClick={handlePlay}></button>
        {/* </div> */}
      </>
    );
  };


  return (
    <>
      <Head>
        <title>Ready</title>
      </Head>
        <RoomList />
        <BackgroundMusic />
    </>
  );
}
