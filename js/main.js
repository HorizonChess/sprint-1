
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
    // revealedCount: 0,
    // markedCount: 0,
    secsPassed: 0,
    difficulty: 'Beginner',
    smileyState: NORMAL_SMILEY
}

function init() {
    gGame.isOn = false
    gCellsClicked = 0
    gGame.secsPassed = 0
    gGame.smileyState = NORMAL_SMILEY

    setDifficulty(gGame.difficulty)
    clearInterval(gTimerInterval)
    showBoard()
    updateStats()
    renderBoard(gBoard, '.board-container')
    renderSmiley()
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

//returns a clean board at the size of glevel.size

function buildBoard() {
    const size = gLevel.SIZE
    const board = []

    for (var i = 0; i < size; i++) {
        board.push([])

        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isRevealed: false,
                isMine: false,
                isMarked: false
            }
        }
    }

    return board
}
//generates random mines on the board model
function genRandMines() {
    for (var i = 0; i < gLevel.MINES; i++) {
        var randIdx = getRandomIntInclusive(0, gBoard.length - 1)
        var randJdx = getRandomIntInclusive(0, gBoard[0].length - 1)

        if (!gBoard[randIdx][randJdx].isRevealed && !gBoard[randIdx][randJdx].isMine) {
            gBoard[randIdx][randJdx].isMine = true
        }
        else {
            i--
        }

    }
}

function setDifficulty(difficulty) {
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
    gBoard = buildBoard()
    renderBoard(gBoard, '.board-container')
    updateStats()
    gGame.difficulty = difficulty
}


function onCellClicked(i, j) {

    //update cell in the model
    var currCell = gBoard[i][j]
    currCell.isRevealed = true
    //checks if it's the first click
    gCellsClicked++
    handleGameStart()
    if (!gGame.isOn) return

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

//recursive function to expand reveal.
function expandReveal(i, j) {
    if (i < 0 || i > gBoard.length - 1 || j < 0 || j > gBoard.length - 1) return
    const currCell = gBoard[i][j]
    if (currCell.isRevealed) return
    if (currCell.isMarked) return
    if (currCell.isMine) return

    currCell.isRevealed = true

    if (currCell.minesAroundCount > 0) return

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

//sets the mine neighbor count for all cells
function setMinesNegsCount() {

    for (var i = 0; i < gBoard.length; i++) {

        for (var j = 0; j < gBoard[0].length; j++) {
            //update model on mines around
            gBoard[i][j].minesAroundCount = getMinesNegsCount(i, j)

        }
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
//updates stats in DOM
function updateStats() {
    const elStats = document.querySelector('.stats')
    elStats.innerHTML = `mines left:${gLevel.MINES} || seconds passed: ${gGame.secsPassed} || Lives left: ${gLevel.LIVES}`

}
//acts as timer
function setTimer() {
    gGame.secsPassed++
    updateStats()
}

function renderSmiley() {
    const elSmiley = document.querySelector('.smiley-zone')
    elSmiley.innerHTML = `${gGame.smileyState}`

}