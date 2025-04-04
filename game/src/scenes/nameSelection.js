import { k } from "../kaplay";
import { EASY_RIVAL_SPEED } from "../constants";
import { savePlay, getPlay } from "../systems/saves.js";
import { resizablePos } from "../components/resizablePos.js";

export let actualname;
export const settings = {
    mute: false
};

k.scene("name_selection", () => {
    const targetRules = [
        { re: /^start m/i, target: "Start mute" },
        { re: /^start u/i, target: "Start unmute" },
        { re: /^start a/i, target: "Start about" },
        { re: /^start g/i, target: "Start github" },
        { re: /.*/,       target: "Start unmute" },
    ];

    function calcNewTarget(input) {
        const rule = targetRules.find(r => r.re.test(input));
        return rule.target;
    }

    // CSS
    const style = document.createElement("style");
    style.innerHTML = `
      :root {
        --bg: hsl(0, 3.60%, 11.00%);
        --gray1: #0a080a;
        --gray2: #110b11;
      }
      
      body {
        margin: 0;
        overflow: hidden;
        background: var(--bg);
        position: relative;
      }
      
      body::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background:
          linear-gradient(45deg, var(--gray1) 25%, transparent 25%),
          linear-gradient(-45deg, var(--gray1) 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, var(--gray1) 75%),
          linear-gradient(-45deg, transparent 75%, var(--gray1) 75%),
          rgba(0, 0, 0, 0.81);
        background-size: 15px 15px, 15px 15px, 15px 15px, 15px 15px, cover;
        background-position: 0 0, 0 7.5px, 7.5px -7.5px, -7.5px 0, center;
        background-blend-mode: multiply;
        backdrop-filter: blur(10px);
        z-index: -1;
      }
    `;
    document.head.appendChild(style);

    k.volume(0.5);
    loadMute();
    
    const background = k.add([
        k.sprite("bg2"),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.z(18),
    ]);
    const btn_githublink = add([
        rect(80, 50, { radius: 8 }),
        resizablePos(() => k.vec2(k.width() * 0.55, k.height() * 0.70)),
        area(),
        scale(1),
        anchor("center"),
        color(255, 255, 255),
        k.z(21),
        k.opacity(0),
    ]);

    const btn_aboutlink = add([
        rect(80, 50, { radius: 8 }),
        resizablePos(() => k.vec2(k.width() * 0.45, k.height() * 0.70)),
        area(),
        scale(1),
        anchor("center"),
        color(255, 255, 255),
        k.z(21),
        k.opacity(0),
    ]);
    const ComandText = k.add([
        k.anchor("top"),
        k.text("Start + Command", { size: 36 }),
        resizablePos(() => k.vec2(k.width() * 0.1, k.height() * 0.9)),
        k.opacity(1),
        k.z(21),
    ]);
    const StartText = k.add([
        k.anchor("top"),
        k.text("Mute", { size: 36 }),
        resizablePos(() => k.vec2(k.width() * 0.7, k.height() * 0.9)),
        k.opacity(1),
        k.z(21),
    ]);
    const gitText = k.add([
        k.anchor("top"),
        k.text("Github", { size: 36 }),
        resizablePos(() => k.vec2(k.width() * 0.8, k.height() * 0.9)),
        k.opacity(1),
        k.z(21),
    ]);
    const aboutText = k.add([
        k.anchor("top"),
        k.text("About", { size: 36 }),
        resizablePos(() => k.vec2(k.width() * 0.9, k.height() * 0.9)),
        k.opacity(1),
        k.z(21),
    ]);
    k.add([
        k.anchor("center"),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.65)),
        k.text("Get faster and better at technical interviewing ", {
            size: 32,
        }),
        k.color(k.WHITE),
        k.z(21),
    ]);
    k.add([
        k.anchor("center"),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.7)),
        k.text("by practicing typing code.", {
            size: 32,
        }),
        k.color(k.WHITE),
        k.z(21),
    ]);
    const title = k.add([
        k.sprite("WPM"),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.30)),
        k.anchor("center"),
        k.z(18),
    ]);

    const button_muteON = k.add([
        k.sprite("muteON"),
        k.pos(k.width() * 0.9, k.height() * 0),
        k.opacity(1),
        k.animate(),
        k.z(50),
    ]);
    const button_muteOFF = k.add([
        k.sprite("muteOff"),
        k.pos(k.width() * 0.9, k.height() * 0),
        k.opacity(0),
        k.animate(),
        k.z(50),
    ]);

    let targetText = "Start unmute";
    let maxLength = targetText.length;
    const letterSpacing = 18;
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
                k.text(targetText[i], { size: 32 }),
                k.pos(startX + i * letterSpacing, k.height() / 2),
                k.anchor("center"),
                k.color(k.rgb(128, 128, 128)),
                k.z(22),
                k.animate(),
            ]);
            letterObjects.push(letter);

            const underscore = k.add([
                k.text("_", { size: 36 }),
                k.pos(startX + i * letterSpacing, k.height() / 1.9),
                k.anchor("center"),
                k.color(k.WHITE),
                k.z(20),
            ]);
            underscoreObjects.push(underscore);
        }
    }

    createLetterObjects();

    function updateTextColors() {
        const targetLower = targetText.toLowerCase();
        const blink = Math.abs(Math.sin(k.time() * 2));

        function setColor(textObj, matchWord) {
            if (targetLower === matchWord) {
                textObj.color = k.rgb(255, 255, 0);
                textObj.opacity = blink;
            } else {
                textObj.color = k.rgb(255, 255, 255);
                textObj.opacity = 1;
            }
        }

        setColor(StartText, "start unmute");
        setColor(gitText, "start github");
        setColor(aboutText, "start about");
    }

    function loadMute() {
        const playDataString = getPlay(actualname);
        if (playDataString) {
            const playData = JSON.parse(playDataString);
            const mute = playData.mute;
        }
    }
  
    const name = k.add([
        k.text("", { size: 36 }),
        k.textInput(true, 20),
        k.pos(k.width() / 2, k.height() / 1.7),
        k.anchor("center"),
        k.color(k.YELLOW),
        k.opacity(0),
        k.z(21),
    ]);

    let previousInput = "";
    let lastErrorCount = 0;

    name.onUpdate(() => {
        if (k.isKeyDown("escape")) {
            name.text = "";
            previousInput = "";
            return;
        }
    
        const input = name.text;
        if (input.length === maxLength) {
            let anyError = false;
            for (let i = 0; i < maxLength; i++) {
                if (input[i].toLowerCase() !== targetText[i]?.toLowerCase()) {
                    anyError = true;
                    break;
                }
            }
            if (anyError) {
                name.text = input.substring(0, maxLength - 1);
                preventError();
                return;
            }
        }

        const newTarget = calcNewTarget(input.toLowerCase());
        
        if (newTarget !== targetText) {
            targetText = newTarget;
            maxLength = targetText.length;
            createLetterObjects();
        }
        
        let localErrorCount = 0;
        let lastErrorIndex = -1;
    
        for (let i = 0; i < input.length; i++) {
            if (input[i].toLowerCase() !== targetText[i]?.toLowerCase()) {
                localErrorCount++;
                lastErrorIndex = i;
            }
        }
    
        if (localErrorCount > lastErrorCount) {
            preventError();
        }

        lastErrorCount = localErrorCount;
        if (input.length > previousInput.length && localErrorCount >= 3) {
            name.text = previousInput;
            preventError();
            return;
        }
    
        if (localErrorCount >= 2 && input.length > lastErrorIndex + 1) {
            name.text = input.slice(0, lastErrorIndex + 1);
            preventError();
            return;
        }
    
        previousInput = name.text;
    
        letterObjects.forEach((letterObj, i) => {
            let char = input[i];
            const correct = targetText[i];
            let displayChar = char;
            
            if (char === " " && correct !== " ") {
                displayChar = "_";
            } else if (!char) {
                displayChar = correct;
            }
            
            const color = !char
                ? k.rgb(128, 128, 128)
                : ((char === " " && correct !== " ") || (char.toLowerCase() !== correct.toLowerCase())
                    ? k.rgb(255, 0, 0)
                    : k.rgb(255, 255, 0));
                    
            letterObj.text = displayChar;
            letterObj.color = color;
        });
    
        underscoreObjects.forEach((uObj, i) => {
            if (i === input.length) {
                uObj.color = k.rgb(255, 255, 0);
                const blink = Math.abs(Math.sin(k.time() * 5));
                uObj.opacity = blink;
            } else {
                uObj.opacity = 0;
            }
        });
    
        if (input.toLowerCase() === "start github") {
            window.open("https://github.com/conanbatt/wpm", "_blank");
            name.text = "";
        }
        if (input.toLowerCase() === "start about") {
            name.text = "";
        }
        if (input.toLowerCase() === "start mute") {
            settings.mute = true;
            k.volume(0);
            button_muteON.opacity = 0;
            button_muteOFF.opacity = 1;
            savePlay({ userName: input });
            k.go("game", { rivalSpeed: EASY_RIVAL_SPEED, userName: input });
        } else if (input.toLowerCase() === "start unmute") {
            settings.mute = false;
            k.volume(0.5);
            button_muteON.opacity = 1;
            button_muteOFF.opacity = 0;
            savePlay({ userName: input });
            k.go("game", { rivalSpeed: EASY_RIVAL_SPEED, userName: input });
        }
    
        updateTextColors();
    });
    
    if (settings.mute) {
        button_muteON.opacity = 0;
        button_muteOFF.opacity = 1;
    } else {
        button_muteON.opacity = 1;
        button_muteOFF.opacity = 0;
    }
    
    let isPreventingError = false;

    function preventError() {
        if (isPreventingError) return;
    
        isPreventingError = true;
        k.shake(2);
        if (!settings.mute) {
            k.play("wrong_typing");
        }
        k.wait(0.3, () => {
            isPreventingError = false;
        });
    }
    
    k.onKeyPress((keyPressed) => {

        if (keyPressed != "backspace") {
            if (!settings.mute) {
                k.play("code_sound");
            }
        }
    });
});