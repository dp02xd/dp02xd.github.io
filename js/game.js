"use strict";


/* =========================================================
   PLAYER CONFIGURATION
========================================================= */

const PLAYERS = {

    red: {
        name: "Red",
        start: 1,
        color: "#ef4444",

        lane: [
            [7, 1],
            [7, 2],
            [7, 3],
            [7, 4],
            [7, 5]
        ],

        /*
         * Exact centers of the four white circles.
         * The home area occupies 6x6 cells.
         */
        yard: [
            [1.5, 1.5],
            [1.5, 4.5],
            [4.5, 1.5],
            [4.5, 4.5]
        ]
    },


    green: {
        name: "Green",
        start: 14,
        color: "#22c55e",

        lane: [
            [1, 7],
            [2, 7],
            [3, 7],
            [4, 7],
            [5, 7]
        ],

        yard: [
            [1.5, 10.5],
            [1.5, 13.5],
            [4.5, 10.5],
            [4.5, 13.5]
        ]
    },


    yellow: {
        name: "Yellow",
        start: 27,
        color: "#facc15",

        lane: [
            [7, 13],
            [7, 12],
            [7, 11],
            [7, 10],
            [7, 9]
        ],

        yard: [
            [10.5, 10.5],
            [10.5, 13.5],
            [13.5, 10.5],
            [13.5, 13.5]
        ]
    },


    blue: {
        name: "Blue",
        start: 40,
        color: "#3b82f6",

        lane: [
            [13, 7],
            [12, 7],
            [11, 7],
            [10, 7],
            [9, 7]
        ],

        yard: [
            [10.5, 1.5],
            [10.5, 4.5],
            [13.5, 1.5],
            [13.5, 4.5]
        ]
    }

};


const PLAYER_ORDER = [
    "red",
    "green",
    "yellow",
    "blue"
];


/* =========================================================
   MAIN TRACK
========================================================= */

const TRACK = [

    [6, 0],
    [6, 1],
    [6, 2],
    [6, 3],
    [6, 4],
    [6, 5],

    [5, 6],
    [4, 6],
    [3, 6],
    [2, 6],
    [1, 6],
    [0, 6],

    [0, 7],
    [0, 8],

    [1, 8],
    [2, 8],
    [3, 8],
    [4, 8],
    [5, 8],

    [6, 9],
    [6, 10],
    [6, 11],
    [6, 12],
    [6, 13],
    [6, 14],

    [7, 14],
    [8, 14],

    [8, 13],
    [8, 12],
    [8, 11],
    [8, 10],
    [8, 9],

    [9, 8],
    [10, 8],
    [11, 8],
    [12, 8],
    [13, 8],
    [14, 8],

    [14, 7],
    [14, 6],

    [13, 6],
    [12, 6],
    [11, 6],
    [10, 6],
    [9, 6],

    [8, 5],
    [8, 4],
    [8, 3],
    [8, 2],
    [8, 1],
    [8, 0],

    [7, 0]
];


/*
 * Safe/star cells.
 *
 * The colored START cell is separate from these.
 */
const SAFE_CELLS = new Set([
    0,
    8,
    13,
    21,
    26,
    34,
    39,
    47
]);


/* =========================================================
   DOM
========================================================= */

const board = document.getElementById("board");
const boardGrid = document.getElementById("boardGrid");
const tokenLayer = document.getElementById("tokenLayer");

const diceCard = document.getElementById("diceCard");
const diceButton = document.getElementById("diceButton");
const diceFace = document.getElementById("diceFace");
const diceTitle = document.getElementById("diceTitle");
const diceHint = document.getElementById("diceHint");

const playersList = document.getElementById("playersList");

const settingsButton = document.getElementById("settingsButton");
const settingsMenu = document.getElementById("settingsMenu");

const boardThemeToggle =
    document.getElementById("boardThemeToggle");

const boardThemeHint =
    document.getElementById("boardThemeHint");

const restartButton =
    document.getElementById("restartButton");

const winnerModal =
    document.getElementById("winnerModal");

const winnerTitle =
    document.getElementById("winnerTitle");

