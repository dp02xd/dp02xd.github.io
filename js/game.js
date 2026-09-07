"use strict";

/*
=========================================================
 LUDO GAME ENGINE
 Vanilla JavaScript
=========================================================
*/


/* =====================================================
   PLAYER CONFIGURATION
===================================================== */

const PLAYERS = [

    {
        id: "red",
        name: "Red",
        start: 0,
        color: "#ef4444"
    },

    {
        id: "green",
        name: "Green",
        start: 13,
        color: "#22c55e"
    },

    {
        id: "yellow",
        name: "Yellow",
        start: 26,
        color: "#facc15"
    },

    {
        id: "blue",
        name: "Blue",
        start: 39,
        color: "#3b82f6"
    }

];


/* =====================================================
   52 CELL OUTER TRACK

   Coordinates use:
   [row, column]

   Board is 15 x 15.
===================================================== */

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


/* =====================================================
   HOME LANES

   Five cells before center.
===================================================== */

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


/* =====================================================
   YARD TOKEN POSITIONS

   Four token locations for each player.
===================================================== */

const YARDS = {

    red: [
        [1.8, 1.8],
        [1.8, 4.2],
        [4.2, 1.8],
        [4.2, 4.2]
    ],

    green: [
        [1.8, 10.8],
        [1.8, 13.2],
        [4.2, 10.8],
        [4.2, 13.2]
    ],

    yellow: [
        [10.8, 1.8],
        [10.8, 4.2],
        [13.2, 1.8],
        [13.2, 4.2]
    ],

    blue: [
        [10.8, 10.8],
        [10.8, 13.2],
        [13.2, 10.8],
        [13.2, 13.2]
    ]

};


/* =====================================================
   SAFE CELLS

   Standard Ludo safe positions.
===================================================== */

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


/* =====================================================
   GAME STATE

   token.position:

   -1 = yard

    0...51 = outer track

    52...56 = home lane

    57 = finished
===================================================== */

let game = {

    currentPlayer: 0,

    dice: null,

    waitingForToken: false,

    gameOver: false,

    players: PLAYERS.map(player => ({

        ...player,

        tokens: [
            { position: -1 },
            { position: -1 },
            { position: -1 },
            { position: -1 }
        ]

    }))

};


/* =====================================================
   DOM
===================================================== */

const board = document.getElementById("board");
const tokenLayer = document.getElementById("tokenLayer");

const diceButton = document.getElementById("diceBtn");
const diceText = document.getElementById("diceText");
const diceHint = document.getElementById("diceHint");

const turnText = document.getElementById("turnText");
const turnIndicator = document.getElementById("turnIndicator");

const message = document.getElementById("message");

const newGameButton = document.getElementById("newGameBtn");


/* =====================================================
   BOARD CREATION
===================================================== */

function createBoard() {

    board.innerHTML = "";

    for (let row = 0; row < 15; row++) {

        for (let col = 0; col < 15; col++) {

            const cell = document.createElement("div");

            cell.className = "cell";

            cell.dataset.row = row;
            cell.dataset.col = col;

            const trackIndex = TRACK.findIndex(
                ([r, c]) => r === row && c === col
            );

            /*
            Main track
            */

            if (trackIndex !== -1) {

                cell.classList.add("path");

                if (SAFE_CELLS.has(trackIndex)) {
                    cell.classList.add("safe");
                }

            }


            /*
            Yards
            */

            if (row <= 5 && col <= 5) {

                cell.classList.add("yard-red");

                if (
                    row >= 1 &&
                    row <= 4 &&
                    col >= 1 &&
                    col <= 4
                ) {
                    cell.classList.add("yard-inner-red");
                }

            }


            if (row <= 5 && col >= 9) {

                cell.classList.add("yard-green");

                if (
                    row >= 1 &&
                    row <= 4 &&
                    col >= 10 &&
                    col <= 13
                ) {
                    cell.classList.add("yard-inner-green");
                }

            }


            if (row >= 9 && col <= 5) {

                cell.classList.add("yard-yellow");

                if (
                    row >= 10 &&
                    row <= 13 &&
                    col >= 1 &&
                    col <= 4
                ) {
                    cell.classList.add("yard-inner-yellow");
                }

            }


            if (row >= 9 && col >= 9) {

                cell.classList.add("yard-blue");

                if (
                    row >= 10 &&
                    row <= 13 &&
                    col >= 10 &&
                    col <= 13
                ) {
                    cell.classList.add("yard-inner-blue");
                }

            }


            /*
            Home lanes
            */

            for (const player of PLAYERS) {

                const lane = HOME_LANES[player.id];

                if (
                    lane.some(
                        ([r, c]) =>
                            r === row &&
                            c === col
                    )
                ) {

                    cell.classList.add(`lane-${player.id}`);

                }

            }


            /*
            Starting cells
            */

            for (const player of PLAYERS) {

                const start = TRACK[player.start];

                if (
                    start[0] === row &&
                    start[1] === col
                ) {

                    cell.classList.add(`start-${player.id}`);

                    cell.classList.remove("safe");

                }

            }


            /*
            Center
            */

            if (
                row >= 6 &&
                row <= 8 &&
                col >= 6 &&
                col <= 8
            ) {

                cell.classList.add("center-cell");

            }


            board.appendChild(cell);

        }

    }

}


