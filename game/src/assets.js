// @ts-check
import { k } from "./kaplay.js";
k.loadFont("monogram", "/fonts/monogram.ttf", {
    outline: {
        width: 6,
        color: k.rgb(0, 0, 0)
    },
});
k.loadFont("thaleahFat", "/fonts/thaleahFat.ttf", {
    outline: {
        width: 4,
        color: k.rgb(0, 0, 0)
    },
});
k.loadSprite("bg2", "/sprites/bg2.png");
k.loadSprite("bg", "/sprites/bg.png");
k.loadSound("code_sound", "/sounds/code_sound.mp3");
k.loadSound("wrong_typing", "/sounds/wrong typing.mp3");
k.loadSprite("muteON", "/sprites/muteON.png");
k.loadSprite("muteOff", "/sprites/muteOFF.png");
k.loadSprite("WPM", "/sprites/WPM.png");