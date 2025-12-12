const statusDisplay = document.getElementById('status');
const cells = document.querySelectorAll('.cell');
const restartBtn = document.getElementById('restartBtn');
const resetScoreBtn = document.getElementById('resetScoreBtn');

// 計分元素
const scoreXEl = document.getElementById('score-x');
const scoreDrawEl = document.getElementById('score-draw');
const scoreOEl = document.getElementById('score-o');

let board = Array(9).fill('');
let gameActive = true;

// 分數變數
let scores = {
    x: 0,
    o: 0,
    draw: 0
};

const HU_PLAYER = 'X';
const AI_PLAYER = 'O';

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// 綁定事件
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', restartGame);
resetScoreBtn.addEventListener('click', resetScores);

function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (board[clickedCellIndex] !== '' || !gameActive) return;

    makeMove(clickedCellIndex, HU_PLAYER);
    
    if (checkGameEnd()) return;

    // 鎖定狀態，顯示電腦思考中
    gameActive = false;
    statusDisplay.innerText = "電腦思考中...";
    
    setTimeout(() => {
        const bestMove = minimax(board, AI_PLAYER).index;
        makeMove(bestMove, AI_PLAYER);
        
        if (!checkGameEnd()) {
            gameActive = true; 
            statusDisplay.innerText = "輪到你了";
        }
    }, 150);
}

function makeMove(index, player) {
    board[index] = player;
    const cell = cells[index];
    cell.classList.add(player.toLowerCase());
    cell.innerText = player;
}

function checkGameEnd() {
    let roundWon = false;
    let winCombo = [];

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            winCombo = [a, b, c];
            break;
        }
    }

    if (roundWon) {
        gameActive = false;
        highlightWin(winCombo);
        const winner = board[winCombo[0]];
        
        // 更新分數
        if (winner === HU_PLAYER) {
            statusDisplay.innerText = "你贏了！";
            scores.x++;
        } else {
            statusDisplay.innerText = "電腦獲勝！";
            scores.o++;
        }
        updateScoreDisplay();
        return true;
    }

    if (!board.includes('')) {
        statusDisplay.innerText = "平局！";
        gameActive = false;
        
        // 更新平局分數
        scores.draw++;
        updateScoreDisplay();
        return true;
    }

    return false;
}

function highlightWin(combo) {
    combo.forEach(index => {
        cells[index].classList.add('win');
    });
}

function restartGame() {
    gameActive = true;
    board = Array(9).fill('');
    statusDisplay.innerText = "輪到你了";
    cells.forEach(cell => {
        cell.innerText = '';
        cell.className = 'cell'; // 移除 x, o, win 樣式
    });
}

// 計分歸零功能
function resetScores() {
    scores.x = 0;
    scores.o = 0;
    scores.draw = 0;
    updateScoreDisplay();
    restartGame(); // 歸零時通常順便重開一局
}

function updateScoreDisplay() {
    scoreXEl.innerText = scores.x;
    scoreOEl.innerText = scores.o;
    scoreDrawEl.innerText = scores.draw;
}

// --- Minimax 演算法 ---
function minimax(newBoard, player) {
    const availSpots = newBoard.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);

    if (checkWin(newBoard, HU_PLAYER)) return { score: -10 };
    if (checkWin(newBoard, AI_PLAYER)) return { score: 10 };
    if (availSpots.length === 0) return { score: 0 };

    const moves = [];

    for (let i = 0; i < availSpots.length; i++) {
        const move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player === AI_PLAYER) {
            const result = minimax(newBoard, HU_PLAYER);
            move.score = result.score;
        } else {
            const result = minimax(newBoard, AI_PLAYER);
            move.score = result.score;
        }

        newBoard[availSpots[i]] = '';
        moves.push(move);
    }

    let bestMove;
    if (player === AI_PLAYER) {
        let bestScore = -10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = 10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }
    return moves[bestMove];
}

function checkWin(board, player) {
    return winningConditions.some(combination => {
        return combination.every(index => board[index] === player);
    });
}