const winnerMessage =
    document.getElementById("winnerMessage");

const modalRestart =
    document.getElementById("modalRestart");

const donateButton =
    document.getElementById("donateButton");

const downloadButton =
    document.getElementById("downloadButton");

const shareButton =
    document.getElementById("shareButton");


/* =========================================================
   GAME STATE
========================================================= */

const state = {

    currentPlayer: 0,

    dice: 0,

    rolling: false,

    moving: false,

    winner: null,

    /*
     * -1 = yard
     * 0..51 = main track
     * 52..56 = colored home lane
     * 57 = finished
     */
    tokens: {
        red: [-1, -1, -1, -1],
        green: [-1, -1, -1, -1],
        yellow: [-1, -1, -1, -1],
        blue: [-1, -1, -1, -1]
    }

};


/* =========================================================
   HELPERS
========================================================= */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function currentPlayerKey() {
    return PLAYER_ORDER[state.currentPlayer];
}


function getTrackCoordinate(index) {
    return TRACK[index];
}


function getGlobalTrackIndex(player, progress) {

    return (
        PLAYERS[player].start + progress
    ) % TRACK.length;

}


function isFinished(progress) {
    return progress === 57;
}


function isInMainTrack(progress) {
    return progress >= 0 && progress <= 51;
}


function canMoveToken(player, tokenIndex) {

    const progress =
        state.tokens[player][tokenIndex];

    const dice =
        state.dice;

    if (dice < 1) {
        return false;
    }

    if (progress === 57) {
        return false;
    }

    /*
     * Pawn in yard can only enter with six.
     */
    if (progress === -1) {
        return dice === 6;
    }

    /*
     * Exact roll required to finish.
     */
    return progress + dice <= 57;
}


function getMovableTokens(player) {

    const result = [];

    for (let i = 0; i < 4; i++) {

        if (canMoveToken(player, i)) {
            result.push(i);
        }

    }

    return result;
}


/* =========================================================
   BOARD CREATION
========================================================= */

const trackMap = new Map();

TRACK.forEach((position, index) => {

    const key =
        `${position[0]}-${position[1]}`;

    trackMap.set(key, index);

});


function laneOwner(row, col) {

    for (const player of PLAYER_ORDER) {

        const lane =
            PLAYERS[player].lane;

        for (const cell of lane) {

            if (
                cell[0] === row &&
                cell[1] === col
            ) {
                return player;
            }

        }

    }

    return null;
}


function startOwner(row, col) {

    for (const player of PLAYER_ORDER) {

        const start =
            PLAYERS[player].start;

        const position =
            TRACK[start];

        if (
            position[0] === row &&
            position[1] === col
        ) {
            return player;
        }

    }

    return null;
}


function createArrow(player, row, col) {

    /*
     * Arrow indicates the direction toward
     * the colored home lane.
     */

    const arrows = {

        red: {
            row: 7,
            col: 0,
            symbol: "→"
        },

        green: {
            row: 0,
            col: 7,
            symbol: "↓"
        },

        yellow: {
            row: 7,
            col: 14,
            symbol: "←"
        },

        blue: {
            row: 14,
            col: 7,
            symbol: "↑"
        }

    };

    const item = arrows[player];

    if (
        item &&
        item.row === row &&
        item.col === col
    ) {

        const span =
            document.createElement("span");

        span.className =
            `lane-arrow ${player}`;

        span.textContent =
            item.symbol;

        return span;

    }

    return null;
}


function buildBoard() {

    boardGrid.innerHTML = "";

    for (let row = 0; row < 15; row++) {

        for (let col = 0; col < 15; col++) {

            const cell =
                document.createElement("div");

            cell.className =
                "board-cell";

            const key =
                `${row}-${col}`;

            const trackIndex =
                trackMap.get(key);

            const lane =
                laneOwner(row, col);

            /*
             * Main track
             */
            if (trackIndex !== undefined) {

                cell.classList.add("track");

                if (SAFE_CELLS.has(trackIndex)) {

                    cell.classList.add("safe");

                }

                const owner =
                    startOwner(row, col);

                if (owner) {

                    cell.classList.add(
                        `start-${owner}`
                    );

                }

            }


            /*
             * Colored home lanes
             */
            if (lane) {

                cell.classList.add(
                    "lane",
                    `lane-${lane}`
                );

            }


            /*
             * Entry arrow
             */
            for (const player of PLAYER_ORDER) {

                const arrow =
                    createArrow(
                        player,
                        row,
                        col
                    );

                if (arrow) {

                    cell.appendChild(arrow);

                }

            }

            boardGrid.appendChild(cell);

        }

    }

}


