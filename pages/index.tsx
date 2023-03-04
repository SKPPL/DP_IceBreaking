import Head from "next/head";
import BagicHome from "@/components/PageElements/BagicHome";
import styles from "./styles.module.css";
import { useEffect } from "react";
import MainParticles from "@/components/PageElements/Particles/ceremonyParticles";

import { useRecoilState } from "recoil";
import { indexBGMElement, indexBGMState } from "@/components/Game/atom";
import IndexBGM from "@/components/PageElements/IndexBGM";

export default function Home() {
  return (
    <>
      <Head>
        <title>Dynamic Puzzle</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <IndexBGM />
      <div className="absolute w-full h-auto overflow-hidden m-0 z-0 ">
        <video muted autoPlay loop src="videos/HIghBG.mp4"></video>
      </div>
      <div className="absolute justify-end items-end flex w-1/5 h-4/5 z-7">
        <BagicHome />
      </div>
    </>
  );
}
