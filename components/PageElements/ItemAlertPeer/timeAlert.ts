import styled from 'styled-components'
import { animated } from '@react-spring/web'

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
  font-size: 3em;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-gap: 10px;
  overflow: hidden;
  height: auto;
  border-radius: 3px;
  margin: 7% 0 0 68%;
`