/* =========================================================
   TOKEN POSITIONING
========================================================= */

const tokenElements = new Map();


function getTokenPosition(
    player,
    progress,
    tokenIndex
) {

    /*
     * Yard
     */
    if (progress === -1) {

        const position =
            PLAYERS[player].yard[tokenIndex];

        return {
            row: position[0],
            col: position[1]
        };

    }


    /*
     * Main track
     */
    if (progress >= 0 && progress <= 51) {

        const position =
            getTrackCoordinate(
                getGlobalTrackIndex(
                    player,
                    progress
                )
            );

        return {
            row: position[0] + 0.5,
            col: position[1] + 0.5
        };

    }


    /*
     * Colored home lane
     */
    if (progress >= 52 && progress <= 56) {

        const laneIndex =
            progress - 52;

        const position =
            PLAYERS[player].lane[laneIndex];

        return {
            row: position[0] + 0.5,
            col: position[1] + 0.5
        };

    }


    /*
     * Finished
     */
    return {
        row: 7.5,
        col: 7.5
    };

}


function setTokenPosition(
    element,
    position
) {

    /*
     * Convert board-cell coordinates
     * into percentage coordinates.
     */
    element.style.left =
        `${(position.col / 15) * 100}%`;

    element.style.top =
        `${(position.row / 15) * 100}%`;

}


function createToken(player, tokenIndex) {

    const token =
        document.createElement("button");

    token.type = "button";

    token.className =
        `token ${player}`;

    token.dataset.player =
        player;

    token.dataset.token =
        tokenIndex;

    token.setAttribute(
        "aria-label",
        `${PLAYERS[player].name} pawn ${tokenIndex + 1}`
    );

    tokenElements.set(
        `${player}-${tokenIndex}`,
        token
    );

    tokenLayer.appendChild(token);

    return token;

}


function renderTokens() {

    const movable =
        getMovableTokens(
            currentPlayerKey()
        );

    for (const player of PLAYER_ORDER) {

        for (let i = 0; i < 4; i++) {

            const key =
                `${player}-${i}`;

            let token =
                tokenElements.get(key);

            if (!token) {
                token =
                    createToken(
                        player,
                        i
                    );
            }

            const progress =
                state.tokens[player][i];

            const position =
                getTokenPosition(
                    player,
                    progress,
                    i
                );

            setTokenPosition(
                token,
                position
            );

            /*
             * Only current player's legal pawns
             * can be selected.
             */
            const isMovable =
                player === currentPlayerKey() &&
                movable.includes(i) &&
                !state.moving &&
                !state.rolling;

            token.classList.toggle(
                "movable",
                isMovable
            );

            token.disabled =
                !isMovable;

        }

    }

}


/* =========================================================
   TURN UI
========================================================= */

function updatePlayerUI() {

    const activePlayer =
        currentPlayerKey();

    document
        .querySelectorAll("[data-player-row]")
        .forEach(row => {

            const player =
                row.dataset.playerRow;

            row.classList.toggle(
                "active",
                player === activePlayer
            );

            const finished =
                state.tokens[player]
                    .filter(isFinished)
                    .length;

            const count =
                row.querySelector(
                    ".finished-count"
                );

            if (count) {
                count.textContent =
                    finished;
            }

        });

}


