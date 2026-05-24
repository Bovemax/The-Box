let durability = 100;
let displayedDurability = 100;
let dialogueEvent = 0;
let busy = false;
let level = 1;
let isPressed = false;
let totalEnemiesDestroyed = 0;
let spawnInterval;

const textbox = document.getElementById("textbox");
const textboxText = document.getElementById("textbox-text");
const gameContainer = document.getElementById("game");
const box = document.getElementById("box");

const durabilityBar = document.getElementById("durability-bar");
const dctx = durabilityBar.getContext("2d");

function resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    durabilityBar.width = width;
    durabilityBar.height = height;
    drawDurabilityBar();
}

function drawDurabilityBar() {
    const dCenterX = (durabilityBar.width - 1200) / 2;
    const dCenterY = (durabilityBar.height - 85) / 2;

    dctx.fillStyle = "rgb(0, 0, 0)";
    dctx.beginPath();
    dctx.roundRect(dCenterX - 10, dCenterY * 2 - 20, 1220, 70, 40);
    dctx.fill();

    dctx.fillStyle = "rgb(209, 0, 0)";
    dctx.beginPath();
    dctx.roundRect(dCenterX, dCenterY * 2 - 10, 1200, 50, 30);
    dctx.fill();

    dctx.fillStyle = "rgb(14, 209, 0)";
    dctx.beginPath();
    dctx.roundRect(dCenterX, dCenterY * 2 - 10, 12 * displayedDurability, 50, 30);
    dctx.fill();
}

function animateDurability() {
    if (displayedDurability > durability) {
        displayedDurability -= 0.05;

        if (displayedDurability < durability) {
            displayedDurability = durability;
        }

        drawDurabilityBar();
    }

    requestAnimationFrame(animateDurability);
}

// fillRect(x , y , width , height);

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

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
            await textbox.classList.add("hide");
            await wait(2000);
            await gameLoop();
            dialogueEvent = -1;
            break;
    }
}

async function gameLoop() {
    clearInterval(spawnInterval);
    switch (level) {
        case 1:
            spawnEnemy(2);
            setInterval(() => {
                spawnEnemy(2);
            }, 5000);
            break;
        case 2:
            spawnEnemy(4);
            setInterval(() => {
                spawnEnemy(4);
            }, 1000);
            break;
    }
}

function spawnEnemy(speed) {
    const enemy1 = document.createElement('img');
    enemy1.src = 'assets/demo_sprite.png';
    enemy1.style.position = 'absolute';
    enemy1.draggable = false;
    const maxX = gameContainer.clientWidth;
    const maxY = gameContainer.clientHeight;
    let randomX = Math.floor(Math.random() * maxX);
    let randomY = Math.floor(Math.random() * maxY);
    if (randomX <= maxX / 2) {
        randomX -= maxX / 2 - 100;
    }
    else {
        randomX += maxX / 2 + 100;
    }
    if (randomY <= maxY / 2) {
        randomY -= maxY / 2 - 100;
    }
    else {
        randomY += maxY / 2 + 100;
    }
    enemy1.style.left = randomX + 'px';
    enemy1.style.top = randomY + 'px';
    enemy1.style.transform = 'scale(0.3)';
    enemy1.style.transformOrigin = 'center';
    gameContainer.appendChild(enemy1);
    moveTowards(randomX, randomY, maxX / 2, maxY / 2, speed, enemy1);
}

function moveTowards(currentX, currentY, targetX, targetY, speed, elementID) {
    const radius = elementID.clientWidth / 2;
    const dx = targetX - currentX - radius;
    const dy = targetY - currentY - radius;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const enemyRect = elementID.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();

    const touching =
        enemyRect.left < boxRect.right &&
        enemyRect.right > boxRect.left &&
        enemyRect.top < boxRect.bottom &&
        enemyRect.bottom > boxRect.top;

    if (touching) {
        elementID.remove();
        durability -= 2;
        drawDurabilityBar();
        return;
    } else {
        currentX += (dx / distance) * speed;
        currentY += (dy / distance) * speed;
        if (!elementID.hoveringInitialized) {
            elementID.isHovering = false;
            elementID.addEventListener('mouseenter', () => {
                elementID.isHovering = true;
            });
            elementID.addEventListener('mouseleave', () => {
                elementID.isHovering = false;
            });
            elementID.hoveringInitialized = true;
        }
        if (elementID.isHovering && isPressed) {
            elementID.remove();
            totalEnemiesDestroyed++;
            if (level === 1 && totalEnemiesDestroyed === 5) {
                level = 2;
                gameLoop();
            }
            return;
        }
        requestAnimationFrame(() => { moveTowards(currentX, currentY, targetX, targetY, speed, elementID) });
    }
    elementID.style.left = currentX + 'px';
    elementID.style.top = currentY + 'px';
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

window.addEventListener('mousedown', () => isPressed = true);
window.addEventListener('mouseup', () => isPressed = false);

animateDurability();
run();