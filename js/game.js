"use strict";


/*
=========================================================
 LUDO
 Phase 1
 Game engine + UI
 Vanilla JavaScript
=========================================================
*/


/* =====================================================
   PLAYER CONFIG
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
   STANDARD 52-CELL TRACK
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
   YARD POSITIONS
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
   TOKEN POSITION MODEL

   -1  = yard

    0  = player's starting track cell

    1..51 = outer track

   52..56 = home lane

    57 = finished
===================================================== */


/* =====================================================
   GAME STATE
===================================================== */

let game = {

    currentPlayer: 0,

    dice: null,

    waitingForToken: false,

    moving: false,

    gameOver: false,

    players: createPlayers()

};


/* =====================================================
   SETTINGS
===================================================== */

let settings = {

    theme: "light",

    board: "classic",

    sound: true,

    compact: false

};


/* =====================================================
   CREATE PLAYERS
===================================================== */

function createPlayers() {

    return PLAYERS.map(player => ({

        ...player,

        tokens: [

            { position: -1 },
            { position: -1 },
            { position: -1 },
            { position: -1 }

        ]

    }));

}


/* =====================================================
   DOM
===================================================== */

const board =
    document.getElementById("board");

const tokenLayer =
    document.getElementById("tokenLayer");

const diceButton =
    document.getElementById("diceBtn");

const diceButtonDesktop =
    document.getElementById("diceBtnDesktop");

const diceText =
    document.getElementById("diceText");

const diceTextDesktop =
    document.getElementById("diceTextDesktop");

const diceHint =
    document.getElementById("diceHint");

const diceHintDesktop =
    document.getElementById("diceHintDesktop");

const diceAttention =
    document.getElementById("diceAttention");

const diceAttentionDesktop =
    document.getElementById(
        "diceAttentionDesktop"
    );

const turnText =
    document.getElementById("turnText");

const turnIndicator =
    document.getElementById(
        "turnIndicator"
    );

const mobileMessage =
    document.getElementById(
        "mobileMessage"
    );

const desktopMessage =
    document.getElementById(
        "desktopMessage"
    );

const newGameButton =
    document.getElementById(
        "newGameBtn"
    );

const optionsButton =
    document.getElementById(
        "optionsBtn"
    );

const optionsMenu =
    document.getElementById(
        "optionsMenu"
    );

const closeOptionsButton =
    document.getElementById(
        "closeOptionsBtn"
    );

const boardStyleSelect =
    document.getElementById(
        "boardStyleSelect"
    );

const soundToggle =
    document.getElementById(
        "soundToggle"
    );

const compactToggle =
    document.getElementById(
        "compactToggle"
    );


/* =====================================================
   LOCAL STORAGE
===================================================== */

const SETTINGS_KEY =
    "ludo_phase1_settings";


function loadSettings() {

    try {

        const saved =
            localStorage.getItem(
                SETTINGS_KEY
            );

        if (saved) {

            settings = {
                ...settings,
                ...JSON.parse(saved)
            };

        }

    } catch (error) {

        console.warn(
            "Could not load settings.",
            error
        );

    }

    applySettings();

}


function saveSettings() {

    try {

        localStorage.setItem(
            SETTINGS_KEY,
            JSON.stringify(settings)
        );

    } catch (error) {

        console.warn(
            "Could not save settings.",
            error
        );

    }

}


/* =====================================================
   APPLY SETTINGS
===================================================== */

function applySettings() {

    document.body.dataset.theme =
        settings.theme;

    document.body.dataset.board =
        settings.board;

    document.body.classList.toggle(
        "compact",
        settings.compact
    );

    if (boardStyleSelect) {

        boardStyleSelect.value =
            settings.board;

    }

    soundToggle.classList.toggle(
        "active",
        settings.sound
    );

    compactToggle.classList.toggle(
        "active",
        settings.compact
    );


    document
        .querySelectorAll(".theme-choice")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.theme ===
                settings.theme
            );

        });

}


/* =====================================================
   THEME EVENTS
===================================================== */

document
    .querySelectorAll(".theme-choice")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                settings.theme =
                    button.dataset.theme;

                applySettings();

                saveSettings();

            }
        );

    });


