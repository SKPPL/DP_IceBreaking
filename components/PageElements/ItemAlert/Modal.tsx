import React, { useRef, useState, useMemo, useEffect, MouseEvent } from 'react'
import { useTransition } from '@react-spring/web'
import { MainR, ContainerR, MessageR, ButtonR, ContentR, LifeR } from './rocketStyles'
import { MainM, ContainerM, MessageM, ButtonM, ContentM, LifeM } from './magnetStyles'
import { MainI, ContainerI, MessageI, ButtonI, ContentI, LifeI } from './iceStyles'
import { MainL, ContainerL, MessageL, ButtonL, ContentL, LifeL } from './lipStyles'
import { MainT, ContainerT, MessageT, ButtonT, ContentT, LifeT } from './twirlStyles'
import useSound from "use-sound"

let id = 0

interface MessageHubProps {
  segmentState: string
  config?: {
    tension: number
    friction: number
    precision: number
  }
  children: (add: AddFunction) => void
}

type AddFunction = (msg: string) => void

interface Item {
  key: number
  msg: string
}

function MessageHub({
  segmentState,
  config = { tension: 125, friction: 20, precision: 0.1 },
  children,
}: MessageHubProps) {
  const refMap = useMemo(() => new WeakMap(), [])
  const cancelMap = useMemo(() => new WeakMap(), [])
  let [items, setItems] = useState<Item[]>([])

  let timeout;

  switch(segmentState){
    case 'rocket': timeout = 8500;  break;
    case 'magnet': timeout = 6500;  break;
    case 'ice': timeout = 14500;  break;
    case 'lip' : timeout = 9500; break;
    case 'twirl' : timeout = 9500; break;
    case 'default' : items = [];
  }

  const transitions = useTransition(items, {
    from: { transform: 'translateX(-100%)', life: '100%' },
    keys: item => item.key,
    enter: item => async (next, cancel) => {
      // cancelMap.set(item, cancel)
      await next({ transform: 'translateX(0%)' })  // 아이템 사용 알람 높이 조절
      await next({ life: '0%' })
    },
    leave: [{ transform: 'translateX(-100%)'}],
    onRest: (result, ctrl, item) => {
      setItems(state =>
        state.filter(i => {
          return i.key !== item.key
        })
      )
    },
    config: (item, index, phase) => key => phase === 'enter' && key === 'life' ? { duration: timeout } : config,
  })

  useEffect(() => {
    children((msg: string) => {
      setItems(state => [...state, { key: id++, msg }])
    })
  }, [])

  switch(segmentState){
    case 'rocket':
      return (
        <ContainerR>
          {transitions(({ life, ...style }, item) => (
            <MessageR style={style}>
              <ContentR ref={(ref: HTMLDivElement) => ref && refMap.set(item, ref)}>
                <LifeR style={{ right: life }} />
                <p>{item.msg}</p>
              </ContentR>
            </MessageR>
          ))}
        </ContainerR>
      )
    case 'magnet':
      return (
        <ContainerM>
          {transitions(({ life, ...style }, item) => (
            <MessageM style={style}>
              <ContentM ref={(ref: HTMLDivElement) => ref && refMap.set(item, ref)}>
                <LifeM style={{ right: life }} />
                <p>{item.msg}</p>
              </ContentM>
            </MessageM>
          ))}
        </ContainerM>
      )
    case 'ice':
      return (
        <ContainerI>
          {transitions(({ life, ...style }, item) => (
            <MessageI style={style}>
              <ContentI ref={(ref: HTMLDivElement) => ref && refMap.set(item, ref)}>
                <LifeI style={{ right: life }} />
                <p>{item.msg}</p>
              </ContentI>
            </MessageI>
          ))}
        </ContainerI>
      )
    case 'lip':
      return (
        <ContainerL>
          {transitions(({ life, ...style }, item) => (
            <MessageL style={style}>
              <ContentL ref={(ref: HTMLDivElement) => ref && refMap.set(item, ref)}>
                <LifeL style={{ right: life }} />
                <p>{item.msg}</p>
              </ContentL>
            </MessageL>
          ))}
        </ContainerL>
      )
    case 'twirl':
      return (
        <ContainerT>
          {transitions(({ life, ...style }, item) => (
            <MessageT style={style}>
              <ContentT ref={(ref: HTMLDivElement) => ref && refMap.set(item, ref)}>
                <LifeT style={{ right: life }} />
                <p>{item.msg}</p>
              </ContentT>
            </MessageT>
          ))}
        </ContainerT>
      )
  }
  return(<></>)
}

interface Props {
  segmentState: string;
}

const icesoundUrl = '/sounds/iceCrack.mp3'
const magnetSoundUrl = '/sounds/MagnetSound.mp3'
const rocketSoundUrl = '/sounds/rocketLaunch.mp3'
const twirlSoundUrl = '/sounds/twirl.mp3'


export default function Modal({ segmentState }:Props) {
  const ref = useRef<null | AddFunction>(null)
  
  const [iceSoundPlay] = useSound(icesoundUrl, { playbackRate: 1.5 });
  const [magnetPlay] = useSound(magnetSoundUrl);
  const [rocketPlay] = useSound(rocketSoundUrl);
  const [twirlPlay] = useSound(twirlSoundUrl);

  
  useEffect(() => {
    switch(segmentState){
      case 'rocket':
        ref.current?.(`내 조각이 로켓으로 변했습니다!`);
        rocketPlay();
        break;
      case 'magnet':
        ref.current?.(`블랙홀로 조각이 빨려들어갑니다!`);
        magnetPlay();
        break;
      case 'ice':
        ref.current?.(`얼음을 클릭해 부수세요!`);
        iceSoundPlay();
        break;
      case 'lip':
        ref.current?.(`Chu ~ ❤️ `);
        // iceSoundPlay();
        break;
      case 'twirl':
        ref.current?.(`적의 얼굴이 빨려들어갑니다!`);
        twirlPlay();
        break;
    }
  }, [segmentState]);


  return (
      <MessageHub segmentState = {segmentState}
        children={(add: AddFunction) => {
          ref.current = add
        }}
      />

  )
}