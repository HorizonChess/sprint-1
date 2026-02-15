

var gBoard

const MINE = 'Mine'
const FLAG = 'Flag'

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
    gBoard = buildBoard()
    genRandMines()
    setMinesNegsCount()
    renderBoard(gBoard, '.board-container')

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
    gBoard[i][j].isRevealed = true

    if (curCell.isMine) {
        console.log('mine!')
        elCell.innerHTML = '&#128163' //bomb html entity
        gameOver()
    }
    elCell.innerHTML = curCell.minesAroundCount

}

function onCellMarked(elCell, i, j) {

}


function setMinesNegsCount() {

    for (var i = 0; i < gBoard.length; i++) {

        for (var j = 0; j < gBoard[0].length; j++) {
            //update model on mines around
            gBoard[i][j].minesAroundCount = getMinesNegsCount(i, j)

            // //update DOM
            // var location = { i: i, j: j }
            // renderCell(location, gBoard[i][j].minesAroundCount)
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

}


function handleRightClick(elCell, ev, i, j) {
    ev.preventDefault()
    onCellMarked(elCell, i, j)
}
