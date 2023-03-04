import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";

export default function Ceremony() {
  
  return (
    <>
      <div className="w-full flex justify-center" id="ceremony_content">
        <div className={`${styles.ceremony} flex justify-center items-center m-10 w-1/2 h-16 rounded-full`}>
          <h2 className={styles.ceremonyText}>승리하셨습니다.</h2>
        </div>
      </div>
    </>
  );
}