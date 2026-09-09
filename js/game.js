/* ================================================================
   LUDO GAME ENGINE
   Vanilla JavaScript
   ================================================================ */

"use strict";


/* ================================================================
   PLAYER DATA
   ================================================================ */

const PLAYERS = {

    red: {
        name: "Red",
        start: 0,
        color: "#ef4444",

        yard: [
            [10, 10],
            [10, 12.7],
            [12.7, 10],
            [12.7, 12.7]
        ]
    },

    green: {
        name: "Green",
        start: 13,
        color: "#22c55e",

        yard: [
            [2.3, 2.3],
            [2.3, 4.9],
            [4.9, 2.3],
            [4.9, 4.9]
        ]
    },

    yellow: {
        name: "Yellow",
        start: 26,
        color: "#facc15",

        yard: [
            [10, 10],
            [10, 12.7],
            [12.7, 10],
            [12.7, 12.7]
        ]
    },

    blue: {
        name: "Blue",
        start: 39,
        color: "#3b82f6",

        yard: [
            [2.3, 10],
            [2.3, 12.7],
            [4.9, 10],
            [4.9, 12.7]
        ]
    }

};

const PLAYER_ORDER = [
    "red",
    "green",
    "yellow",
    "blue"
];


/* ================================================================
   TRACK
   52 MAIN TRACK CELLS
   ================================================================ */

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


/* ================================================================
   HOME LANES
   ================================================================ */

const HOME_LANES = {

    red: [
        [7, 1],
        [7, 2],
        [7, 3],
        [7, 4],
        [7, 5]
    ],

    green: [
        [1, 7],
        [2, 7],
        [3, 7],
        [4, 7],
        [5, 7]
    ],

    yellow: [
        [7, 13],
        [7, 12],
        [7, 11],
        [7, 10],
        [7, 9]
    ],

    blue: [
        [13, 7],
        [12, 7],
        [11, 7],
        [10, 7],
        [9, 7]
    ]

};


/* ================================================================
   SAFE CELLS
   ================================================================ */

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


/* ================================================================
   GAME STATE
   ================================================================ */

let state = {

    currentPlayer: 0,

    dice: 0,

    rolling: false,

    awaitingMove: false,

    gameOver: false,

    tokens: {

        red: [-1, -1, -1, -1],

        green: [-1, -1, -1, -1],

        yellow: [-1, -1, -1, -1],

        blue: [-1, -1, -1, -1]

    }

};


/* ================================================================
   DOM
   ================================================================ */

const board =
    document.getElementById("board");

const boardGrid =
    document.getElementById("boardGrid");

const tokenLayer =
    document.getElementById("tokenLayer");

const diceButton =
    document.getElementById("diceButton");

const diceStatus =
    document.getElementById("diceStatus");

const diceHint =
    document.getElementById("diceHint");

const dicePointer =
    document.getElementById("dicePointer");

const playersList =
    document.getElementById("playersList");

const settingsButton =
    document.getElementById("settingsButton");

const settingsMenu =
    document.getElementById("settingsMenu");

const restartButton =
    document.getElementById("restartButton");

const footerNewGame =
    document.getElementById("footerNewGame");

const boardThemeToggle =
    document.getElementById("boardThemeToggle");

const winnerModal =
    document.getElementById("winnerModal");

const winnerTitle =
    document.getElementById("winnerTitle");

const winnerText =
    document.getElementById("winnerText");

const modalRestart =
    document.getElementById("modalRestart");


/* ================================================================
   DICE DOT MAP
   ================================================================ */

const DICE_MAP = {

    1: [5],

    2: [1, 9],

    3: [1, 5, 9],

    4: [1, 3, 7, 9],

    5: [1, 3, 5, 7, 9],

    6: [1, 3, 4, 6, 7, 9]

};


/* ================================================================
   CREATE BOARD
   ================================================================ */

