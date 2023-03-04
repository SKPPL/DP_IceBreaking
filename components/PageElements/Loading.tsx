import React, { useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import styles from "./styles.module.css";

export default function Loading() {
  const [state, toggle] = useState(true);
  setInterval(function () {
    toggle(!state);
  }, 1000);
  const { x } = useSpring({
    from: { x: 0 },
    x: state ? 1 : 0,
    config: { duration: 1000 },
  });
  return (
    <div className={styles.container}>
      <animated.div
        className={styles.text}
        style={{
          opacity: x.to({ range: [0, 1], output: [0.3, 1] }),
        }}
      >
        다이나믹 퍼즐이 준비 중입니다.
      </animated.div>
    </div>
  );
}
