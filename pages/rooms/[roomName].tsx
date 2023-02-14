import Head from "next/head";
import dynamic from 'next/dynamic'
import { useWindowSize } from "usehooks-ts";
import Script from "next/script";
import ItemBar from "@/components/itemBar/itemBar";
import WebRTC from "@/components/WebRTC/WebRTC";
import { Provider, useSelector, useDispatch } from 'react-redux'
import itemStore from "./itemStore";



export default function Play() {


    return (
        <>
            <Head>
                <title>Jigsaw Puzzle</title>
            </Head>
            {/* webRTC게임과 ItemBar에서 공통으로 사용하는 itemStore, 아이템별 사용 횟수는 1개로 제한됨 */}
            <Provider store={itemStore}>
                    <WebRTC />
                <ItemBar />
            </Provider>
        </>
    );
}