/* =====================================================
   TOKEN ELEMENT CREATION
===================================================== */

function createTokens() {

    tokenLayer.innerHTML = "";

    game.players.forEach((player, playerIndex) => {

        player.tokens.forEach((token, tokenIndex) => {

            const element = document.createElement("div");

            element.className = `token ${player.id}`;

            element.dataset.player = playerIndex;
            element.dataset.token = tokenIndex;

            element.addEventListener("click", () => {

                if (
                    playerIndex !== game.currentPlayer ||
                    !game.waitingForToken
                ) {
                    return;
                }

                selectToken(playerIndex, tokenIndex);

            });

            tokenLayer.appendChild(element);

        });

    });

    renderTokens();

}


/* =====================================================
   GET GLOBAL TRACK POSITION
===================================================== */

function getGlobalTrackPosition(player, position) {

    if (position < 0 || position > 51) {
        return null;
    }

    return (player.start + position) % 52;

}


/* =====================================================
   TOKEN COORDINATES
===================================================== */

function getTokenCoordinates(player, tokenIndex) {

    const token = player.tokens[tokenIndex];

    /*
    Token still in yard.
    */

    if (token.position === -1) {

        return YARDS[player.id][tokenIndex];

    }


    /*
    Token finished.
    */

    if (token.position === 57) {

        return [7.5, 7.5];

    }


    /*
    Main track.
    */

    if (
        token.position >= 0 &&
        token.position <= 51
    ) {

        const globalPosition =
            getGlobalTrackPosition(
                player,
                token.position
            );

        const [row, col] =
            TRACK[globalPosition];

        return [
            row + 0.5,
            col + 0.5
        ];

    }


    /*
    Home lane.
    */

    if (
        token.position >= 52 &&
        token.position <= 56
    ) {

        const lane =
            HOME_LANES[player.id];

        const index =
            token.position - 52;

        const [row, col] =
            lane[index];

        return [
            row + 0.5,
            col + 0.5
        ];

    }

    return [7.5, 7.5];

}


/* =====================================================
   RENDER TOKENS
===================================================== */

function renderTokens() {

    const elements =
        tokenLayer.querySelectorAll(".token");

    elements.forEach(element => {

        const playerIndex =
            Number(element.dataset.player);

        const tokenIndex =
            Number(element.dataset.token);

        const player =
            game.players[playerIndex];

        const token =
            player.tokens[tokenIndex];

        const [row, col] =
            getTokenCoordinates(
                player,
                tokenIndex
            );

        element.style.top =
            `${(row / 15) * 100}%`;

        element.style.left =
            `${(col / 15) * 100}%`;

        element.classList.remove("movable");

        if (token.position === 57) {
            element.classList.add("finished");
        } else {
            element.classList.remove("finished");
        }

    });

    highlightMovableTokens();

}


/* =====================================================
   MOVEMENT RULES
===================================================== */

