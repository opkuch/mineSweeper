'use strict'

function renderBoard(board) {
  var strHTML = ''

  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>'

    for (var j = 0; j < board[0].length; j++) {
      var cell = board[i][j]
      var className = cell.isShown
        ? 'cell revealed'
        : cell.isMarked
        ? 'cell'
        : 'cell hide'
      strHTML += `<td oncontextmenu = "cellMarked(this, ${i}, ${j})" data-i="${i}" data-j="${j}" onclick="cellClicked(this, ${i}, ${j})" class="${className}" >${
        cell.isMarked
          ? '🚩'
          : cell.isMine
          ? MINE
          : cell.minesAroundCount === 0
          ? ''
          : cell.minesAroundCount
      }</td>`
    }

    strHTML += '</tr>'
  }

  var elBoard = document.querySelector('.board')
  elBoard.innerHTML = strHTML
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

function getEmptyCell() {
  var emptyCells = []
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      var cell = gBoard[i][j]
      if (cell === EMPTY) {
        emptyCells.push({ i, j })
      }
    }
  }
  var randIdx = getRandomInt(0, emptyCells.length)
  return emptyCells[randIdx]
}

function getRandomLocation(coord) {
  var rowIdx = getRandomInt(1, gBoard.length)
  var colIdx = getRandomInt(1, gBoard.length)

  while (true) {
    if (colIdx !== coord.j && rowIdx !== coord.i) {
      var randLocation = { i: rowIdx, j: colIdx }
      return randLocation
    } else {
      rowIdx = getRandomInt(1, gBoard.length)
      colIdx = getRandomInt(1, gBoard.length)
    }
  }
}

function countNeighbors(location) {
  var count = 0
  var neighbors = getAllNeighbors(gBoard, location.i, location.j)
  for (var i = 0; i < neighbors.length; i++) {
    var neighbor = neighbors[i]
    if (neighbor.isMine) count++
  }
  return count
}

function renderLives() {
  var elLives = document.querySelector('.lives')
  var strHTML = 'Lives: '
  for (var i = 0; i < gLives; i++) {
    strHTML += '<img class = "heart" src = "./imgs/heart.gif" />'
  }
  elLives.innerHTML = strHTML
}

function renderFlags() {
  var elFlag = document.querySelector('.flag-counter')
  var strHTML = 'Flagged: ' + gGame.markedCount
  elFlag.innerHTML = strHTML
}

function isCellExist(board, i, j) {
  if (board[i] === undefined || board[j] === undefined) return false
  return true
}

function getAllNeighbors(board, i, j) {
  var rowLimit = board.length - 1
  var columnLimit = board[0].length - 1
  var neighbors = []
  for (var x = Math.max(0, i - 1); x <= Math.min(i + 1, rowLimit); x++) {
    for (var y = Math.max(0, j - 1); y <= Math.min(j + 1, columnLimit); y++) {
      if (!isCellExist(board, x, y)) continue
      var cell = board[x][y]
      if (x !== i || y !== j) {
        neighbors.push(cell)
      }
    }
  }
  return neighbors
}

function revealMines(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board.length; j++) {
      var cell = board[i][j]
      if (cell.isMine) cell.isShown = true
    }
  }
  renderBoard(board)
}



function swap(lst, i, j){
	var tmp = lst[i][0]
	var nametmp = lst[i][1]
	lst[i][0] = lst[j][0]
	lst[i][1] = lst[j][1]
	lst[j][1] = nametmp
	lst[j][0] = tmp

}

function sortLeaderboard(leaderBoard) {
  var m_index
	for(var i = 0; i<leaderBoard.length; i++){
		m_index = i
		for(var j = i+1; j < leaderBoard.length; j++){
			if (+(leaderBoard[m_index][0]) > +(leaderBoard[j][0])){
				m_index = j
		swap(leaderBoard, i, m_index)
			}
		}
	}
}

function openLeaderModal(){
  updateLeaderBoard()
  var modal = document.querySelector('.leaderboard-modal')
  modal.style.display = 'block'
}

function closeLeaderModal(){
  var modal = document.querySelector('.leaderboard-modal')
  modal.style.display = 'none'

}

function renderHints(){
  var elHints = document.querySelectorAll('.hint-img')
  for (var i =0; i < elHints.length; i++){
    var elHint = elHints[i]
    elHint.style.display = 'inline'
  }
}

function initPumpkinImg() {
  var pumpkin = document.querySelector('.pumpkin-img')
  pumpkin.src = './imgs/pumpkin_play.gif'
}

function disableSafeClick(){
  var elSafeBtn = document.querySelector('.safeclick-btn')
  elSafeBtn.disabled = true
  setTimeout(activateSafeClick, 2000)
}

function activateSafeClick(){
  var elSafeBtn = document.querySelector('.safeclick-btn')
  elSafeBtn.disabled = false
}

function safeClicksRender(){
  var elText = document.querySelector('.safeclick-txt')
  elText.innerText = `${gSafeClickCount} clicks available`
}