import { indexBGMElement, indexBGMState } from "@/components/Game/atom";
import { useRecoilState } from "recoil";
import { useEffect } from "react";

export default function IndexBGM() {
  const [indexBGM, setIndexBGM] = useRecoilState(indexBGMElement);
  const [isPlaying, setIsPlaying] = useRecoilState(indexBGMState);

  const handleChangeSound = (): void => {
    setIsPlaying((prev) => !prev);
  };

  useEffect(() => {
    if (!indexBGM) {
      const newAudio = new Audio("/sounds/bgm.mp3");
      //@ts-ignore
      setIndexBGM(newAudio);
      setIsPlaying(true);
    }
  }, [indexBGM]);

  useEffect(() => {
    if (indexBGM && isPlaying) {
      (indexBGM as HTMLAudioElement).loop = true;
      (indexBGM as HTMLAudioElement).volume = 0.5;
      (indexBGM as HTMLAudioElement).play();
    } else if (indexBGM && !isPlaying) {
      (indexBGM as HTMLAudioElement).pause();
    }
  }, [isPlaying]);

  return (
    <>
      <button className="z-10 absolute bottom-0 m-[20px] w-12 h-12 bg-[url('../public/images/whitevolume.png')] bg-cover" onClick={handleChangeSound}></button>
    </>
  );
}
