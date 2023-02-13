
import Head from "next/head";
import "../components/WebRTC/WebRTC";
import WebRTC from "../components/WebRTC/WebRTC";
import dynamic from 'next/dynamic'
import { useWindowSize } from "usehooks-ts";


// export function shuffle<T>(array: T[]): T[] {
//   let currentIndex = array.length, randomIndex;

//   // While there remain elements to shuffle.
//   while (currentIndex != 0) {

//     // Pick a remaining element.
//     randomIndex = Math.floor(Math.random() * currentIndex);
//     currentIndex--;

//     // And swap it with the current element.
//     [array[currentIndex], array[randomIndex]] = [
//       array[randomIndex], array[currentIndex]];
//   }

//   return array;
// };

export default function Play() {
  return (
    <>
      <Head>
        <title>Jigsaw Puzzle</title>
      </Head>
      <div className="flex flex-col bg-neutral-700 h-96">
        <WebRTC />
      </div>
    </>
  );
}

