import React, { useRef, useState, useMemo, useEffect, MouseEvent } from 'react'
import { X } from 'react-feather'
import { useTransition } from '@react-spring/web'
import { ContainerR, MessageR, ContentR } from './rocketStyles'
import { ContainerM, MessageM, ContentM } from './magnetStyles'
import { ContainerI, MessageI, ContentI } from './iceStyles'
import { ContainerL, MessageL, ContentL } from './lipStyles'
import { ContainerT, MessageT, ContentT } from './twirlStyles'
import { MessageA, ContentA } from './timeAlert'

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
  let [items, setItems] = useState<Item[]>([])

  let timeout;

  switch(segmentState){
    case 'rocket': timeout = 1500;  break;
    case 'magnet': timeout = 1500;  break;
    case 'ice': timeout = 1500;  break;
    case 'lip' : timeout = 1500; break;
    case 'twirl' : timeout = 1500; break;
    case 'default' : items = [];
  }

  const transitions = useTransition(items, {
    from: { transform: 'translateX(100%)', life: '100%' },
    keys: item => item.key,
    enter: item => async (next, cancel) => {
      // cancelMap.set(item, cancel)
      await next({ transform: 'translateX(0%)' })  // 아이템 사용 알람 높이 조절
      await next({ life: '0%' })
    },
    leave: [{ transform: 'translateX(100%)'}],
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
            <MessageA style={style}>
              <ContentA ref={(ref: HTMLDivElement) => ref && refMap.set(item, ref)}>
                <p>9초 지속</p>
              </ContentA>
            </MessageA>
          ))}
          {transitions(({ life, ...style }, item) => (
            <MessageR style={style}>
              <ContentR ref={(ref: HTMLDivElement) => ref && refMap.set(item, ref)}>
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
            <MessageA style={style}>
              <ContentA ref={(ref: HTMLDivElement) => ref && refMap.set(item, ref)}>
                <p>7초 지속</p>
              </ContentA>
            </MessageA>
          ))}
          {transitions(({ life, ...style }, item) => (
            <MessageM style={style}>
              <ContentM ref={(ref: HTMLDivElement) => ref && refMap.set(item, ref)}>
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
            <MessageA style={style}>
              <ContentA ref={(ref: HTMLDivElement) => ref && refMap.set(item, ref)}>
                <p>15초 지속</p>
              </ContentA>
            </MessageA>
          ))}
          {transitions(({ life, ...style }, item) => (
            <MessageI style={style}>
              <ContentI ref={(ref: HTMLDivElement) => ref && refMap.set(item, ref)}>
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
            <MessageA style={style}>
              <ContentA ref={(ref: HTMLDivElement) => ref && refMap.set(item, ref)}>
                <p>10초 지속</p>
              </ContentA>
            </MessageA>
          ))}
          {transitions(({ life, ...style }, item) => (
            <MessageL style={style}>
              <ContentL ref={(ref: HTMLDivElement) => ref && refMap.set(item, ref)}>
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
            <MessageA style={style}>
              <ContentA ref={(ref: HTMLDivElement) => ref && refMap.set(item, ref)}>
                <p>10초 지속</p>
              </ContentA>
            </MessageA>
          ))}
          {transitions(({ life, ...style }, item) => (
            <MessageT style={style}>
              <ContentT ref={(ref: HTMLDivElement) => ref && refMap.set(item, ref)}>
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

export default function ModalPeer({ segmentState }:Props) {
  const ref = useRef<null | AddFunction>(null)

  useEffect(() => {
    switch(segmentState){
      case 'rocket': ref.current?.(`적의 로켓을 움직이세요!`);  break;
      case 'magnet': ref.current?.(`블랙홀이 생성되었습니다!`);  break;
      case 'ice': ref.current?.(`적의 조각이 얼어붙었습니다!`);  break;
      case 'lip': ref.current?.(`Chu ~ ❤️ `); break;
      case 'twirl': ref.current?.(`내 얼굴이 돌아갑니다!`); break;
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

