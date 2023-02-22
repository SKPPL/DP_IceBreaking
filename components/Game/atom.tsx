import { atom, selector } from "recoil";

export type status = "DONE" | "DOING";

export const storedPositions = atom({
    key: "storedPositions",
    default: [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
    ]
});

export const storedPosition = selector({
    key: "storedPositions/set",
    get: ({ get }) => {
        const positions = get(storedPositions);
        return positions;
    },
    set: ({ set }, newPosition) => {
        set(storedPositions, newPosition);
    }
});