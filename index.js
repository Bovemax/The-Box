let durability = 100;
let displayedDurability = 100;
let dialogueEvent = 0;
let busy = false;
let level = 1;
let totalEnemiesDestroyed = 0;
let spawnInterval;
let timeInterval;
let time = 0;
let score = 0;
let damageTaken = 0;
let isGameOver = false;
let mouseX;
let mouseY;
let isLightningActive = false;
let isOnFire = false;

function startTime() {
    updateScore();
    timeInterval = setInterval(() => {
        if (isGameOver) return;
        time++;
        updateScore();
    }, 1000);
}

// Create Textbox

const textbox = document.getElementById("textbox");
const textboxText = document.getElementById("textbox-text");
const gameContainer = document.getElementById("game");
const box = document.getElementById("box");
const scoreText = document.getElementById("score");
const gameOverBox = document.getElementById("game-over");
const gameOverText = document.getElementById("game-over-text");

const bgMusicCtx = new AudioContext();

async function playLoop() {
    const response = await fetch("assets/sadge.wav");
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await bgMusicCtx.decodeAudioData(arrayBuffer);
    const source = bgMusicCtx.createBufferSource();
    const gainNode = bgMusicCtx.createGain();
    source.buffer = audioBuffer;
    source.loop = true;
    gainNode.gain.value = 0.25;
    source.connect(gainNode);
    gainNode.connect(bgMusicCtx.destination);
    source.start(0);
}

scoreText.style.display = "none"; // Hide score until game starts

const durabilityBar = document.getElementById("durability-bar");
const dctx = durabilityBar.getContext("2d");

function resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    durabilityBar.width = width;
    durabilityBar.height = height;
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
    if (isGameOver) {
        dctx.clearRect(0, 0, durabilityBar.width, durabilityBar.height);
        return;
    }
    if (displayedDurability > durability) {
        displayedDurability -= (damageTaken / 10);
        damageTaken /= 1.1;

        if (displayedDurability < durability) {
            displayedDurability = durability;
            damageTaken = 0;
        }

        if (damageTaken < 0.01) {
            damageTaken = 0;
        }

        if (durability <= 0) {
            gameOver();
        }
        drawDurabilityBar();
    }
    durability = Math.floor(durability);
    displayedDurability = Math.floor(displayedDurability);
    requestAnimationFrame(animateDurability);
}