function buildBoard() {

    boardGrid.innerHTML = "";

    for (let row = 0; row < 15; row++) {

        for (let col = 0; col < 15; col++) {

            const cell =
                document.createElement("div");

            cell.className = "board-cell";

            cell.dataset.row = row;
            cell.dataset.col = col;

            const trackIndex =
                TRACK.findIndex(
                    position =>
                        position[0] === row &&
                        position[1] === col
                );

            if (trackIndex !== -1) {

                cell.dataset.track =
                    trackIndex;

                if (SAFE_CELLS.has(trackIndex)) {

                    const star =
                        document.createElement("span");

                    star.className =
                        "safe-star";

                    star.textContent = "★";

                    cell.appendChild(star);

                }

            }

            boardGrid.appendChild(cell);

        }

    }


    /* ============================================================
       HOME LANES
    ============================================================ */

    Object.entries(HOME_LANES)
        .forEach(([color, cells]) => {

            cells.forEach(
                ([row, col], index) => {

                    const cell =
                        document.createElement("div");

                    cell.className =
                        `home-lane-cell ${color}`;

                    cell.style.left =
                        `${(col / 15) * 100}%`;

                    cell.style.top =
                        `${(row / 15) * 100}%`;

                    cell.style.width =
                        `${100 / 15}%`;

                    cell.style.height =
                        `${100 / 15}%`;

                    cell.dataset.lane =
                        `${color}-${index}`;

                    board.appendChild(cell);

                }
            );

        });


    /* ============================================================
       START COLORS
    ============================================================ */

    PLAYER_ORDER.forEach(player => {

        const start =
            PLAYERS[player].start;

        const [row, col] =
            TRACK[start];

        const cell =
            boardGrid.children[
                row * 15 + col
            ];

        if (cell) {

            cell.classList.add(
                "start-cell",
                player
            );

        }

    });

}


/* ================================================================
   TOKEN POSITION
   ================================================================ */

function getTokenPosition(
    player,
    tokenIndex
) {

    const progress =
        state.tokens[player][tokenIndex];


    /* ------------------------------------------------------------
       IN YARD
    ------------------------------------------------------------ */

    if (progress === -1) {

        const slot =
            PLAYERS[player].yard[tokenIndex];

        return {

            row: slot[0],

            col: slot[1]

        };

    }


    /* ------------------------------------------------------------
       FINISHED
    ------------------------------------------------------------ */

    if (progress === 57) {

        return {

            row: 7.5,

            col: 7.5

        };

    }


    /* ------------------------------------------------------------
       MAIN TRACK
    ------------------------------------------------------------ */

    if (
        progress >= 0 &&
        progress <= 51
    ) {

        const globalIndex =
            (
                PLAYERS[player].start +
                progress
            ) % 52;

        const [row, col] =
            TRACK[globalIndex];

        return {

            row: row + .5,

            col: col + .5

        };

    }


    /* ------------------------------------------------------------
       HOME LANE
    ------------------------------------------------------------ */

    if (
        progress >= 52 &&
        progress <= 56
    ) {

        const laneIndex =
            progress - 52;

        const [row, col] =
            HOME_LANES[player][laneIndex];

        return {

            row: row + .5,

            col: col + .5

        };

    }


    return {
        row: 7.5,
        col: 7.5
    };

}


/* ================================================================
   CREATE TOKENS
   ================================================================ */

function createTokens() {

    tokenLayer.innerHTML = "";

    PLAYER_ORDER.forEach(player => {

        for (
            let tokenIndex = 0;
            tokenIndex < 4;
            tokenIndex++
        ) {

            const token =
                document.createElement("div");

            token.className =
                `token ${player}`;

            token.dataset.player =
                player;

            token.dataset.token =
                tokenIndex;

            token.title =
                `${PLAYERS[player].name} pawn ${tokenIndex + 1}`;

            token.addEventListener(
                "click",
                () => {

                    if (
                        state.awaitingMove &&
                        PLAYER_ORDER[
                            state.currentPlayer
                        ] === player
                    ) {

                        const number =
                            Number(
                                token.dataset.token
                            );

                        if (
                            canMoveToken(
                                player,
                                number
                            )
                        ) {

                            moveToken(
                                player,
                                number
                            );

                        }

                    }

                }
            );

            tokenLayer.appendChild(token);

        }

    });

}


