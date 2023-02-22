import React, { useRef, useState, useMemo, useEffect, MouseEvent } from 'react'
import { X } from 'react-feather'
import { useTransition } from '@react-spring/web'
import { Main, Container, Message, Button, Content, Life } from './styles'
import useSound from "use-sound"
import magnet from '@/components/Game/SegmentState/magnet'

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
  const [items, setItems] = useState<Item[]>([])

  let timeout;

  switch(segmentState){
    case 'rocket': timeout = 7500;  break;
    case 'magnet': timeout = 7500;  break;
    case 'ice': timeout = 7500;  break;
  }

  const transitions = useTransition(items, {
    from: { opacity: 0, height: 0, life: '100%' },
    keys: item => item.key,
    enter: item => async (next, cancel) => {
      cancelMap.set(item, cancel)
      await next({ opacity: 1, height: refMap.get(item).offsetHeight + 10 })  // 아이템 사용 알람 높이 조절
      await next({ life: '0%' })
    },
    leave: [{ opacity: 0 }, { height: 0 }],
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

  return (
    <Container>
      {transitions(({ life, ...style }, item) => (
        <Message style={style}>
          <Content ref={(ref: HTMLDivElement) => ref && refMap.set(item, ref)}>
            <Life style={{ right: life }} />
            <p>{item.msg}</p>
            <Button
              onClick={(e: MouseEvent) => {
                e.stopPropagation()
                if (cancelMap.has(item) && life.get() !== '0%') cancelMap.get(item)()
              }}>
              <X size={18} />
            </Button>
          </Content>
        </Message>
      ))}
    </Container>
  )
}

interface Props {
  segmentState: string;
}

const icesoundUrl = '/sounds/iceCrack.mp3'
const magnetSoundUrl = '/sounds/MagnetSound.mp3'
const rocketSoundUrl = '/sounds/rocketLaunch.mp3'


export default function Modal({ segmentState }:Props) {
  const ref = useRef<null | AddFunction>(null)
  
  const [iceSoundPlay] = useSound(icesoundUrl, { playbackRate: 1.5 })
  const [magnetPlay] = useSound(magnetSoundUrl)
  const [rocketPlay] = useSound(rocketSoundUrl)

  
  useEffect(() => {
    switch(segmentState){
      case 'rocket':
        ref.current?.(`적이 로켓 아이템을 사용하였습니다.`);
        rocketPlay();
        break;
      case 'magnet':
        ref.current?.(`적이 자석 아이템을 사용하였습니다.`);
        magnetPlay();
        break;
      case 'ice':
        ref.current?.(`적이 얼음 아이템을 사용하였습니다.`);
        iceSoundPlay();
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
