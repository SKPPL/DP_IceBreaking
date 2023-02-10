
import Head from "next/head";
import "../components/WebRTC/WebRTC";
import WebRTC from "../components/WebRTC/WebRTC";
import Puzzle from "../components/Game/Puzzle";
export default function Play() {
  return (
    <>
      <Head>
        <title>Jigsaw Puzzle</title>
      </Head>
      <div className="flex flex-col bg-neutral-700 h-96">
          <WebRTC />
          <Puzzle />
      </div>
    </>
  );
}