
//sets the mine neighbor count for all cells

function setMinesNegsCount() {

    for (var i = 0; i < gBoard.length; i++) {

        for (var j = 0; j < gBoard[0].length; j++) {
            //update model on mines around
            gBoard[i][j].minesAroundCount = getMinesNegsCount(i, j)

        }
    }


}





//generates random mines on the board model

function genRandMines(idx, jdx) {
    for (var i = 0; i < gLevel.MINES; i++) {
        var randIdx = getRandomIntInclusive(0, gBoard.length - 1)
        var randJdx = getRandomIntInclusive(0, gBoard[0].length - 1)

        if (randIdx === idx && randJdx === jdx) continue

        if (!gBoard[randIdx][randJdx].isMine) {
            gBoard[randIdx][randJdx].isMine = true
        }
        else {
            i--
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

//gets a mine for the terminator
function getRandMine() {
    var randIdx = getRandomIntInclusive(0, gBoard.length - 1)
    var randJdx = getRandomIntInclusive(0, gBoard.length - 1)

    while (!gBoard[randIdx][randJdx].isMine && !gBoard[randIdx][randJdx].isMarked) {
        var randIdx = getRandomIntInclusive(0, gBoard.length - 1)
        var randJdx = getRandomIntInclusive(0, gBoard.length - 1)
    }
    return { i: randIdx, j: randJdx }
}


function removeMine(object) {
    const idx = object.i
    const jdx = object.j
    gBoard[idx][jdx].isMine = false
    gLevel.MINES--

}

function handleMineExplode(currCell) {
    gLevel.LIVES--
    if (gLevel.LIVES <= 0) {
        revealMines()
        clearInterval(gTimerInterval)
        gGame.smileyState = EXPLODING_HEAD
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