function canMoveToken(player, token, dice) {

    if (!dice) {
        return false;
    }


    /*
    Finished token cannot move.
    */

    if (token.position === 57) {
        return false;
    }


    /*
    Token in yard.

    Must roll 6.
    */

    if (token.position === -1) {

        return dice === 6;

    }


    /*
    Token on track.
    */

    if (
        token.position >= 0 &&
        token.position <= 51
    ) {

        const newPosition =
            token.position + dice;

        /*
        Maximum progress:

        52 -> first home lane

        56 -> final lane

        57 -> home
        */

        if (newPosition <= 51) {
            return true;
        }

        /*
        Number of spaces required to enter
        and reach home.
        */

        return newPosition <= 56;

    }


    /*
    Already inside home lane.
    */

    if (
        token.position >= 52 &&
        token.position <= 56
    ) {

        return token.position + dice <= 57;

    }

    return false;

}


/* =====================================================
   MOVABLE TOKENS
===================================================== */

function getMovableTokens(playerIndex, dice) {

    const player =
        game.players[playerIndex];

    const result = [];

    player.tokens.forEach(
        (token, index) => {

            if (
                canMoveToken(
                    player,
                    token,
                    dice
                )
            ) {

                result.push(index);

            }

        }
    );

    return result;

}


/* =====================================================
   HIGHLIGHT MOVABLE TOKENS
===================================================== */

function highlightMovableTokens() {

    if (
        !game.waitingForToken ||
        game.dice === null
    ) {
        return;
    }

    const movable =
        getMovableTokens(
            game.currentPlayer,
            game.dice
        );

    movable.forEach(tokenIndex => {

        const element =
            tokenLayer.querySelector(
                `.token[data-player="${game.currentPlayer}"][data-token="${tokenIndex}"]`
            );

        if (element) {
            element.classList.add("movable");
        }

    });

}


/* =====================================================
   MOVE TOKEN
===================================================== */

async function selectToken(
    playerIndex,
    tokenIndex
) {

    if (game.gameOver) {
        return;
    }

    if (
        playerIndex !==
        game.currentPlayer
    ) {
        return;
    }

    if (!game.waitingForToken) {
        return;
    }

    const player =
        game.players[playerIndex];

    const token =
        player.tokens[tokenIndex];

    if (
        !canMoveToken(
            player,
            token,
            game.dice
        )
    ) {
        return;
    }


    const dice =
        game.dice;


    /*
    Stop selection.
    */

    game.waitingForToken = false;


    /*
    Clear highlighting.
    */

    renderTokens();


    /*
    Move token.
    */

    await moveToken(
        playerIndex,
        tokenIndex,
        dice
    );


    /*
    Capture.
    */

    const captured =
        captureOpponents(
            playerIndex,
            tokenIndex
        );


    /*
    Check winner.
    */

    if (
        checkWinner(playerIndex)
    ) {
        return;
    }


    /*
    Extra turn:
    - rolled six
    - captured opponent
    */

    if (
        dice === 6 ||
        captured
    ) {

        game.dice = null;

        updateUI();

        setMessage(
            captured
                ? `${player.name} captured a token! Roll again.`
                : `${player.name} rolled a 6! Roll again.`
        );

        return;

    }


    /*
    Next player.
    */

    nextPlayer();

}


/* =====================================================
   MOVE TOKEN ANIMATION
===================================================== */

function moveToken(
    playerIndex,
    tokenIndex,
    dice
) {

    return new Promise(resolve => {

        const player =
            game.players[playerIndex];

        const token =
            player.tokens[tokenIndex];


        /*
        Leaving yard.
        */

        if (token.position === -1) {

            token.position = 0;

            renderTokens();

            setTimeout(
                resolve,
                300
            );

            return;

        }


        /*
        Normal movement.

        Animate one square at a time.
        */

        let steps = dice;


        const interval =
            setInterval(() => {

                if (token.position <= 51) {

                    token.position++;

                    if (token.position === 52) {
                        token.position = 52;
                    }

                } else {

                    token.position++;

                }


                /*
                Position 52 is the first
                home-lane position.

                After 51 on the track,
                continue into lane.
                */

                renderTokens();

                steps--;

                if (steps <= 0) {

                    clearInterval(interval);

                    /*
                    Reaching home.
                    */

                    if (
                        token.position === 57
                    ) {

                        token.position = 57;

                    }

                    renderTokens();

                    setTimeout(
                        resolve,
                        200
                    );

                }

            }, 130);

    });

}


