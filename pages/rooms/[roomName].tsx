import Head from "next/head";
import dynamic from 'next/dynamic'
import { useWindowSize } from "usehooks-ts";
import Script from "next/script";
import ItemBar from "@/components/itemBar/itemBar";
import WebRTC from "@/components/WebRTC/WebRTC";
import { Provider, useSelector, useDispatch } from 'react-redux'
import store from "../../components/Game/store";
import {
    RecoilRoot,
    atom,
    selector,
    useRecoilState,
    useRecoilValue,
} from 'recoil';
import styles from '../rooms/styles.module.css'



export default function Play() {

    return (
        <>
            <Head>
                <title>Jigsaw Puzzle</title>
            </Head>
            <div className={`h-full ${styles.gameBackGround}`}>
                <RecoilRoot>
                    <Provider store={store}>
                        <WebRTC />
                        <div id="itembar" className="hidden">
                            <ItemBar />
                        </div>
                    </Provider>
                </RecoilRoot>
            </div>
        </>
    );
}