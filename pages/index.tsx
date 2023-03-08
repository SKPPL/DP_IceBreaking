import Head from "next/head";
import BagicHome from "@/components/PageElements/BagicHome";
import IndexBGM from "@/components/PageElements/IndexBGM";

const bgUrl = 'images/DP';
export default function Home() {
  return (
    <>
      <Head>
        <title>Dynamic Puzzle</title>
        <meta name="description" content="Play Dynamic Puzzle with FaceCamera!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <IndexBGM />
      <div className="absolute flex">
        <img src="images/dpindexBg.webp" className="w-screen h-max z-5"></img>
      </div>
      <div className="absolute justify-end items-end flex w-1/5 h-4/5 z-7">
        <BagicHome />
      </div>
    </>
  );
}
