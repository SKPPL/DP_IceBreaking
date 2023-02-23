import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";

//부모로부터 ref 전달받아 사용
const Ceremony = React.forwardRef(() => {
  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <>
      <div className="w-screen h-screen flex flex-col items-center bg-transparent absolute" id="ceremony_content">
        <motion.div
          initial="visible"
          animate="hidden"
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
          variants={variants}
        >
          <p className="text-black text-7xl">
            승리하셨습니다!👍 <br />
            🕺세레모니 타임💃
          </p>
        </motion.div>
      </div>
    </>
  );
});

export default Ceremony;