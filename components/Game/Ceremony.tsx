import React, { useState, useEffect } from "react";
import CeremonyParticles from "../PageElements/Particles/ceremonyParticles";
import styles from "./styles.module.css";

export default function Ceremony() {

  return (
    <>
      <CeremonyParticles />
      <div className="w-full flex justify-center" id="ceremony_content">
        <div className={`${styles.ceremony} flex justify-center items-center m-10 w-1/2 h-16 rounded-full`}>
          <h2 className={styles.ceremonyText}>승리자의 세레머니</h2>
        </div>
      </div>
    </>
  );
}