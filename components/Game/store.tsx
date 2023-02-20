import { createSlice, configureStore, PayloadAction } from "@reduxjs/toolkit";

const itemSlice = createSlice({
    name: "item",
    initialState: { rocket: 1, ice: 1, lip: 1, nose: 1, rotate: 1, divide: 1 },
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
        nose: (state) => {
            if (state.nose > 0)
                state.nose -= 1;
        },
        rotate: (state) => {
            if (state.rotate > 0)
                state.rotate -= 1;
        },
        divide: (state) => {
            if (state.divide > 0)
                state.divide -= 1;
        },
        init: (state) => {
            state = { rocket: 1, ice: 1, lip: 1, nose: 1, rotate: 1, divide: 1 };
            console.log('초기화 했디ㅏ')
        }
    }
});
const initialState = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]]
//내 퍼즐의 상태를 저장
const myPuzzleSlice = createSlice({
    name: "myPuzzle",
    initialState: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]], //9개의 퍼즐의 좌표를 저장
    reducers: {
        setPosition: (state, action: PayloadAction<{ index: number; position: Array<number> }>) => {
            state[action.payload.index] = action.payload.position //index번째 퍼즐의 좌표를 position으로 변경
        },
        init: (state) => {
            state = initialState;
        }
    }
});
//상대 퍼즐의 상태를 저장
const peerPuzzleSlice = createSlice({
    name: "peerPuzzle",
    initialState: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]], //9개의 퍼즐의 좌표를 저장
    reducers: {
        setPosition: (state, action: PayloadAction<{ index: number; position: Array<number> }>) => {
            state[action.payload.index] = action.payload.position //index번째 퍼즐의 좌표를 position으로 변경
        },
        init: (state) => {
            state = initialState;
        }
    }
});

const store = configureStore({
    reducer: {
        item: itemSlice.reducer,
        myPuzzle: myPuzzleSlice.reducer,
        peerPuzzle: peerPuzzleSlice.reducer,
    }
})

export default store;