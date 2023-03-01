import react from "react"
import { useEffect, useState } from "react"

const bgmUrl = "/sounds/bgm.mp3"
const bgmTag = new Audio(bgmUrl);

interface Props {
  musicPlay : boolean,
}

export default function Playbgm({musicPlay}: Props) {

  useEffect(() => {
    console.log("로드 됨")
    if (musicPlay){
      bgmTag.play();
    } else {
      bgmTag.pause();
    }

  }, [musicPlay])

  return(
    <>
      {/* <audio className="" src={bgmUrl} autoPlay={true}  hidden></audio> */}
    </>
  )
}