function updateDiceUI() {

    const player =
        currentPlayerKey();

    diceCard.classList.toggle(
        "awaiting-roll",
        state.dice === 0 &&
        !state.rolling &&
        !state.moving &&
        !state.winner
    );

    diceCard.classList.toggle(
        "rolling",
        state.rolling
    );


    if (state.rolling) {

        diceTitle.textContent =
            "ROLLING…";

        diceHint.textContent =
            `${PLAYERS[player].name} is rolling`;

    }

    else if (state.moving) {

        diceTitle.textContent =
            "MOVING…";

        diceHint.textContent =
            "Pawn is moving";

    }

    else if (state.dice > 0) {

        const movable =
            getMovableTokens(player);

        if (movable.length > 0) {

            diceTitle.textContent =
                "CHOOSE A PAWN";

            diceHint.textContent =
                "Tap a glowing pawn to move it.";

        }

        else {

            diceTitle.textContent =
                "NO MOVE";

            diceHint.textContent =
                "No pawn can move with this roll.";

        }

    }

    else {

        diceTitle.textContent =
            "ROLL THE DICE";

        diceHint.textContent =
            `${PLAYERS[player].name}'s turn — roll the dice.`;

    }


    diceButton.disabled =
        state.rolling ||
        state.moving ||
        state.dice !== 0 ||
        Boolean(state.winner);

}


/* =========================================================
   DICE
========================================================= */

const DOT_POSITIONS = {

    1: [5],

    2: [1, 9],

    3: [1, 5, 9],

    4: [1, 3, 7, 9],

    5: [1, 3, 5, 7, 9],

    6: [1, 3, 4, 6, 7, 9]

};


function setDiceFace(value) {

    diceFace
        .querySelectorAll(".dot")
        .forEach((dot, index) => {

            dot.classList.toggle(
                "show",
                DOT_POSITIONS[value]
                    .includes(index + 1)
            );

        });

}


async function rollDice() {

    if (
        state.rolling ||
        state.moving ||
        state.dice !== 0 ||
        state.winner
    ) {
        return;
    }

    state.rolling = true;

    updateDiceUI();

    /*
     * Dice rolling animation.
     */
    for (let i = 0; i < 9; i++) {

        const temporary =
            1 + Math.floor(
                Math.random() * 6
            );

        setDiceFace(temporary);

        await sleep(70);

    }

    const result =
        1 + Math.floor(
            Math.random() * 6
        );

    state.dice =
        result;

    state.rolling =
        false;

    setDiceFace(result);

    updateDiceUI();
    renderTokens();


    const player =
        currentPlayerKey();

    const movable =
        getMovableTokens(player);

    /*
     * No legal move.
     */
    if (movable.length === 0) {

        await sleep(750);

        /*
         * A six still gives another turn.
         */
        const extraTurn =
            result === 6;

        state.dice = 0;

        if (!extraTurn) {

            nextPlayer();

        }

        updateDiceUI();
        updatePlayerUI();
        renderTokens();

        return;

    }

}


/* =========================================================
   CAPTURE
========================================================= */

function captureOpponents(
    movingPlayer,
    progress
) {

    if (
        progress < 0 ||
        progress > 51
    ) {
        return false;
    }

    const globalIndex =
        getGlobalTrackIndex(
            movingPlayer,
            progress
        );

    /*
     * Safe cells cannot capture.
     */
    if (SAFE_CELLS.has(globalIndex)) {
        return false;
    }

    let captured =
        false;

    for (const opponent of PLAYER_ORDER) {

        if (opponent === movingPlayer) {
            continue;
        }

        for (let i = 0; i < 4; i++) {

            const opponentProgress =
                state.tokens[opponent][i];

            if (
                opponentProgress >= 0 &&
                opponentProgress <= 51
            ) {

                const opponentGlobal =
                    getGlobalTrackIndex(
                        opponent,
                        opponentProgress
                    );

                if (
                    opponentGlobal === globalIndex
                ) {

                    state.tokens[opponent][i] =
                        -1;

                    captured =
                        true;

                }

            }

        }

    }

    return captured;

}


/* =========================================================
   MOVE TOKEN
========================================================= */

