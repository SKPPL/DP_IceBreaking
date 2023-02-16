import Head from "next/head";
import dynamic from 'next/dynamic'
import { useWindowSize } from "usehooks-ts";
import Script from "next/script";
import ItemBar from "@/components/itemBar/itemBar";
import WebRTC from "@/components/WebRTC/WebRTC";
import { Provider, useSelector, useDispatch } from 'react-redux'
import store from "./store";



export default function Play() {
    return (
        <>
            <Head>
                <title>Jigsaw Puzzle</title>
            </Head>
            <Provider store={store}>
                <WebRTC />
                <ItemBar />
            </Provider>
        </>
    );
}