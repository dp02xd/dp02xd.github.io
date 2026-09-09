"use strict";

/* ============================================================
   LUDO GAME
   Classic offline implementation
============================================================ */


/* ============================================================
   PLAYER DEFINITIONS
============================================================ */

/*
    IMPORTANT:

    Starts have been moved one square forward:

    Red    0 -> 1
    Green 13 -> 14
    Yellow26 -> 27
    Blue  39 -> 40

    These positions also correctly line up with the corresponding
    colored home lanes.
*/

const PLAYERS = {

    red: {
        name: "Red",
        color: "#ef4444",

        start: 1,

        lane: [
            [7, 1],
            [7, 2],
            [7, 3],
            [7, 4],
            [7, 5]
        ],

        /*
            Coordinates are CENTER positions in a 15x15 board.

            The white yard circles are positioned at:
            1.5 / 4.5 on their respective axes.
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
        color: "#22c55e",

        start: 14,

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
        color: "#facc15",

        start: 27,

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
        color: "#3b82f6",

        start: 40,

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


/* ============================================================
   MAIN TRACK
============================================================ */

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


/* ============================================================
   SAFE CELLS
============================================================ */

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


/* ============================================================
   STATE
============================================================ */

const state = {

    currentPlayer: 0,

    dice: 0,

    rolling: false,

    moving: false,

    winner: null,

    tokens: {

        red: [-1, -1, -1, -1],

        green: [-1, -1, -1, -1],

        yellow: [-1, -1, -1, -1],

        blue: [-1, -1, -1, -1]

    }

};


/* ============================================================
   DOM
============================================================ */

const board = document.getElementById("board");
const boardGrid = document.getElementById("boardGrid");
const tokenLayer = document.getElementById("tokenLayer");

const diceButton = document.getElementById("diceButton");
const diceFace = document.getElementById("diceFace");
const diceStatus = document.getElementById("diceStatus");
const diceHint = document.getElementById("diceHint");
const dicePointer = document.getElementById("dicePointer");
const diceArea = document.getElementById("diceArea");

const playersList = document.getElementById("playersList");

const settingsButton = document.getElementById("settingsButton");
const settingsMenu = document.getElementById("settingsMenu");
const closeSettings = document.getElementById("closeSettings");

const boardThemeOption = document.getElementById("boardThemeOption");
const boardThemeToggle = document.getElementById("boardThemeToggle");

const restartGameButton = document.getElementById("restartGame");

const winnerModal = document.getElementById("winnerModal");
const winnerTitle = document.getElementById("winnerTitle");
const winnerText = document.getElementById("winnerText");
const winnerRestart = document.getElementById("winnerRestart");

const themeButtons =
    document.querySelectorAll("[data-theme-option]");

const donateButton =
    document.getElementById("donateButton");

const downloadButton =
    document.getElementById("downloadButton");

const shareButton =
    document.getElementById("shareButton");


/* ============================================================
   TOKEN DOM CACHE
============================================================ */

const tokenElements = {};


/* ============================================================
   HELPERS
============================================================ */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function currentPlayerKey() {
    return PLAYER_ORDER[state.currentPlayer];
}


function currentPlayer() {
    return PLAYERS[currentPlayerKey()];
}


/* ============================================================
   BUILD BOARD
============================================================ */

function buildBoard() {

    boardGrid.innerHTML = "";

    const trackMap = new Map();

    TRACK.forEach((position, index) => {

        const key = `${position[0]},${position[1]}`;

        trackMap.set(key, index);

    });


    for (let row = 0; row < 15; row++) {

        for (let col = 0; col < 15; col++) {

            const cell = document.createElement("div");

            cell.className = "board-cell";

            const key = `${row},${col}`;

            const trackIndex = trackMap.get(key);

            if (trackIndex !== undefined) {

                cell.classList.add("track");

                if (SAFE_CELLS.has(trackIndex)) {

                    cell.classList.add("safe");

                    const star =
                        document.createElement("span");

                    star.className = "cell-star";
                    star.textContent = "★";

                    cell.appendChild(star);
                }


                const startOwner =
                    PLAYER_ORDER.find(
                        player =>
                            PLAYERS[player].start === trackIndex
                    );


                if (startOwner) {

                    cell.classList.add("start");

                    cell.style.setProperty(
                        "--player-color",
                        PLAYERS[startOwner].color
                    );

                    /*
                        Start box is intentionally separate from
                        the normal safe-star system.
                    */

                }

            }


            /*
                Colored home lanes.
            */

            if (
                row === 7 &&
                col >= 1 &&
                col <= 5
            ) {

                cell.classList.add(
                    "lane",
                    "lane-red"
                );

            }


            if (
                col === 7 &&
                row >= 1 &&
                row <= 5
            ) {

                cell.classList.add(
                    "lane",
                    "lane-green"
                );

            }


            if (
                row === 7 &&
                col >= 9 &&
                col <= 13
            ) {

                cell.classList.add(
                    "lane",
                    "lane-yellow"
                );

            }


            if (
                col === 7 &&
                row >= 9 &&
                row <= 13
            ) {

                cell.classList.add(
                    "lane",
                    "lane-blue"
                );

            }


            boardGrid.appendChild(cell);

        }

    }


    /*
        Home exit arrows.
    */

    addExitArrow("exit-red", "→");
    addExitArrow("exit-green", "→");
    addExitArrow("exit-yellow", "→");
    addExitArrow("exit-blue", "→");

}


function addExitArrow(className, symbol) {

    const existing =
        board.querySelector(`.${className}`);

    if (existing) {
        existing.remove();
    }

    const arrow =
        document.createElement("div");

    arrow.className =
        `home-exit-arrow ${className}`;

    arrow.textContent = symbol;

    board.appendChild(arrow);

}


/* ============================================================
   TOKEN COORDINATES
============================================================ */

/*
    Progress:

    -1      = yard
     0-51   = main track
     52-56  = colored home lane
     57     = finished / center
*/

function getTokenCoordinates(playerKey, progress, tokenIndex) {

    const player = PLAYERS[playerKey];


    /*
        Yard
    */

    if (progress === -1) {

        const point =
            player.yard[tokenIndex];

        return {
            row: point[0],
            col: point[1]
        };

    }


    /*
        Main track
    */

    if (progress >= 0 && progress <= 51) {

        const trackIndex =
            (player.start + progress) % 52;

        const point =
            TRACK[trackIndex];

        return {
            row: point[0] + 0.5,
            col: point[1] + 0.5
        };

    }


    /*
        Colored home lane
    */

    if (progress >= 52 && progress <= 56) {

        const laneIndex =
            progress - 52;

        const point =
            player.lane[laneIndex];

        return {
            row: point[0] + 0.5,
            col: point[1] + 0.5
        };

    }


    /*
        Finished token.
    */

    return {
        row: 7.5,
        col: 7.5
    };

}


/* ============================================================
   TOKEN POSITION
============================================================ */

function applyTokenPosition(
    token,
    coordinates
) {

    token.style.left =
        `${(coordinates.col / 15) * 100}%`;

    token.style.top =
        `${(coordinates.row / 15) * 100}%`;

}


/* ============================================================
   CREATE TOKEN
============================================================ */

function createToken(playerKey, tokenIndex) {

    const token =
        document.createElement("button");

    token.type = "button";

    token.className =
        `token ${playerKey}`;

    token.dataset.player =
        playerKey;

    token.dataset.token =
        tokenIndex;

    token.setAttribute(
        "aria-label",
        `${PLAYERS[playerKey].name} pawn ${tokenIndex + 1}`
    );

    tokenElements[
        `${playerKey}-${tokenIndex}`
    ] = token;

    tokenLayer.appendChild(token);

    return token;

}


/* ============================================================
   RENDER TOKENS
============================================================ */

function renderTokens(
    jumpingKey = null
) {

    PLAYER_ORDER.forEach(playerKey => {

        state.tokens[playerKey].forEach(
            (progress, tokenIndex) => {

                const key =
                    `${playerKey}-${tokenIndex}`;

                let token =
                    tokenElements[key];


                if (!token) {

                    token =
                        createToken(
                            playerKey,
                            tokenIndex
                        );

                }


                const coordinates =
                    getTokenCoordinates(
                        playerKey,
                        progress,
                        tokenIndex
                    );


                applyTokenPosition(
                    token,
                    coordinates
                );


                const movable =
                    playerKey === currentPlayerKey() &&
                    state.dice > 0 &&
                    !state.rolling &&
                    !state.moving &&
                    canMoveToken(
                        playerKey,
                        tokenIndex,
                        state.dice
                    );


                token.classList.toggle(
                    "movable",
                    movable
                );


                if (
                    jumpingKey === key
                ) {

                    /*
                        Restart jump animation each step.
                    */

                    token.classList.remove(
                        "jumping"
                    );

                    void token.offsetWidth;

                    token.classList.add(
                        "jumping"
                    );

                }

            }
        );

    });

}


/* ============================================================
   PLAYER UI
============================================================ */

function renderPlayers() {

    playersList.innerHTML = "";

    PLAYER_ORDER.forEach(playerKey => {

        const player =
            PLAYERS[playerKey];

        const progressList =
            state.tokens[playerKey];

        const finished =
            progressList.filter(
                value => value === 57
            ).length;

        const active =
            playerKey === currentPlayerKey();


        const card =
            document.createElement("div");

        card.className =
            "player-card";

        if (active) {
            card.classList.add("active");
        }

        card.style.setProperty(
            "--player-color",
            player.color
        );


        const color =
            document.createElement("span");

        color.className =
            "player-color";


        const info =
            document.createElement("div");

        const name =
            document.createElement("div");

        name.className =
            "player-name";

        name.textContent =
            player.name;


        const progress =
            document.createElement("div");

        progress.className =
            "player-progress";

        progress.textContent =
            `${finished}/4 finished`;


        info.appendChild(name);
        info.appendChild(progress);


        const badge =
            document.createElement("span");

        badge.className =
            "player-badge";

        if (active) {

            badge.textContent =
                "TURN";

        } else {

            badge.textContent =
                finished;

            badge.classList.add(
                "finished"
            );

        }


        card.appendChild(color);
        card.appendChild(info);
        card.appendChild(badge);

        playersList.appendChild(card);

    });

}


/* ============================================================
   CAN MOVE
============================================================ */

function canMoveToken(
    playerKey,
    tokenIndex,
    dice
) {

    const progress =
        state.tokens[playerKey][tokenIndex];


    /*
        Finished token cannot move.
    */

    if (progress === 57) {
        return false;
    }


    /*
        Yard requires a six.
    */

    if (progress === -1) {
        return dice === 6;
    }


    /*
        Exact finish required.
    */

    return progress + dice <= 57;

}


/* ============================================================
   LEGAL MOVES
============================================================ */

function getLegalTokens(
    playerKey,
    dice
) {

    const legal = [];

    state.tokens[playerKey].forEach(
        (_, index) => {

            if (
                canMoveToken(
                    playerKey,
                    index,
                    dice
                )
            ) {

                legal.push(index);

            }

        }
    );

    return legal;

}


/* ============================================================
   GLOBAL TRACK POSITION
============================================================ */

function getGlobalTrackIndex(
    playerKey,
    progress
) {

    if (
        progress < 0 ||
        progress > 51
    ) {
        return null;
    }

    return (
        PLAYERS[playerKey].start +
        progress
    ) % 52;

}


/* ============================================================
   CAPTURE
============================================================ */

function captureOpponents(
    playerKey,
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
            playerKey,
            progress
        );


    /*
        Safe cells cannot be captured.
    */

    if (
        SAFE_CELLS.has(globalIndex)
    ) {

        return false;

    }


    let captured = false;


    PLAYER_ORDER.forEach(
        opponentKey => {

            if (
                opponentKey === playerKey
            ) {
                return;
            }


            state.tokens[
                opponentKey
            ].forEach(
                (opponentProgress, index) => {

                    if (
                        opponentProgress >= 0 &&
                        opponentProgress <= 51
                    ) {

                        const opponentGlobal =
                            getGlobalTrackIndex(
                                opponentKey,
                                opponentProgress
                            );


                        if (
                            opponentGlobal ===
                            globalIndex
                        ) {

                            state.tokens[
                                opponentKey
                            ][index] = -1;

                            captured = true;

                        }

                    }

                }
            );

        }
    );


    return captured;

}


/* ============================================================
   MOVE TOKEN
============================================================ */

async function moveToken(
    playerKey,
    tokenIndex
) {

    if (
        state.moving ||
        state.rolling ||
        state.winner
    ) {
        return;
    }


    if (
        playerKey !== currentPlayerKey()
    ) {
        return;
    }


    const dice =
        state.dice;


    if (
        dice < 1 ||
        !canMoveToken(
            playerKey,
            tokenIndex,
            dice
        )
    ) {

        return;

    }


    state.moving = true;

    dicePointer.classList.add(
        "hidden"
    );


    const oldProgress =
        state.tokens[playerKey][tokenIndex];


    let newProgress;


    /*
        Pawn leaving yard.
    */

    if (oldProgress === -1) {

        newProgress = 0;

    } else {

        newProgress =
            oldProgress + dice;

    }


    /*
        Move one square at a time.

        This creates the visible jump to each
        next box rather than teleporting.
    */

    if (oldProgress === -1) {

        state.tokens[
            playerKey
        ][tokenIndex] = 0;


        renderTokens(
            `${playerKey}-${tokenIndex}`
        );

        await sleep(300);

    } else {

        for (
            let step = oldProgress + 1;
            step <= newProgress;
            step++
        ) {

            state.tokens[
                playerKey
            ][tokenIndex] = step;


            renderTokens(
                `${playerKey}-${tokenIndex}`
            );


            /*
                Wait long enough for the jump to
                be visible before moving to the next
                cell.
            */

            await sleep(145);

        }

    }


    /*
        Capture after landing.
    */

    const captured =
        captureOpponents(
            playerKey,
            newProgress
        );


    renderTokens();


    /*
        Check winner.
    */

    const won =
        state.tokens[playerKey]
            .every(
                value => value === 57
            );


    if (won) {

        state.winner =
            playerKey;

        state.dice = 0;

        state.moving = false;

        updateInterface();

        showWinner(
            playerKey
        );

        return;

    }


    /*
        Six OR capture = extra turn.
    */

    const extraTurn =
        dice === 6 ||
        captured;


    state.dice = 0;

    state.moving = false;


    if (extraTurn) {

        setDiceMessage(
            captured
                ? `${PLAYERS[playerKey].name} captured a pawn!`
                : `${PLAYERS[playerKey].name} rolled a 6!`,
            "Roll again."
        );

    } else {

        nextPlayer();

    }


    updateInterface();

}


/* ============================================================
   NEXT PLAYER
============================================================ */

function nextPlayer() {

    state.currentPlayer =
        (
            state.currentPlayer + 1
        ) % PLAYER_ORDER.length;

    state.dice = 0;

    renderTokens();

}


/* ============================================================
   DICE FACE
============================================================ */

const DICE_POSITIONS = {

    1: [5],

    2: [1, 9],

    3: [1, 5, 9],

    4: [1, 3, 7, 9],

    5: [1, 3, 5, 7, 9],

    6: [1, 3, 4, 6, 7, 9]

};


function setDiceFace(value) {

    const positions =
        DICE_POSITIONS[value] || [];

    const dots =
        diceFace.querySelectorAll(
            ".dice-dot"
        );


    dots.forEach(
        (dot, index) => {

            dot.classList.toggle(
                "show",
                positions.includes(index + 1)
            );

        }
    );

}


/* ============================================================
   ROLL DICE
============================================================ */

async function rollDice() {

    if (
        state.rolling ||
        state.moving ||
        state.winner ||
        state.dice !== 0
    ) {

        return;

    }


    state.rolling = true;

    dicePointer.classList.add(
        "hidden"
    );

    diceButton.classList.add(
        "rolling"
    );

    diceButton.disabled = true;


    /*
        Dice animation.
    */

    for (
        let i = 0;
        i < 9;
        i++
    ) {

        const random =
            Math.floor(
                Math.random() * 6
            ) + 1;

        setDiceFace(random);

        await sleep(65);

    }


    const result =
        Math.floor(
            Math.random() * 6
        ) + 1;


    state.dice = result;

    state.rolling = false;

    diceButton.classList.remove(
        "rolling"
    );


    setDiceFace(result);


    const legal =
        getLegalTokens(
            currentPlayerKey(),
            result
        );


    if (legal.length === 0) {

        /*
            No pawn can move.
        */

        setDiceMessage(
            `${currentPlayer().name} rolled ${result}.`,
            "No legal move."
        );


        renderTokens();


        /*
            A six still gives another turn.
        */

        setTimeout(
            () => {

                if (state.winner) {
                    return;
                }


                if (result === 6) {

                    state.dice = 0;

                    updateInterface();

                } else {

                    nextPlayer();

                    updateInterface();

                }

            },
            850
        );


        return;

    }


    setDiceMessage(
        `${currentPlayer().name} rolled ${result}.`,
        legal.length === 1
            ? "Choose the glowing pawn."
            : "Choose a glowing pawn."
    );


    renderTokens();

    updateInterface();

}


/* ============================================================
   DICE MESSAGE
============================================================ */

function setDiceMessage(
    status,
    hint
) {

    diceStatus.textContent =
        status;

    diceHint.textContent =
        hint;

}


/* ============================================================
   INTERFACE
============================================================ */

function updateInterface() {

    const player =
        currentPlayer();


    /*
        Player cards.
    */

    renderPlayers();


    /*
        Dice state.
    */

    if (state.winner) {

        diceStatus.textContent =
            `${PLAYERS[state.winner].name} wins!`;

        diceHint.textContent =
            "Start a new game to play again.";

        diceButton.disabled = true;

        dicePointer.classList.add(
            "hidden"
        );

        return;

    }


    if (state.moving) {

        diceStatus.textContent =
            "Moving pawn…";

        diceHint.textContent =
            "Watch the pawn jump to each square.";

        diceButton.disabled = true;

        dicePointer.classList.add(
            "hidden"
        );

        return;

    }


    if (state.rolling) {

        diceStatus.textContent =
            "Rolling…";

        diceHint.textContent =
            "Good luck!";

        diceButton.disabled = true;

        dicePointer.classList.add(
            "hidden"
        );

        return;

    }


    if (state.dice > 0) {

        diceStatus.textContent =
            `${player.name} rolled ${state.dice}.`;

        diceHint.textContent =
            "Choose a glowing pawn.";

        diceButton.disabled = true;

        dicePointer.classList.add(
            "hidden"
        );

        return;

    }


    diceStatus.textContent =
        `${player.name}'s turn`;

    diceHint.textContent =
        "Roll the dice to start your turn.";

    diceButton.disabled = false;

    dicePointer.classList.remove(
        "hidden"
    );


    /*
        Color the dice status according to player.
    */

    diceArea.style.setProperty(
        "--player-color",
        player.color
    );

}


/* ============================================================
   TOKEN CLICK HANDLER
============================================================ */

tokenLayer.addEventListener(
    "click",
    event => {

        const token =
            event.target.closest(
                ".token"
            );


        if (!token) {
            return;
        }


        const playerKey =
            token.dataset.player;

        const tokenIndex =
            Number(
                token.dataset.token
            );


        if (
            playerKey !==
            currentPlayerKey()
        ) {

            return;

        }


        if (
            state.dice <= 0 ||
            state.moving ||
            state.rolling
        ) {

            return;

        }


        if (
            !canMoveToken(
                playerKey,
                tokenIndex,
                state.dice
            )
        ) {

            return;

        }


        moveToken(
            playerKey,
            tokenIndex
        );

    }
);


/* ============================================================
   DICE CLICK
============================================================ */

diceButton.addEventListener(
    "click",
    rollDice
);


/* ============================================================
   NEW GAME
============================================================ */

function newGame() {

    state.currentPlayer = 0;

    state.dice = 0;

    state.rolling = false;

    state.moving = false;

    state.winner = null;


    PLAYER_ORDER.forEach(
        playerKey => {

            state.tokens[playerKey] =
                [-1, -1, -1, -1];

        }
    );


    hideWinner();

    setDiceFace(1);

    renderTokens();

    updateInterface();

}


/* ============================================================
   WINNER
============================================================ */

function showWinner(playerKey) {

    const player =
        PLAYERS[playerKey];


    winnerTitle.textContent =
        `${player.name} Wins!`;

    winnerText.textContent =
        "All four pawns reached the center.";


    winnerModal.classList.remove(
        "hidden"
    );

    winnerModal.setAttribute(
        "aria-hidden",
        "false"
    );

}


function hideWinner() {

    winnerModal.classList.add(
        "hidden"
    );

    winnerModal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* ============================================================
   SETTINGS
============================================================ */

function openSettings() {

    settingsMenu.hidden = false;

    settingsButton.setAttribute(
        "aria-expanded",
        "true"
    );

}


function closeSettingsMenu() {

    settingsMenu.hidden = true;

    settingsButton.setAttribute(
        "aria-expanded",
        "false"
    );

}


settingsButton.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        if (settingsMenu.hidden) {

            openSettings();

        } else {

            closeSettingsMenu();

        }

    }
);


