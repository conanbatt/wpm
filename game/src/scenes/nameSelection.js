import { k } from "../kaplay";
import { EASY_RIVAL_SPEED } from "../constants";
import { savePlay } from "../systems/saves.js";
import { resizablePos } from "../components/resizablePos.js";

export let actualname;

k.scene("name_selection", () => {
    const btn_githublink = add([
        rect(80, 50, { radius: 8 }),
        resizablePos(() => k.vec2(k.width() * 0.55, k.height() * 0.90)),
        area(),
        scale(1),
        anchor("center"),
        color(255, 255, 255),
        k.z(21),
        k.opacity(0),
        k.onHover,
    ]);

    /*btn_githublink.onClick(() => {
        window.open("https://github.com/conanbatt/wpm", "_blank");
    });
    btn_githublink.onHover(() => {
        gitText.color = k.rgb(255, 215, 0);
    });
    btn_githublink.onHoverEnd(() => {
        gitText.color = k.rgb(255, 255, 255);
        console.log("exit");
    });*/

    // Botón About
    const btn_aboutlink = add([
        rect(80, 50, { radius: 8 }),
        resizablePos(() => k.vec2(k.width() * 0.45, k.height() * 0.90)),
        area(),
        scale(1),
        anchor("center"),
        color(255, 255, 255),
        k.z(21),
        k.opacity(0),
        k.onHover,
    ]);

    /*btn_aboutlink.onHover(() => {
        aboutText.color = k.rgb(255, 215, 0);
    });
    btn_aboutlink.onHoverEnd(() => {
        aboutText.color = k.rgb(255, 255, 255);
        console.log("exit");
    });*/

    const gitText = k.add([
        k.anchor("top"),
        k.text("github", { size: 36 }),
        resizablePos(() => k.vec2(k.width() * 0.55, k.height() * 0.85)),
        k.opacity(1),
        k.z(21),
    ]);
    const aboutText = k.add([
        k.anchor("top"),
        k.text("about", { size: 36 }),
        resizablePos(() => k.vec2(k.width() * 0.44, k.height() * 0.85)),
        k.opacity(1),
        k.z(21),
    ]);

    k.add([
        k.anchor("center"),
        k.pos(k.width() / 2, k.height() / 2.2),
        k.text("Get faster and better at technical interviewing by practicing typing code.", {
            size: 28,
        }),
        k.color(k.WHITE),
        k.z(21),
    ]);

    const background = k.add([
        k.sprite("bg3"),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.z(18),
    ]);
    const title = k.add([
        k.sprite("WPM"),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.30)),
        k.anchor("center"),
        k.z(18),
    ]);
    const subTitle = k.add([
        k.sprite("SilverDev"),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.1)),
        k.anchor("center"),
        k.z(18),
    ]);

    let targetText = "START";
    let maxLength = targetText.length;
    const letterSpacing = 48;
    let startX = k.width() / 2 - ((maxLength - 1) * letterSpacing) / 2;
    let letterObjects = [];
    let underscoreObjects = [];

    function createLetterObjects() {
        letterObjects.forEach(obj => k.destroy(obj));
        underscoreObjects.forEach(obj => k.destroy(obj));
        letterObjects = [];
        underscoreObjects = [];
        startX = k.width() / 2 - ((maxLength - 1) * letterSpacing) / 2;

        for (let i = 0; i < maxLength; i++) {
            const letter = k.add([
                k.text(targetText[i], { size: 36 }),
                k.pos(startX + i * letterSpacing, k.height() / 1.7),
                k.anchor("center"),
                k.color(k.rgb(128, 128, 128)),
                k.z(22),
                k.animate(),
            ]);
            letterObjects.push(letter);

            const underscore = k.add([
                k.text("_", { size: 40 }),
                k.pos(startX + i * letterSpacing, k.height() / 1.6),
                k.anchor("center"),
                k.color(k.MAGENTA),
                k.z(20),
            ]);
            underscoreObjects.push(underscore);
        }
    }

    createLetterObjects();

    const name = k.add([
        k.text("", { size: 36 }),
        k.textInput(true, 20),
        k.pos(k.width() / 2, k.height() / 1.7),
        k.anchor("center"),
        k.color(k.YELLOW),
        k.opacity(0),
        k.z(21),
    ]);

    name.onUpdate(() => {
        const input = name.text;

        let newTarget = "Start";
        if (input.length > 0) {
            const firstChar = input[0].toLowerCase();
            if (firstChar === "a") {
                newTarget = "About";
            } else if (firstChar === "g") {
                newTarget = "Github";
            }
        }
        if (newTarget !== targetText) {
            targetText = newTarget;
            maxLength = targetText.length;
            createLetterObjects();
        }

        for (let i = 0; i < maxLength; i++) {
            if (input[i]) {
                if (input[i].toLowerCase() === targetText[i].toLowerCase()) {
                    letterObjects[i].text = input[i];
                    letterObjects[i].color = k.rgb(255, 255, 0);
                } else {
                    letterObjects[i].text = input[i];
                    letterObjects[i].color = k.rgb(255, 0, 0);
                }
            } else {
                letterObjects[i].text = targetText[i];
                letterObjects[i].color = k.rgb(128, 128, 128);
            }
        }

        if (input.toLowerCase() === "Start".toLowerCase()) {
            const playData = { userName: input };
            savePlay(playData);
            k.go("game", { rivalSpeed: EASY_RIVAL_SPEED, userName: input });
        }
        if (input.toLowerCase() === "Github".toLowerCase()) {
            window.open("https://github.com/conanbatt/wpm", "_blank");
        }
        if (input.toLowerCase() === "About".toLowerCase()) {

        }
    });

    k.onKeyPress((keyPressed) => {
        if (keyPressed != "backspace") {
            k.play("code_sound");
        }
    });
});