async function moveToken(tokenIndex) {

    if (
        state.moving ||
        state.rolling ||
        state.dice === 0 ||
        state.winner
    ) {
        return;
    }

    const player =
        currentPlayerKey();

    if (
        !canMoveToken(
            player,
            tokenIndex
        )
    ) {
        return;
    }

    state.moving =
        true;

    const roll =
        state.dice;

    let progress =
        state.tokens[player][tokenIndex];

    /*
     * Yard -> start cell.
     */
    if (progress === -1) {

        state.tokens[player][tokenIndex] =
            0;

        renderTokens();

        const token =
            tokenElements.get(
                `${player}-${tokenIndex}`
            );

        if (token) {

            token.classList.add(
                "jumping"
            );

            setTimeout(() => {
                token.classList.remove(
                    "jumping"
                );
            }, 300);

        }

        await sleep(320);

    }

    else {

        /*
         * Move one cell at a time.
         */
        for (
            let step = 1;
            step <= roll;
            step++
        ) {

            progress++;

            state.tokens[player][tokenIndex] =
                progress;

            renderTokens();

            const token =
                tokenElements.get(
                    `${player}-${tokenIndex}`
                );

            if (token) {

                /*
                 * Restart jump animation.
                 */
                token.classList.remove(
                    "jumping"
                );

                void token.offsetWidth;

                token.classList.add(
                    "jumping"
                );

            }

            await sleep(260);

        }

    }


    /*
     * Capture after reaching destination.
     */
    const finalProgress =
        state.tokens[player][tokenIndex];

    const captured =
        captureOpponents(
            player,
            finalProgress
        );

    renderTokens();


    /*
     * Check winner.
     */
    const finishedCount =
        state.tokens[player]
            .filter(isFinished)
            .length;

    if (finishedCount === 4) {

        state.winner =
            player;

        state.dice =
            0;

        state.moving =
            false;

        updatePlayerUI();
        updateDiceUI();
        renderTokens();

        showWinner(player);

        return;

    }


    /*
     * Six or capture = another turn.
     */
    const extraTurn =
        roll === 6 ||
        captured;

    state.dice =
        0;

    state.moving =
        false;

    if (!extraTurn) {

        nextPlayer();

    }

    updatePlayerUI();
    updateDiceUI();
    renderTokens();

}


/* =========================================================
   TOKEN CLICK HANDLER
========================================================= */

tokenLayer.addEventListener(
    "click",
    event => {

        const token =
            event.target.closest(".token");

        if (!token) {
            return;
        }

        const player =
            token.dataset.player;

        const tokenIndex =
            Number(
                token.dataset.token
            );

        /*
         * Only active player's pawn.
         */
        if (
            player !== currentPlayerKey()
        ) {
            return;
        }

        moveToken(tokenIndex);

    }
);


/* =========================================================
   TURN
========================================================= */

function nextPlayer() {

    state.currentPlayer =
        (
            state.currentPlayer + 1
        ) % PLAYER_ORDER.length;

}


/* =========================================================
   NEW GAME
========================================================= */

function newGame() {

    state.currentPlayer = 0;

    state.dice = 0;

    state.rolling = false;

    state.moving = false;

    state.winner = null;

    for (const player of PLAYER_ORDER) {

        state.tokens[player] =
            [-1, -1, -1, -1];

    }

    hideWinner();

    setDiceFace(1);

    updatePlayerUI();
    updateDiceUI();
    renderTokens();

}


/* =========================================================
   WINNER
========================================================= */

function showWinner(player) {

    winnerTitle.textContent =
        `${PLAYERS[player].name} Wins!`;

    winnerMessage.textContent =
        "All four pawns reached home. Congratulations!";

    winnerModal.classList.remove(
        "hidden"
    );

}


function hideWinner() {

    winnerModal.classList.add(
        "hidden"
    );

}


/* =========================================================
   SETTINGS
========================================================= */

