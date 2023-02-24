import Head from "next/head";
import RoomList from "@/components/WebRTC/RoomList";

export default function Ready() {
  return (
    <>
      <Head>
        <title>Ready</title>
      </Head>
        <RoomList />
    </>
  );
}