/* ================================================================
   RENDER TOKENS
   ================================================================ */

function renderTokens() {

    const tokens =
        tokenLayer.querySelectorAll(
            ".token"
        );

    tokens.forEach(token => {

        const player =
            token.dataset.player;

        const tokenIndex =
            Number(token.dataset.token);

        const position =
            getTokenPosition(
                player,
                tokenIndex
            );

        token.style.left =
            `${(position.col / 15) * 100}%`;

        token.style.top =
            `${(position.row / 15) * 100}%`;

        token.classList.remove(
            "movable"
        );

    });


    /* ============================================================
       HIGHLIGHT LEGAL TOKENS
    ============================================================ */

    if (
        state.awaitingMove &&
        state.dice > 0
    ) {

        const player =
            PLAYER_ORDER[
                state.currentPlayer
            ];

        for (
            let i = 0;
            i < 4;
            i++
        ) {

            if (
                canMoveToken(
                    player,
                    i
                )
            ) {

                const token =
                    tokenLayer.querySelector(
                        `.token[data-player="${player}"][data-token="${i}"]`
                    );

                if (token) {

                    token.classList.add(
                        "movable"
                    );

                }

            }

        }

    }

}


/* ================================================================
   CAN MOVE TOKEN
   ================================================================ */

function canMoveToken(
    player,
    tokenIndex
) {

    const progress =
        state.tokens[player][tokenIndex];

    const dice =
        state.dice;


    if (!dice) {
        return false;
    }


    /* Already finished */

    if (progress === 57) {
        return false;
    }


    /* In yard */

    if (progress === -1) {

        return dice === 6;

    }


    /* Normal movement */

    return progress + dice <= 57;

}


/* ================================================================
   LEGAL MOVES
   ================================================================ */

function getLegalMoves(player) {

    const moves = [];

    for (
        let i = 0;
        i < 4;
        i++
    ) {

        if (
            canMoveToken(
                player,
                i
            )
        ) {

            moves.push(i);

        }

    }

    return moves;

}


/* ================================================================
   ROLL DICE
   ================================================================ */

diceButton.addEventListener(
    "click",
    rollDice
);


function rollDice() {

    if (
        state.rolling ||
        state.awaitingMove ||
        state.gameOver
    ) {

        return;

    }

    state.rolling = true;

    dicePointer.style.opacity = "0";

    diceStatus.textContent =
        "Rolling";

    diceHint.textContent =
        "Rolling the dice…";

    diceButton.disabled = true;


    let count = 0;

    const interval =
        setInterval(
            () => {

                const random =
                    Math.floor(
                        Math.random() * 6
                    ) + 1;

                setDiceFace(
                    random
                );

                count++;

                if (count >= 8) {

                    clearInterval(
                        interval
                    );

                    const finalValue =
                        Math.floor(
                            Math.random() * 6
                        ) + 1;

                    setDiceFace(
                        finalValue
                    );

                    finishRoll(
                        finalValue
                    );

                }

            },
            75
        );

}


/* ================================================================
   FINISH ROLL
   ================================================================ */

function finishRoll(value) {

    state.rolling = false;

    state.dice = value;

    state.awaitingMove = true;

    diceButton.disabled = false;

    const player =
        PLAYER_ORDER[
            state.currentPlayer
        ];

    diceStatus.textContent =
        `${PLAYERS[player].name} rolled ${value}`;

    diceHint.textContent =
        getDiceHint(
            player,
            value
        );


    const legalMoves =
        getLegalMoves(player);


    /* ------------------------------------------------------------
       NO LEGAL MOVE
    ------------------------------------------------------------ */

    if (legalMoves.length === 0) {

        state.awaitingMove = false;

        diceHint.textContent =
            value === 6
                ? "No pawn can move. Roll again."
                : "No legal move. Next player.";

        setTimeout(
            () => {

                if (state.gameOver) {
                    return;
                }

                if (value === 6) {

                    resetForNextRoll();

                } else {

                    nextPlayer();

                }

            },
            900
        );

        return;

    }


    renderTokens();

}


