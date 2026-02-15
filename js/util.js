function renderBoard(mat, selector) {

    var strHTML = '<table><tbody>'
    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {

            const cell = mat[i][j]
            const className = `cell cell-${i}-${j}`
            var cellContent = ''

            //content detrmined based on revealed/isMine/ismarked
            if (!cell.isRevealed) {
                cellContent = ''
            }
            if (cell.isRevealed && !cell.isMine) {
                cellContent = cell.minesAroundCount
            }
            else if (cell.isRevealed && cell.isMine) {
                cellContent = '&#128163;' //bomb html entity
            }
            else if (cell.isMarked) {
                cellContent = '&#x1F6A9;' //red flag html entity
            }


            strHTML += `<td class="${className}" 
                            onclick="onCellClicked(this,${i}, ${j})" 
                            oncontextmenu="handleRightClick(this, event, ${i}, ${j})">
                            ${cellContent}
                        </td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}


function renderCell(pos, value) {
    // Select the elCell and set the value
    const elCell = document.querySelector(`.cell-${pos.i}-${pos.j}`)
    elCell.innerHTML = value
}


function getRandomIntInclusive(min, max) {
    const minCeiled = Math.ceil(min)
    const maxFloored = Math.floor(max)
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled)
}