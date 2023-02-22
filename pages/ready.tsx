import { createContext } from 'react';
import Head from "next/head";
import RoomList from '@/components/WebRTC/RoomList';
const MyContext = createContext("")

export default function Ready() {

    return (
    <>
      <Head>
      <title>Ready</title>
        </Head>
        <div className="flex justify-center">
        <RoomList />
          </div>
    </>
    )
}
