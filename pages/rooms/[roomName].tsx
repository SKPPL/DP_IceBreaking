
import Head from "next/head";
import dynamic from 'next/dynamic'
import { useWindowSize } from "usehooks-ts";
import Script from "next/script";
import ItemBar from "@/components/itemBar/itemBar";
import WebRTC from "@/components/WebRTC/WebRTC";

export default function Play() {
    return (
        <>
            <Head>
                <title>Jigsaw Puzzle</title>
            </Head>
            <div className="flex flex-col bg-neutral-700 h-96">
                <WebRTC />
            </div>
            <ItemBar />
        </>
    );
}

