//to do: add support for difficulty, add game over, add timer (16.2)



var gBoard
var gSeconds
var gTimerInterval

const MINE = '&#128163;'
const FLAG = '&#x1F6A9;'

const gLevel = {
    SIZE: 4,
    MINES: 2
}

const gGame = {
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0,
}

function init() {
    // gGame.isOn = true
    clearInterval(gTimerInterval)
    gSeconds = 0
    gBoard = buildBoard()
    genRandMines()
    setMinesNegsCount()
    updateStats()
    renderBoard(gBoard, '.board-container')
    gTimerInterval = setInterval(setTimer, 1000)

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
        gBoard[randIdx][randJdx].isMine = true
    }

}


function setDifficulty() {

}


function onCellClicked(elCell, i, j) {
    //update cell in the model
    var curCell = gBoard[i][j]
    curCell.isRevealed = true
    renderBoard(gBoard, '.board-container')

    if (curCell.isMine) {

        // gameOver()
    }
    updateStats()

}

//marks the cell and calls update stats
function onCellMarked(ev, i, j) {
    ev.preventDefault()
    var currCell = gBoard[i][j]

    currCell.isMarked = !currCell.isMarked
    currCell.isMarked ? gLevel.MINES-- : gLevel.MINES++

    updateStats()
    renderBoard(gBoard, '.board-container')
    
    // if (checkGameOver()) showGameoverModal() TO FINISH tommorow
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
    stats.innerHTML = `mines left:${gLevel.MINES} || seconds passed: ${gSeconds}`

}

function setTimer() {
    gSeconds++
    updateStats()
}