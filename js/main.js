//global variables

var gLevel
var gBoard
var gTimerInterval

var gCellsClicked
var gTerminatorClicks

const MINE = '&#128163;'
const FLAG = '&#x1F6A9;'
const NORMAL_SMILEY = '&#128515;'
const EXPLODING_HEAD = '&#129327;'
const WIN = '&#128526;'
const HEART = '❤️'
const HINT = '💡'

const gGame = {
    isOn: false,
    isHint: false,
    secsPassed: 0,
    difficulty: 'Beginner',
    leaderBoard: [],
    smileyState: NORMAL_SMILEY,
}

function onInit(difficulty) {
    //resetting variables
    resetVariables()

    //building and rendering the board
    setDifficulty(difficulty || gGame.difficulty)
    gBoard = buildBoard()
    renderBoard(gBoard, '.board-container')
    updateStats()
    updateLeaderBoard()
    renderLeaderBoard()
    renderSmiley()
    renderHints()
    showBoard()
    showLeaderBoard()
}

function onCellClicked(i, j) {
    //update cell in the model
    var currCell = gBoard[i][j]
    currCell.isRevealed = true

    //handle activated hint, will not work first click intentionally
    if (gGame.isHint && gGame.isOn) {
        const revealed = revealNeighbors(i, j)
        setTimeout(() => {
            currCell.isRevealed = false
            hideNeighbors(revealed)
            renderBoard(gBoard, '.board-container')
        }, 1500)
        gGame.isHint = false
        return
    }

    //checks if it's the first click
    gCellsClicked++
    handleGameStart(i, j)
    if (!gGame.isOn) return

    //check win/loss
    if (currCell.isMine) handleMineExplode(currCell)

    //cascade reveal if no mine neighbors
    else if (currCell.minesAroundCount === 0)
        initExpandReveal(i, j)

    //check if this click wins the game
    if (isVictory()) handleVictory()

    //update stats and board in DOM
    renderBoard(gBoard, '.board-container')
    updateStats()
}

//starts the game and places mines
function handleGameStart(i, j) {
    if (gCellsClicked === 1) {
        gGame.isOn = true
        gTimerInterval = setInterval(setTimer, 1000)

        genRandMines(i, j)
        setMinesNegsCount()
        updateStats()
        renderBoard(gBoard, '.board-container')
    }
}


//changes difficulty (from button, immediately updates board)

function setDifficulty(difficulty) {
    switch (difficulty) {
        case 'Beginner':
            gLevel = { SIZE: 4, MINES: 2, LIVES: 2, HINTS: 1 }
            break;
        case 'Intermediate':
            gLevel = { SIZE: 8, MINES: 14, LIVES: 3, HINTS: 2 }
            break;
        case 'Expert':
            gLevel = { SIZE: 12, MINES: 32, LIVES: 3, HINTS: 3 }
            break;
        default: gLevel = { SIZE: 4, MINES: 2, LIVES: 2, HINTS: 1 }
    }

    gGame.difficulty = difficulty
}
//feeds neighbor cells to expandReveal function

function initExpandReveal(i, j) {
    for (var idx = Math.max(i - 1, 0); idx <= Math.min(i + 1, gBoard.length - 1); idx++) {

        for (var jdx = Math.max(j - 1, 0); jdx <= Math.min(j + 1, gBoard[0].length - 1); jdx++) {
            expandReveal(idx, jdx)
        }
    }
}

//recursive function to expand reveal.

function expandReveal(i, j) {

    //return if outside borders, or the cell is marked, revealed or a mine

    if (i < 0 || i > gBoard.length - 1 || j < 0 || j > gBoard.length - 1) return
    const currCell = gBoard[i][j]
    if (currCell.isRevealed) return
    if (currCell.isMarked) return
    if (currCell.isMine) return

    //otherwise we set it to revealed
    currCell.isRevealed = true

    //if some of it's neighbors are mines, stop
    if (currCell.minesAroundCount > 0) return

    //otherwise we fetch this cells's neighbors and feed them recursively to expandReveal
    for (var idx = Math.max(i - 1, 0); idx <= Math.min(i + 1, gBoard.length - 1); idx++) {

        for (var jdx = Math.max(j - 1, 0); jdx <= Math.min(j + 1, gBoard[0].length - 1); jdx++) {
            expandReveal(idx, jdx)
        }
    }
}

//marks the cell and calls update stats

function onCellMarked(ev, i, j) {
    ev.preventDefault()
    if (!gGame.isOn) return

    var currCell = gBoard[i][j]
    if (currCell.isRevealed) return

    //toggle ismarked and level mines count
    currCell.isMarked = !currCell.isMarked
    currCell.isMarked ? gLevel.MINES-- : gLevel.MINES++

    updateStats()
    renderBoard(gBoard, '.board-container')

    if (isVictory()) {
        handleVictory()
    }
}




//checks for win

function isVictory() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine && !gBoard[i][j].isMarked) return false
            if (!gBoard[i][j].isMine && !gBoard[i][j].isRevealed) return false
        }
    }
    return true
}



function handleVictory() {
    gGame.smileyState = WIN
    renderSmiley()
    clearInterval(gTimerInterval)
    setTimeout(() => {
        showGameOverModal(true)
    }, 1000)

}

//saves the record and updates gGameleaderboard
function onSaveRecord() {
    const record = document.querySelector('input')
    const value = record.value

    gGame.leaderBoard.push({ name: value, time: gGame.secsPassed })
    sortArrSmallToBig(gGame.leaderBoard)

    if (gGame.leaderBoard.length > 10) gGame.leaderBoard.pop()

    //save in local storage, in a drawer with the name "leaderboard- *difficulty*.
    localStorage.setItem('leaderboard-' + gGame.difficulty, JSON.stringify(gGame.leaderBoard))
}


//fetches leaderboard from storage, updates model and displays leaderboard


function updateLeaderBoard() {
    //grab from local storage or empty array if no leaderboard exists yet
    var leaderBoard = localStorage.getItem('leaderboard-' + gGame.difficulty)
    //turn the string into an object
    leaderBoard = JSON.parse(leaderBoard) || []

    gGame.leaderBoard = leaderBoard
}

function getLives() {
    var str = ''
    for (var i = 0; i < gLevel.LIVES; i++) {
        str += HEART
    }
    return str
}

function onUseHint(hint) {
    if (gLevel.HINTS <= 0) return

    hint.classList.add('used')
    gGame.isHint = true
    gLevel.HINTS--
}



function getTerminatorQuote() {
    const terminatorQuotes = [
        "Hasta la vista, baby.",
        "Come with me if<br> you want to live",
        "Terminated.",
        "No problemo.",
        "Get down!",
    ]
    const randIndex = getRandomIntInclusive(0, terminatorQuotes.length - 1)
    return terminatorQuotes[randIndex]
}

function setTimer() {
    gGame.secsPassed++
    updateStats()
}


function resetVariables() {
    //resetting variables for init
    gGame.isOn = false
    gCellsClicked = 0
    gGame.secsPassed = 0
    gGame.smileyState = NORMAL_SMILEY
    gTerminatorClicks = 0
    clearInterval(gTimerInterval)
    hideTerminatorQuote()
}
