"strict mode";
const $ = document;

/* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
particlesJS.load("particles-js", "assets/particles.json", function () {
  console.log("callback - particles.js config loaded");
});

const mineSweeper = $.querySelector(".mineSweeper");
const mineSweeperBoard = $.querySelector(".mineSweeper__board");
const result = $.querySelector(".result");
const restartElem = $.querySelector(".restart");
const levelOptions = $.querySelector(".options");
const levelArrow = $.querySelector(".level__svg");
let bomb = new Audio("../sounds/bomb.mp3");
let win = new Audio("../sounds/win.ogg");

let row = 9;
let column = 9;
let mineCount = 10;
let flagCount = null;
let minePosition = [];

renderSquare();

/* This function creates a square button for each row and column. */
function renderSquare() {
  mineSweeperBoard.innerHTML = "";
  let squareWidth = 100 / column;
  for (let i = 0; i < row; i++) {
    for (let j = 0; j < column; j++) {
      let square = $.createElement("button");

      square.classList.add("square");
      square.setAttribute("data-row", i);
      square.setAttribute("data-column", j);
      square.setAttribute("data-number", `${i * column + j}`);

      square.style.width = `${squareWidth}%`;
      mineSweeperBoard.appendChild(square);
      let height = getComputedStyle(square).getPropertyValue("width");
      square.style.height = height;
      if (parseInt(height) > 72) {
        square.style.width = "7.2rem";
        square.style.height = "7.2rem";
        mineSweeperBoard.style.maxWidth = 7.2 * column + "rem";
      }
    }
  }

  flagCount = mineCount;
  randomMinePosition();
}

/* This function randomly generates the positions of the mines. */
function randomMinePosition() {
  minePosition = [];
  for (let i = 0; i < mineCount; i++) {
    let newPosition = {
      row: Math.floor(Math.random() * row),
      column: Math.floor(Math.random() * column),
      number: 0,
    };
    newPosition.number =
      Number(newPosition.row) * column + Number(newPosition.column);
    if (
      minePosition.some((position) => {
        if (
          position.row === newPosition.row &&
          position.column === newPosition.column
        )
          return true;
      })
    ) {
      i--;
    } else {
      minePosition.push(newPosition);
    }
  }
}

/* This function opens a square and its adjacent squares if there are no mines around it. */
function processSquare(square) {
  let stack = [square];
  let processedSquares = [];

  while (stack.length > 0) {
    let currentSquare = stack.pop();
    if (processedSquares.includes(currentSquare)) {
      continue;
    }
    processedSquares.push(currentSquare);
    currentSquare.classList.add("open");

    let mainSquarePosition = Number(currentSquare.dataset.number);
    let mainSquareRow = currentSquare.dataset.row;
    let mainSquareColumn = currentSquare.dataset.column;
    let aroundMineCount = 0;
    let aroundSquares = [];
    let aroundSquarePositions = [];

    // Get the adjacent square positions.
    for (
      let i = mainSquarePosition - column - 1;
      i <= mainSquarePosition + column + 1;
      i += column
    ) {
      if (mainSquareRow == 0 && mainSquareColumn == 0 && i < 0) {
        i = 0;
      }
      if (i < 0) {
        continue;
      }

      for (let j = 0; j < 3; j++) {
        if (mainSquareRow == 0 && mainSquareColumn == 0 && j === 0) {
          j = 0;
        } else if (mainSquareColumn == 0 && j === 0) {
          j = 1;
        }

        if (mainSquareRow == 0 && mainSquareColumn == 0 && j === 2) {
          break;
        }
        if (mainSquareColumn == column - 1 && j === 2) {
          break;
        }
        if (i + j >= row * column) {
          continue;
        }

        aroundSquarePositions.push(i + j);
      }
    }

    /*
      Iterate through the adjacent square positions and count the number of mines.

      If the number of mines is 0, the adjacent squares are added to the stack.

      If the number of mines is not 0, the current square is updated with the number of mines.
    */
    aroundSquarePositions.forEach((aroundSquarePosition) => {
      minePosition.forEach((mine) => {
        if (mine.number === aroundSquarePosition) aroundMineCount++;
      });
      let aroundSquare = selectMineWithNumber(aroundSquarePosition);
      if (
        !aroundSquare.classList.contains("open") ||
        !aroundSquare.classList.contains("flag") ||
        !aroundSquare.classList.contains("showMine")
      )
        aroundSquares.push(aroundSquare);
    });

    if (!aroundMineCount) {
      stack.push(...aroundSquares);
    } else {
      currentSquare.innerHTML = aroundMineCount;
      currentSquare.classList.add(`min-count-${aroundMineCount}`);
    }
  }
}