/* =====================================================
   CAPTURE
===================================================== */

function captureOpponents(
    playerIndex,
    tokenIndex
) {

    const player =
        game.players[playerIndex];

    const token =
        player.tokens[tokenIndex];


    /*
    Only tokens on outer track
    can capture.
    */

    if (
        token.position < 0 ||
        token.position > 51
    ) {
        return false;
    }


    const globalPosition =
        getGlobalTrackPosition(
            player,
            token.position
        );


    /*
    Safe cell cannot capture.
    */

    if (
        SAFE_CELLS.has(
            globalPosition
        )
    ) {
        return false;
    }


    let captured = false;


    game.players.forEach(
        (opponent, opponentIndex) => {

            if (
                opponentIndex ===
                playerIndex
            ) {
                return;
            }

            opponent.tokens.forEach(
                opponentToken => {

                    if (
                        opponentToken.position <
                        0 ||
                        opponentToken.position >
                        51
                    ) {
                        return;
                    }


                    const opponentGlobal =
                        getGlobalTrackPosition(
                            opponent,
                            opponentToken.position
                        );


                    if (
                        opponentGlobal ===
                        globalPosition
                    ) {

                        opponentToken.position = -1;

                        captured = true;

                    }

                }
            );

        }
    );


    if (captured) {
        renderTokens();
    }


    return captured;

}


/* =====================================================
   WINNER
===================================================== */

function checkWinner(playerIndex) {

    const player =
        game.players[playerIndex];

    const finished =
        player.tokens.filter(
            token =>
                token.position === 57
        ).length;


    updateScores();


    if (finished === 4) {

        game.gameOver = true;

        game.waitingForToken = false;

        showWinner(player);

        return true;

    }

    return false;

}


/* =====================================================
   NEXT PLAYER
===================================================== */

function nextPlayer() {

    game.dice = null;

    game.waitingForToken = false;

    game.currentPlayer =
        (game.currentPlayer + 1) %
        game.players.length;

    updateUI();

    const player =
        game.players[
            game.currentPlayer
        ];

    setMessage(
        `${player.name}'s turn. Roll the dice.`
    );

}


/* =====================================================
   ROLL DICE
===================================================== */

function rollDice() {

    if (game.gameOver) {
        return;
    }

    if (game.waitingForToken) {
        return;
    }

    if (game.dice !== null) {
        return;
    }


    diceButton.classList.add("rolling");

    diceButton.disabled = true;


    /*
    Temporary rolling animation.
    */

    let count = 0;

    const animation =
        setInterval(() => {

            const random =
                Math.floor(
                    Math.random() * 6
                ) + 1;

            drawDice(random);

            count++;

            if (count >= 7) {

                clearInterval(animation);

                const result =
                    Math.floor(
                        Math.random() * 6
                    ) + 1;

                game.dice = result;

                diceButton.classList.remove(
                    "rolling"
                );

                diceButton.disabled = false;

                handleDiceResult();

            }

        }, 75);

}


/* =====================================================
   DICE RESULT
===================================================== */

function handleDiceResult() {

    const player =
        game.players[
            game.currentPlayer
        ];

    const dice =
        game.dice;

    drawDice(dice);

    const movable =
        getMovableTokens(
            game.currentPlayer,
            dice
        );


    /*
    No legal move.
    */

    if (movable.length === 0) {

        game.waitingForToken = false;

        setMessage(
            `${player.name} cannot make a move.`
        );

        diceHint.textContent =
            "No legal moves";


        /*
        A six still gives another turn.
        */

        if (dice === 6) {

            setTimeout(() => {

                game.dice = null;

                updateUI();

                setMessage(
                    `${player.name} rolled a 6. Roll again.`
                );

            }, 900);

        } else {

            setTimeout(
                nextPlayer,
                900
            );

        }

        return;

    }


    /*
    Legal move exists.
    */

    game.waitingForToken = true;

    updateUI();

    setMessage(
        movable.length === 1
            ? "Select the highlighted token."
            : "Choose a token to move."
    );

}


