import styled from 'styled-components'
import { animated } from '@react-spring/web'

// align-items 에서 알람 창 위치 조절
export const ContainerL = styled.div`
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
  align-items: flex-end;
  @media (max-width: 680px) {
    align-items: center;
  }
`
// 아이템 사용 모달 알람 박스 스타일
export const MessageL = styled(animated.div)`
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  @media (max-width: 680px) {
    width: 100%;
  }
  width: 70vh;
  height: 30vh;
  background-image: url("/images/lipHani.gif");
  opacity: 1.1;
  background-size: cover;
  border: 0.2rem solid #fff;
  border-top-left-radius: 150px;
  border-bottom-right-radius: 50px;
  box-shadow: 0 0 .2rem #fff,
            0 0 .2rem #fff,
            0 0 2rem #FF00FA,
            0 0 0.8rem #FF00FA,
            0 0 2.8rem #FF00FA,
            inset 0 0 1.3rem #FF00FA; 
`
// 아이템 사용 모달 알람 메시지 스타일
export const ContentL = styled.div`
  text-align: right;
  color: #fff;
  font-weight: 400;
  text-shadow: 0 0 5px #FF00FA,0 0 5px #FF00FA,0 0 5px #FF00FA,0 0 5px #FF00FA,0 0 5px #FF00FA,0 0 5px #FF00FA,0 0 5px #FF00FA,0 0 5px #FF00FA;
  opacity: 1;
  padding: 70px 20px;
  font-size: 2.8em;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-gap: 10px;
  overflow: hidden;
  height: auto;
  border-radius: 3px;
  margin: 10% 0 0 5%;
`
