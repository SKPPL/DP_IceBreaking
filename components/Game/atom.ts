import { atom, selector } from "recoil";

export const myWaitState = atom({
    key: 'myWait',
    default: false,
});
export const peerWaitState = atom({
    key: 'peerWait',
    default: false,
});

export const dataChannelState = atom({
    key: 'dataChannel',
    default: false,
});


export const myFaceLandMarkState = atom({
    key: 'myFaceLandMark',
    default: false,
});

export const peerFaceLandMarkState = atom({
    key: 'peerFaceLandMark',
    default: false,
});

export const myLipState = atom({
    key: 'myLip',
    default: false,
})
export const peerLipState = atom({
    key: 'peerLip',
    default: false,
})

export const myTwirlState = atom({
    key: 'myTwirl',
    default: false,
})
export const peerTwirlState = atom({
    key: 'peerTwirl',
    default: false,
})