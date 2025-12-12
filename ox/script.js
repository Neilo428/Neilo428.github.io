const statusDisplay = document.getElementById('status');
const cells = document.querySelectorAll('.cell');
const restartBtn = document.getElementById('restartBtn');
const resetScoreBtn = document.getElementById('resetScoreBtn');

// 計分 DOM 元素
const scoreXEl = document.getElementById('score-x');
const scoreDrawEl = document.getElementById('score-draw');
const scoreOEl = document.getElementById('score-o');

// 遊戲變數
let board = Array(9).fill('');
let gameActive = true;
const HU_PLAYER = 'X';
const AI_PLAYER = 'O';

// 初始分數
let scores = {
    x: 0,
    o: 0,
    draw: 0
};

// 獲勝條件
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// 初始化事件監聽
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', restartGame);
resetScoreBtn.addEventListener('click', resetScores);

// --- 核心遊戲流程 ---
function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    // 如果格子有東西或遊戲已結束，不動作
    if (board[clickedCellIndex] !== '' || !gameActive) return;

    // 1. 玩家下棋
    makeMove(clickedCellIndex, HU_PLAYER);
    
    // 2. 檢查玩家是否獲勝
    if (checkGameEnd()) return;

    // 3. 鎖定遊戲，讓電腦思考
    gameActive = false;
    statusDisplay.innerText = "電腦思考中...";
    
    // 4. 延遲執行電腦下棋 (體驗較佳)
    setTimeout(() => {
        const bestMove = minimax(board, AI_PLAYER).index;
        makeMove(bestMove, AI_PLAYER);
        
        // 5. 檢查電腦是否獲勝，如果沒有，將控制權還給玩家
        if (!checkGameEnd()) {
            gameActive = true; 
            statusDisplay.innerText = "輪到你了";
        }
    }, 200);
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

    // 檢查是否有連線
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

    // 檢查平局
    if (!board.includes('')) {
        statusDisplay.innerText = "平局！";
        gameActive = false;
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
        cell.className = 'cell'; // 重置所有 class
    });
}

// --- 計分相關功能 ---
function resetScores() {
    scores.x = 0;
    scores.o = 0;
    scores.draw = 0;
    updateScoreDisplay();
    restartGame();
}

function updateScoreDisplay() {
    scoreXEl.innerText = scores.x;
    scoreOEl.innerText = scores.o;
    scoreDrawEl.innerText = scores.draw;
}

// --- Minimax 演算法 (AI 核心) ---
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

        newBoard[availSpots[i]] = ''; // Backtrack
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