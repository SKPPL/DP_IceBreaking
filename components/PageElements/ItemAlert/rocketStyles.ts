import styled from 'styled-components'
import { animated } from '@react-spring/web'

// align-items 에서 알람 창 위치 조절
export const ContainerR = styled.div`
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
  bottom: 20%;
  display: flex;
  flex-direction: column;
  pointer-events: none;
  align-items: flex-start;
  @media (max-width: 680px) {
    align-items: center;
  }
`
// 아이템 사용 모달 알람 박스 스타일
export const MessageR = styled(animated.div)`
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  @media (max-width: 680px) {
    width: 100%;
  }
  width: 80vh;
  height: 40vh;
  background-image: url("/images/rocketModal.jpeg");
  opacity: 1.1;
  background-size: contain;
  border: 0.2rem solid #fff;
  border-top-right-radius: 150px;
  border-bottom-left-radius: 150px;
  box-shadow: 0 0 .2rem #fff,
            0 0 .2rem #fff,
            0 0 2rem #fe135d,
            0 0 0.8rem #fe135d,
            0 0 2.8rem #fe135d,
            inset 0 0 1.3rem #fe135d; 
`
// 아이템 사용 모달 알람 메시지 스타일
export const ContentR = styled.div`
  color: #fff;
  font-weight: 400;
  text-shadow: 0 0 5px #fe135d,0 0 5px #fe135d,0 0 5px #fe135d,0 0 5px #fe135d,0 0 5px #fe135d,0 0 5px #fe135d,0 0 5px #fe135d,0 0 5px #fe135d;
  opacity: 1;
  padding: 50px 20px;
  font-size: 3.2em;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-gap: 10px;
  overflow: hidden;
  height: auto;
  border-radius: 3px;
  margin: 10% 0 0 5%;
`