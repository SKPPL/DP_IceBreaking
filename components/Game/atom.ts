import { atom, selector } from "recoil";

export const myWaitState = atom({
  key: "myWait",
  default: 0,
});
export const peerWaitState = atom({
  key: "peerWait",
  default: 0,
});

export const dataChannelState = atom({
  key: "dataChannel",
  default: false,
});

export const myFaceLandMarkState = atom({
  key: "myFaceLandMark",
  default: false,
});

export const peerFaceLandMarkState = atom({
  key: "peerFaceLandMark",
  default: false,
});

// 아이템 사용시 바뀌고, 아이템 사용이 풀릴때 돌아오는 상태
// 특정 컴포넌트의 사용이 필요한 아이템의 경우 사용시 바꾸지 않고 해당 컴포넌트의 마운트, 언마운트에 바꾼다.
export const myItemState = atom({
  key: "myItem",
  default: false,
});
export const peerItemState = atom({
  key: "peerItem",
  default: false,
});

export const indexBGMElement = atom({
  key: "indexBGMElement",
  default: undefined,
});

export const indexBGMState = atom({
  key: "indexBGMState",
  default: false,
});

export const gameBGMElement = atom({
  key: "gameBGMElement",
  default: undefined,
});

export const gameBGMState = atom({
  key: "gameBGMState",
  default: false,
});
