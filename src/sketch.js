class Cell {
  constructor(i, j, cellWidth) {
    this.i = i;
    this.j = j;
    this.cellWidth = cellWidth;

    this.f = 0;
    this.g = 0;
    this.h = 0;

    this.neighbours = [];
    this.previous = undefined;

    this.wall = false;
    if (!(i == 0 && j == 0) && random() < 0.3) {
      this.wall = true;
    }
  }

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

  drawCells = () => {
    for (let row of this.cells) {
      for (let cell of row) {
        let colour = cell.wall ? color(0) : color(255);
        cell.show(colour);
      }
    }

    stroke(0);
    strokeWeight(1);
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
  let canvas = createCanvas(500, 500);
  let canvasElement = canvas.elt;
  let canvasDiv = document.getElementById("canvas-container");
  canvasDiv.appendChild(canvasElement);
};

let rows, cols, cellWidth;
let grid;
let pathfinder;

let setRowsAndCols = (num) => {
  rows = cols = num;
  cellWidth = width / cols;
};

let generateNewGrid = () => {
  grid = new Grid(rows, cols, cellWidth);
  let start = grid.cells[0][0];
  let goal = grid.cells[rows - 1][cols - 1];
  pathfinder = new AStar(start, goal);
  pathfinder.start = start;
  pathfinder.goal = goal;
};

let addButton = (text, onClick) => {
  let button = document.createElement("button");
  button.innerText = text;
  button.onclick = onClick;

  let buttonContainer = document.getElementById("button-container");
  buttonContainer.appendChild(button);
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

let getSliderValue = () => {
  let slider = document.getElementById("grid-size-slider");
  return slider.value;
};

let disableSlider = (disable) => {
  let slider = document.getElementById("grid-size-slider");
  slider.disabled = disable;
};

function setup() {
  makeCanvas();
  setRowsAndCols(5);
  generateNewGrid();

  running = false;
  let resetPathfinder = () => {
    running = false;
    disableSlider(false);
    pathfinder.initialise();
  };
  addButton("Start pathfinding", () => {
    running = true;
    disableSlider(true);
  });
  addButton("Reset pathfinder", resetPathfinder);
  addButton("Generate new grid", () => {
    generateNewGrid();
    resetPathfinder();
  });

  configureCellSizeSlider(() => {
    let sliderValue = getSliderValue();
    setRowsAndCols(sliderValue);
    generateNewGrid();
  });
}

function draw() {
  background(200);

  grid.drawCells();
  if (running) {
    pathfinder.run();
  }
}
