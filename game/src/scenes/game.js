// @ts-check
import "../types.js";
import {
    gameState,
    dialogsData,
    lineHeight,
    MAX_TIME,
    EASY_RIVAL_SPEED,
    JUMP_AFTER,
    ICON_START_Y,
    TEXT_START_Y,
    SPACING,
    goalBlocks,
} from "../constants.js";
import { savePlay, getPlay } from "../systems/saves.js";
import { k } from "../kaplay.js";
import { themes } from "../data/themes.js";
import { resizablePos } from "../components/resizablePos.js";
import { resizableRect } from "../components/resizableRect.js";

const titles = dialogsData.map((item) => item.title);

let COLOR_TEXT_DEFAULT = k.Color.fromHex("#544c4c");
let COLOR_TEXT_RIVAL = k.Color.fromHex("#e3cf5b");
let COLOR_TEXT_INCORRECT = k.Color.RED;

let completedBlocks = 0;
export let actual_wpm = 0;
export let actual_lpm = 0;
export let actual_acc = 0;
export let totalCorrectChars = 0;
export let totalIcorrectCorrectChars = 0;
export let totalTypedCharacters = 0;
export let totalCorrectlines = 0;
export let goal_wpm = actual_wpm;
export let goal_lpm = actual_lpm;
export let goal_acc = actual_acc;
let fontSize = 28;
let fontWidth = 13.9;
let errorCharsIndexes = [];
let errorCharsReplaces = {};


/**
 * Text taken from the dialogs.json file
 */
let originalText = "";
/**
 * The rendered and escaped text
 */
let renderedText = "";
/**
 * Text for comparison with user input
 */
let fixedText = "";

/**
 * @param {GameParams} params
 */