function loadSettings() {

    const theme =
        localStorage.getItem(
            "ludo-theme"
        ) || "midnight";

    let boardFollow =
        localStorage.getItem(
            "ludo-board-theme"
        );

    if (boardFollow === null) {
        boardFollow = "false";
    }

    applyTheme(theme);

    /*
     * Board follows theme is only meaningful
     * on Midnight.
     */
    if (theme === "light") {

        boardThemeToggle.checked =
            false;

        boardThemeToggle.disabled =
            true;

        document.body.dataset.boardFollow =
            "false";

    }

    else {

        boardThemeToggle.disabled =
            false;

        boardThemeToggle.checked =
            boardFollow === "true";

        document.body.dataset.boardFollow =
            boardFollow;

    }

    updateThemeButtons();

}


function applyTheme(theme) {

    if (
        theme !== "light" &&
        theme !== "midnight"
    ) {
        theme = "midnight";
    }

    document.body.dataset.theme =
        theme;

    localStorage.setItem(
        "ludo-theme",
        theme
    );

    /*
     * Light theme cannot use board-follow.
     */
    if (theme === "light") {

        boardThemeToggle.checked =
            false;

        boardThemeToggle.disabled =
            true;

        document.body.dataset.boardFollow =
            "false";

        boardThemeHint.textContent =
            "Disabled in Light theme";

    }

    else {

        boardThemeToggle.disabled =
            false;

        boardThemeHint.textContent =
            "Use Midnight colors on the board";

        document.body.dataset.boardFollow =
            boardThemeToggle.checked
                ? "true"
                : "false";

    }

    updateThemeButtons();

}


function updateThemeButtons() {

    const current =
        document.body.dataset.theme;

    document
        .querySelectorAll(
            "[data-theme-choice]"
        )
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.themeChoice === current
            );

        });

}


/* Theme buttons */

document
    .querySelectorAll(
        "[data-theme-choice]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                applyTheme(
                    button.dataset.themeChoice
                );

            }
        );

    });


/* Board theme toggle */

boardThemeToggle.addEventListener(
    "change",
    () => {

        if (
            document.body.dataset.theme ===
            "light"
        ) {

            boardThemeToggle.checked =
                false;

            return;

        }

        const value =
            boardThemeToggle.checked;

        document.body.dataset.boardFollow =
            value
                ? "true"
                : "false";

        localStorage.setItem(
            "ludo-board-theme",
            String(value)
        );

    }
);


/* =========================================================
   SETTINGS MENU
========================================================= */

settingsButton.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        const open =
            settingsMenu.classList.toggle(
                "open"
            );

        settingsButton.setAttribute(
            "aria-expanded",
            String(open)
        );

    }
);


settingsMenu.addEventListener(
    "click",
    event => {

        event.stopPropagation();

    }
);


document.addEventListener(
    "click",
    () => {

        settingsMenu.classList.remove(
            "open"
        );

        settingsButton.setAttribute(
            "aria-expanded",
            "false"
        );

    }
);


/* =========================================================
   BUTTONS
========================================================= */

diceButton.addEventListener(
    "click",
    rollDice
);


restartButton.addEventListener(
    "click",
    () => {

        newGame();

        settingsMenu.classList.remove(
            "open"
        );

    }
);


modalRestart.addEventListener(
    "click",
    newGame
);


/* =========================================================
   FOOTER
========================================================= */

donateButton.addEventListener(
    "click",
    () => {

        /*
         * Replace this with your donation URL.
         */
        alert(
            "Add your donation link here."
        );

    }
);


downloadButton.addEventListener(
    "click",
    () => {

        /*
         * Basic download of the current page.
         *
         * Replace with your GitHub release/download
         * URL if you publish a packaged version.
         */
        alert(
            "Add your download link here."
        );

    }
);


shareButton.addEventListener(
    "click",
    async () => {

        const shareData = {

            title: "Ludo — Classic Offline Game",

            text:
                "Play this classic offline Ludo game.",

            url:
                window.location.href

        };

        try {

            if (
                navigator.share
            ) {

                await navigator.share(
                    shareData
                );

            }

            else {

                await navigator.clipboard.writeText(
                    window.location.href
                );

                alert(
                    "Game link copied!"
                );

            }

        }

        catch (error) {

            /*
             * User cancelled sharing.
             */
            console.log(
                "Share cancelled."
            );

        }

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

buildBoard();

loadSettings();

setDiceFace(1);

newGame();
