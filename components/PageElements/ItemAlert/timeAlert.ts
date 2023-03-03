import styled from 'styled-components'
import { animated } from '@react-spring/web'

export const MainA = styled.div`
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
export const ContainerA = styled.div`
  -webkit-user-select:none;
  -moz-user-select:none;
  -ms-user-select:none;
  user-select:none;
  pointer-events: none;
  position: fixed;
  z-index: 1000;
  width: 0 auto;
  bottom: 30px;
  margin: 0 auto;
  left: 30px;
  right: 30px;
  bottom: 35%;
  display: flex;
  flex-direction: column;
  pointer-events: none;
  align-items: flex-start;
  @media (max-width: 680px) {
    align-items: center;
  }
`
// 아이템 사용 모달 알람 박스 스타일
export const MessageA = styled(animated.div)`
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  @media (max-width: 680px) {
    width: 100%;
  }
  width: 700px;
  height: 130px;
  background-image: url("");
  opacity: 1;
  background-size: contain;
`
// 아이템 사용 모달 알람 메시지 스타일
export const ContentA = styled.div`
  color: #fff;
  font-weight: 500;
  text-shadow: 0 0 10px black, 0 0 10px black, 0 0 10px black, 0 0 10px black, 0 0 10px black;
  opacity: 1;
  font-size: 2.3em;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-gap: 10px;
  overflow: hidden;
  height: auto;
  border-radius: 3px;
  margin: 10% 0 0 5%;
`