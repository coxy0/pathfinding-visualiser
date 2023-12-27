class Cell {
  constructor(i, j, cellWidth) {
    this.i = i;
    this.j = j;
    this.cellWidth = cellWidth;

    this.f = 0;
    this.g = 0;
    this.h = 0;

    this.initCell();

    this.wall = false;
    if (!(i == 0 && j == 0) && random() < 0.3) {
      this.wall = true;
    }
  }

  initCell = () => {
    this.wall = false;

    this.neighbours = [];
    this.previous = undefined;

    this.walls = [false, false, false, false];
    this.visited = false;
  };

  findNeighbours = (grid) => {
    if (this.j > 0) {
      this.neighbours.push(grid.cells[this.i][this.j - 1]);
    }
    if (this.j < grid.cols - 1) {
      this.neighbours.push(grid.cells[this.i][this.j + 1]);
    }
    if (this.i > 0) {
      this.neighbours.push(grid.cells[this.i - 1][this.j]);
    }
    if (this.i < grid.rows - 1) {
      this.neighbours.push(grid.cells[this.i + 1][this.j]);
    }
  };

  show = (colour) => {
    fill(colour);
    noStroke(0);
    let w = this.cellWidth;
    rect(this.j * w + 0.5, this.i * w + 0.5, w - 1, w - 1);
  };
}

class Grid {
  constructor(rows, cols, cellWidth) {
    this.rows = rows;
    this.cols = cols;
    this.cellWidth = cellWidth;

    this.cells = this.createAndFillArray();
    this.findNeighbours();
  }

  createAndFillArray = () => {
    let cells = new Array();
    for (let i = 0; i < this.rows; i++) {
      cells[i] = new Array(this.cols);
    }
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        cells[i][j] = new Cell(i, j, this.cellWidth);
      }
    }
    return cells;
  };

  findNeighbours = () => {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.cells[i][j].findNeighbours(this);
      }
    }
  };

  initAllCells = () => {
    for (let row of this.cells) {
      for (let cell of row) {
        cell.initCell();
      }
    }
    this.findNeighbours();
  };

  setAllWalls = () => {
    for (let row of this.cells) {
      for (let cell of row) {
        cell.walls = [true, true, true, true];
      }
    }
  };

  removeWall = (cell1, cell2) => {
    let di = cell1.i - cell2.i;
    let dj = cell1.j - cell2.j;
    if (di == 1) {
      cell1.walls[2] = false;
      cell2.walls[3] = false;
    } else if (di == -1) {
      cell1.walls[3] = false;
      cell2.walls[2] = false;
    } else if (dj == 1) {
      cell1.walls[0] = false;
      cell2.walls[1] = false;
    } else if (dj == -1) {
      cell1.walls[1] = false;
      cell2.walls[0] = false;
    }
  };

  drawCells = () => {
    let w = this.cellWidth;
    for (let row of this.cells) {
      for (let cell of row) {
        let colour = cell.wall ? color(0) : color(255);
        cell.show(colour);

        let wallsPos = [
          [cell.j * w, cell.i * w, cell.j * w, (cell.i + 1) * w],
          [(cell.j + 1) * w, cell.i * w, (cell.j + 1) * w, (cell.i + 1) * w],
          [cell.j * w, cell.i * w, (cell.j + 1) * w, cell.i * w],
          [cell.j * w, (cell.i + 1) * w, (cell.j + 1) * w, (cell.i + 1) * w],
        ];

        stroke(0);
        strokeWeight(1);
        for (let i = 0; i < 4; i++) {
          if (cell.walls[i]) {
            line(
              wallsPos[i][0],
              wallsPos[i][1],
              wallsPos[i][2],
              wallsPos[i][3]
            );
          }
        }
      }
    }

    noFill();
    rect(0, 0, width, height);
  };
}

class AStar {
  constructor(start, goal) {
    this.start = start;
    this.goal = goal;
    this.initialise();
  }

  initialise = () => {
    this.openSet = [this.start];
    this.closedSet = [];
    this.current = undefined;

    this.path = undefined;
    this.done = false;
    this.noSolution = false;
  };

