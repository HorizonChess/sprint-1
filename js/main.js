//to do: add support for difficulty, add game over, add timer (16.2)
//to do: add cascading reveal on click, reveal mines on bad end (17.2)


var gLevel =
{
    SIZE: 4,
    MINES: 2
}
var gBoard = buildBoard()
var gTimerInterval
var gCellsClicked

const MINE = '&#128163;'
const FLAG = '&#x1F6A9;'
const gGame = {
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0,
}

function init() {
    gCellsClicked = 0
    gGame.secsPassed = 0
    clearInterval(gTimerInterval)
    gBoard = buildBoard()
    showBoard()
    updateStats()
    renderBoard(gBoard, '.board-container')


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

function buildBoard() {  //returns a matrix of cell objects
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
            gLevel = { SIZE: 4, MINES: 2 }
            break;
        case 'Intermediate':
            gLevel = { SIZE: 8, MINES: 14 }
            break;
        case 'Expert':
            gLevel = { SIZE: 12, MINES: 32 }
            break;
        default: gLevel = { SIZE: 4, MINES: 2 }
    }
    gBoard = buildBoard()
    renderBoard(gBoard, '.board-container')
    updateStats()
}


function onCellClicked(i, j) {

    //update cell in the model
    var currCell = gBoard[i][j]
    currCell.isRevealed = true
    //checks if it's the first click
    gCellsClicked++
    handleGameStart()
    if (!gGame.isOn) return

    //cascade reveal
    if (currCell.minesAroundCount === 0)
        for (var idx = Math.max(i - 1, 0); idx <= Math.min(i + 1, gBoard.length - 1); idx++) {

            for (var jdx = Math.max(j - 1, 0); jdx <= Math.min(j + 1, gBoard[0].length - 1); jdx++) {
                expandReveal(idx, jdx)
            }
        }

    //check win/loss
    if (currCell.isMine) {
        revealMines()
        setTimeout(() => {
            showGameOverModal(false)
        }, 1000)
    }
    if (checkGameOver()) {
        setTimeout(() => {
            showGameOverModal(true)
        }, 1000)
    }
    //update stats and board in DOM
    renderBoard(gBoard, '.board-container')
    updateStats()

}

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

    if (checkGameOver()) showGameoverModal(true)
}


function setMinesNegsCount() {

    for (var i = 0; i < gBoard.length; i++) {

        for (var j = 0; j < gBoard[0].length; j++) {
            //update model on mines around
            gBoard[i][j].minesAroundCount = getMinesNegsCount(i, j)

        }
    }


}

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


function checkGameOver() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine && !gBoard[i][j].isMarked) return false
            if (!gBoard[i][j].isMine && !gBoard[i][j].isRevealed) return false
        }
    }
    return true
}

function updateStats() {
    const stats = document.querySelector('.stats')
    stats.innerHTML = `mines left:${gLevel.MINES} || seconds passed: ${gGame.secsPassed}`

}

function setTimer() {
    gGame.secsPassed++
    updateStats()
}

