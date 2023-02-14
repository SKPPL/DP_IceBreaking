import { createSlice, configureStore } from "@reduxjs/toolkit";

//TODO 퍼즐의 좌표 저장하기 when DragEnd
const myPuzzleSlice = createSlice({
    name: "myPuzzle",
    initialState: { rocket: 1, lip: 1, nose: 1, rotate: 1, mirror: 1, flash: 1 },
    reducers: {
        rocket: (state) => {
            console.log(state)
            if (state.rocket > 0) {
                state.rocket -= 1;
            }
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
        mirror: (state) => {
            if (state.mirror > 0)
                state.mirror -= 1;
        },
        flash: (state) => {
            if (state.flash > 0)
                state.flash -= 1;
        }
    }
});
const myPuzzleStore = configureStore({
    reducer: {
        item: myPuzzleSlice.reducer
    }
})

export default myPuzzleStore;
