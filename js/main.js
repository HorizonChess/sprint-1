//global variables

var gLevel =
{
    SIZE: 4,
    MINES: 2,
    LIVES: 2,
}
var gBoard
var gTimerInterval
var gCellsClicked

const MINE = '&#128163;'
const FLAG = '&#x1F6A9;'
const NORMAL_SMILEY = '&#128515;'
const EXPLODING_HEAD = '&#129327;'
const WIN = '&#128526;'

const gGame = {
    isOn: false,
    secsPassed: 0,
    difficulty: 'Beginner',
    smileyState: NORMAL_SMILEY
}
//change init to oninit with parameters
function onInit(difficulty) {
    //resetting variables
    gGame.isOn = false
    gCellsClicked = 0
    gGame.secsPassed = 0
    gGame.smileyState = NORMAL_SMILEY
    clearInterval(gTimerInterval)

    //building and rendering the board
    setDifficulty(difficulty||gGame.difficulty)
    gBoard = buildBoard()
    renderBoard(gBoard, '.board-container')
    updateStats()
    renderSmiley()
    showBoard()
}

function onCellClicked(i, j) {

    //update cell in the model
    var currCell = gBoard[i][j]
    currCell.isRevealed = true
    //checks if it's the first click
    gCellsClicked++
    handleGameStart()
    if (!gGame.isOn) return

//put in another function
    //check win/loss
    if (currCell.isMine) {
        gLevel.LIVES--
        if (gLevel.LIVES <= 0) {
            revealMines()
            gGame.smileyState = EXPLODING_HEAD //lose html entity
            renderSmiley()

            setTimeout(() => {
                showGameOverModal(false)
            }, 1000)
        }
        //hide the mine if lives are left
        else {
            setTimeout(() => {
                currCell.isRevealed = false
                renderBoard(gBoard, '.board-container')
            }, 1000)
        }
    }


    //cascade reveal if no mine neighbors
    else if (currCell.minesAroundCount === 0)
        for (var idx = Math.max(i - 1, 0); idx <= Math.min(i + 1, gBoard.length - 1); idx++) {

            for (var jdx = Math.max(j - 1, 0); jdx <= Math.min(j + 1, gBoard[0].length - 1); jdx++) {
                expandReveal(idx, jdx)
            }
        }

    //check if this click wins the game
    if (isVictory()) {
        gGame.smileyState = WIN //win html entity
        renderSmiley()
        setTimeout(() => {
            showGameOverModal(true)
        }, 1000)
    }
    //update stats and board in DOM
    renderBoard(gBoard, '.board-container')
    updateStats()

}

function handleGameStart() {
    if (gCellsClicked === 1) {
        gGame.isOn = true
        gTimerInterval = setInterval(setTimer, 1000)

        genRandMines()
        setMinesNegsCount()
        updateStats()
        renderBoard(gBoard, '.board-container')
    }
}

//generates random mines on the board model
//consider getting array?
function genRandMines() {
    for (var i = 0; i < gLevel.MINES; i++) {
        var randIdx = getRandomIntInclusive(0, gBoard.length - 1)
        var randJdx = getRandomIntInclusive(0, gBoard[0].length - 1)

        if (!gBoard[randIdx][randJdx].isMine) {
            gBoard[randIdx][randJdx].isMine = true
        }
        else {
            i--
        }

    }
}
//changes difficulty (from button, immediately updates board)
function setDifficulty(difficulty) {
    //if midgame, you can't change diff
    if (gGame.isOn) return

    switch (difficulty) {
        case 'Beginner':
            gLevel = { SIZE: 4, MINES: 2, LIVES: 2 }
            break;
        case 'Intermediate':
            gLevel = { SIZE: 8, MINES: 14, LIVES: 3 }
            break;
        case 'Expert':
            gLevel = { SIZE: 12, MINES: 32, LIVES: 3 }
            break;
        default: gLevel = { SIZE: 4, MINES: 2, LIVES: 2 }
    }

    gGame.difficulty = difficulty
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
        gGame.smileyState = WIN
        renderSmiley()
        showGameOverModal(true)
    }
}

//gets mine neighbor count for a specific cell

function getMinesNegsCount(idx, jdx) {
    var minesNegsCount = 0
    for (var i = Math.max(idx - 1, 0); i <= Math.min(idx + 1, gBoard.length - 1); i++) {

        for (var j = Math.max(jdx - 1, 0); j <= Math.min(jdx + 1, gBoard[0].length - 1); j++) {

            if (i === idx && j === jdx) continue

            if (gBoard[i][j].isMine) {
                minesNegsCount++
            }
        }

    }
    return minesNegsCount
}

//sets the mine neighbor count for all cells

function setMinesNegsCount() {

    for (var i = 0; i < gBoard.length; i++) {

        for (var j = 0; j < gBoard[0].length; j++) {
            //update model on mines around
            gBoard[i][j].minesAroundCount = getMinesNegsCount(i, j)

        }
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

//acts as timer

function setTimer() {
    gGame.secsPassed++
    updateStats()
}

