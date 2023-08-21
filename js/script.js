"strict mode";
const $ = document;

const mineSweeper = $.querySelector(".mineSweeper");
const mineSweeperMap = $.querySelector(".mineSweeper__map");

let row = 9;
let column = 9;
let mineCount = 10;
let minePosition = [];

renderSquare();

function renderSquare() {
  let squareWidth = 100 / column;
  for (let i = 0; i < row; i++) {
    for (let j = 0; j < column; j++) {
      let square = $.createElement("button");

      square.classList.add("square");
      square.setAttribute("data-row", i);
      square.setAttribute("data-column", j);
      square.setAttribute("data-number", `${i * column + j}`);

      square.style.width = `${squareWidth}%`;
      mineSweeperMap.appendChild(square);
      square.style.height = getComputedStyle(square).getPropertyValue("width");
    }
  }
  randomMinePosition();
}

function randomMinePosition() {
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
    }
  }
}

/*

function processSquare(square) {
  square.classList.add("open");

  let mainSquarePosition = Number(square.dataset.number);
  let mainSquareRow = square.dataset.row;
  let mainSquareColumn = square.dataset.column;
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
    console.log(aroundSquares);
    aroundSquares.forEach((aroundSquare) => {
      processSquare(aroundSquare);
    });
  } else {
    square.innerHTML = aroundMineCount;
  }
}
*/

function endgame() {
  alert("Game ended");
}

function showMine() {
  minePosition.forEach((position) => {
    let mine = selectMineWithNumber(position.number);
    mine.classList.add("showMine");
  });
}

function selectMine(position) {
  return document.querySelector(
    `[data-number = "${position.row}${position.column}"]`
  );
}
function selectMineWithNumber(number) {
  return document.querySelector(`[data-number = "${number}"]`);
}

mineSweeperMap.addEventListener("click", (e) => {
  let target = e.target;
  if (target.classList.contains("square")) {
    let number = Number(target.dataset.number);

    if (
      minePosition.some((mine) => {
        return mine.number === number;
      })
    ) {
      showMine();
      endgame();
      return;
    }

    let square = selectMineWithNumber(number);

    if (
      square.classList.contains("open") ||
      square.classList.contains("flag") ||
      square.classList.contains("showMine")
    ) {
    } else {
      processSquare(square);
    }
  }
});

mineSweeperMap.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  let target = e.target;
  if (target.classList.contains("square")) {
    let square = selectMineWithNumber(Number(target.dataset.number));
    if (
      square.classList.contains("open") ||
      square.classList.contains("showMine")
    ) {
    } else {
      square.classList.toggle("flag");
    }
  }
});