/* ================================================================
   DICE HINT
   ================================================================ */

function getDiceHint(
    player,
    value
) {

    const legal =
        getLegalMoves(player);

    if (value === 6) {

        if (
            legal.some(
                index =>
                    state.tokens[player][index] === -1
            )
        ) {

            return "Choose a pawn to bring it onto the board.";

        }

        return "Great! Choose a pawn to move.";

    }

    if (legal.length === 1) {

        return "One pawn can move.";

    }

    return "Choose a highlighted pawn.";

}


/* ================================================================
   DICE FACE
   ================================================================ */

function setDiceFace(value) {

    const dots =
        diceButton.querySelectorAll(
            ".dot"
        );

    dots.forEach(dot => {

        dot.style.opacity = "0";

    });

    const activeDots =
        DICE_MAP[value] || [];

    activeDots.forEach(
        number => {

            const dot =
                diceButton.querySelector(
                    `.dot-${number}`
                );

            if (dot) {

                dot.style.opacity =
                    "1";

            }

        }
    );


    const player =
        PLAYER_ORDER[
            state.currentPlayer
        ];

    diceButton.classList.remove(
        "red",
        "green",
        "yellow",
        "blue"
    );

    diceButton.classList.add(
        player
    );

}


/* ================================================================
   MOVE TOKEN
   ================================================================ */

async function moveToken(
    player,
    tokenIndex
) {

    if (
        state.gameOver ||
        state.rolling ||
        !state.awaitingMove
    ) {

        return;

    }

    if (
        PLAYER_ORDER[
            state.currentPlayer
        ] !== player
    ) {

        return;

    }

    if (
        !canMoveToken(
            player,
            tokenIndex
        )
    ) {

        return;

    }


    state.awaitingMove = false;

    renderTokens();


    let progress =
        state.tokens[player][tokenIndex];

    const dice =
        state.dice;


    /* ------------------------------------------------------------
       LEAVE YARD
    ------------------------------------------------------------ */

    if (progress === -1) {

        state.tokens[player][tokenIndex] = 0;

        renderTokens();

        await delay(250);

    }

    else {

        for (
            let step = 0;
            step < dice;
            step++
        ) {

            progress++;

            state.tokens[player][tokenIndex] =
                progress;

            renderTokens();

            await delay(130);

        }

    }


    /* ------------------------------------------------------------
       CAPTURE
    ------------------------------------------------------------ */

    const captured =
        captureOpponents(
            player,
            tokenIndex
        );


    /* ------------------------------------------------------------
       WIN
    ------------------------------------------------------------ */

    if (
        checkWinner(player)
    ) {

        state.gameOver = true;

        renderTokens();

        showWinner(player);

        return;

    }


    /* ------------------------------------------------------------
       EXTRA TURN
    ------------------------------------------------------------ */

    if (
        dice === 6 ||
        captured
    ) {

        state.dice = 0;

        state.awaitingMove = false;

        diceStatus.textContent =
            `${PLAYERS[player].name}'s extra turn`;

        diceHint.textContent =
            captured
                ? "Captured a pawn! Roll again."
                : "You rolled a 6! Roll again.";

        dicePointer.style.opacity = "1";

        renderTokens();

        return;

    }


    /* ------------------------------------------------------------
       NEXT PLAYER
    ------------------------------------------------------------ */

    state.dice = 0;

    nextPlayer();

}


/* ================================================================
   CAPTURE OPPONENTS
   ================================================================ */

