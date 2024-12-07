// @ts-check

import {
    charSpacing,
    goalBlocks,
    jsonData,
    lineHeight,
    marginvisiblebox,
    maxMistakes,
    maxtime,
    startmoveline,
} from "../constants";
import { k } from "../kaplay";
import colorTags from "../data/colorTags.json";

export let COLOR_TEXT_DEFAULT = k.Color.fromHex("#553d4d");
export let COLOR_TEXT_RIVAL = k.Color.fromHex("#fbf236");
export let COLOR_TEXT_CORRECT = k.Color.WHITE;
export let COLOR_TEXT_INCORRECT = k.Color.RED;
export let OmitedtagsLengths = { "▯": 0 };
export let completedBlocks = 0;
export let totalCorrectChars = 0;
export let totalIncorrectChars = 0;
export let totalCorrectLines = 0;
export let timeLeft = maxtime;
export let currentMistakes = 0;
export let font_size = 28;
export let currentline = 0;

k.scene("game", () => {
    const speedX = 0.1;
    const speedY = 0.3;
    const maxLines = 20;
    const body = document.querySelector("body");
    let currentBlockIndex = 0;
    let currentGroupIndex = 0;
    let txtCharacters = [];
    let cursorPos = 0;
    let offsetX = 0;
    let offsetY = 0;
    animateBackground();
    constructTransparentBackground();

    function animateBackground() {
        offsetX += speedX;
        offsetY += speedY;
        if (!body) return console.error("Body not found");
        body.style.backgroundPosition = `${offsetX}px ${offsetY}px`;

        requestAnimationFrame(animateBackground);
    }

    function constructTransparentBackground() {
        const container = document.createElement("div");
        document.body.appendChild(container);
        container.classList.add("backtextbox");
        const innerRect = document.createElement("div");
        container.appendChild(innerRect);
        innerRect.classList.add("innerRect");
    }

    const textbox = k.add([
        k.rect(k.width() * 0.7, k.height() * 0.7, { radius: 2 }),
        k.anchor("center"),
        k.pos(k.center().x, k.height() - k.height() * 0.5),
        k.outline(8, k.CYAN),
        k.color(23, 9, 39),
        k.opacity(0.6),
    ]);

    const headertextbox = k.add([
        k.rect(k.width() * 0.7, k.height() * 0.05, { radius: 2 }),
        k.anchor("center"),
        k.pos(k.center().x, k.height() - k.height() * 0.85),
        k.outline(8, k.CYAN),
        k.color(k.CYAN),
        k.opacity(1),
    ]);

    const timerLabel = k.add([
        k.text(String(timeLeft), {
            size: 48,
            font: "monogram",
        }),
        k.pos(k.width() * 0.8, k.height() * 0.2),
        k.anchor("topright"),
    ]);

    const cursorPointer = k.add([
        k.text("_", { size: 16 }),
        k.pos(0, 0),
        k.opacity(0.6),
        k.anchor("left"),
        k.color(255, 255, 255),
    ]);

    const rivalPointer = k.add([
        k.text("_", { size: 16 }),
        k.pos(0, 0),
        k.opacity(0.6),
        k.anchor("left"),
        k.color(COLOR_TEXT_RIVAL),
    ]);

    function selectCurrentBlock() {
        if (jsonData.blocks && jsonData.blocks[currentBlockIndex]) {
            return jsonData.blocks[currentBlockIndex];
        } else {
            console.error("jsonData.blocks is undefined or out of range");
            return [];
        }
    }

    function getCurrentGroup() {
        const currentBlock = selectCurrentBlock();
        const visibleLines = Math.floor(textbox.height / lineHeight);

        return currentBlock.slice(0, visibleLines);
    }

    function applyRivalColor() {
        let rivalIndex = 0;
        const currentBlockId = currentBlockIndex;
        k.loop(0.3, () => {
            if (
                rivalIndex < txtCharacters.length &&
                currentBlockIndex === currentBlockId
            ) {
                const char = txtCharacters[rivalIndex];
                if (char.color.eq(COLOR_TEXT_DEFAULT)) {
                    char.color = COLOR_TEXT_RIVAL;
                }
                rivalPointer.pos = k.vec2(char.pos.x, char.pos.y * 1.02);
                rivalIndex++;
            }
        });
    }

    let tagPositions = {};

    function updateDialog() {
        completedBlocks++;
        currentGroupIndex = 0;
        cursorPos = 0;
        currentMistakes = 0;
        txtCharacters.forEach((char) => char.destroy());
        txtCharacters.length = 0;
        timeLeft = maxtime;

        const currentGroup = getCurrentGroup();

        let totalTextWidth = currentGroup.reduce((width, line) => {
            return width + line.length * charSpacing;
        }, 0);

        let initialPosX =
            Math.max(0, (textbox.width - totalTextWidth) / 2.2) +
            textbox.pos.x -
            textbox.width / 2.2;
        let verticalOffset = textbox.pos.y * 0.7;

        const textboxTop = textbox.pos.y - textbox.height / 2;
        const textboxBottom = textbox.pos.y + textbox.height / 2.5;

        for (let line of currentGroup) {
            let i = 0;
            while (i < line.length) {
                const char = line[i];
                let tagFound = false;
                for (let tag in OmitedtagsLengths) {
                    if (line.startsWith(tag, i)) {
                        totalCorrectChars++;
                        i += OmitedtagsLengths[tag];
                        tagFound = true;
                        break;
                    }
                }
                if (!tagFound) {
                    const charPosY = verticalOffset;
                    const isVisible =
                        charPosY >= textboxTop && charPosY <= textboxBottom;

                    const charText = k.add([
                        k.text(char, { size: font_size, font: "monogram" }),
                        k.pos(initialPosX + i * charSpacing, verticalOffset),
                        k.anchor("left"),
                        k.color(COLOR_TEXT_DEFAULT),
                        k.opacity(isVisible ? 1 : 0),
                        {
                            originalChar: char,
                            originalColor: COLOR_TEXT_DEFAULT,
                            isModified: false,
                        },
                    ]);
                    txtCharacters.push(charText);
                }
                i++;
            }
            verticalOffset += lineHeight;
        }

        updateCursorPosition();
        applyRivalColor();
    }

    function updateCursorPosition() {
        if (cursorPos < txtCharacters.length && txtCharacters[cursorPos]) {
            const currentChar = txtCharacters[cursorPos];
            cursorPointer.pos = k.vec2(
                currentChar.pos.x,
                currentChar.pos.y * 1.02,
            );
            // debug.log(cursorPos);
        } else {
            console.warn("undefined or exceeded range");
        }
    }

    function startTimer() {
        k.loop(1, () => {
            timeLeft--;
            timerLabel.text = String(timeLeft);
            // console.log(totalCorrectChars);
            // console.log(totalIncorrectChars);
            // console.log(totalCorrectLines);
            if (timeLeft <= 0) {
                k.go("endgame");
            }
        });
    }

    function updateLineVisibility() {
        const textboxTop = textbox.pos.y - textbox.height / 2;
        const textboxBottom = textbox.pos.y + textbox.height / 2;
        const adjustedTextboxTop = textboxTop - marginvisiblebox;
        const adjustedTextboxBottom = textboxBottom + marginvisiblebox;

        for (let char of txtCharacters) {
            if (!char || !char.pos) {
                console.warn(
                    "Carácter inválido detectado en txtCharacters:",
                    char,
                );
                continue;
            }
            const isVisible =
                char.pos.y >= adjustedTextboxTop &&
                char.pos.y <= adjustedTextboxBottom;
            char.opacity = isVisible ? 1 : 0;
        }
    }

    function shiftLines(direction) {
        const shiftAmount = direction === "up" ? -lineHeight : lineHeight;
        for (let char of txtCharacters) {
            char.pos.y += shiftAmount;
            rivalPointer.pos = k.vec2(char.pos.x, char.pos.y * 1.02);
        }

        updateLineVisibility();
    }

    let spacePositions = [];

    window.addEventListener("keydown", (event) => {
        const key = event.key;

        if (key === "Backspace" && cursorPos > 0) {
            const currentChar = txtCharacters[cursorPos - 1];
            const nextChar =
                cursorPos < txtCharacters.length
                    ? txtCharacters[cursorPos]
                    : null;

            if (
                cursorPos === 1 &&
                tagPositions.hasOwnProperty(currentChar.originalChar)
            ) {
                cursorPos--;
                updateCursorPosition();
                return;
            }
            if (spacePositions.includes(cursorPos - 1)) {
                currentChar.text = " ";
                spacePositions = spacePositions.filter(
                    (pos) => pos !== cursorPos - 1,
                );
            }

            if (currentChar.originalChar === "\n") {
                totalCorrectLines--;
                currentline--;
                if (currentline >= startmoveline - 1) {
                    shiftLines("down");
                }
            }

            if (currentChar.color.eq(COLOR_TEXT_INCORRECT)) {
                currentMistakes--;
            }

            if (nextChar && nextChar.color.eq(COLOR_TEXT_RIVAL)) {
                currentChar.color = COLOR_TEXT_RIVAL;
            } else {
                currentChar.color = currentChar.originalColor;
            }
            currentChar.isModified = false;
            cursorPos--;
            updateCursorPosition();
            applyTagColor();
            return;
        }

        if (currentMistakes >= maxMistakes) {
            return;
        }

        if (cursorPos < txtCharacters.length) {
            const currentChar = txtCharacters[cursorPos];
            applyTagColor();

            if (isTag(currentChar.originalChar)) {
                cursorPos++;
                totalCorrectChars++;
                updateCursorPosition();
                return;
            }

            if (currentChar.originalChar === "\n") {
                if (key === "Enter") {
                    currentChar.color = COLOR_TEXT_CORRECT;
                    totalCorrectChars++;
                    totalCorrectLines++;
                    cursorPos++;
                    currentline++;
                    updateCursorPosition();

                    if (currentline >= startmoveline) {
                        shiftLines("up");
                    }
                    updateCursorPosition();

                    if (cursorPos >= txtCharacters.length) {
                        const noInvalidColors = txtCharacters.every(
                            (char) =>
                                !char.color.eq(COLOR_TEXT_INCORRECT) &&
                                !char.color.eq(COLOR_TEXT_RIVAL) &&
                                !char.color.eq(COLOR_TEXT_DEFAULT),
                        );
                        if (noInvalidColors) {
                            currentGroupIndex++;
                            if (
                                currentGroupIndex >=
                                selectCurrentBlock().length / maxLines
                            ) {
                                if (completedBlocks >= goalBlocks) {
                                    k.go("endgame");
                                    return;
                                }
                                currentBlockIndex++;
                                if (
                                    currentBlockIndex >= jsonData.blocks.length
                                ) {
                                    currentBlockIndex = 0;
                                }
                                updateDialog();
                            } else {
                                updateDialog();
                            }
                        }
                    }
                }
                return;
            }

            if (key.length === 1 || key === " ") {
                const isCorrect = currentChar.text === key;

                if (isCorrect) {
                    currentChar.color = COLOR_TEXT_CORRECT;
                    totalCorrectChars++;
                } else {
                    currentChar.color = COLOR_TEXT_INCORRECT;
                    totalIncorrectChars++;
                    currentMistakes++;

                    if (currentChar.originalChar === " ") {
                        currentChar.text = key;
                        spacePositions.push(cursorPos);
                    }
                }
                cursorPos++;
                updateCursorPosition();
            }
        }
    });

    function applyTagColor() {
        if (colorTags && currentBlockIndex !== undefined) {
            // debug.log(` ${cursorPos}`);
            const currentBlock = colorTags[currentBlockIndex];
            if (currentBlock) {
                for (const [tag, positions] of Object.entries(currentBlock)) {
                    //debug.log(`Checking tag ${tag} with positions ${positions}`);

                    if (positions.includes(cursorPos)) {
                        switch (tag) {
                            case "/C1":
                                COLOR_TEXT_CORRECT = k.Color.fromHex("#ff37b1");
                                //  debug.log("/C1");
                                break;
                            case "/C2":
                                COLOR_TEXT_CORRECT = k.Color.fromHex("#22fcff");
                                //    debug.log(" /C2");
                                break;
                            case "/C3":
                                COLOR_TEXT_CORRECT = k.Color.WHITE;
                                //   debug.log("/C3");
                                break;
                            case "/C4":
                                COLOR_TEXT_CORRECT = k.Color.WHITE;
                                //  debug.log("/C4");
                                break;
                            case "/C5":
                                COLOR_TEXT_CORRECT = k.Color.fromHex("#32ed67");
                                //   debug.log("/C5");
                                break;
                            default:
                                console.warn(`warn: ${tag}`);
                                break;
                        }
                        break;
                    }
                }
            }
        }
    }

    function isTag(character) {
        return tagPositions.hasOwnProperty(character);
    }

    startTimer();
    updateDialog();
});
