const gameBoard = document.getElementById('game-board');
const ctx = gameBoard.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');

const gridSize = 20;
let snake = [{ x: 10, y: 10 }];
let food = {};
let direction = 'right';
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameOver = false;

highScoreElement.textContent = highScore;

function generateFood() {
    food = {
        x: Math.floor(Math.random() * (gameBoard.width / gridSize)),
        y: Math.floor(Math.random() * (gameBoard.height / gridSize))
    };
}

function draw() {
    ctx.clearRect(0, 0, gameBoard.width, gameBoard.height);

    // Draw snake
    ctx.fillStyle = '#ffc107'; // Yellow for school bus
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });

    // Draw food
    ctx.fillStyle = '#dc3545'; // Red for food
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

    if (gameOver) {
        ctx.fillStyle = 'black';
        ctx.font = '40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', gameBoard.width / 2, gameBoard.height / 2 - 20);
        ctx.font = '20px sans-serif';
        ctx.fillText('Press any key to restart', gameBoard.width / 2, gameBoard.height / 2 + 20);
    }

}

function update() {
    if (gameOver) {
        return;
    }

    const head = { x: snake[0].x, y: snake[0].y };

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
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreElement.textContent = highScore;
    }
}

function restartGame() {
    snake = [{ x: 10, y: 10 }];
    direction = 'right';
    score = 0;
    scoreElement.textContent = score;
    gameOver = false;
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
    if (gameOver) return;
    setTimeout(() => {
        update();
        draw();
        main();
    }, 100);
}

generateFood();
main();