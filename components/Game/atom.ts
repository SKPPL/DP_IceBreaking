import { atom } from "recoil";

export const myWaitState = atom({
    key: 'myWaitState',
    default: false,
});
export const peerWaitState = atom({
    key: 'peerWaitState',
    default: false,
});