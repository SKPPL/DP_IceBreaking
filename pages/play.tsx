
import Head from "next/head";
import "../components/WebRTC/WebRTC";
import WebRTC from "../components/WebRTC/WebRTC";
import dynamic from 'next/dynamic'
import { useWindowSize } from "usehooks-ts";

const PuzzleSegment = dynamic(
  import('@/components/Game/Segment'), {
  loading: () => (<div></div>),
  ssr: false,
},
);
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
  const windowSize = useWindowSize();
  return (
    <>
      <Head>
        <title>Jigsaw Puzzle</title>
      </Head>
      <div className="flex flex-col bg-neutral-700 h-96">
        <WebRTC />
        {/* <PlayPuzzle /> */}
        {[...Array(9)].map((_, i) => (
          <PuzzleSegment key={i} i={i} videoId={''} initx={(Math.random() * 0.6 + 0.2) * windowSize.width / 2} inity={(Math.random() * 0.6 + 0.2) * windowSize.height} />
        ))}
      </div>
    </>
  );
}

