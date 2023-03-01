import { createSlice, configureStore, PayloadAction } from "@reduxjs/toolkit";

const itemSlice = createSlice({
    name: "item",
    initialState: { rocket: 1, ice: 1, lip: 1, twirl: 1, magnet: 1 },
    reducers: {
        rocket: (state) => {
            if (state.rocket > 0) {
                state.rocket -= 1;
            }
        },
        ice: (state) => {
            if (state.ice > 0)
                state.ice -= 1;
        },
        lip: (state) => {
            if (state.lip > 0)
                state.lip -= 1;
        },
        twirl: (state) => {
            if (state.twirl > 0)
                state.twirl -= 1;
        },
        magnet: (state) => {
            if (state.magnet > 0)
                state.magnet -= 1;
        },
        init: (state) => {
            state = { rocket: 1, ice: 1, lip: 1, twirl: 1, magnet: 1 };
        }
    }
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const arr = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9])

const order = createSlice({
    name: "puzzleOrder",
    initialState: arr,
    reducers: {
        init: (state) => {
            state = initialState;
        },
        value: (state) => {
            return state;
        }
    }
})


const initialState = [[arr[0]*50-370, 0], [arr[1]*50-370, 0], [arr[2]*50-370, 0], [arr[3]*50-370, 0], [arr[4]*50-370, 0], [arr[5]*50-370, 0], [arr[6]*50-370, 0], [arr[7]*50-370, 0], [arr[8]*50-370, 0]]
//내 퍼즐의 상태를 저장
const myPuzzleSlice = createSlice({
    name: "myPuzzle",
    initialState: [[-320, 0], [-270, 0], [-220, 0], [-170, 0], [-120, 0], [-70, 0], [-20, 0], [30, 0], [80, 0]], //9개의 퍼즐의 좌표를 저장
    reducers: {
        setPosition: (state, action: PayloadAction<{ index: number; position: Array<number> }>) => {
            state[action.payload.index] = action.payload.position //index번째 퍼즐의 좌표를 position으로 변경
        },
        init: (state) => {
            state = initialState
        },
        start : (state) => {
            state = initialState
        }
    }
});
//상대 퍼즐의 상태를 저장
const peerPuzzleSlice = createSlice({
    name: "peerPuzzle",
    initialState: [[-320, 0], [-270, 0], [-220, 0], [-170, 0], [-120, 0], [-70, 0], [-20, 0], [30, 0], [80, 0]], //9개의 퍼즐의 좌표를 저장
    reducers: {
        setPosition: (state, action: PayloadAction<{ index: number; position: Array<number> }>) => {
            state[action.payload.index] = action.payload.position //index번째 퍼즐의 좌표를 position으로 변경
        },
        init: (state) => {
            state = initialState;
        },
        start: (state) => {
            state = initialState;
        }
    }
});

const puzzleCompleteSlice = createSlice({
    name: "puzzleComplete",
    initialState: { mine: 0, peer: 0 }, //나와 상대방의 퍼즐 완성 여부를 저장
    reducers: {
        plus_mine: (state) => {
            state.mine = state.mine + 1;
        },
        plus_peer: (state) => {
            state.peer = state.peer + 1;
        },
        init_mine: (state) => {
            state.mine = 0;
        },
        init_peer: (state) => {
            state.peer = 0;
        }
    }
});

const isBgMusicOnSlice = createSlice({
    name: "isBgMusicOn",
    initialState: { isBgMusicOn: true },
    reducers: {
        bgm_start: (state) => {
            state.isBgMusicOn = true;
        },
        bgm_stop: (state) => {
            state.isBgMusicOn = false;
        }
    }
});



const store = configureStore({
    reducer: {
        item: itemSlice.reducer,
        myPuzzle: myPuzzleSlice.reducer,
        peerPuzzle: peerPuzzleSlice.reducer,
        puzzleComplete: puzzleCompleteSlice.reducer,
        isBgMusicOn: isBgMusicOnSlice.reducer,
        puzzleOrder: order.reducer,
    }
})

export default store;