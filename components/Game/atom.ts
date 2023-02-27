import { atom, selector } from "recoil";

export const myWaitState = atom({
    key: 'myWaitState',
    default: false,
});
export const peerWaitState = atom({
    key: 'peerWaitState',
    default: false,
});

export const dataChannelState = atom({
    key: 'dataChannelState',
    default: false,
});


export const myFaceLandMarkState = atom({
    key: 'myFaceLandMarkState',
    default: false,
});

export const peerFaceLandMarkState = atom({
    key: 'peerFaceLandMarkState',
    default: false,
});
