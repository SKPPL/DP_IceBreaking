import { useRouter } from 'next/router';
import { createContext } from 'react';
import Image from 'next/image'
import Head from "next/head";
import { useContext, useEffect, useState } from "react";
import RoomList from '@/components/WebRTC/RoomList';
const MyContext = createContext("")

export default function Ready() {
    const route = useRouter();

    const nickName = route.query.nickName as string

    return (
    <>
      <Head>
      <title>Ready</title>
      </Head>
        <div className="flex justify-center">
        <RoomList nickName={nickName} />
      </div>
    </>
    )
}
