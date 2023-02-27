import styled from 'styled-components'
import { animated } from '@react-spring/web'

export const Main = styled.div`
  cursor: pointer;
  color: #676767;
  -webkit-user-select: none;
  user-select: none;
  display: flex;
  align-items: center;
  height: 100%;
  justify-content: center;
`

// align-items 에서 알람 창 위치 조절
export const Container = styled.div`
  position: fixed;
  z-index: 1000;
  width: 0 auto;
  bottom: 30px;
  margin: 0 auto;
  left: 30px;
  right: 30px;
  display: flex;
  flex-direction: column;
  pointer-events: none;
  align-items: flex-end;
  @media (max-width: 680px) {
    align-items: center;
  }
`
// 아이템 사용 모달 알람 박스 스타일
export const Message = styled(animated.div)`
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  width: 45ch;
  @media (max-width: 680px) {
    width: 100%;
  }
  background: #445159;
  outline: none;
  color: #fff;
  z-index: 0;
  border: 0.1rem solid #fff;
  box-shadow: 0 0 .05rem #fff,
              0 0 .5rem #fff,
              0 0 0.5rem #e2aff6,
              0 0 0.2rem #e2aff6,
              0 0 0.7rem #e2aff6,
              inset 0 0 0.15rem #e2aff6;
`
// 아이템 사용 모달 알람 메시지 스타일
export const Content = styled.div`
  color: white;
  background: #445159;
  opacity: 0.9;
  padding: 12px 22px;
  font-size: 1.5em;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-gap: 10px;
  overflow: hidden;
  height: auto;
  border-radius: 3px;
  margin-top: 10px;
`

export const Button = styled.button`
  cursor: pointer;
  pointer-events: all;
  outline: 0;
  border: none;
  background: transparent;
  display: flex;
  align-self: flex-end;
  overflow: hidden;
  margin: 0;
  padding: 0;
  padding-bottom: 14px;
  color: rgba(255, 255, 255, 0.5);
  :hover {
    color: rgba(255, 255, 255, 0.6);
  }
`

export const Life = styled(animated.div)`
  position: absolute;
  bottom: 0;
  left: 0px;
  width: auto;
  background-image: linear-gradient(130deg, #00b4e6, #00f0e0);
  height: 5px;
`