function captureOpponents(
    player,
    tokenIndex
) {

    const progress =
        state.tokens[player][tokenIndex];

    if (
        progress < 0 ||
        progress > 51
    ) {

        return false;

    }


    const landingCell =
        (
            PLAYERS[player].start +
            progress
        ) % 52;


    /* Safe cell */

    if (
        SAFE_CELLS.has(
            landingCell
        )
    ) {

        return false;

    }


    let captured = false;


    PLAYER_ORDER.forEach(
        opponent => {

            if (
                opponent === player
            ) {

                return;

            }


            for (
                let i = 0;
                i < 4;
                i++
            ) {

                const opponentProgress =
                    state.tokens[
                        opponent
                    ][i];


                if (
                    opponentProgress < 0 ||
                    opponentProgress > 51
                ) {

                    continue;

                }


                const opponentCell =
                    (
                        PLAYERS[
                            opponent
                        ].start +
                        opponentProgress
                    ) % 52;


                if (
                    opponentCell === landingCell
                ) {

                    state.tokens[
                        opponent
                    ][i] = -1;

                    captured = true;

                }

            }

        }
    );


    if (captured) {

        renderTokens();

    }


    return captured;

}


/* ================================================================
   WINNER
   ================================================================ */

function checkWinner(player) {

    return state.tokens[player]
        .every(
            progress =>
                progress === 57
        );

}


/* ================================================================
   NEXT PLAYER
   ================================================================ */

function nextPlayer() {

    state.currentPlayer =
        (
            state.currentPlayer + 1
        ) % PLAYER_ORDER.length;

    state.dice = 0;

    state.awaitingMove = false;

    const player =
        PLAYER_ORDER[
            state.currentPlayer
        ];

    updatePlayerUI();

    setDiceFace(1);

    diceStatus.textContent =
        "Ready";

    diceHint.textContent =
        `${PLAYERS[player].name}'s turn — roll the dice.`;

    dicePointer.style.opacity =
        "1";

    renderTokens();

}


/* ================================================================
   RESET FOR EXTRA TURN
   ================================================================ */

function resetForNextRoll() {

    state.dice = 0;

    state.awaitingMove = false;

    const player =
        PLAYER_ORDER[
            state.currentPlayer
        ];

    diceStatus.textContent =
        "Ready";

    diceHint.textContent =
        `${PLAYERS[player].name}'s turn — roll again.`;

    dicePointer.style.opacity =
        "1";

    renderTokens();

}


/* ================================================================
   UPDATE PLAYER UI
   ================================================================ */

function updatePlayerUI() {

    const player =
        PLAYER_ORDER[
            state.currentPlayer
        ];


    const cards =
        playersList.querySelectorAll(
            ".player-card"
        );


    cards.forEach(card => {

        const cardPlayer =
            card.dataset.player;

        card.classList.remove(
            "active"
        );

        card.style.removeProperty(
            "--player-color"
        );


        if (
            cardPlayer === player
        ) {

            card.classList.add(
                "active"
            );

            card.style.setProperty(
                "--player-color",
                PLAYERS[player].color
            );

        }

    });


    diceButton.classList.remove(
        "red",
        "green",
        "yellow",
        "blue"
    );

    diceButton.classList.add(
        player
    );

}


/* ================================================================
   UPDATE SCORES
   ================================================================ */

function updateScores() {

    PLAYER_ORDER.forEach(
        player => {

            const finished =
                state.tokens[player]
                    .filter(
                        progress =>
                            progress === 57
                    ).length;


            const card =
                playersList.querySelector(
                    `.player-card[data-player="${player}"]`
                );


            if (!card) {
                return;
            }


            const score =
                card.querySelector(
                    ".player-score"
                );


            if (score) {

                score.textContent =
                    `${finished}/4`;

            }


            const small =
                card.querySelector(
                    ".player-info small"
                );


            if (small) {

                small.textContent =
                    finished === 4
                        ? "Finished"
                        : `${4 - finished} pawns`;

            }

        }
    );

}


/* ================================================================
   RENDER ALL
   ================================================================ */

function render() {

    renderTokens();

    updatePlayerUI();

    updateScores();

}


/* ================================================================
   NEW GAME
   ================================================================ */

