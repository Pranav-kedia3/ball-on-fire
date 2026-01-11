// Basketball Pro - Realistic Physics Game
// Using Matter.js for realistic physics simulation

const { Engine, Render, Runner, World, Bodies, Body, Events, Composite } = Matter;

// Game Configuration
const config = {
    width: 1000,
    height: 700,
    gravity: 0.8,
    basketSpeed: 2,
    launchPower: 18, // Constant power
    minAngle: 0,
    maxAngle: 360,
    trajectoryPoints: 30
};

// Game State
let gameState = {
    score: 0,
    shots: 0,
    streak: 0,
    bestScore: 0,
    isThrown: false,
    launchAngle: 315, // Start at 45 degrees up-right (360 - 45)
    basketDirection: 1,
    ball: null,
    basket: null,
    backboard: null,
    net: null,
    shotTimer: null
};

// Initialize Physics Engine
const engine = Engine.create();
engine.gravity.y = config.gravity;

const canvas = document.getElementById('gameCanvas');
const render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
        width: config.width,
        height: config.height,
        wireframes: false,
        background: 'transparent'
    }
});

// Create Game Objects
function createBall() {
    const ball = Bodies.circle(100, config.height - 100, 20, {
        restitution: 0.7,
        friction: 0.05,
        density: 0.04,
        render: {
            fillStyle: '#ff6b35',
            strokeStyle: '#ff4500',
            lineWidth: 3
        },
        label: 'ball'
    });
    return ball;
}

function createBasket(x, y) {
    const rimLeft = Bodies.rectangle(x - 40, y, 10, 10, {
        isStatic: true,
        render: {
            fillStyle: '#e74c3c'
        },
        label: 'rim'
    });

    const rimRight = Bodies.rectangle(x + 40, y, 10, 10, {
        isStatic: true,
        render: {
            fillStyle: '#e74c3c'
        },
        label: 'rim'
    });

    const rimBottom = Bodies.rectangle(x, y + 5, 90, 5, {
        isStatic: true,
        isSensor: true,
        render: {
            fillStyle: '#c0392b',
            opacity: 0.5
        },
        label: 'sensor'
    });

    return { rimLeft, rimRight, rimBottom };
}

function createBackboard(x, y) {
    const backboard = Bodies.rectangle(x + 45, y - 20, 10, 100, {
        isStatic: true,
        restitution: 0.8,
        render: {
            fillStyle: '#2c3e50',
            strokeStyle: '#34495e',
            lineWidth: 2
        },
        label: 'backboard'
    });
    return backboard;
}

function createNet(ctx, x, y) {
    ctx.strokeStyle = '#95a5a6';
    ctx.lineWidth = 2;

    // Draw net pattern
    for (let i = 0; i < 80; i += 12) {
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(x - 40 + i, y + 10);
        ctx.lineTo(x - 40 + i, y + 60);
        ctx.stroke();

        // Diagonal cross pattern
        if (i < 70) {
            ctx.beginPath();
            ctx.moveTo(x - 40 + i, y + 10);
            ctx.lineTo(x - 40 + i + 12, y + 30);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x - 40 + i + 12, y + 10);
            ctx.lineTo(x - 40 + i, y + 30);
            ctx.stroke();
        }
    }

    // Bottom rim
    ctx.beginPath();
    ctx.moveTo(x - 40, y + 60);
    ctx.lineTo(x + 40, y + 60);
    ctx.stroke();
}