closeSettings.addEventListener(
    "click",
    closeSettingsMenu
);


document.addEventListener(
    "click",
    event => {

        if (
            !settingsMenu.contains(event.target) &&
            !settingsButton.contains(event.target)
        ) {

            closeSettingsMenu();

        }

    }
);


/* ============================================================
   THEME
============================================================ */

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


    themeButtons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.themeOption ===
                theme
            );

        }
    );


    /*
        The board-follow toggle is ONLY available
        in Midnight mode.
    */

    if (theme === "midnight") {

        boardThemeOption.classList.remove(
            "disabled"
        );

        boardThemeToggle.disabled =
            false;

    } else {

        boardThemeOption.classList.add(
            "disabled"
        );

        boardThemeToggle.disabled =
            true;

        /*
            White theme always uses the classic board.
        */

        boardThemeToggle.checked =
            false;

        document.body.dataset.boardFollow =
            "false";

        localStorage.setItem(
            "ludo-board-theme",
            "false"
        );

    }


    /*
        If switching back to Midnight,
        restore the saved board-follow choice.
    */

    if (theme === "midnight") {

        const saved =
            localStorage.getItem(
                "ludo-board-theme"
            );

        const enabled =
            saved === "true";

        boardThemeToggle.checked =
            enabled;

        document.body.dataset.boardFollow =
            enabled
                ? "true"
                : "false";

    }

}


themeButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                applyTheme(
                    button.dataset.themeOption
                );

            }
        );

    }
);


/* ============================================================
   BOARD THEME TOGGLE
============================================================ */

boardThemeToggle.addEventListener(
    "change",
    () => {

        /*
            Safety check:
            this option should only work in Midnight.
        */

        if (
            document.body.dataset.theme !==
            "midnight"
        ) {

            boardThemeToggle.checked =
                false;

            return;

        }


        const enabled =
            boardThemeToggle.checked;


        document.body.dataset.boardFollow =
            enabled
                ? "true"
                : "false";


        localStorage.setItem(
            "ludo-board-theme",
            String(enabled)
        );

    }
);


/* ============================================================
   RESTART
============================================================ */

restartGameButton.addEventListener(
    "click",
    () => {

        newGame();

        closeSettingsMenu();

    }
);


winnerRestart.addEventListener(
    "click",
    newGame
);


/* ============================================================
   FOOTER - DONATE
============================================================ */

donateButton.addEventListener(
    "click",
    () => {

        /*
            Replace this with your real donation URL.

            Example:
            window.open(
                "https://your-donation-link.example",
                "_blank",
                "noopener"
            );
        */

        alert(
            "Add your donation link in js/game.js."
        );

    }
);


/* ============================================================
   FOOTER - DOWNLOAD
============================================================ */

