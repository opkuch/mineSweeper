'use strict'

const MINE = '🧨'

var gFlagCount
var gBoard
var gBoardCopy
var gBoardCopies
var gStopperInterval
var gStart
var gElStopper
var gMineTimeOut
var gLeaderBoardBtn
var gGameLeaders
var gIsHint
var gNeighbors
var gMineCount
var gSafeClickCount
var gIsSevenBoom
var gIsManual
var gManualMode
var gManualMineCount
var gRevealedCells
var gIsNoramlMode

var gGame = {
  isOn: false,
  showCount: 0,
  markedCount: 0,
  secsPassed: 0,
}
var gLevel = {
  SIZE: 4,
  MINES: 2,
}
var gFirstClick
var gLives

function init() {
  clearInterval(gStopperInterval)
  gGame.isOn = true
  gGame.showCount = 0
  gGame.markedCount = 0
  gIsHint = false
  gFirstClick = false
  gIsSevenBoom = false
  gIsNoramlMode = false
  gFlagCount = gLevel.MINES
  gLives = 3
  gIsManual = false
  gManualMode = false
  gSafeClickCount = 3
  gManualMineCount = 0
  gMineCount = gLevel.MINES
  gNeighbors = []
  gRevealedCells = []
  gBoard = buildBoard()
  gBoardCopies = []
  renderBoard(gBoard)
  renderLives()
  renderFlags()
  renderHints()
  gLeaderBoardBtn = document.querySelector('.leaderboard-btn')
  gElStopper = document.querySelector('.stopper')
  gElStopper.innerText = ''
  gGameLeaders = initLeaderboard()
  initPumpkinImg()
  safeClicksRender()
}

function buildBoard() {
  var board = []
  for (var i = 0; i < gLevel.SIZE; i++) {
    board.push([])
    for (var j = 0; j < gLevel.SIZE; j++) {
      var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      }
      board[i][j] = cell
    }
  }
  return board
}

function cellClicked(cellTd, i, j) {
  if (cellTd.classList.contains('revealed') || !gGame.isOn) return

  var cell = gBoard[i][j]
  if (gIsHint) {
    useHint(cell, i, j)
  }
  if (cell.isMarked) return
  gBoardCopies.push(structuredClone(gBoard))
  if (gIsManual) {
    putManualMine(gLevel.MINES, i, j)
    return
  }

  if (!gFirstClick && !gIsSevenBoom && !gIsManual) {
    gFirstClick = true
    gIsNoramlMode = true
    var clickCoord = { i: +cellTd.dataset.i, j: +cellTd.dataset.j }
    putMines(clickCoord)
    setMinesNegsCount(gBoard)
    gBoardCopies.push(structuredClone(gBoard))
    startStopper()
  }
  if (!gIsHint) {
    gGame.showCount++
    cell.isShown = true
    checkGameOver()
    renderBoard(gBoard)
  }

  if (cell.isMine) {
    gLives--
    gGame.showCount--
    gMineCount--
    checkGameOver()
    renderLives()
    return
  }
  if (cell.minesAroundCount === 0 && !cell.isMine) {
    expandShown(gBoard, i, j)
    renderBoard(gBoard)
  }
}

function setMinesNegsCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var cell = board[i][j]
      var location = { i, j }
      var mines = countNeighbors(location)
      cell.minesAroundCount = mines
    }
  }
}

function putMines(coord) {
  for (var i = 0; i < gLevel.MINES; i++) {
    var randLocation = getRandomLocation(coord)
    var cell = gBoard[randLocation.i][randLocation.j]
    cell.isMine = true
  }
}

function checkGameOver() {
  if (gLives === 0) {
    var pumpkin = document.querySelector('.pumpkin-img')
    pumpkin.src = './imgs/pumpkin_dead.gif'
    clearTimeout(gMineTimeOut)
    revealMines(gBoard)
    gGame.isOn = false
    clearInterval(gStopperInterval)
  }
  var cellsAmount = gLevel.SIZE * gLevel.SIZE - gLevel.MINES

  if (gGame.showCount >= cellsAmount && gMineCount === gGame.markedCount) {
    callVictory()
  }
}

function changeDifficulty(elBtn) {
  clearInterval(gStopperInterval)
  if (elBtn.dataset.value === 'easy') {
    gLevel.SIZE = 4
    gLevel.MINES = 2
    init()
  } else if (elBtn.dataset.value === 'medium') {
    gLevel.SIZE = 8
    gLevel.MINES = 12
    init()
  } else if (elBtn.dataset.value === 'hard') {
    gLevel.SIZE = 12
    gLevel.MINES = 30
    init()
  }
}

function startStopper() {
  gStart = Date.now()
  gStopperInterval = setInterval(stopperRun, 80)
}
function stopperRun() {
  var now = Date.now()
  gGame.secsPassed = Math.ceil((now - gStart) / 1000)
  gElStopper.innerHTML = gGame.secsPassed
}

function cellMarked(cellTd, i, j) {
  if (!gFirstClick) return
  if (cellTd.classList.contains('revealed') || !gGame.isOn) return
  var cell = gBoard[i][j]
  cell.isMarked = cell.isMarked ? false : true
  if (cell.isMarked) {
    gGame.markedCount++
    cellTd.innerText = '🚩'
    if (gGame.markedCount === gMineCount) checkGameOver()
  } else {
    gGame.markedCount--
    cellTd.innerText = ''
  }
  cellTd.classList.remove('hide')
  renderFlags()
}

