import { atom } from "recoil";

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