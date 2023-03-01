import * as React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { animated, useIsomorphicLayoutEffect, useSpringValue } from '@react-spring/web'

import { useMousePosition } from '../hooks/useMousePosition'
import { useWindowResize } from '../hooks/useWindowResize'

import { useDock } from '../Dock/DockContext'

import styles from './styles.module.scss'
import { useRecoilValue } from 'recoil'
import { dataChannelState, peerLipState, peerTwirlState, peerWaitState } from "../../Game/atom";

interface DockCardProps {
  children: React.ReactNode
  item: number
}

const INITIAL_WIDTH = 48

const itemList = ['rocket', 'ice', 'lip', 'twirl', 'magnet']

export const DockCard = ({ children, item }: DockCardProps) => {
  const dispatch = useDispatch();
  const cardRef = React.useRef<HTMLButtonElement>(null!)
  /**
   * This doesn't need to be real time, think of it as a static
   * value of where the card should go to at the end.
   */
  const [elCenterX, setElCenterX] = React.useState<number>(0)

  const size = useSpringValue(INITIAL_WIDTH, {
    config: {
      mass: 0.1,
      tension: 320,
    },
  })

  const opacity = useSpringValue(0)
  const y = useSpringValue(0, {
    config: {
      friction: 30,
      tension: 350,
    },
  })

  const dock = useDock()

  /**
   * This is just an abstraction around a `useSpring` hook, if you wanted you could do this
   * in the hook above, but these abstractions are useful to demonstrate!
   */
  useMousePosition(
    {
      onChange: ({ value }) => {
        const mouseX = value.x

        if (dock.width > 0) {
          const transformedValue =
            INITIAL_WIDTH + 36 * Math.cos((((mouseX - elCenterX) / dock.width) * Math.PI) / 2) ** 12

          if (dock.hovered) {
            size.start(transformedValue)
          }
        }
      },
    },
    [elCenterX, dock]
  )

  useIsomorphicLayoutEffect(() => {
    if (!dock.hovered) {
      size.start(INITIAL_WIDTH)
    }
  }, [dock.hovered])

  useWindowResize(() => {
    const { x } = cardRef.current.getBoundingClientRect()

    setElCenterX(x + INITIAL_WIDTH / 2)
  })

  const timesLooped = React.useRef(0)
  const timeoutRef = React.useRef<number>()
  const wasUsed = React.useRef(false)

  const peerWait = useRecoilValue(peerWaitState)
  const dataChannel = useRecoilValue(dataChannelState);
  const peerLipWait = useRecoilValue(peerLipState)
  const peerTwirlWait = useRecoilValue(peerTwirlState)
  const itemWait = peerWait || peerLipWait || peerTwirlWait
  const handleClick = () => {
    // peer에 쓴 아이템이 진행중일 때는 눌러도 아무일도 일어나지 않음
    if (itemWait === true || dataChannel === false) return;
    dispatch({ type: `item/${itemList[item]}` });
    if (!wasUsed.current) {
      wasUsed.current = true

      opacity.start(0.5)
      timesLooped.current = 0

      y.start(-INITIAL_WIDTH / 2, {
        loop: () => {
          if (1 === timesLooped.current++) {
            opacity.start(0)
            // y.set(0)
            timeoutRef.current = undefined
            y.set(0)
          }
          return { reverse: false }
        },
      })
    }
    // else {
    //   /**
    //    * Allow premature exit of animation
    //    * on a second click if we're currently animating
    //    */
    //   clearTimeout(timeoutRef.current)
    //   opacity.start(0)
    //   y.start(0)
    //   isAnimating.current = false
    // }
  }

  React.useEffect(() => () => clearTimeout(timeoutRef.current), [])

  return (
    <div className={styles['dock-card-container']}>
      <animated.button
        ref={cardRef}
        className={styles['dock-card']}
        onClick={handleClick}
        style={{
          width: size,
          height: size,
          y,
        }}>
        {children}
      </animated.button>
      <animated.div className={styles['dock-dot']} style={{ opacity }} />
    </div>
  )
}