const cells = Array.from(document.querySelectorAll('.cell'));
const strikeEl = document.getElementById('strike');
const stateEl = document.getElementById('state');
const scoreXEl = document.getElementById('score-x');
const scoreOEl = document.getElementById('score-o');
const scoreDrawEl = document.getElementById('score-draw');
const cardX = document.getElementById('card-x');
const cardO = document.getElementById('card-o');

const btnReset = document.getElementById('reset');
const btnResetAll = document.getElementById('reset-all');

let board = Array(9).fill('');
let current = 'X';
let active = true;
let scoreX = 0;
let scoreO = 0;
let scoreDraw = 0;

// 定義贏法，並給每一種贏法一個 CSS class 名稱
const WIN_COMBOS = [
    { line: [0, 1, 2], cssClass: 'strike-row-1' },
    { line: [3, 4, 5], cssClass: 'strike-row-2' },
    { line: [6, 7, 8], cssClass: 'strike-row-3' },
    { line: [0, 3, 6], cssClass: 'strike-col-1' },
    { line: [1, 4, 7], cssClass: 'strike-col-2' },
    { line: [2, 5, 8], cssClass: 'strike-col-3' },
    { line: [0, 4, 8], cssClass: 'strike-diag-1' },
    { line: [2, 4, 6], cssClass: 'strike-diag-2' }
];

function init() {
    board.fill('');
    current = 'X';
    active = true;
    stateEl.textContent = '遊戲開始';
    
    // 重置格子
    cells.forEach(c => {
        c.textContent = '';
        c.className = 'cell'; // 移除 x, o, win 樣式
        c.disabled = false;
    });

    // 重置連線
    strikeEl.className = 'strike'; 

    updatePlayerActiveUI();
}

function place(idx) {
    if (!active || board[idx]) return;

    board[idx] = current;
    const cell = cells[idx];
    cell.textContent = current;
    cell.classList.add(current.toLowerCase()); // 加 class .x 或 .o

    const result = evaluate();

    if (result.finished) {
        endGame(result);
    } else {
        switchTurn();
    }
}

function switchTurn() {
    current = current === 'X' ? 'O' : 'X';
    updatePlayerActiveUI();
    stateEl.textContent = `輪到 ${current} 下棋`;
}

function updatePlayerActiveUI() {
    // 控制計分板誰在發光
    if (current === 'X') {
        cardX.classList.add('active-x');
        cardO.classList.remove('active-o');
    } else {
        cardX.classList.remove('active-x');
        cardO.classList.add('active-o');
    }
}

function evaluate() {
    // 檢查是否有連線
    for (const combo of WIN_COMBOS) {
        const [a, b, c] = combo.line;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { finished: true, winner: board[a], combo: combo };
        }
    }
    // 檢查平手
    if (board.every(v => v)) return { finished: true, winner: null };
    return { finished: false };
}

function endGame({ winner, combo }) {
    active = false;
    cardX.classList.remove('active-x');
    cardO.classList.remove('active-o');

    if (winner) {
        stateEl.textContent = `${winner} 獲勝！`;
        
        // 1. 播放連線動畫：加上定位 class
        strikeEl.classList.add(combo.cssClass);
        // 2. 稍微延遲後加上 active class 觸發寬度伸長動畫
        setTimeout(() => strikeEl.classList.add('active'), 50);

        if (winner === 'X') scoreX++;
        else scoreO++;
    } else {
        stateEl.textContent = '平手！';
        scoreDraw++;
    }
    
    updateScoreboard();
    cells.forEach(c => c.disabled = true);
}

function updateScoreboard() {
    scoreXEl.textContent = scoreX;
    scoreOEl.textContent = scoreO;
    scoreDrawEl.textContent = scoreDraw;
}

// Event Listeners
cells.forEach(cell => {
    cell.addEventListener('click', () => {
        const idx = +cell.getAttribute('data-idx');
        place(idx);
    });
});

btnReset.addEventListener('click', init);

btnResetAll.addEventListener('click', () => {
    scoreX = scoreO = scoreDraw = 0;
    updateScoreboard();
    init();
});

// 啟動遊戲
init();