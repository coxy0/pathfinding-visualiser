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
    this.wallProbability = 0.15;
    if (!(i == 0 && j == 0) && random() < this.wallProbability) {
      this.wall = true;
    }
    this.walls = [false, false, false, false];
  }

  initCell = () => {
    this.wall = false;

    this.neighbours = [];
    this.previous = undefined;

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

  generateMaze = () => {
    this.initAllCells();
    this.setAllWalls();

    let current = this.cells[0][0];
    let stack = [];
    let iterations = 0;

    while (stack.length > 0 || iterations == 0) {
      current.visited = true;

      let neighbours = [];
      for (let neighbour of current.neighbours) {
        if (!neighbour.visited) {
          neighbours.push(neighbour);
        }
      }
      let next = neighbours[floor(random(0, neighbours.length))];
      if (next) {
        next.visited = true;
        stack.push(current);
        this.removeWall(current, next);
        current = next;
      } else if (stack.length > 0) {
        current = stack.pop();
      }

      iterations++;
    }
    this.initAllCells();
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
        strokeWeight(2);
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
    return dist(a.i, a.j, b.i, b.j);
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
        let di = this.current.i - neighbour.i;
        let dj = this.current.j - neighbour.j;
        let neighbourIsWall =
          neighbour.wall ||
          (dj == -1 && neighbour.walls[0]) ||
          (dj == 1 && neighbour.walls[1]) ||
          (di == -1 && neighbour.walls[2]) ||
          (di == 1 && neighbour.walls[3]);
        if (!neighbourIsWall && !this.closedSet.includes(neighbour)) {
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

class Dijkstra {
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

  pathfind = () => {
    if (this.openSet.length > 0) {
      this.current = this.openSet[0];
      for (let cell of this.openSet) {
        if (cell.g < this.current.g) {
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
        let di = this.current.i - neighbour.i;
        let dj = this.current.j - neighbour.j;
        let neighbourIsWall =
          neighbour.wall ||
          (dj == -1 && neighbour.walls[0]) ||
          (dj == 1 && neighbour.walls[1]) ||
          (di == -1 && neighbour.walls[2]) ||
          (di == 1 && neighbour.walls[3]);
        if (!neighbourIsWall && !this.closedSet.includes(neighbour)) {
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
let pathfinder;
let activePathfinder = "A*";
// let activePathfinder = "Dijkstra's";
let pathfinderRunning = false;

let setRowsAndCols = (num) => {
  rows = cols = num;
  cellWidth = height / rows;
};

let getPathfinder = () => {
  const pathfinderClasses = {
    "A*": AStar,
    "Dijkstra's": Dijkstra,
  };

  let start = grid.cells[0][0];
  let goal = grid.cells[rows - 1][cols - 1];
  return new pathfinderClasses[activePathfinder](start, goal);
};

let generateNewGrid = () => {
  grid = new Grid(rows, cols, cellWidth);
  pathfinder = getPathfinder();
};

let addButton = (row, text, buttonID, onClick) => {
  let button = document.createElement("button");
  button.innerText = text;
  button.id = buttonID;

  button.onclick = onClick;

  let buttonContainer;
  if (row == 1) {
    buttonContainer = document.getElementById("button-container-row-1");
  } else if (row == 2) {
    buttonContainer = document.getElementById("button-container-row-2");
  }
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

let configureCellSizeSlider = () => {
  let slider = document.getElementById("grid-size-slider");
  let output = document.getElementById("grid-size-slider-output");

  output.innerHTML = `${slider.value}x${slider.value}`;
  slider.oninput = function () {
    output.innerHTML = `${this.value}x${this.value}`;

    let sliderValue = getSliderValue("grid-size-slider");
    setRowsAndCols(sliderValue);
    generateNewGrid();
  };
};

let getSliderValue = (sliderID) => {
  let slider = document.getElementById(sliderID);
  return slider.value;
};

let disableSlider = (sliderID, disable) => {
  let slider = document.getElementById(sliderID);
  slider.disabled = disable;
};

let resetPathfinder = () => {
  pathfinderRunning = false;
  pathfinder.initialise();
  disableSlider("grid-size-slider", false);
};

function setup() {
  frameRate(30);

  makeCanvas();
  setRowsAndCols(5);
  generateNewGrid();

  // row 1
  addButton(
    1,
    `Start ${activePathfinder} pathfinding`,
    "start-pathfinding",
    () => {
      pathfinderRunning = true;
      disableSlider("grid-size-slider", true);
    }
  );
  addButton(1, "Reset pathfinder", "reset-pathfinding", resetPathfinder);
  addButton(1, "Generate random grid", "random-grid", () => {
    resetPathfinder();
    generateNewGrid();
  });
  addButton(1, "Generate maze", "generate-maze", () => {
    resetPathfinder();
    grid.generateMaze();
  });

  // row 2
  addButton(2, "Switch to A*", "switch-to-a-star", () => {});
  addButton(2, "Switch to Dijkstra's", "switch-to-dijkstra", () => {});
  let row2Div = document.getElementById("button-container-row-2");
  let buttons = row2Div.querySelectorAll("button");
  buttons.forEach(function (button) {
    button.onclick = () => {
      let buttonText = button.innerHTML;
      let algorithm = buttonText.split(" ")[2];
      if (activePathfinder != algorithm) {
        resetPathfinder();
        activePathfinder = algorithm;
        pathfinder = getPathfinder();
      }

      let startButton = document.getElementById("start-pathfinding");
      startButton.innerHTML = `Start ${algorithm} pathfinding`;
    };
  });

  configureCellSizeSlider();
}

function draw() {
  background(200);

  grid.drawCells();
  if (pathfinderRunning) {
    pathfinder.run();
  }
}