  removeFromArray = (arr, item) => {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i] == item) {
        arr.splice(i, 1);
      }
    }
  };

  heuristic = (a, b) => {
    dist(a.i, a.j, b.i, b.j);
  };

  pathfind = () => {
    if (this.openSet.length > 0) {
      this.current = this.openSet[0];
      for (let cell of this.openSet) {
        if (cell.f < this.current.f) {
          this.current = cell;
        }
      }

      if (this.current === this.goal) {
        this.done = true;
        return;
      }

      this.removeFromArray(this.openSet, this.current);
      this.closedSet.push(this.current);

      let neighbours = this.current.neighbours;
      for (let neighbour of neighbours) {
        if (!neighbour.wall && !this.closedSet.includes(neighbour)) {
          let tentativeG = this.current.g + 1;

          let newPath = false;
          if (this.openSet.includes(neighbour)) {
            if (tentativeG < neighbour.g) {
              neighbour.g = tentativeG;
              newPath = true;
            }
          } else {
            neighbour.g = tentativeG;
            this.openSet.push(neighbour);
            newPath = true;
          }

          if (newPath) {
            neighbour.h = this.heuristic(neighbour, this.goal);
            neighbour.f = neighbour.g + neighbour.h;
            neighbour.previous = this.current;
          }
        }
      }
    } else {
      this.noSolution = true;
      return;
    }
  };

  drawSetCells = () => {
    if (!this.done) {
      for (let cell of this.closedSet) {
        cell.show(color(255, 0, 0, 100));
      }
      for (let cell of this.openSet) {
        cell.show(color(0, 255, 0));
      }
    }
  };

  drawPath = () => {
    if (!this.noSolution) {
      this.path = [this.current];
      while (this.current.previous) {
        this.path.push(this.current.previous);
        this.current = this.current.previous;
      }
    }

    let w = this.start.cellWidth;
    for (let i = 0; i < this.path.length - 1; i++) {
      stroke(color(0, 0, 255));
      strokeWeight(w / 4);
      line(
        (this.path[i].j + 0.5) * w,
        (this.path[i].i + 0.5) * w,
        (this.path[i + 1].j + 0.5) * w,
        (this.path[i + 1].i + 0.5) * w
      );
    }
  };

  run = () => {
    this.pathfind();
    this.drawSetCells();
    this.drawPath();
  };
}

let makeCanvas = () => {
  let dimension = Math.min(window.innerWidth, window.innerHeight) * 0.85;
  let canvas = createCanvas(dimension, dimension);
  let canvasElement = canvas.elt;
  let canvasDiv = document.getElementById("canvas-container");
  canvasDiv.appendChild(canvasElement);
};

let rows, cols, cellWidth;
let grid;
let pathfinder, active;
let pathfinderRunning = false;

let setRowsAndCols = (num) => {
  rows = cols = num;
  cellWidth = height / rows;
};

let generateNewGrid = () => {
  grid = new Grid(rows, cols, cellWidth);
  let start = grid.cells[0][0];
  let goal = grid.cells[rows - 1][cols - 1];
  pathfinder = new AStar(start, goal);
};

let addButton = (text, buttonID, onClick) => {
  let button = document.createElement("button");
  button.innerText = text;
  button.id = buttonID;

  button.onclick = onClick;

  let buttonContainer = document.getElementById("button-container");
  buttonContainer.appendChild(button);
};

let disableButton = (buttonID, disable) => {
  let button = document.getElementById(buttonID);
  button.disabled = disable;
};

let disableAllButtons = (disable) => {
  let buttons = Array.from(document.querySelectorAll("button"));
  for (let button of buttons) {
    disableButton(button.id, disable);
  }
};

let configureCellSizeSlider = (onUpdate) => {
  let slider = document.getElementById("grid-size-slider");
  let output = document.getElementById("grid-size-slider-output");

  output.innerHTML = `${slider.value}x${slider.value}`;
  slider.oninput = function () {
    output.innerHTML = `${this.value}x${this.value}`;
    onUpdate();
  };
};

let getSliderValue = (sliderID) => {
  let slider = document.getElementById(sliderID);
  return slider.value;
};

let disableSlider = (disable) => {
  let slider = document.getElementById("grid-size-slider");
  slider.disabled = disable;
};

let resetPathfinder = () => {
  pathfinderRunning = false;
  pathfinder.initialise();
  disableSlider(false);
};

function setup() {
  frameRate(30);

  makeCanvas();
  setRowsAndCols(5);
  generateNewGrid();

  addButton("Start pathfinding", "start-pathfinding", () => {
    pathfinderRunning = true;
    disableSlider(true);
  });
  addButton("Reset pathfinder", "reset-pathfinding", resetPathfinder);
  addButton("Generate random grid", "random-grid", () => {
    resetPathfinder();
    generateNewGrid();
  });
  // addButton("Generate maze", "maze", () => {
  //   resetPathfinder();
  //   disableAllButtons(true);
  //   disableSlider(true);
  //   //generate maze
  //   disableAllButtons(false);
  //   disableSlider(false);
  // });

  configureCellSizeSlider(() => {
    let sliderValue = getSliderValue("grid-size-slider");
    setRowsAndCols(sliderValue);
    generateNewGrid();
  });
}

function draw() {
  background(200);

  grid.drawCells();
  if (pathfinderRunning) {
    pathfinder.run();
  }
}
