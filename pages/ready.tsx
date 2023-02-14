import { useRouter } from 'next/router';
import { createContext } from 'react';
import Image from 'next/image'
import tlogo from "/public/images/tlogo.png";
import ylogo from "/public/images/ylogo.png";
import plogo from "/public/images/plogo.png";
import { useContext, useEffect, useState } from "react";
import RoomList from '@/components/WebRTC/RoomList';
const MyContext = createContext("")

interface video {
    id: string;
    title: string;
    thumbnails: {
        url: string

    }[]
}

export default function Ready() {
    const route = useRouter()
    const nickName = route.query.nickName as string

    return (
        <>
            <title>Ready</title>
            <div>
                <MyContext.Provider value={nickName}>
                    <RoomList />
                </MyContext.Provider>
            </div>


        </>
    )
}