/* =====================================================
   DRAW DICE
===================================================== */

function drawDice(number) {

    const dots =
        diceButton.querySelectorAll(
            ".dot"
        );

    const patterns = {

        1: [4],

        2: [0, 8],

        3: [0, 4, 8],

        4: [0, 2, 6, 8],

        5: [0, 2, 4, 6, 8],

        6: [0, 2, 3, 5, 6, 8]

    };


    dots.forEach(dot => {

        dot.style.opacity = "0";

    });


    patterns[number].forEach(index => {

        dots[index].style.opacity = "1";

    });

}


/* =====================================================
   UI UPDATE
===================================================== */

function updateUI() {

    const player =
        game.players[
            game.currentPlayer
        ];


    /*
    Turn title.
    */

    turnText.textContent =
        `${player.name}'s turn`;


    /*
    Turn color.
    */

    turnIndicator.style.background =
        player.color;

    turnIndicator.style.boxShadow =
        `0 0 0 7px ${player.color}22`;


    /*
    Player panels.
    */

    game.players.forEach(
        (p, index) => {

            const panel =
                document.getElementById(
                    `panel-${p.id}`
                );

            const status =
                document.getElementById(
                    `${p.id}-status`
                );

            panel.classList.toggle(
                "active",
                index ===
                game.currentPlayer
            );

            if (
                index ===
                game.currentPlayer
            ) {

                status.textContent =
                    game.waitingForToken
                        ? "Choose token"
                        : "Your turn";

            } else {

                status.textContent =
                    "Waiting";

            }

        }
    );


    /*
    Dice button.
    */

    diceButton.disabled =
        game.gameOver ||
        game.waitingForToken ||
        game.dice !== null;


    /*
    Dice labels.
    */

    if (game.dice === null) {

        diceText.textContent =
            "Roll Dice";

        diceHint.textContent =
            "Your turn";

    } else {

        diceText.textContent =
            `Rolled ${game.dice}`;

        diceHint.textContent =
            game.waitingForToken
                ? "Choose a token"
                : "Processing";

    }


    renderTokens();

    updateScores();

}


/* =====================================================
   SCORES
===================================================== */

function updateScores() {

    game.players.forEach(player => {

        const score =
            player.tokens.filter(
                token =>
                    token.position === 57
            ).length;

        const element =
            document.getElementById(
                `${player.id}-score`
            );

        element.textContent =
            score;

    });

}


/* =====================================================
   MESSAGE
===================================================== */

function setMessage(text) {

    message.textContent = text;

}


/* =====================================================
   WINNER MODAL
===================================================== */

function showWinner(player) {

    const overlay =
        document.createElement("div");

    overlay.className =
        "winner-overlay";

    overlay.innerHTML = `

        <div class="winner-card">

            <div class="trophy">
                🏆
            </div>

            <h2>
                ${player.name} Wins!
            </h2>

            <p>
                Congratulations! All four tokens
                reached home.
            </p>

            <button id="playAgainBtn">
                Play Again
            </button>

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    document
        .getElementById("playAgainBtn")
        .addEventListener(
            "click",
            () => {

                overlay.remove();

                newGame();

            }
        );

}


/* =====================================================
   NEW GAME
===================================================== */

function newGame() {

    game = {

        currentPlayer: 0,

        dice: null,

        waitingForToken: false,

        gameOver: false,

        players: PLAYERS.map(player => ({

            ...player,

            tokens: [
                { position: -1 },
                { position: -1 },
                { position: -1 },
                { position: -1 }
            ]

        }))

    };


    drawDice(1);

    setMessage(
        "Roll the dice to start."
    );

    createTokens();

    updateUI();

}


/* =====================================================
   EVENTS
===================================================== */

diceButton.addEventListener(
    "click",
    rollDice
);

newGameButton.addEventListener(
    "click",
    newGame
);


/* =====================================================
   START GAME
===================================================== */

createBoard();

newGame();
