import Head from "next/head";
import RoomList from "@/components/WebRTC/RoomList";
import IndexBGM from "@/components/PageElements/IndexBGM";

export default function Ready() {
  return (
    <>
      <Head>
        <title>Dynamic Puzzle</title>
      </Head>
      <IndexBGM />
      <RoomList />
    </>
  );
}
