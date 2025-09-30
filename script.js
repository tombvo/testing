const gameBoard = document.getElementById('game-board');
const ctx = gameBoard.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');

const gridSize = 20;
let snake = [{ x: 10, y: 10, dir: 'right' }];
let food = {};
let direction = 'right';
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameOver = false;
let gameOverAnimation = { progress: 0 };

highScoreElement.textContent = highScore;

function generateFood() {
    food = {
        x: Math.floor(Math.random() * (gameBoard.width / gridSize)),
        y: Math.floor(Math.random() * (gameBoard.height / gridSize))
    };
}

function drawPixelArt(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
}

function drawFood(x, y) {
    const foodX = x * gridSize;
    const foodY = y * gridSize;
    // Simple apple-like sprite
    ctx.fillStyle = '#d90429'; // Red
    ctx.fillRect(foodX + 4, foodY + 4, 12, 12);
    ctx.fillStyle = '#8d5b4c'; // Brown stem
    ctx.fillRect(foodX + 9, foodY, 2, 4);
}

function drawSchoolBusSegment(segment, isHead) {
    const segX = segment.x * gridSize;
    const segY = segment.y * gridSize;
    const centerX = segX + gridSize / 2;
    const centerY = segY + gridSize / 2;

    ctx.save();
    ctx.translate(centerX, centerY);

    let angle = 0;
    if (segment.dir === 'up') angle = -Math.PI / 2;
    if (segment.dir === 'down') angle = Math.PI / 2;
    if (segment.dir === 'left') angle = Math.PI;
    ctx.rotate(angle);

    const halfGrid = gridSize / 2;

    // Bus body
    ctx.fillStyle = '#ffc107'; // Yellow
    ctx.fillRect(-halfGrid, -halfGrid, gridSize, gridSize);

    // Windows
    ctx.fillStyle = '#87ceeb'; // Sky blue
    ctx.fillRect(-halfGrid + 2, -halfGrid + 2, 5, 5);
    ctx.fillRect(halfGrid - 7, -halfGrid + 2, 5, 5);

    // Wheels
    ctx.fillStyle = '#333'; // Dark grey
    ctx.fillRect(-halfGrid + 2, halfGrid - 5, 5, 5);
    ctx.fillRect(halfGrid - 7, halfGrid - 5, 5, 5);

    if (isHead) {
        // Headlights (at the front, which is to the right in the un-rotated state)
        ctx.fillStyle = 'white';
        ctx.fillRect(halfGrid - 5, -halfGrid + 4, 3, 3);
        ctx.fillRect(halfGrid - 5, halfGrid - 7, 3, 3);
    }
    ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, gameBoard.width, gameBoard.height);

    // Draw snake
    snake.forEach((segment, index) => {
        drawSchoolBusSegment(segment, index === 0);
    });

    // Draw food
    drawFood(food.x, food.y);


    if (gameOver) {
        ctx.save();
        ctx.globalAlpha = gameOverAnimation.progress;
        ctx.fillStyle = 'black';
        ctx.font = '40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', gameBoard.width / 2, gameBoard.height / 2 - 20);
        ctx.font = '20px sans-serif';
        ctx.fillText('Press any key to restart', gameBoard.width / 2, gameBoard.height / 2 + 20);
        ctx.restore();
    }
}

function update() {
    if (gameOver) {
        if (gameOverAnimation.progress < 1) {
            gameOverAnimation.progress += 0.05;
        }
        return;
    }

    const head = { x: snake[0].x, y: snake[0].y, dir: direction };

    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }

    // Wall collision
    if (head.x < 0 || head.x * gridSize >= gameBoard.width || head.y < 0 || head.y * gridSize >= gameBoard.height) {
        endGame();
        return;
    }

    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame();
            return;
        }
    }

    snake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = score;
        generateFood();
    } else {
        snake.pop();
    }
}

function endGame() {
    gameOver = true;
    gameOverAnimation.progress = 0;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreElement.textContent = highScore;
    }
}

function restartGame() {
    snake = [{ x: 10, y: 10, dir: 'right' }];
    direction = 'right';
    score = 0;
    scoreElement.textContent = score;
    gameOver = false;
    gameOverAnimation.progress = 0;
    generateFood();
    main();
}

function handleKeyPress(event) {
    if (gameOver) {
        restartGame();
        return;
    }
    const key = event.key;
    if ((key === 'w' || key === 'W' || key === 'ArrowUp') && direction !== 'down') {
        direction = 'up';
    } else if ((key === 's' || key === 'S' || key === 'ArrowDown') && direction !== 'up') {
        direction = 'down';
    } else if ((key === 'a' || key === 'A' || key === 'ArrowLeft') && direction !== 'right') {
        direction = 'left';
    } else if ((key === 'd' || key === 'D' || key === 'ArrowRight') && direction !== 'left') {
        direction = 'right';
    }
}

document.addEventListener('keydown', handleKeyPress);

function main() {
    setTimeout(() => {
        update();
        draw();
        main();
    }, 100);
}

generateFood();
main();