// Initialize Game
function initGame() {
    // Create ball
    gameState.ball = createBall();
    World.add(engine.world, gameState.ball);

    // Create basket
    const basketY = config.height / 2;
    const basketX = config.width - 150;
    const basket = createBasket(basketX, basketY);
    gameState.basket = basket;
    gameState.basketY = basketY;
    gameState.basketX = basketX;

    World.add(engine.world, [basket.rimLeft, basket.rimRight, basket.rimBottom]);

    // Create backboard
    gameState.backboard = createBackboard(basketX, basketY);
    World.add(engine.world, gameState.backboard);

    // Create ground (invisible)
    const ground = Bodies.rectangle(config.width / 2, config.height + 50, config.width, 100, {
        isStatic: true,
        render: {
            visible: false
        }
    });
    World.add(engine.world, ground);

    // Start rendering
    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Setup collision detection
    Events.on(engine, 'collisionStart', handleCollision);

    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Handle Collisions
function handleCollision(event) {
    const pairs = event.pairs;

    for (let pair of pairs) {
        const { bodyA, bodyB } = pair;

        // Check if ball scored
        if ((bodyA.label === 'ball' && bodyB.label === 'sensor') ||
            (bodyB.label === 'ball' && bodyA.label === 'sensor')) {

            if (gameState.ball.velocity.y > 0 && gameState.isThrown) {
                score();
            }
        }
    }
}

// Score Function
function score() {
    gameState.score++;
    gameState.streak++;
    gameState.bestScore = Math.max(gameState.bestScore, gameState.score);

    // Clear shot timer
    if (gameState.shotTimer) {
        clearTimeout(gameState.shotTimer);
        gameState.shotTimer = null;
    }

    updateUI();
    createParticles(gameState.basketX, gameState.basketY, 'success');

    // Reset ball after short delay
    setTimeout(resetBall, 800);
}

// Reset Ball
function resetBall() {
    // Clear any existing shot timer
    if (gameState.shotTimer) {
        clearTimeout(gameState.shotTimer);
        gameState.shotTimer = null;
    }

    World.remove(engine.world, gameState.ball);
    gameState.ball = createBall();
    World.add(engine.world, gameState.ball);
    gameState.isThrown = false;
    document.getElementById('controlsPanel').classList.remove('hidden');
}

// Shoot Ball
function shootBall() {
    if (gameState.isThrown) return;

    const angleRad = (gameState.launchAngle * Math.PI) / 180;
    const vx = Math.cos(angleRad) * config.launchPower;
    const vy = Math.sin(angleRad) * config.launchPower;

    Body.setVelocity(gameState.ball, { x: vx, y: vy });
    gameState.isThrown = true;
    gameState.shots++;
    updateUI();
    document.getElementById('controlsPanel').classList.add('hidden');

    if (gameState.streak >= 3) {
        createParticles(gameState.ball.position.x, gameState.ball.position.y, 'fire');
    }

    // Auto-reset after 5 seconds if ball hasn't scored or gone off screen
    gameState.shotTimer = setTimeout(() => {
        if (gameState.isThrown) {
            gameState.streak = 0;
            updateUI();
            resetBall();
        }
    }, 5000);
}

// Update Basket Position
function updateBasket() {
    const speed = config.basketSpeed;
    gameState.basketY += speed * gameState.basketDirection;

    if (gameState.basketY > config.height - 100 || gameState.basketY < 100) {
        gameState.basketDirection *= -1;
    }

    // Update positions
    Body.setPosition(gameState.basket.rimLeft, { x: gameState.basketX - 40, y: gameState.basketY });
    Body.setPosition(gameState.basket.rimRight, { x: gameState.basketX + 40, y: gameState.basketY });
    Body.setPosition(gameState.basket.rimBottom, { x: gameState.basketX, y: gameState.basketY + 5 });
    Body.setPosition(gameState.backboard, { x: gameState.basketX + 45, y: gameState.basketY - 20 });
}

// Draw Trajectory
function drawTrajectory(ctx) {
    if (gameState.isThrown) return;

    ctx.strokeStyle = 'rgba(102, 126, 234, 0.5)';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();

    let x = 100;
    let y = config.height - 100;
    const angleRad = (gameState.launchAngle * Math.PI) / 180;
    let vx = Math.cos(angleRad) * config.launchPower;
    let vy = Math.sin(angleRad) * config.launchPower;

    ctx.moveTo(x, y);

    for (let i = 0; i < config.trajectoryPoints; i++) {
        x += vx;
        y += vy;
        vy += config.gravity;

        ctx.lineTo(x, y);

        // Draw dots
        ctx.fillStyle = 'rgba(102, 126, 234, 0.6)';
        ctx.fillRect(x - 2, y - 2, 4, 4);
    }

    ctx.stroke();
    ctx.setLineDash([]);
}

// Create Particles
function createParticles(x, y, type) {
    const container = document.getElementById('particles');
    const count = type === 'fire' ? 10 : 20;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = `particle ${type}`;

        const angle = (Math.PI * 2 * i) / count;
        const distance = 50 + Math.random() * 50;
        const px = x + Math.cos(angle) * distance;
        const py = y + Math.sin(angle) * distance;

        particle.style.left = px + 'px';
        particle.style.top = py + 'px';

        container.appendChild(particle);

        setTimeout(() => particle.remove(), 1000);
    }
}

// Update UI
function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('streak').textContent = gameState.streak;
    document.getElementById('best').textContent = gameState.bestScore;

    // Update shots display if element exists
    const shotsElement = document.getElementById('shots');
    if (shotsElement) {
        shotsElement.textContent = gameState.shots;
    }

    const fireIndicator = document.getElementById('fireIndicator');
    if (gameState.streak >= 3) {
        fireIndicator.classList.add('active');
    } else {
        fireIndicator.classList.remove('active');
    }

    // Update angle meter and display
    const anglePercent = (gameState.launchAngle / 360) * 100;

    document.getElementById('angleMeter').style.width = anglePercent + '%';
    document.getElementById('angleValue').textContent = Math.round(gameState.launchAngle) + '°';
}

// Game Loop
function gameLoop() {
    updateBasket();

    // Custom rendering
    const ctx = render.canvas.getContext('2d');

    // Draw trajectory
    drawTrajectory(ctx);

    // Draw net
    createNet(ctx, gameState.basketX, gameState.basketY);

    // Check if ball is off screen (miss)
    if (gameState.isThrown &&
        (gameState.ball.position.x > config.width + 50 ||
            gameState.ball.position.x < -50 ||
            gameState.ball.position.y > config.height + 50)) {

        // Clear shot timer
        if (gameState.shotTimer) {
            clearTimeout(gameState.shotTimer);
            gameState.shotTimer = null;
        }

        gameState.streak = 0;
        updateUI();
        resetBall();
    }

    requestAnimationFrame(gameLoop);
}

// Keyboard Controls
document.addEventListener('keydown', (e) => {
    if (gameState.isThrown) return;

    switch (e.key) {
        case 'ArrowUp':
        case 'ArrowRight':
            gameState.launchAngle = (gameState.launchAngle + 2) % 360;
            updateUI();
            break;
        case 'ArrowDown':
        case 'ArrowLeft':
            gameState.launchAngle = (gameState.launchAngle - 2 + 360) % 360;
            updateUI();
            break;
        case ' ':
            e.preventDefault();
            shootBall();
            break;
    }
});

// Initialize
initGame();
updateUI();
