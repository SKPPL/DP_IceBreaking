import Head from "next/head";
import ItemBar from "@/components/itemBar/itemBar";
import WebRTC from "@/components/WebRTC/WebRTC";
import { Provider } from "react-redux";
import store from "../../components/Game/store";
import styles from "../rooms/styles.module.css";
import React from "react";

export default function Play() {
  return (
    <>
      <Head>
        <title>Jigsaw Puzzle</title>
      </Head>
      <div className={`h-full ${styles.gameBackGround}`}>
        <Provider store={store}>
          <WebRTC />
          <div id="itembar" className="invisible">
            <ItemBar />
          </div>
        </Provider>
      </div>
    </>
  );
}