boardStyleSelect.addEventListener(
    "change",
    () => {

        settings.board =
            boardStyleSelect.value;

        applySettings();

        saveSettings();

    }
);


soundToggle.addEventListener(
    "click",
    () => {

        settings.sound =
            !settings.sound;

        applySettings();

        saveSettings();

    }
);


compactToggle.addEventListener(
    "click",
    () => {

        settings.compact =
            !settings.compact;

        applySettings();

        saveSettings();

    }
);


/* =====================================================
   OPTIONS
===================================================== */

function openOptions() {

    optionsMenu.classList.add("open");

    optionsMenu.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeOptions() {

    optionsMenu.classList.remove("open");

    optionsMenu.setAttribute(
        "aria-hidden",
        "true"
    );

}


optionsButton.addEventListener(
    "click",
    () => {

        if (
            optionsMenu.classList.contains(
                "open"
            )
        ) {

            closeOptions();

        } else {

            openOptions();

        }

    }
);


closeOptionsButton.addEventListener(
    "click",
    closeOptions
);


document.addEventListener(
    "click",
    event => {

        if (
            optionsMenu.classList.contains(
                "open"
            ) &&
            !optionsMenu.contains(event.target) &&
            !optionsButton.contains(event.target)
        ) {

            closeOptions();

        }

    }
);


/* =====================================================
   BOARD CREATION
===================================================== */

function createBoard() {

    board.innerHTML = "";

    for (
        let row = 0;
        row < 15;
        row++
    ) {

        for (
            let col = 0;
            col < 15;
            col++
        ) {

            const cell =
                document.createElement("div");

            cell.className = "cell";

            cell.dataset.row = row;
            cell.dataset.col = col;


            /*
            Outer track.
            */

            const trackIndex =
                TRACK.findIndex(
                    ([r, c]) =>
                        r === row &&
                        c === col
                );


            if (trackIndex !== -1) {

                cell.classList.add("path");

                if (
                    SAFE_CELLS.has(trackIndex)
                ) {

                    cell.classList.add(
                        "safe"
                    );

                }

            }


            /*
            Red yard.
            */

            if (
                row <= 5 &&
                col <= 5
            ) {

                cell.classList.add(
                    "yard-red"
                );

                if (
                    row >= 1 &&
                    row <= 4 &&
                    col >= 1 &&
                    col <= 4
                ) {

                    cell.classList.add(
                        "yard-inner-red"
                    );

                }

            }


            /*
            Green yard.
            */

            if (
                row <= 5 &&
                col >= 9
            ) {

                cell.classList.add(
                    "yard-green"
                );

                if (
                    row >= 1 &&
                    row <= 4 &&
                    col >= 10 &&
                    col <= 13
                ) {

                    cell.classList.add(
                        "yard-inner-green"
                    );

                }

            }


            /*
            Yellow yard.
            */

            if (
                row >= 9 &&
                col <= 5
            ) {

                cell.classList.add(
                    "yard-yellow"
                );

                if (
                    row >= 10 &&
                    row <= 13 &&
                    col >= 1 &&
                    col <= 4
                ) {

                    cell.classList.add(
                        "yard-inner-yellow"
                    );

                }

            }


            /*
            Blue yard.
            */

            if (
                row >= 9 &&
                col >= 9
            ) {

                cell.classList.add(
                    "yard-blue"
                );

                if (
                    row >= 10 &&
                    row <= 13 &&
                    col >= 10 &&
                    col <= 13
                ) {

                    cell.classList.add(
                        "yard-inner-blue"
                    );

                }

            }


            /*
            Home lanes.
            */

            PLAYERS.forEach(
                player => {

                    const lane =
                        HOME_LANES[
                            player.id
                        ];

                    if (
                        lane.some(
                            ([r, c]) =>
                                r === row &&
                                c === col
                        )
                    ) {

                        cell.classList.add(
                            `lane-${player.id}`
                        );

                    }

                }
            );


            /*
            Starting cells.
            */

            PLAYERS.forEach(
                player => {

                    const start =
                        TRACK[
                            player.start
                        ];

                    if (
                        start[0] === row &&
                        start[1] === col
                    ) {

                        cell.classList.add(
                            `start-${player.id}`
                        );

                        cell.classList.remove(
                            "safe"
                        );

                    }

                }
            );


            /*
            Center.
            */

            if (
                row >= 6 &&
                row <= 8 &&
                col >= 6 &&
                col <= 8
            ) {

                cell.classList.add(
                    "center-cell"
                );

            }


            board.appendChild(cell);

        }

    }

}


/* =====================================================
   TOKEN ELEMENTS
===================================================== */

function createTokens() {

    tokenLayer.innerHTML = "";

    game.players.forEach(
        (player, playerIndex) => {

            player.tokens.forEach(
                (token, tokenIndex) => {

                    const element =
                        document.createElement(
                            "div"
                        );

                    element.className =
                        `token ${player.id}`;

                    element.dataset.player =
                        playerIndex;

                    element.dataset.token =
                        tokenIndex;


                    element.addEventListener(
                        "click",
                        () => {

                            if (
                                game.moving ||
                                game.gameOver
                            ) {
                                return;
                            }

                            if (
                                playerIndex !==
                                game.currentPlayer
                            ) {
                                return;
                            }

                            if (
                                !game.waitingForToken
                            ) {
                                return;
                            }

                            selectToken(
                                playerIndex,
                                tokenIndex
                            );

                        }
                    );


                    tokenLayer.appendChild(
                        element
                    );

                }
            );

        }
    );


    renderTokens();

}


/* =====================================================
   GLOBAL TRACK POSITION
===================================================== */

function getGlobalTrackPosition(
    player,
    relativePosition
) {

    if (
        relativePosition < 0 ||
        relativePosition > 51
    ) {

        return null;

    }

    return (
        player.start +
        relativePosition
    ) % 52;

}


/* =====================================================
   TOKEN COORDINATES
===================================================== */

function getTokenCoordinates(
    player,
    tokenIndex
) {

    const token =
        player.tokens[tokenIndex];


    /*
    Yard.
    */

    if (
        token.position === -1
    ) {

        return YARDS[
            player.id
        ][tokenIndex];

    }


    /*
    Finished.

    Place finished tokens around
    the center rather than exactly
    on top of one another.
    */

    if (
        token.position === 57
    ) {

        const finished =
            player.tokens.filter(
                t =>
                    t.position === 57
            ).length;

        const offset =
            (tokenIndex -
                Math.max(0, finished - 1)
            ) * 0.45;

        return [
            7.5 + offset,
            7.5
        ];

    }


    /*
    Outer track.
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

        const [
            row,
            col
        ] =
            TRACK[
                globalPosition
            ];

        return [
            row + .5,
            col + .5
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
            HOME_LANES[
                player.id
            ];

        const index =
            token.position - 52;

        const [
            row,
            col
        ] =
            lane[index];

        return [
            row + .5,
            col + .5
        ];

    }


    return [
        7.5,
        7.5
    ];

}


/* =====================================================
   RENDER TOKENS
===================================================== */

function renderTokens() {

    const elements =
        tokenLayer.querySelectorAll(
            ".token"
        );


    elements.forEach(element => {

        const playerIndex =
            Number(
                element.dataset.player
            );

        const tokenIndex =
            Number(
                element.dataset.token
            );

        const player =
            game.players[
                playerIndex
            ];

        const [
            row,
            col
        ] =
            getTokenCoordinates(
                player,
                tokenIndex
            );


        element.style.left =
            `${(col / 15) * 100}%`;

        element.style.top =
            `${(row / 15) * 100}%`;


        element.classList.remove(
            "movable"
        );


        if (
            playerIndex ===
            game.currentPlayer &&
            game.waitingForToken &&
            game.dice !== null &&
            canMoveToken(
                player,
                player.tokens[tokenIndex],
                game.dice
            )
        ) {

            element.classList.add(
                "movable"
            );

        }

    });

}


/* =====================================================
   TOKEN MOVEMENT RULE
===================================================== */

function canMoveToken(
    player,
    token,
    dice
) {

    if (
        dice === null ||
        dice === undefined
    ) {

        return false;

    }


    /*
    Finished.
    */

    if (
        token.position === 57
    ) {

        return false;

    }


    /*
    Yard.

    Six is required.
    */

    if (
        token.position === -1
    ) {

        return dice === 6;

    }


    /*
    Outer track.

    Position 51 is followed by
    home-lane position 52.
    */

    if (
        token.position >= 0 &&
        token.position <= 51
    ) {

        return (
            token.position +
            dice
        ) <= 56;

    }


    /*
    Home lane.
    */

    if (
        token.position >= 52 &&
        token.position <= 56
    ) {

        return (
            token.position +
            dice
        ) <= 57;

    }


    return false;

}


/* =====================================================
   MOVABLE TOKENS
===================================================== */

function getMovableTokens(
    playerIndex,
    dice
) {

    const player =
        game.players[
            playerIndex
        ];

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
   SELECT TOKEN
===================================================== */

async function selectToken(
    playerIndex,
    tokenIndex
) {

    if (
        game.gameOver ||
        game.moving
    ) {

        return;

    }

    if (
        playerIndex !==
        game.currentPlayer
    ) {

        return;

    }

    if (
        !game.waitingForToken
    ) {

        return;

    }


    const player =
        game.players[
            playerIndex
        ];

    const token =
        player.tokens[
            tokenIndex
        ];

    const dice =
        game.dice;


    if (
        !canMoveToken(
            player,
            token,
            dice
        )
    ) {

        return;

    }


    game.waitingForToken = false;

    game.moving = true;

    renderTokens();


    /*
    Move.
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
    Winner.
    */

    if (
        checkWinner(playerIndex)
    ) {

        game.moving = false;

        return;

    }


    game.moving = false;


    /*
    Extra turn.

    Six or capture.
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


    nextPlayer();

}


/* =====================================================
   MOVE TOKEN
===================================================== */

function moveToken(
    playerIndex,
    tokenIndex,
    dice
) {

    return new Promise(
        resolve => {

            const player =
                game.players[
                    playerIndex
                ];

            const token =
                player.tokens[
                    tokenIndex
                ];


            /*
            Leaving yard.

            Token starts on its player's
            starting cell.
            */

            if (
                token.position === -1
            ) {

                token.position = 0;

                renderTokens();

                playMoveSound();

                setTimeout(
                    resolve,
                    240
                );

                return;

            }


            /*
            Move one logical step
            at a time.
            */

            let steps = dice;


            const interval =
                setInterval(
                    () => {

                        /*
                        Outer track.
                        */

                        if (
                            token.position <= 51
                        ) {

                            token.position++;

                        }


                        /*
                        Home lane is
                        automatically entered
                        after track position 51.
                        */

                        else if (
                            token.position >= 52 &&
                            token.position <= 56
                        ) {

                            token.position++;

                        }


                        if (
                            token.position > 57
                        ) {

                            token.position =
                                57;

                        }


                        renderTokens();

                        playMoveSound();

                        steps--;


                        if (
                            steps <= 0
                        ) {

                            clearInterval(
                                interval
                            );


                            if (
                                token.position === 57
                            ) {

                                playHomeSound();

                            }


                            renderTokens();

                            setTimeout(
                                resolve,
                                180
                            );

                        }

                    },
                    125
                );

        }
    );

}


/* =====================================================
   CAPTURE
===================================================== */

function captureOpponents(
    playerIndex,
    tokenIndex
) {

    const player =
        game.players[
            playerIndex
        ];

    const token =
        player.tokens[
            tokenIndex
        ];


    /*
    Only outer track can capture.
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
    Safe.
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

                        opponentToken.position =
                            -1;

                        captured = true;

                    }

                }
            );

        }
    );


    if (captured) {

        playCaptureSound();

        renderTokens();

    }


    return captured;

}


/* =====================================================
   WINNER
===================================================== */

function checkWinner(
    playerIndex
) {

    const player =
        game.players[
            playerIndex
        ];


    const finished =
        player.tokens.filter(
            token =>
                token.position === 57
        ).length;


    updateScores();


    if (
        finished === 4
    ) {

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

    game.moving = false;


    game.currentPlayer =
        (
            game.currentPlayer + 1
        ) %
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

    if (
        game.gameOver ||
        game.moving ||
        game.waitingForToken ||
        game.dice !== null
    ) {

        return;

    }


    diceButton.classList.add(
        "rolling"
    );

    diceButtonDesktop.classList.add(
        "rolling"
    );


    diceButton.disabled = true;

    diceButtonDesktop.disabled = true;


    /*
    Small visual randomization.
    */

    let count = 0;


    const animation =
        setInterval(
            () => {

                const random =
                    Math.floor(
                        Math.random() * 6
                    ) + 1;

                drawDice(random);

                count++;


                if (
                    count >= 7
                ) {

                    clearInterval(
                        animation
                    );


                    const result =
                        Math.floor(
                            Math.random() * 6
                        ) + 1;


                    game.dice =
                        result;


                    diceButton.classList.remove(
                        "rolling"
                    );

                    diceButtonDesktop.classList.remove(
                        "rolling"
                    );


                    diceButton.disabled =
                        false;

                    diceButtonDesktop.disabled =
                        false;


                    playDiceSound();

                    handleDiceResult();

                }

            },
            75
        );

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

    if (
        movable.length === 0
    ) {

        game.waitingForToken = false;


        setMessage(
            `${player.name} cannot make a move.`
        );


        updateUI();


        /*
        Six means another roll.
        */

        if (
            dice === 6
        ) {

            setTimeout(
                () => {

                    game.dice = null;

                    updateUI();

                    setMessage(
                        `${player.name} rolled a 6. Roll again.`
                    );

                },
                850
            );

        } else {

            setTimeout(
                nextPlayer,
                850
            );

        }


        return;

    }


    /*
    Legal move.
    */

    game.waitingForToken = true;


    updateUI();


    setMessage(
        movable.length === 1
            ? "Select the highlighted token."
            : "Choose a highlighted token."
    );

}


/* =====================================================
   DRAW DICE
===================================================== */

function drawDice(number) {

    const buttons = [
        diceButton,
        diceButtonDesktop
    ];


    const patterns = {

        1: [4],

        2: [
            0,
            8
        ],

        3: [
            0,
            4,
            8
        ],

        4: [
            0,
            2,
            6,
            8
        ],

        5: [
            0,
            2,
            4,
            6,
            8
        ],

        6: [
            0,
            2,
            3,
            5,
            6,
            8
        ]

    };


    buttons.forEach(
        button => {

            if (!button) {
                return;
            }


            const dots =
                button.querySelectorAll(
                    ".dot"
                );


            dots.forEach(
                dot => {

                    dot.style.opacity = "0";

                }
            );


            if (
                patterns[number]
            ) {

                patterns[number]
                    .forEach(
                        index => {

                            if (
                                dots[index]
                            ) {

                                dots[index]
                                    .style
                                    .opacity = "1";

                            }

                        }
                    );

            }

        }
    );

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
    Turn indicator.
    */

    turnIndicator.style.background =
        player.color;

    turnIndicator.style.boxShadow =
        `0 0 0 6px ${player.color}22`;


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
                        : game.moving
                            ? "Moving..."
                            : "Your turn";

            } else {

                status.textContent =
                    "Waiting";

            }

        }
    );


    /*
    Dice state.
    */

    const diceDisabled =
        game.gameOver ||
        game.waitingForToken ||
        game.moving ||
        game.dice !== null;


    diceButton.disabled =
        diceDisabled;

    diceButtonDesktop.disabled =
        diceDisabled;


    /*
    Dice text.
    */

    if (
        game.dice === null
    ) {

        diceText.textContent =
            "Roll Dice";

        diceTextDesktop.textContent =
            "Roll Dice";

        diceHint.textContent =
            "Your turn";

        diceHintDesktop.textContent =
            "Your turn";

    } else {

        diceText.textContent =
            `Rolled ${game.dice}`;

        diceTextDesktop.textContent =
            `Rolled ${game.dice}`;

        diceHint.textContent =
            game.waitingForToken
                ? "Choose a token"
                : "Processing";

        diceHintDesktop.textContent =
            game.waitingForToken
                ? "Choose a token"
                : "Processing";

    }


    /*
    Dice attention.

    Hide when user needs to choose
    a token or dice isn't available.
    */

    const showAttention =
        game.dice === null &&
        !game.waitingForToken &&
        !game.moving &&
        !game.gameOver;


    diceAttention.style.display =
        showAttention
            ? "block"
            : "none";

    diceAttentionDesktop.style.display =
        showAttention
            ? "block"
            : "none";


    /*
    Active player controls
    */

    updatePlayerColor(
        player.color
    );


    /*
    Render.
    */

    renderTokens();

    updateScores();

}


/* =====================================================
   UPDATE ACTIVE PLAYER COLOR
===================================================== */

function updatePlayerColor(color) {

    document.documentElement.style.setProperty(
        "--current-player-color",
        color
    );

}


/* =====================================================
   SCORES
===================================================== */

function updateScores() {

    game.players.forEach(
        player => {

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

        }
    );

}


/* =====================================================
   MESSAGE
===================================================== */

function setMessage(text) {

    mobileMessage.textContent =
        text;

    desktopMessage.textContent =
        text;

}


/* =====================================================
   WINNER
===================================================== */

function showWinner(player) {

    const overlay =
        document.createElement(
            "div"
        );

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
                All four tokens reached home.
                Congratulations!
            </p>

            <button
                id="playAgainBtn"
                type="button"
            >
                Play Again
            </button>

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    document
        .getElementById(
            "playAgainBtn"
        )
        .addEventListener(
            "click",
            () => {

                overlay.remove();

                newGame();

            }
        );


    playWinSound();

}


/* =====================================================
   NEW GAME
===================================================== */

function newGame() {

    /*
    Remove old winner modal.
    */

    document
        .querySelectorAll(
            ".winner-overlay"
        )
        .forEach(
            element =>
                element.remove()
        );


    game = {

        currentPlayer: 0,

        dice: null,

        waitingForToken: false,

        moving: false,

        gameOver: false,

        players: createPlayers()

    };


    drawDice(1);

    setMessage(
        "Roll the dice to start."
    );


    createTokens();

    updateUI();

}


/* =====================================================
   SIMPLE SOUND SYSTEM
   Uses Web Audio only.

   No external sound files.
===================================================== */

let audioContext = null;


function getAudioContext() {

    if (
        !settings.sound
    ) {

        return null;

    }


    if (!audioContext) {

        try {

            audioContext =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();

        } catch {

            return null;

        }

    }


    if (
        audioContext.state ===
        "suspended"
    ) {

        audioContext.resume();

    }


    return audioContext;

}


function playTone(
    frequency,
    duration,
    volume = .035,
    type = "sine"
) {

    const ctx =
        getAudioContext();

    if (!ctx) {
        return;
    }


    const oscillator =
        ctx.createOscillator();

    const gain =
        ctx.createGain();


    oscillator.type =
        type;

    oscillator.frequency.value =
        frequency;


    gain.gain.setValueAtTime(
        volume,
        ctx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        .001,
        ctx.currentTime +
        duration
    );


    oscillator.connect(gain);

    gain.connect(
        ctx.destination
    );


    oscillator.start();

    oscillator.stop(
        ctx.currentTime +
        duration
    );

}


function playDiceSound() {

    playTone(
        360,
        .06,
        .035,
        "square"
    );

}


function playMoveSound() {

    if (
        Math.random() > .45
    ) {

        return;

    }

    playTone(
        280,
        .035,
        .018
    );

}


function playCaptureSound() {

    playTone(
        190,
        .09,
        .04,
        "triangle"
    );

}


function playHomeSound() {

    setTimeout(
        () => {

            playTone(
                520,
                .09,
                .04
            );

        },
        20
    );

    setTimeout(
        () => {

            playTone(
                720,
                .12,
                .04
            );

        },
        110
    );

}


function playWinSound() {

    [520, 650, 780]
        .forEach(
            (frequency, index) => {

                setTimeout(
                    () => {

                        playTone(
                            frequency,
                            .16,
                            .045
                        );

                    },
                    index * 130
                );

            }
        );

}


/* =====================================================
   EVENTS
===================================================== */

diceButton.addEventListener(
    "click",
    rollDice
);


diceButtonDesktop.addEventListener(
    "click",
    rollDice
);


newGameButton.addEventListener(
    "click",
    newGame
);


/* =====================================================
   INITIALIZE
===================================================== */

loadSettings();

createBoard();

newGame();
