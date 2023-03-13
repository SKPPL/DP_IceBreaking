# Dynamic Puzzle with Web Camera

## 프로젝트 기간 
(2023.02.02 ~ 2023.03.11)  
[0주차] flutter, golang 학습하다가 프로젝트 엎기 (1.26 ~ 2.01)  
[1주차] 아이디어 내고 엎고 반복하기, 프로토타입 만들기  
[2주차] 확장성 있는 개발을 위해 기반 라이브러리 교체 작업 (Konva->react-spring)  
[3주차] 아이템 2개 추가  
[4주차] 아이템 3개 추가, 게임 로직 정교화  
[5주차] 게임 시간 관련 이벤트 정교화, 프레임 최적화 및 디버깅  

## 서비스 소개 
- 기획 배경
  서로 얼굴을 보다보면 웃음을 통해 분위기를 Up 할 수 있다!
- 서비스 특징
  1. 웹카메라를 사용한 퍼즐 게임
  2. 실시간 1:1 멀티플레이
  3. 재미있는 아이템들

- [시연 영상](https://www.youtube.com/watch?v=sIGSSbmrrp0)
- 포스터 
![posterv8 001](https://user-images.githubusercontent.com/115034667/224616200-21e8dbe4-2962-4960-8a89-415033506dcf.png)



## 아키텍처 & 기술스택
1. 백엔드 : next.js (API 및 웹서버 역할)  
2. 프론트엔드 : react.js, next.js, react spring, redux, recoil, type script, Tensor flow  
3. 인프라: Amazon EC2, Github actions, Socket.io  
4. 협업 툴 : slack, github, notion  

![image](https://user-images.githubusercontent.com/43032391/224637846-99736ca6-7cd8-450d-8418-06d5d1cb49d0.png)

1. React.js  
  팀원 모두 프론트앤드 학습한 경험이 적어 그나마 익숙한 javscript를 사용하는 언어 중 레퍼런스가 가장 많은 react.js 언어를 채택하여 빠르게 프로토 타입을 개발하여 가능성 부터 확인하고자함.
2. Type Script  
  JavaScript에 Type을 명시하여 안정성을 향상
3. next.js  
  Hot Module Replacement(HMR)을 지원하여 개발 중 변경한 코드를 실시간으로 확인할 수 있고, Type Script를 지원하여 코드 유지보수와 디버깅이 안정적임. 추가로, API 라우팅 기능을 제공하여 간단한 API 서버를 사용하기에 가장 적절하였음.

## 프로젝트 진행
- 어떤 어려움이 있있는지?
  - 상태 관리
  - peer to peer 통신의 이벤트 타이밍 처리
  - 레퍼런스가 풍부하지 않은 라이브러리
- 어떤 문제를 해결했는지?
  - 프레임 저하 해결
  - 이벤트 순서 처리 해결
  - 공유자원 관리
  - 최적화
  

## 팀원소개
각 팀원들은 아래의 역할을 중점적으로 맡았으나, Boundary없이 서로 도우면서 개발하였음.
- 곽호연 : 게임 구조 설계, Canvas API
- 박다솔 : Canvas API, 이미지, 사운드
- 박찬 : 프로젝트 UI/UX
- 성현식 : 프로젝트 전반의 코드 퀄리티 향상 및 디버깅
- 이전제 : WebRTC, Socket.io, CI/CD

