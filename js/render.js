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

//renders the board according to objects content

function renderBoard(mat, selector) {

    var strHTML = '<table><tbody>'
    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {
            strHTML += getCellHTML(mat, i, j)
        }
        strHTML += '</tr>'
    }

    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

//gets the correct html string for a single cell

function getCellHTML(mat, i, j) {
    var strHTML = ''
    const cell = mat[i][j]
    var className = `cell cell-${i}-${j}`
    var cellContent = ''


    //revealed cells show number of mines around unless it's 0
    if (cell.isRevealed && !cell.isMine) {
        className = 'revealed'

        if (cell.minesAroundCount > 0) cellContent = cell.minesAroundCount
        if (cell.minesAroundCount === 1) className = 'revealed cell-type-1'
        if (cell.minesAroundCount === 2) className = 'revealed cell-type-2'
        if (cell.minesAroundCount >= 3) className = 'revealed cell-type-3'
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

    return strHTML
}


//updates stats in DOM
function updateStats() {
    const elStats = document.querySelector('.stats')
    elStats.innerHTML = `Mines left:${gLevel.MINES} || Seconds passed: ${gGame.secsPassed} || Lives left: ${gLevel.LIVES}`

}

function renderSmiley() {
    const elSmiley = document.querySelector('.smiley-zone')
    elSmiley.innerHTML = `${gGame.smileyState}`

}
//sets mines to revealed
function revealMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++)
            if (gBoard[i][j].isMine) {
                gBoard[i][j].isRevealed = true
            }
    }
}

function renderLeaderBoard() {

    const elLeaderBoard = document.querySelector('.leaderboard-entries')

    var strHTML = ''
    for (var i = 0; i < leaderBoard.length; i++) {
        strHTML += `<tr>
        <td>${i + 1}.</td> 
        <td>${gGame.leaderBoard[i].name}</td>
        <td>${gGame.leaderBoard[i].time}s</td>
        </tr>`

    }
    elLeaderBoard.innerHTML = strHTML
}


//handles game over
function showGameOverModal(isVictory) {
    gGame.isOn = false
    const elGameOverModal = document.querySelector('.game-over-modal')
    if (isVictory) {
        elGameOverModal.innerHTML = `<span> Victorious! you did it in ${gGame.secsPassed} seconds!
        <label>Name:</label>
         <input type="text"  placeholder= "Enter your name">
        </span> 
        <button onclick="onSaveRecord(); onInit()"> Play again?</button>`
    }
    else {
        elGameOverModal.innerHTML = '<span> Game over!</span><button onclick="onInit()"> Play again?</button>'
    }

    elGameOverModal.style.display = 'flex'
    hideBoard()
    hideLeaderBoard()

}

//hides board
function hideBoard() {
    const board = document.querySelector('.board-container')
    board.style.display = 'none'
}

//shows board
function showBoard() {
    const board = document.querySelector('.board-container')
    const gameOverModal = document.querySelector('.game-over-modal')

    board.style.display = 'flex'
    gameOverModal.style.display = 'none'
}

function hideLeaderBoard() {
    const leaderBoard = document.querySelector('.leaderboard')
    leaderBoard.style.display = 'none'
}

function showLeaderBoard() {
    const leaderBoard = document.querySelector('.leaderboard')
    leaderBoard.style.display = 'block'
}


