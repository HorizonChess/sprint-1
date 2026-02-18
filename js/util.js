function renderBoard(mat, selector) {

    var strHTML = '<table><tbody>'
    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {

            const cell = mat[i][j]
            var className = `cell cell-${i}-${j}`
            var cellContent = ''

            //content detrmined based on revealed/isMine/ismarked
            if (!cell.isRevealed) {
                cellContent = ''
            }
            //revealed cells show number of mines around unless it's 0
            if (cell.isRevealed && !cell.isMine) {
                className = 'revealed'

                if (cell.minesAroundCount > 0)
                    cellContent = cell.minesAroundCount

            }
            else if (cell.isRevealed && cell.isMine) {
                cellContent = MINE //bomb html entity
            }
            else if (cell.isMarked) {
                cellContent = FLAG //red flag html entity
            }


            strHTML += `<td class="${className}" 
                            onclick="onCellClicked(${i}, ${j})" 
                            oncontextmenu="onCellMarked(event, ${i}, ${j})">
                            ${cellContent}
                        </td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

function revealMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++)
            if (gBoard[i][j].isMine) {
                gBoard[i][j].isRevealed = true
            }
    }
}



function showGameOverModal(isVictory) {
    gGame.isOn = false
    const gameOverModal = document.querySelector('.game-over-modal')
    if (isVictory) {
        gameOverModal.innerHTML = '<span> Congrats, you got them all!</span><button onclick="init()"> Play again?</button>'
    }
    else {
        gameOverModal.innerHTML = '<span> Game over!</span><button onclick="init()"> Play again?</button>'
    }
    gameOverModal.style.display = 'flex'

    hideBoard()
}


function hideBoard() {
    const board = document.querySelector('.board-container')
    board.style.display = 'none'
}


function showBoard() {
    const board = document.querySelector('.board-container')
    const gameOverModal = document.querySelector('.game-over-modal')

    board.style.display = 'flex'
    gameOverModal.style.display = 'none'
}

function getRandomIntInclusive(min, max) {
    const minCeiled = Math.ceil(min)
    const maxFloored = Math.floor(max)
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled)
}