function newGame() {

    state = {

        currentPlayer: 0,

        dice: 0,

        rolling: false,

        awaitingMove: false,

        gameOver: false,

        tokens: {

            red: [-1, -1, -1, -1],

            green: [-1, -1, -1, -1],

            yellow: [-1, -1, -1, -1],

            blue: [-1, -1, -1, -1]

        }

    };


    hideWinner();

    setDiceFace(1);

    diceButton.disabled = false;

    dicePointer.style.opacity = "1";

    diceStatus.textContent =
        "Ready";

    diceHint.textContent =
        "Red's turn — roll the dice.";

    render();

}


/* ================================================================
   WINNER MODAL
   ================================================================ */

function showWinner(player) {

    winnerTitle.textContent =
        `${PLAYERS[player].name} Wins!`;

    winnerText.textContent =
        "All four pawns reached the center.";

    winnerModal.classList.remove(
        "hidden"
    );

}


function hideWinner() {

    winnerModal.classList.add(
        "hidden"
    );

}


modalRestart.addEventListener(
    "click",
    () => {

        newGame();

    }
);


/* ================================================================
   SETTINGS
   ================================================================ */

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

        settingsMenu.setAttribute(
            "aria-hidden",
            String(!open)
        );

    }
);


document.addEventListener(
    "click",
    event => {

        if (
            !settingsMenu.contains(event.target) &&
            !settingsButton.contains(event.target)
        ) {

            settingsMenu.classList.remove(
                "open"
            );

            settingsButton.setAttribute(
                "aria-expanded",
                "false"
            );

            settingsMenu.setAttribute(
                "aria-hidden",
                "true"
            );

        }

    }
);


/* ================================================================
   THEME
   ================================================================ */

const themeChoices =
    document.querySelectorAll(
        ".theme-choice"
    );


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


    themeChoices.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.themeChoice === theme
            );

        }
    );


    updateBoardTheme();

}


themeChoices.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                applyTheme(
                    button.dataset.themeChoice
                );

            }
        );

    }
);


/* ================================================================
   BOARD THEME
   ================================================================ */

function updateBoardTheme() {

    const follow =
        boardThemeToggle.checked;

    localStorage.setItem(
        "ludo-board-theme",
        follow
            ? "follow"
            : "classic"
    );


    if (!follow) {

        document.body.removeAttribute(
            "data-board-theme"
        );

        return;

    }


    document.body.dataset.boardTheme =
        document.body.dataset.theme;

}


boardThemeToggle.addEventListener(
    "change",
    updateBoardTheme
);


/* ================================================================
   LOAD SETTINGS
   ================================================================ */

function loadSettings() {

    const savedTheme =
        localStorage.getItem(
            "ludo-theme"
        ) || "midnight";

    const savedBoard =
        localStorage.getItem(
            "ludo-board-theme"
        );


    applyTheme(
        savedTheme
    );


    if (
        savedBoard === "classic"
    ) {

        boardThemeToggle.checked =
            false;

    } else {

        boardThemeToggle.checked =
            true;

    }


    updateBoardTheme();

}


/* ================================================================
   RESTART BUTTONS
   ================================================================ */

restartButton.addEventListener(
    "click",
    () => {

        newGame();

        settingsMenu.classList.remove(
            "open"
        );

    }
);


footerNewGame.addEventListener(
    "click",
    () => {

        newGame();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


/* ================================================================
   FOOTER LINKS
   ================================================================ */

const githubButton =
    document.getElementById(
        "githubButton"
    );

const sourceButton =
    document.getElementById(
        "sourceButton"
    );


/*
    Replace these later with your actual
    GitHub repository URLs.
*/

githubButton.href =
    "https://github.com/";

sourceButton.href =
    "https://github.com/";


/* ================================================================
   UTILITY
   ================================================================ */

function delay(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );

}


/* ================================================================
   INITIALIZE
   ================================================================ */

buildBoard();

createTokens();

loadSettings();

newGame();
