import react from "react"
import { useEffect, useState } from "react"

const bgmUrl = "/sounds/bgm.mp3"
// const bgmTag = new Audio(bgmUrl);

interface Props {
  musicPlay : boolean,
}

export default function Playbgm({musicPlay}: Props) {
  // const bgmTag = new Audio(bgmUrl);
  // useEffect(() => {
  //   console.log("로드 됨")
  //   if(typeof bgmTag !== "undefined"){
  //     if (musicPlay){
  //       bgmTag.play();
  //     } else {
  //       bgmTag.pause();
  //     }
  //   }
 

  // }, [bgmTag,musicPlay])



  return(
    <>
    </>
  )
}