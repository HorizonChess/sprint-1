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
    const lives = getLives()
    elStats.innerHTML = `Mines left:${gLevel.MINES} || Seconds passed: ${gGame.secsPassed} || Lives left: ${lives}`

}

function renderHints() {
    const elHintsContainer = document.querySelector('.hints')
    var strHTML = '<span class= "header"> Hints: </span>'
    for (var i = 0; i < gLevel.HINTS; i++) {
        strHTML += `<span class="hint-${i + 1}" onclick= "onUseHint(this)" title= "Click a cell to reveal it and its neighbors risk free">${HINT}</span>`
    }
    elHintsContainer.innerHTML = strHTML
}


function renderSmiley() {
    const elSmiley = document.querySelector('.smiley')
    elSmiley.innerHTML = `${gGame.smileyState}`
}

//reveal neighbors
function revealNeighbors(idx, jdx) {
    var revealed = []
    for (var i = Math.max(idx - 1, 0); i <= Math.min(idx + 1, gBoard.length - 1); i++) {

        for (var j = Math.max(jdx - 1, 0); j <= Math.min(jdx + 1, gBoard[0].length - 1); j++) {

            if (i === idx && j === jdx) continue
            if (gBoard[i][j].isRevealed) continue

            gBoard[i][j].isRevealed = true
            revealed.push({ i, j })
        }

    }
    renderBoard(gBoard, '.board-container')
    return revealed
}

//hide neighbors that were revealed by hint

function hideNeighbors(revealed) {
    for (var k = 0; k < revealed.length; k++) {
        gBoard[revealed[k].i][revealed[k].j].isRevealed = false
    }
    renderBoard(gBoard, '.board-container')
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
    for (var i = 0; i < gGame.leaderBoard.length; i++) {
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

function onCallTerminator() {
    if (!gGame.isOn) return
    gTerminatorClicks++
    if (gTerminatorClicks > 1) return

    showTerminatorQuote()
    setTimeout(hideTerminatorQuote, 1000)

    const length = (gLevel.MINES <= 3) ? gLevel.MINES : 3
    for (var i = 0; i < length; i++) {
        const currMine = getRandMine()
        const elCurrMine = document.querySelector(`.cell-${currMine.i}-${currMine.j}`)
        elCurrMine.classList.add('explode') //only place where we render cells outside renderboard
        removeMine(currMine)
        setMinesNegsCount()

        setTimeout(() => {
            elCurrMine.classList.remove('explode')
            renderBoard(gBoard, '.board-container')
        }, 1000)

    }
    if (isVictory()) handleVictory()
}

function hideTerminatorQuote() {

    const elBubble = document.querySelector('.speech-bubble')
    const elBubbleQuote = document.querySelector('.speech-bubble.quote')

    elBubble.classList.add('hidden')
    elBubbleQuote.classList.add('hidden')
}

function showTerminatorQuote() {
    const quote = getTerminatorQuote()
    const elBubble = document.querySelector('.speech-bubble')
    const elBubbleQuote = document.querySelector('.speech-bubble.quote')

    elBubble.classList.remove('hidden')
    elBubbleQuote.classList.remove('hidden')

    elBubbleQuote.innerHTML = `${quote}`
}