function loseGame() {
  $.body.classList.add("lose");
  result.innerHTML = "you lost!";
  bomb.play();
}
function winGame() {
  $.body.classList.add("win");
  result.innerHTML = "you won!";
  win.play();
}

function checkWin() {
  let allOpenSquares = $.querySelectorAll(".open");
  if (row * column - mineCount === allOpenSquares.length) {
    winGame();
  }
}

/* This function shows all the mines on the board. */
function showMine() {
  minePosition.forEach((position) => {
    let mine = selectMineWithNumber(position.number);
    mine.classList.add("showMine");
  });
}

/* This function returns the mine button with the specified number. */
function selectMineWithNumber(number) {
  return document.querySelector(`[data-number = "${number}"]`);
}

mineSweeperBoard.addEventListener("click", (e) => {
  /*
    This function is called when the player clicks on a square.

    The function takes the event object as an argument and opens the square if it does not contain a mine.

    If the square contains a mine, the game ends.

    If the square is already open or flagged, the function does nothing.
  */

  let target = e.target;
  if (target.classList.contains("square")) {
    let number = Number(target.dataset.number);
    let square = selectMineWithNumber(number);

    /*
      Check if the square contains a mine.
      If it does, end the game.
    */
    if (
      minePosition.some((mine) => {
        return mine.number === number;
      }) &&
      !square.classList.contains("flag") &&
      !square.classList.contains("showMine")
    ) {
      square.classList.add("open");
      showMine();
      loseGame();
      return;
    }

    /*
      Check if the square is already open or flagged.
      If it is, do nothing.
    */
    if (
      square.classList.contains("open") ||
      square.classList.contains("flag") ||
      square.classList.contains("showMine") ||
      $.body.classList.contains("win") ||
      $.body.classList.contains("lose")
    ) {
    } else {
      /*
        Call the processSquare function with the square clicked
     */
      processSquare(square);
      checkWin();
    }
  }
});

mineSweeperBoard.addEventListener("contextmenu", (e) => {
  /*
    This function is called when the player right-clicks on a square.

    The function takes the square button as an argument and toggles its flag status.

    If the square is already flagged, the flag is removed.

    If the square is not flagged, a flag is added to it.
  */
  e.preventDefault();

  let target = e.target;
  if (target.classList.contains("square")) {
    let square = selectMineWithNumber(Number(target.dataset.number));
    /*
      Check if the square is already open or shows a mine.
      If it is, do nothing.
    */
    if (
      square.classList.contains("open") ||
      square.classList.contains("showMine") ||
      $.body.classList.contains("win") ||
      $.body.classList.contains("lose")
    ) {
    } else {
      if (square.classList.contains("flag")) {
        square.classList.remove("flag");
        flagCount++;
      } else {
        if (flagCount === 0) return;

        square.classList.add("flag");
        flagCount--;
      }
    }
  }
});

/* When the browser window is resized, this function sets the height of all squares on the page to their width. */
window.addEventListener("resize", () => {
  let squares = $.querySelectorAll(".square");
  let height = getComputedStyle(squares[0]).getPropertyValue("width");
  squares.forEach((square) => {
    square.style.height = height;
  });
});

/* restart the game */
restartElem.addEventListener("click", restartFun);
function restartFun() {
  bomb.load();
  win.load();
  renderSquare();
  $.body.classList = "";
}

/* Sets the game level. */
levelOptions.addEventListener("click", (e) => {
  let level = e.target.id;
  if (level) {
    if (level === "easy") {
      row = 9;
      column = 9;
      mineCount = 10;
      levelArrow.style.left = "23%";
    } else if (level === "medium") {
      row = 16;
      column = 16;
      mineCount = 40;
      levelArrow.style.left = "50%";
    } else if (level === "hard") {
      row = 30;
      column = 16;
      mineCount = 99;
      levelArrow.style.left = "78%";
    }

    restartFun();
  }
});