downloadButton.addEventListener(
    "click",
    () => {

        /*
            Downloads the current game page.

            For a GitHub Pages project, you can later
            replace this with a ZIP/release link.
        */

        const html =
            "<!DOCTYPE html>\n" +
            document.documentElement.outerHTML;


        const blob =
            new Blob(
                [html],
                {
                    type: "text/html"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            "ludo.html";

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);

    }
);


/* ============================================================
   FOOTER - SHARE
============================================================ */

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

                return;

            }


            await navigator.clipboard.writeText(
                window.location.href
            );


            alert(
                "Game link copied to clipboard!"
            );

        } catch (error) {

            /*
                User cancelled sharing or clipboard
                isn't available.
            */

        }

    }
);


/* ============================================================
   LOCAL STORAGE INITIALIZATION
============================================================ */

function loadSettings() {

    const savedTheme =
        localStorage.getItem(
            "ludo-theme"
        ) || "midnight";


    applyTheme(
        savedTheme
    );


    /*
        Make sure the board setting is correctly
        restored when starting directly in Midnight.
    */

    if (
        savedTheme === "midnight"
    ) {

        const boardSetting =
            localStorage.getItem(
                "ludo-board-theme"
            );


        const enabled =
            boardSetting === "true";


        boardThemeToggle.checked =
            enabled;

        document.body.dataset.boardFollow =
            enabled
                ? "true"
                : "false";

    }

}


/* ============================================================
   INITIALIZATION
============================================================ */

function init() {

    buildBoard();

    loadSettings();

    setDiceFace(1);

    renderTokens();

    updateInterface();

}


init();
