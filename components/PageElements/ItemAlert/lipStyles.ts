import styled from 'styled-components'
import { animated } from '@react-spring/web'

export const MainL = styled.div`
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
  display: flex;
  flex-direction: column;
  pointer-events: none;
  align-items: flex-start;
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
  width: 500px;
  height: 300px;
  background-image: url("https://thumbs.gfycat.com/FlickeringDamagedGentoopenguin-size_restricted.gif");
  opacity: 0.8;
  background-size: contain;
  border: 0.2rem solid #fff;
  border-top-right-radius: 400px;
  box-shadow: 0 0 .2rem #fff,
            0 0 .2rem #fff,
            0 0 2rem #FF00FA,
            0 0 0.8rem #FF00FA,
            0 0 2.8rem #FF00FA,
            inset 0 0 1.3rem #FF00FA; 
`
// 아이템 사용 모달 알람 메시지 스타일
export const ContentL = styled.div`
  color: #fff;
  font-weight: 400;
  text-shadow: 0 0 5px #FF00FA,0 0 5px #FF00FA,0 0 5px #FF00FA,0 0 5px #FF00FA,0 0 5px #FF00FA,0 0 5px #FF00FA,0 0 5px #FF00FA,0 0 5px #FF00FA;
  opacity: 1;
  padding: 12px 22px;
  font-size: 2em;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-gap: 10px;
  overflow: hidden;
  height: auto;
  border-radius: 3px;
  margin-top: 200px;
`

export const ButtonL = styled.button`
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

export const LifeL = styled(animated.div)`
  position: absolute;
  bottom: 0;
  left: 0px;
  width: auto;
  background-image: linear-gradient(130deg, #00b4e6, #00f0e0);
  height: 5px;
`
