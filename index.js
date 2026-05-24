let durability = 100;
let dialogueEvent = 0;
let busy = false;

const textbox = document.getElementById("textbox");
const textboxText = document.getElementById("textbox-text");

const canvas = document.getElementById("durability-bar");

setTimeout(() => {
    textbox.classList.add("show");
}, 2000);

function typeText(text, speed) {
    return new Promise((resolve) => {
        let i = 0;

        textboxText.textContent = "";

        const interval = setInterval(() => {
            textboxText.textContent = text.slice(0, i + 1);

            i++;

            if (i >= text.length) {
                clearInterval(interval);
                resolve();
            }
        }, speed);
    });
}

async function intro() {
    switch (dialogueEvent) {
        case 0:
            await wait(2500);
            await typeText("This is a box...", 70);
            dialogueEvent++;
            break;

        case 1:
            await typeText("Don't let it open...", 70);
            dialogueEvent++;
            break;

        case 2:
            await typeText("Or else...", 70);
            dialogueEvent++;
            break;

        case 3:
            await typeText("It's over...", 70);
            dialogueEvent++;
            break;

        case 4:
            await typeText("Good luck.", 70);
            dialogueEvent++;
            break;

        case 5:
            textbox.classList.add("hide");
            break;
    }
}

async function run() {
    if (busy) return;
    busy = true;
    await intro();
    busy = false;
}

function wait(ms) {
    return new Promise(resolve => { setTimeout(resolve, ms) });
}



document.addEventListener("keydown", e => {
    if (
        e.key === " " ||
        e.key === "ArrowDown" ||
        e.key === "Enter"
    ) {
        run();
    }
});


window.addEventListener('mousedown', (e) => {
    if (e.buttons === 1) {
        run();
    }
});

window.addEventListener('mousemove', (mouseMoved) => {
    console.log(`X: ${mouseMoved.clientX}, Y: ${mouseMoved.clientY}`);
});

run();