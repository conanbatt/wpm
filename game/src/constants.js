// @ts-check

import dialogs from "./data/dialogs.json";

export const EASY_RIVAL_SPEED = 0.3;
export const goalBlocks = 2;
export const maxtime = 500;
export const maxMistakes = 2;
export const lineHeight = 24;
export const charSpacing = 10;
export const startmoveline = 1;
export const marginvisiblebox = 1;
export const dialogsData = dialogs;

// modifiable data in game
export const data = {
    /**
     * Allocated resizable objects for update on resize
     *
     * @type {import("kaplay").GameObj[]}
     */
    resizableObjects: [],
    /**
     * Current block
     */
    currentBlock: 0,
};