const gameScene = (params) => {
    const BG_SPEED_X = 0.1;
    const BG_SPEED_Y = 0.3;
    let startTime = Date.now();
    let jumpCount = 0;
    let theme = themes[0];
    let offsetX = 0;
    let offsetY = 0;
    let currentBlockIndex = -1;
    let rivalSpeed = params.rivalSpeed ?? EASY_RIVAL_SPEED;
    let curBlockData = {
        lineCount: 0,
    };

    // #region PLAYER  & RIVAL VARIABLES

    /**
     * @type {PlayerState}
     */
    const playerState = {
        
        cursorPos: 0,
        line: "",
        curLineCount: 0,
        curCharInLine: 0,
        curIdentSize: 0,
        cursorPointer: null,
        reset: () => {
            playerState.cursorPos = 0;
            playerState.line = "";
            playerState.curLineCount = 0;
            playerState.curCharInLine = 0;
            playerState.curIdentSize = 0;
            if (playerState.cursorPointer) {
                playerState.cursorPointer.pos = cursorPos();
            }
        },
    };

    /**
     * @type {PlayerState}
     */
    const rivalState = {
        cursorPos: 0,
        line: "",
        curLineCount: 0,
        curCharInLine: 0,
        curIdentSize: 0,
        cursorPointer: null,
        reset: () => {
            rivalState.cursorPos = 0;
            rivalState.line = "";
            rivalState.curLineCount = 0;
            rivalState.curCharInLine = 0;
            rivalState.curIdentSize = 0;
            if (rivalState.cursorPointer) {
                rivalState.cursorPointer.pos = cursorPos(true);
            }
        },
    };

    // #endregion

    animateBackground();

    /**
     * @param {number} i
     */
    const matchColorToken = (i, ch) => {
        const themeTokens = theme.tokens;
        const themeAssociations = theme.associations;

        if (ch === " ") return COLOR_TEXT_DEFAULT;
        if (playerState.cursorPos - 1 < i) {
            if (rivalState.cursorPos + 1 > i) {
                return COLOR_TEXT_RIVAL;
            }
            return COLOR_TEXT_DEFAULT;
        }

        let charColor = COLOR_TEXT_DEFAULT;

        const words = originalText.split(" ");
        let wordCharsIndex = 0;
        const word =
            words.find((w) => {
                const found = w.length + wordCharsIndex >= i;
                wordCharsIndex += w.length + 1;
                return found;
            }) || "";

        if (errorCharsIndexes.includes(i)) {
            charColor = COLOR_TEXT_INCORRECT;
        } else if (ch.match(themeAssociations.brackets)) {
            charColor = k.Color.fromHex(themeTokens.brackets);
        } else if (ch.match(themeAssociations.punctuation)) {
            charColor = k.Color.fromHex(themeTokens.punctuation);
        } else if (word.match(themeAssociations.classes)) {
            charColor = k.Color.fromHex(themeTokens.classes);
        } else if (word.match(themeAssociations.functions)) {
            charColor = k.Color.fromHex(themeTokens.functions);
        } else if (word.match(themeAssociations.keywords)) {
            charColor = k.Color.fromHex(themeTokens.keywords);
        } else if (word.match(themeAssociations.strings)) {
            charColor = k.Color.fromHex(themeTokens.strings);
        } else {
            charColor = k.Color.fromHex(themeTokens.text);
        }

        if (
            rivalState.cursorPos < playerState.cursorPos &&
            rivalState.cursorPos > i
        ) {
            return charColor.lighten(60);
        }

        return charColor;
    };


    function StatsforAnalitics(){
        console.log("wpm"+goal_wpm);
         goal_wpm = actual_wpm;
         goal_lpm = actual_lpm;
         goal_acc = actual_acc;
    }

    function resetGameStats() {
        completedBlocks = 0;
        actual_wpm = 0;
        actual_lpm = 0;
        actual_acc = 0;
        totalCorrectChars = 0;
        totalIcorrectCorrectChars = 0;
        totalTypedCharacters = 0;
        totalCorrectlines = 0;
        errorCharsIndexes = [];
        errorCharsReplaces = {};
    }
    function animateBackground() {
        offsetX += BG_SPEED_X;
        
        offsetY += BG_SPEED_Y;
        document.body.style.backgroundPosition = `${offsetX}px ${offsetY}px`;

        requestAnimationFrame(animateBackground);
    }
    // Music
  
    k.volume(0.6);
    const music = k.play("videogame", {
        loop: true,
    });
    // background
    // Files & Folders
    const filesFoldersSize = () => {
        if (k.width() > 1080) {
            return k.vec2(323, k.height());
        } else {
            return k.vec2(k.width() * 0.3, k.height());
        }
    };
    const filesFoldersPos = () => k.vec2(0, 0);

    k.add([
        resizablePos(filesFoldersPos),
        k.sprite("bg3"),
        k.anchor("topleft"),
        k.opacity(1),
    ]);

    const icons = [
        { sprite: "icon_03" },
        { sprite: "icon_03" },
        { sprite: "icon_03" },
        { sprite: "icon_03" },
        { sprite: "icon_03" },
        { sprite: "icon_03" },
        { sprite: "icon_03" },
    ];

    const texts = [
        { text: "Challenges", size: 20 },
        { text: "isUnique.js", size: 20 },
        { text: "removeDups.js", size: 21 },
        { text: "routeBetweenNodes.js", size: 20 },
        { text: "insertion.js", size: 20 },
        { text: "getPermutations.js", size: 20 },
        { text: "sortedMerge.js", size: 20 },
        { text: "rotateMatrix.js", size: 20 },
    ];

    icons.forEach((icon, index) => {
        k.add([
            k.sprite(icon.sprite),
            resizablePos(() => k.vec2(k.width() * 0.02, k.height() * (ICON_START_Y + SPACING * index))),
            k.opacity(1),
        ]);
    });

    texts.forEach((text, index) => {
        k.add([
            k.text(text.text, { size: text.size }),
            resizablePos(() => k.vec2(k.width() * 0.055, k.height() * (TEXT_START_Y + SPACING * index))),
            k.color(k.WHITE),
            k.opacity(1),
        ]);
    });

    const iconChallenge = k.add([
        k.sprite("icon_02"),
        resizablePos(() => k.vec2(k.width() * 0.01, k.height() * 0.1)),
        k.opacity(1),
    ]);
    const rest_text = k.add([
        k.text("Press ESC to reset", { size: 28 }),
        resizablePos(() => k.vec2(k.width() * 0.01, k.height() * 0.9)),
        k.color(k.YELLOW),
        k.opacity(1),
    ]);
    /*   const button_retry = k.add([
           k.sprite("retry"),
           k.pos(k.width() * 0.01, k.height() * 0.01),
           k.opacity(1),
           k.animate(),
           k.z(18),
       ]);*/
    const btn_mute = k.add([
        k.rect(60, 50, { radius: 8 }),
        resizablePos(() => k.vec2(k.width() * 0.025, k.height() * 0.025)),
        k.area(),
        k.scale(1),
        k.anchor("center"),
        k.color(255, 255, 255),
        k.z(21),
        k.opacity(0),
    ]);
    let mute_enable = true;

    btn_mute.onClick(() => {
        if (mute_enable) {
            button_muteON.opacity = 0;
            button_muteOFF.opacity = 1;
            mute_enable = false;
        }
        else {
            button_muteON.opacity = 1;
            button_muteOFF.opacity = 0;
            mute_enable = false;
        }

    });
    const button_muteON = k.add([
        k.sprite("muteON"),
        k.pos(k.width() * 0.02, k.height() * 0.01),
        k.opacity(1),
        k.animate(),
        k.z(18),
    ]);
    const button_muteOFF = k.add([
        k.sprite("muteOff"),
        k.pos(k.width() * 0.02, k.height() * 0.01),
        k.opacity(0),
        k.animate(),
        k.z(17),
    ]);

    k.onKeyPress(["escape"], () => {
        music.stop();
        k.go("game", {
            rivalSpeed: EASY_RIVAL_SPEED,
        });
    });

    k.onKeyPress(["up"], () => {
        StatsforAnalitics();
        resetGameStats();
        music.stop();
        k.go("endgame", {
            rivalSpeed: EASY_RIVAL_SPEED,
        });
    });
    const arrow = k.add([
        k.sprite("arrow_yellow"),
        k.pos(k.width() * 0.001, k.height() * (TEXT_START_Y - SPACING * 0.5)),
        k.opacity(1),
        k.animate(),
    ]);

    let currentIndex = 0;
    let arrow_ypos = arrow.pos.y;

    function moveArrow() {
        const newY = k.height() * (TEXT_START_Y + SPACING * currentIndex);
        arrow.pos = k.vec2(arrow.pos.x, newY);
        arrow.animate("pos", [k.vec2(0, newY), k.vec2(10, newY)], {
            duration: 0.5,
            direction: "ping-pong",
        });
    }

    const textboxSize = () => k.vec2(k.width(), k.height());
    const textboxPos = () => {
        if (k.width() > 1080) {
            return k.vec2(323, 0);
        }

        return k.vec2(k.width() * 0.3, 0);
    };

    const textPadding = k.vec2(100, 200);

    k.volume(0.05);

    const textbox = k.add([
        // resizableRect(textboxSize),
        resizablePos(textboxPos),
        k.sprite("bg2"),
        k.anchor("topleft"),
        // k.color(23, 9, 39),
        k.opacity(1),
    ]);

    const textboxBackParent = k.add([
        resizableRect(textboxSize),
        resizablePos(textboxPos),
        k.anchor("topleft"),
        k.color(),
        k.rotate(0),
        k.scale(1),
        k.z(10),
        k.opacity(0),
    ]);

    const textboxTextPos = () => {
        return k.vec2(textPadding).sub(0, lineHeight * (JUMP_AFTER * jumpCount));
    }

    const textboxText = textboxBackParent.add([
        k.text("", {
            size: fontSize,
            transform: (idx, ch) => ({
                color: matchColorToken(idx, ch),
            }),
        }),
        k.pos(0, 0),
        resizablePos(textboxTextPos),
    ]);

    const BAR_INITIAL_WIDTH = 0;

    const timeprogressBar = k.add([
        k.rect(BAR_INITIAL_WIDTH, 20),
        k.anchor("topleft"),
        resizablePos(() => k.vec2(k.width() * 0.05, k.height() * 0.08)),
        k.color(k.YELLOW),
        k.outline(2),
    ]);

    const cursorPos = (rival = false) => {
        const player = rival ? rivalState : playerState;

        return k.vec2(
            textboxBackParent.pos
                .add(textboxText.pos)
                .add(
                    player.curCharInLine * fontWidth,
                    (player.curLineCount + 1) * lineHeight,
                ),
        );
    };

    const cursorPointer = k.add([
        k.text("_", { size: 28 }),
        resizablePos(() => cursorPos()),
        k.opacity(0.6),
        k.anchor("left"),
        k.color(255, 255, 255),
        k.z(10),
    ]);

    const rivalPointer = k.add([
        k.text("_", { size: 28 }),
        resizablePos(() => cursorPos(true)),
        k.opacity(0.6),
        k.anchor("left"),
        k.color(COLOR_TEXT_RIVAL),
    ]);

    makeBlink(cursorPointer);
    makeBlink(rivalPointer);

    function makeBlink(entity) {
        k.loop(0.5, () => {
            entity.opacity = entity.opacity === 0 ? 0.3 : 0;
        });
    }
    playerState.cursorPointer = cursorPointer;
    rivalState.cursorPointer = rivalPointer;

    function getCurrentDialog() {
        if (dialogsData && dialogsData[currentBlockIndex]) {
            return dialogsData[currentBlockIndex];
        } else {
            console.error("dialogs.json is undefined or out of range");
            return dialogsData[0];
        }
    }

    /**
     * @param {string} group
     */
    const logGroupWithColor = (group) => {
        if (k.debug.inspect !== true) return;

        const curChar = group[playerState.cursorPos];
        const groupFrom = group.substring(0, playerState.cursorPos);
        const groupTo = group.substring(playerState.cursorPos + 1);

        console.log(
            `%c${groupFrom}%c${curChar}%c${groupTo}`,
            "color: inherit;",
            "color: #f00;",
            "color: inherit;",
        );
    };

    function updateDialog() {
        currentBlockIndex++;
        completedBlocks++;
        console.log(completedBlocks);
        if(completedBlocks>2){
            k.go("endgame", {
                rivalSpeed: EASY_RIVAL_SPEED,
            });
        }
        playerState.reset();
        rivalState.reset();
        arrow.pos = k.vec2(arrow.pos.x, arrow_ypos);
        if (currentIndex < texts.length - 1) {
            currentIndex++;
            moveArrow();
        }
        gameState.timeLeft = MAX_TIME;
        jumpCount = 0;
        textboxText.updatePos();
        const currentDialog = getCurrentDialog();

        // theme
        theme = themes[0];

        // the sentences
        const currentBlocks = currentDialog.blocks;
        curBlockData.lineCount = currentBlocks.length;

        // we replace [] characters with \[ and \] to avoid them being interpreted as tags
        // also ▯ is replaced with a space
        originalText = currentBlocks.join("");

        const fixedGroup = currentBlocks
            .join("")
            .replace(/\[/g, "\\[")
            .replace(/\]/g, "\\]")
            .replace(/▯/g, " ");

        fixedText = currentBlocks.join("").replace(/▯/g, " ");
        renderedText = fixedGroup;
        textboxText.text = renderedText;
        playerState.line = fixedText.split("\n")[0];
        rivalState.line = fixedText.split("\n")[0];
        cursorPointer.updatePos();
        rivalPointer.updatePos();
    }

    function updateDialogErrors() {
        renderedText = fixedText
            .split("")
            .map((char, index) => {
                if (errorCharsIndexes.includes(index)) {
                    if (char === "\n") return `${errorCharsReplaces[index]}\n`;
                    return errorCharsReplaces[index];
                } else {
                    return char;
                }
            })
            .join("")
            .replace(/\[/g, "\\[")
            .replace(/\]/g, "\\]");

        textboxText.text = renderedText;
    }


    function updateProgressBar() {
        const targetWidth = (gameState.timeLeft / MAX_TIME) * BAR_INITIAL_WIDTH;
        timeprogressBar.width = targetWidth;
    }

    function nextChar(rival = false) {
        const player = rival ? rivalState : playerState;
        if (!player.cursorPointer) return;

        player.cursorPos++;
        player.curCharInLine++;
        player.cursorPointer.pos = cursorPos(rival);
        logGroupWithColor(fixedText);
    }

    function prevChar(rival = false) {
        const player = rival ? rivalState : playerState;
        if (!player.cursorPointer) return;

        player.cursorPos--;
        player.curCharInLine--;
        player.cursorPointer.pos = cursorPos(rival);
        logGroupWithColor(fixedText);
    }

    function preventError() {
        k.shake(2);
    }

    function nextLine(isRival = false) {
        const player = isRival ? rivalState : playerState;
        if (!player.cursorPointer) return;
        totalCorrectlines++;
        player.curLineCount++;

        if (JUMP_AFTER == 1) {
            jumpCount++;
        }
        else if (playerState.curLineCount >= JUMP_AFTER * (jumpCount + 1)) {
            jumpCount++;
        }

        const line = fixedText.split("\n")[player.curLineCount];
        if (!line) return;
        const lineIdent = line.match(/^\s+/)?.[0].length || 0;

        player.line = line;
        player.cursorPos += lineIdent;
        player.curIdentSize = lineIdent;
        player.curCharInLine = lineIdent;

        textboxText.updatePos();
        player.cursorPointer.pos = cursorPos(isRival);
        cursorPointer.updatePos();
        rivalPointer.updatePos();
    }

    function rivalWrite() {
        const curChar = fixedText[rivalState.cursorPos];

        if (curChar === "\n") {
            nextChar(true);
            nextLine(true);
        } else {
            nextChar(true);
        }
    }

    function startTimer() {
        actual_wpm = 0.; //reset wpm
        actual_lpm = 0;
        actual_acc = 0;
        k.loop(0.1, () => {
            updateProgressBar();

            analitycs_calculate();

        });

        k.loop(rivalSpeed, () => {
            rivalWrite();
        });
    }
    const wmp_text = k.add([
        k.anchor("top"),
        k.pos(k.width() * 0.9, k.height() * 0.05),
        k.text("WPM: " + actual_wpm, {
            size: 28,
        }),
        k.color(k.YELLOW),
        k.z(21),
    ]);
    const lpm_text = k.add([
        k.anchor("top"),
        k.pos(k.width() * 0.9, k.height() * 0.10),
        k.text("LPM: " + actual_lpm, {
            size: 28,
        }),
        k.color(k.YELLOW),
        k.z(21),
    ]);
    const acc_text = k.add([
        k.anchor("top"),
        k.pos(k.width() * 0.9, k.height() * 0.15),
        k.text("ACC: " + actual_acc, {
            size: 28,
        }),
        k.color(k.YELLOW),
        k.z(21),
    ]);
    const time_text = k.add([
        k.anchor("top"),
        k.pos(k.width() * 0.9, k.height() * 0.20),
        k.text("time: ", {
            size: 28,
        }),
        k.color(k.YELLOW),
        k.z(21),
    ]);
    const char_text = k.add([
        k.anchor("top"),
        k.pos(k.width() * 0.9, k.height() * 0.25),
        k.text("TTC: " + totalTypedCharacters + " TCC: " + totalCorrectChars, {
            size: 28,
        }),
        k.color(k.YELLOW),
        k.z(21),
    ]);

    function analitycs_calculate() {
        if (startTime > 0) {
            const timeElapsedInSeconds = (Date.now() - startTime) / 1000;
            if (timeElapsedInSeconds > 0) {
                time_text.text = "Time: " + timeElapsedInSeconds.toFixed(2);
                actual_wpm = (totalCorrectChars && timeElapsedInSeconds > 0) ? (totalCorrectChars / 5) / (timeElapsedInSeconds / 60) : 0;
                actual_lpm = (totalCorrectlines && timeElapsedInSeconds > 0) ? (totalCorrectlines / 5) / (timeElapsedInSeconds / 60) : 0;
                actual_acc = (totalCorrectChars && totalTypedCharacters > 0) ? (totalCorrectChars / totalTypedCharacters) * 100 : 0;
                wmp_text.text = "WPM: " + (actual_wpm || 0).toFixed(2);
                lpm_text.text = "LPM: " + (actual_lpm || 0).toFixed(2);
                acc_text.text = "ACC: " + (actual_acc || 0).toFixed(2);
                char_text.text = "TTC: " + totalTypedCharacters.toFixed(0) + " TCC: " + totalCorrectChars.toFixed(2);
            }
        }
    }

    k.onKeyPress((keyPressed) => {
        totalTypedCharacters++;

        const correctChar = fixedText[playerState.cursorPos];
        const shifting = k.isKeyDown("shift");
        let key = keyPressed;
        let errorKey = key;
        let isCorrect = false;

        if (key == "enter" || key == "backspace") {
            return;
        }

        if (errorCharsIndexes.length > 1) {
            return preventError();
        }

        // Setting key
        if (key.length == 1) {
            key = shifting ? key.toUpperCase() : key;
        } else if (key == "space") {
            key = " ";
            errorKey = "_";
        } else {
            return;
        }

        isCorrect = key === correctChar;

        if (isCorrect) {
            totalCorrectChars++;

            nextChar();
        } else {
            errorCharsIndexes.push(playerState.cursorPos);
            errorCharsReplaces[playerState.cursorPos] = errorKey;
            updateDialogErrors();
            nextChar();

            totalIcorrectCorrectChars++;
        }
    });

    // Line jump
    k.onKeyPress("enter", () => {
        const correctChar = fixedText[playerState.cursorPos];
        const isCorrect = "\n" === correctChar;

        if (errorCharsIndexes.length > 0 || !isCorrect) {
            return preventError();
        }

        if (playerState.curLineCount >= curBlockData.lineCount - 1) {
            return updateDialog();
        }

        // totalCorrectlines++;
        nextChar();
        nextLine();
    });

    k.onKeyPressRepeat("backspace", () => {
        if (playerState.cursorPos <= 0) return; // prevent negative index

        if (
            playerState.curCharInLine === playerState.curIdentSize &&
            playerState.curLineCount > 0
        ) {
            return k.shake(2);
        } else {
            prevChar();
        }

        if (errorCharsIndexes.includes(playerState.cursorPos)) {
            errorCharsIndexes = errorCharsIndexes.filter(
                (index) => index !== playerState.cursorPos,
            );
        }

        updateDialogErrors();
    });

    k.onResize(() => {
        for (const obj of gameState.resizableObjects) {
            if (obj.is("resizablePos")) obj.updatePos();
            if (obj.is("resizableRect")) obj.updateRectSize();
        }
    });

    startTimer();
    updateDialog();
};

k.scene("game", gameScene);