function expandShown(board, rowIndex, colIndex) {
  for (var i = rowIndex - 1; i <= rowIndex + 1; i++) {
    if (i < 0 || i > gLevel.SIZE - 1) continue
    for (var j = colIndex - 1; j <= colIndex + 1; j++) {
      if (j < 0 || j > gLevel.SIZE - 1) continue
      if (rowIndex === i && colIndex === j) continue
      var cell = board[i][j]
      if (cell.isMarked) continue
      if (cell.minesAroundCount === 0 && !cell.isShown) {
        cell.isShown = true
        gGame.showCount++
        expandShown(board, i, j)
      }
      if (cell.minesAroundCount > 0 && !cell.isShown) {
        cell.isShown = true
        gGame.showCount++
      }
    }
  }
}

function highScoreCheck() {
  if (gGameLeaders.length < 10) {
    return true
  } else {
    for (var i = 0; i < gGameLeaders.length; i++) {
      if (gGame.secsPassed < +gGameLeaders[i][0]) {
        gGameLeaders.pop()
        return true
      }
    }
  }
  return false
}

function callVictory() {
  gGame.isOn = false
  clearInterval(gStopperInterval)
  var pumpkin = document.querySelector('.pumpkin-img')
  pumpkin.src = './imgs/banana_victory.gif'
  if (highScoreCheck()) {
    pushNewLeader()
  }
}

function initLeaderboard() {
  if (localStorage.getItem('scores') !== null) {
    return JSON.parse(localStorage.getItem('scores'))
  } else {
    return []
  }
}

function updateLeaderBoard() {
  for (var i = 0; i < gGameLeaders.length; i++) {
    var leaderRank = document.querySelector(`#rank${i}`)
    var leaderName = document.querySelector(`#name${i}`)
    var leaderScore = document.querySelector(`#score${i}`)
    leaderRank.innerHTML = i + 1
    leaderName.innerHTML = gGameLeaders[i][1]
    leaderScore.innerHTML = gGameLeaders[i][0]
  }
}

function pushNewLeader() {
  gGameLeaders.push([
    gGame.secsPassed,
    prompt(
      'Congratulations! You made it to the leaderboard. Please enter your name: '
    ),
  ])
  sortLeaderboard(gGameLeaders)
  console.log(gGameLeaders)
  localStorage.setItem('scores', JSON.stringify(gGameLeaders))
}

function useHint(currCell, i, j) {
  gIsHint = false
  gNeighbors = getAllNeighbors(gBoard, i, j)
  gNeighbors.push(currCell)
  for (var i = 0; i < gNeighbors.length; i++) {
    var cell = gNeighbors[i]
    if (cell.isShown) gRevealedCells.push(cell)
    cell.isShown = true
  }
  setTimeout(disableHint, 1000)
}

function disableHint() {
  for (var i = 0; i < gNeighbors.length; i++) {
    var cell = gNeighbors[i]
    cell.isShown = false
  }
  for (var i = 0; i < gRevealedCells.length; i++) {
    var cell = gRevealedCells[i]
    cell.isShown = true
  }
  renderBoard(gBoard)
}

function hintClicked(elHint) {
  gIsHint = true
  elHint.style.display = 'none'
}

function undoClicked() {
  if (gBoardCopies.length <= 1 || !gGame.isOn) return

  var lastIdx = gBoardCopies.length - 1
  gBoard = gBoardCopies[lastIdx]
  renderBoard(gBoardCopies[lastIdx])
  gBoardCopies.pop()
}

function safeClick() {
  if (!gGame.isOn || gSafeClickCount <= 0) return
  gSafeClickCount--
  safeClicksRender()
  while (true) {
    var rowIdx = getRandomInt(0, gBoard.length)
    var colIdx = getRandomInt(0, gBoard.length)
    var cell = gBoard[rowIdx][colIdx]
    if (!cell.isMarked && !cell.isMine && !cell.isShown) {
      disableSafeClick()
      gBoardCopy = structuredClone(gBoard)
      cell.isShown = true
      renderBoard(gBoard)
      setTimeout(() => {
        gBoard = gBoardCopy
        renderBoard(gBoardCopy)
      }, 1000)
      return
    }
  }
}

function sevenBoom() {
  if (gIsManual || gIsNoramlMode) return
  gIsSevenBoom = true
  var count = 0
  var strCount
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard.length; j++) {
      strCount = count + ''
      var cell = gBoard[i][j]
      if ((count % 7 === 0 && count !== 0) || strCount.includes('7'))
        cell.isMine = true
      count++
    }
  }
  setMinesNegsCount(gBoard)
  gBoardCopies.push(structuredClone(gBoard))
}

function setManualMode() {
  if (!gIsSevenBoom && !gIsNoramlMode){
    gIsManual = true
    gManualMode = true
    gFirstClick = true
  }

}

function putManualMine(mineNum, i, j) {
  if (gManualMineCount !== mineNum) {
    var cell = gBoard[i][j]
    cell.isMine = true
    gManualMineCount++
    setMinesNegsCount(gBoard)
    gBoardCopies.push(structuredClone(gBoard))
  } else {
    gIsManual = false
    startStopper()
  }
}
