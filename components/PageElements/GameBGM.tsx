import { gameBGMElement, gameBGMState } from "@/components/Game/atom";
import { useRecoilState } from "recoil";
import { useEffect } from "react";

interface props {
  prevPlayingState: boolean | undefined;
}

export default function GameBGM({ prevPlayingState }: props) {
  const [gameBGM, setGameBGM] = useRecoilState(gameBGMElement);
  const [isPlaying, setIsPlaying] = useRecoilState(gameBGMState);

  const handleChangeSound = (): void => {
    setIsPlaying((prev) => !prev);
  };

  useEffect(() => {
    if (!gameBGM) {
      const newAudio = new Audio("/sounds/gameBGM.mp3");
      //@ts-ignore
      setGameBGM(newAudio);
      setIsPlaying(true);
    }
  }, [gameBGM]);

  useEffect(() => {
    if (gameBGM && isPlaying && !prevPlayingState) {
      (gameBGM as HTMLAudioElement).loop = true;
      (gameBGM as HTMLAudioElement).volume = 0.5;
      (gameBGM as HTMLAudioElement).play();
    } else if (gameBGM && !isPlaying) {
      (gameBGM as HTMLAudioElement).pause();
    }
  }, [isPlaying]);

  const iconClass = isPlaying ? "bg-[url('../public/images/whitevolume.png')]" : "bg-[url('../public/images/nowhitevolume.png')]";
  return (
    <>
      <button className={`z-10 absolute bottom-0 m-[20px] w-12 h-12 ${iconClass} bg-cover`} onClick={handleChangeSound}></button>      
    </>
  );
}