function gameOver() {
    if (isGameOver) return;
    isGameOver = true;
    clearInterval(spawnInterval);
    clearInterval(timeInterval);
    gameOverBox.classList.add("show");
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

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

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function intro() {
    switch (dialogueEvent) {
        case 0:
            await wait(1000);
            playLoop();
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

function gameLoop() {
    scoreText.style.display = "block";
    startTime();
    drawDurabilityBar();
    clearInterval(spawnInterval);
    switch (level) {
        case 1:
            spawnEnemy(0);
            spawnInterval = setInterval(() => {
                if (!isGameOver) {
                    spawnEnemy(0);
                }
            }, 5000);
            break;
        case 2:
            spawnEnemy(1);
            spawnInterval = setInterval(() => {
                if (!isGameOver) {
                    spawnEnemy(0);
                    if (randomNumber(1, 4) === 4) {
                        spawnEnemy(1);
                    }
                }
            }, 1000);
            break;
    }
}

function updateScore() {
    score = time + 5 * totalEnemiesDestroyed;
    scoreText.textContent = score;
}

function spawnEnemy(enemyType) {
    switch (enemyType) {
        case 0: // Ball enemy
            const ball = document.createElement('img');
            ball.src = 'assets/demo_sprite.png';
            ball.style.position = 'absolute';
            ball.style.transform = 'scale(0.3)';
            ball.style.transformOrigin = 'center';
            ball.draggable = false;

            const maxX = window.innerWidth;
            const maxY = window.innerHeight;
            const spawnOffset = 1000;
            let randomX;
            let randomY;

            const side = Math.floor(Math.random() * 4);
            switch (side) {

                case 0: // Top
                    randomX = Math.random() * maxX;
                    randomY = -spawnOffset;
                    break;

                case 1: // Right
                    randomX = maxX + spawnOffset;
                    randomY = Math.random() * maxY;
                    break;

                case 2: // Bottom
                    randomX = Math.random() * maxX;
                    randomY = maxY + spawnOffset;
                    break;

                case 3: // Left
                    randomX = -spawnOffset;
                    randomY = Math.random() * maxY;
                    break;
            }

            ball.style.left = randomX + 'px';
            ball.style.top = randomY + 'px';
            gameContainer.appendChild(ball);
            ball.onload = () => {
                moveTowards(
                    randomX, randomY, maxX / 2, maxY / 2, 2, ball
                );
            };
            break;

        case 1: // Lightning
            if (!isLightningActive) {
                blockLightning();
            }
            break;
    }
}

const strikeAudio = new Audio('assets/strike.wav');
const blockAudio = new Audio('assets/block.wav');

let safe = false;
async function blockLightning() {
    isLightningActive = true;
    const buzzAudio = new Audio('assets/buzz.wav');
    buzzAudio.play();
    await wait(Math.floor(Math.random() * 5001) + 5000);
    buzzAudio.pause();
    if (isGameOver) {
        isLightningActive = false;
        return;
    }
    if (mouseY <= 0.5 && mouseX >= 0.44 && mouseX <= 0.6) {
        safe = true;
    } else {
        safe = false;
    }
    const lightning = document.createElement('img');
    lightning.src = 'assets/lightning.gif';
    lightning.style.position = 'absolute';
    lightning.style.zIndex = '10';
    lightning.style.transformOrigin = 'bottom center';
    lightning.style.transform = 'translate(-50%, -100%) scale(5)';
    gameContainer.appendChild(lightning);
    if (safe === false) {
        strikeAudio.play();
        damageTaken = 30;
        durability -= damageTaken;
        drawDurabilityBar();
        const boxRect = box.getBoundingClientRect();
        const targetX = boxRect.left !== 0 ? boxRect.left + (boxRect.width / 2) : window.innerWidth / 2;
        const targetY = boxRect.top !== 0 ? boxRect.top : window.innerHeight / 2;
        lightning.style.left = targetX + 'px';
        lightning.style.top = targetY + 'px';
    } else {
        blockAudio.play();
        const pixelX = parseFloat(mouseX) * window.innerWidth;
        const pixelY = parseFloat(mouseY) * window.innerHeight;
        lightning.style.left = pixelX + 'px';
        lightning.style.top = pixelY + 'px';
    }
    await wait(1000);
    lightning.remove();
    isLightningActive = false;
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
        damageTaken = 10;
        durability -= damageTaken;
        drawDurabilityBar();
        return;
    } else {
        currentX += (dx / distance) * speed;
        currentY += (dy / distance) * speed;
        if (!elementID.clickInitialized) {
            elementID.addEventListener('mousedown', () => {
                elementID.remove();
                totalEnemiesDestroyed++;
                updateScore();
                if (level === 1 && totalEnemiesDestroyed === 5) {
                    level = 2;
                    gameLoop();
                }
            })
            elementID.clickInitialized = true;
        }
        requestAnimationFrame(() => { moveTowards(currentX, currentY, targetX, targetY, speed, elementID) });
    }
    elementID.style.left = currentX + 'px';
    elementID.style.top = currentY + 'px';
}

function setFire() {
    if (isOnFire || isGameOver) return;

    isOnFire = true;

    fireInterval = setInterval(() => {
        if (isGameOver) {
            extinguish();
            return;
        }

        damageTaken = 2;
        durability -= damageTaken;

        drawDurabilityBar();
    }, 1000);
}

function extinguish() {
    if (!isOnFire) return;

    clearInterval(fireInterval);
    fireInterval = null;
    isOnFire = false;
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

// Run Textbox on Space, Enter, or ArrowDown key press
document.addEventListener("keydown", e => {
    if (
        e.key === " " ||
        e.key === "ArrowDown" ||
        e.key === "Enter"
    ) {
        setTimeout(() => {
            textbox.classList.add("show");
        }, 1000);
        run();
    }
});

// Run Textbox on left mouse click
window.addEventListener('mousedown', (e) => {
    if (e.buttons === 1) {
        setTimeout(() => {
            textbox.classList.add("show");
        }, 1000);
        run();
    }
});

// Get mouse coordinates
window.addEventListener('mousemove', (mouseMoved) => {
    //console.log(`X: ${mouseMoved.clientX}, Y: ${mouseMoved.clientY}`);
});

// Get mouse position relative to the viewport and screen
window.addEventListener('mousemove', (e) => {
    const screenX = e.screenX;
    const screenY = e.screenY;

    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;

    const relativeViewportX = e.clientX / window.innerWidth;
    const relativeViewportY = e.clientY / window.innerHeight;

    console.log(`X: ${relativeViewportX.toFixed(2)}, Y: ${relativeViewportY.toFixed(2)}`);
    mouseX = relativeViewportX.toFixed(2);
    mouseY = relativeViewportY.toFixed(2);
});

animateDurability();