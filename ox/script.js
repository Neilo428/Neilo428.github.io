const statusDisplay = document.getElementById('status');
const cells = document.querySelectorAll('.cell');
const restartBtn = document.getElementById('restartBtn');

let board = Array(9).fill('');
let gameActive = true;
const HU_PLAYER = 'X';
const AI_PLAYER = 'O';

// 獲勝組合
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// 初始化
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', restartGame);

function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (board[clickedCellIndex] !== '' || !gameActive) return;

    // 玩家回合
    makeMove(clickedCellIndex, HU_PLAYER);
    
    if (checkGameEnd()) return;

    // 電腦回合 (延遲一下比較自然)
    gameActive = false; // 鎖定版面
    statusDisplay.innerText = "電腦思考中...";
    
    setTimeout(() => {
        const bestMove = minimax(board, AI_PLAYER).index;
        makeMove(bestMove, AI_PLAYER);
        checkGameEnd();
        if (gameActive) {
            statusDisplay.innerText = "輪到你了";
        }
    }, 400);
}

function makeMove(index, player) {
    board[index] = player;
    const cell = cells[index];
    cell.classList.add(player.toLowerCase());
    cell.setAttribute('data-symbol', player); // 用於 CSS 偽元素顯示
    cell.innerText = player; // 兼容性備份
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
        statusDisplay.innerText = winner === HU_PLAYER ? "太神了！你贏了！" : "電腦獲勝！";
        return true;
    }

    if (!board.includes('')) {
        statusDisplay.innerText = "平局！勢均力敵";
        gameActive = false;
        return true;
    }

    gameActive = true;
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
        cell.setAttribute('data-symbol', '');
        cell.className = 'cell'; // 重置所有 class
    });
}

// --- Minimax 演算法 ---
// 這裡優化了結構，讓回傳物件包含 index 和 score
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