import { k } from "../kaplay";
import { goal_acc, goal_lpm, goal_wpm, goal_awpm } from "./game.js";
import { savePlay, getPlay } from "../systems/saves.js";
import { actualname, settings } from "./nameSelection.js";
import { resizablePos } from "../components/resizablePos.js";
import "../types.js";
k.scene("endgame", () => {
    k.loadMusic("endgame", "/sounds/endgame.mp3");
    k.loadSprite("BG_analitycsACC", "/sprites/BG_analitycsACC.png");
    k.loadSprite("BG_analitycsAWPM", "/sprites/BG_analitycsAWPM.png");
    k.loadSprite("BG_analitycsAWPM_B", "/sprites/BG_analitycsAWPM_B.png");
    //CSS
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
    const background = k.add([
        k.sprite("bg2"),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.z(18),
    ]);
    let awpm = goal_awpm;
    let wpm = goal_wpm;
    let lpm = goal_lpm;
    let acc = goal_acc;

    let prev_awpm = 0;
    let prev_wpm = 0;
    let prev_lpm = 0;
    let prev_acc = 0;

    let best_awpm = awpm;
    let best_wpm = wpm;
    let best_lpm = lpm;
    let best_acc = acc;

    let reciveprevdata = 0;
    let prevdata = 0;
    wpm = parseFloat(wpm.toFixed(2));
    lpm = parseFloat(lpm.toFixed(2));
    acc = parseFloat(acc.toFixed(2));

    const currentResults = {
        wpm: wpm,
        awpm: awpm,
        lpm: lpm,
        acc: acc,
    };

    k.volume(1);
    const music = k.play("endgame");
    music.loop = true;
    music.volume = 0;
    const maxVolume = 0.05;
    const volumeStep = 0.01;
    const intervalTime = 100;
    let volumeIncrease;

    function updateMusicVolume() {
        clearInterval(volumeIncrease);

        if (!settings.mute) {
            music.volume = 0.0;
        } else {
            let currentVolume = 0.0;
            volumeIncrease = setInterval(() => {
                if (currentVolume < maxVolume) {
                    currentVolume += volumeStep;
                    music.volume = Math.min(currentVolume, maxVolume);
                } else {
                    clearInterval(volumeIncrease);
                }
            }, intervalTime);
        }
    }

    const title = k.add([
        k.sprite("WPM"),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.30)),
        k.anchor("center"),
        k.z(18),
    ]);

    k.add([
        k.sprite("icon_0"),
        resizablePos(() => k.vec2(k.width() * 0.77, k.height() * 0.38)),
        k.anchor("center"),
        k.opacity(0),
        k.z(18),
    ]);


    const username = actualname;
    const retrievedData = getPlay(username);

    if (retrievedData) {

        console.log("Load data:", retrievedData);
        reciveprevdata = retrievedData;
        console.log(prevdata);
        prevdata = JSON.parse(reciveprevdata);
        prev_awpm = parseFloat(prevdata.awpm) || 0;
        prev_wpm = parseFloat(prevdata.wpm) || 0;
        prev_lpm = parseFloat(prevdata.lpm) || 0;
        prev_acc = parseFloat(prevdata.acc) || 0;

        best_awpm = Math.max(prevdata.awpm || 0, awpm);
        best_wpm = Math.max(prevdata.wpm || 0, wpm);
        best_lpm = Math.max(prevdata.lpm || 0, lpm);
        best_acc = Math.max(prevdata.acc || 0, acc);

    } else {
        console.log("Empty load, load default data.");
        best_awpm = awpm;
        best_wpm = wpm;
        best_lpm = lpm;
        best_acc = acc;
    }

    k.add([
        k.sprite("BG_analitycsAWPM"),
        resizablePos(() => k.vec2(k.width() * 0.3, k.height() * 0.55)),
        k.anchor("center"),
        k.z(18),
    ]);
    k.add([
        k.sprite("BG_analitycsACC"),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.55)),
        k.anchor("center"),
        k.z(18),
    ]);
    k.add([
        k.sprite("BG_analitycsAWPM_B"),
        resizablePos(() => k.vec2(k.width() * 0.7, k.height() * 0.55)),
        k.anchor("center"),
        k.z(18),
    ]);
    k.add([
        k.text(awpm.toFixed(2), { size: 48, }),
        resizablePos(() => k.vec2(k.width() * 0.3, k.height() * 0.6)),
        k.opacity(1),
        k.z(19),
    ]),
        k.add([
            k.text(acc.toFixed(2) + "%", { size: 48, }),
            resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.6)),
            k.opacity(1),
            k.z(19),
        ]),
        k.add([
            k.text(best_awpm.toFixed(2), { size: 48, }),
            resizablePos(() => k.vec2(k.width() * 0.7, k.height() * 0.6)),
            k.opacity(1),
            k.z(19),
        ]);

    const textPressEnd = k.add([
        k.text("Press ENTER to retry", { size: 36 }),
        resizablePos(() => k.vec2(k.width() * 0.5, k.height() * 0.85)),
        k.anchor("center"),
        k.color(k.YELLOW),
        k.animate(),
        k.z(19),
    ]);

    moveText();
    function moveText() {
        textPressEnd.animate("pos", [k.vec2(textPressEnd.pos.x, textPressEnd.pos.y + 5), k.vec2(textPressEnd.pos.x, textPressEnd.pos.y - 5)], {
            duration: 0.5,
            direction: "ping-pong",
        });
    }
    savePlay({
        userName: username,
        awpm: currentResults.awpm,
        wpm: currentResults.wpm,
        lpm: currentResults.lpm,
        acc: currentResults.acc,
    });

    const button_muteON = k.add([
        k.sprite("muteON"),
        k.pos(k.width() * 0.9, k.height()*0),
        k.opacity(1),
        k.animate(),
        k.z(50),
    ]);
    const button_muteOFF = k.add([
        k.sprite("muteOff"),
        k.pos(k.width() * 0.9, k.height()*0),
        k.opacity(0),
        k.animate(),
        k.z(50),
    ]);
    
    k.onKeyPress((keyPressed) => {
        if (keyPressed.toLowerCase() === "m" && k.isKeyDown("tab")) {
            if (settings.mute) {
                button_muteON.opacity = 0;
                button_muteOFF.opacity = 1;
                settings.mute = false;
                updateMusicVolume();
            }
            else {
                button_muteON.opacity = 1;
                button_muteOFF.opacity = 0;
                settings.mute = true;
                updateMusicVolume();
            }
            return;
        }
    });

    if (settings.mute) {
        button_muteON.opacity = 1;
        button_muteOFF.opacity = 0;
        updateMusicVolume();
    }
    else {
        button_muteON.opacity = 0;
        button_muteOFF.opacity = 1;
        updateMusicVolume();
    }

    onKeyPress("enter", () => {
        music.stop();
        k.go("name_selection");
    });

});
