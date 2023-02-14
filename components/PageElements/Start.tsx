import React, { ReactNode } from 'react'
import { useSpring, animated } from '@react-spring/web'
import { useDrag } from 'react-use-gesture'
import styles from './styles.module.css'
import { useRouter } from "next/router";

const left = {
  bg: `linear-gradient(120deg, #f093fb 0%, #f5576c 100%)`,
  justifySelf: 'end',
}
const right = {
  bg: `linear-gradient(120deg, #96fbc4 0%, #f9f586 100%)`,
  justifySelf: 'start',
}

const Slider = ({ children }: { children: ReactNode }) => {
  const [{ x, bg, scale, justifySelf }, api] = useSpring(() => ({
    x: 50,
    scale: 1,
    ...left,
  }))
    const router = useRouter();
    
    const bind = useDrag(({ active, movement: [x] }) => {
        api.start({
            x: active ? x : 50,
            scale: active ? 1.1 : 1,
            ...(x < 0 ? left : right),
            immediate: name => active && name === 'x',
        })
        if (x > 300 || x < -300) {
            router.push({
                pathname: '/ready',
            })
        };
    }
  )

  const avSize = x.to({
    map: Math.abs,
    range: [50, 300],
    output: [0.5, 1],
    extrapolate: 'clamp',
  })

  return (
    <animated.div {...bind()} className={styles.item} style={{ background: bg }}>
      <animated.div className={styles.av} style={{ scale: avSize, justifySelf }} />
      <animated.div className={styles.fg} style={{ x, scale }}>
        {children}
      </animated.div>
    </animated.div>
  )
}

export default function Start() {
  return (
    <div className={styles.container}>
      <Slider>Start</Slider>
    </div>
  )
}
