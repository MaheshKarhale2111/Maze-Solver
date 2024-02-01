// alert("working");
let maze = document.querySelector(".maze");
let ctx = maze.getContext("2d"); // ctx is 2d rendering context
let current;
let finished = true;

class Maze {
  constructor(size, rows, columns, speed) {
    this.size = size;
    this.rows = rows;
    this.columns = columns;
    this.speed = speed;
    this.grid = [];
    this.stack = [];
  }

  setup() {
    for (let r = 0; r < this.rows; r++) {
      let row = [];
      for (let c = 0; c < this.columns; c++) {
        let cell = new Cell(r, c, this.grid, this.size);
        row.push(cell);
      }
      this.grid.push(row);
    }

    current = this.grid[0][0]; // maze generation will stop herer
  }

  draw() {
    maze.width = this.size;
    maze.height = this.size;
    maze.style.background = "black";
    current.visited = true;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.columns; c++) {
        let grid = this.grid;
        grid[r][c].show(this.size, this.rows, this.columns);
      }
    }

    let next = current.checkNeighbours(); // this function will return random available neighbour
    if (next) {
      next.visited = true;
      this.stack.push(current);

      current.highlight(this.columns);

      current.removeWall(current, next);

      current = next;
    } else if (this.stack.length > 0) {
      // this is backtracking

      let cell = this.stack.pop();
      current = cell;
      current.highlight(this.columns);
    }

    if (this.stack.length === 0) {
      // stack is empty means all cells are visited
      finished = true;
      return;
    }

    // window.requestAnimationFrame(() => {
    //   this.draw();
    // });

    window.requestAnimationFrame(() => {
      setTimeout(() => {
        this.draw();
      }, this.speed);
    });
  }
}

class Cell {
  constructor(rowNum, colNum, parentGrid, parentSize) {
    this.rowNum = rowNum;
    this.colNum = colNum;
    this.parentGrid = parentGrid;
    this.parentSize = parentSize;
    this.visited = false;
    this.walls = {
      topWall: true,
      rightWall: true,
      bottomWall: true,
      leftWall: true,
    };
  }

  checkNeighbours() {
    let grid = this.parentGrid;
    let row = this.rowNum;
    let col = this.colNum;

    let neighbours = []; // empty array to push neighbours

    // if some neighbour is not available then we will return undefined

    let top = row !== 0 ? grid[row - 1][col] : undefined;
    let right = col !== grid.length - 1 ? grid[row][col + 1] : undefined;
    let bottom = row !== grid.length - 1 ? grid[row + 1][col] : undefined;
    let left = col !== 0 ? grid[row][col - 1] : undefined;

    if (top && !top.visited) {
      // if top is available and top it is not visited then push into neighbours array
      neighbours.push(top);
    }
    if (right && !right.visited) {
      neighbours.push(right);
    }
    if (bottom && !bottom.visited) {
      neighbours.push(bottom);
    }
    if (left && !left.visited) {
      neighbours.push(left);
    }

    // by this point we have all available neighbours to thecell
    // we can choose a random neighbour to proceed

    if (neighbours.length !== 0) {
      // neighbours should not be empty
      let random = Math.floor(Math.random() * neighbours.length);
      return neighbours[random];
    } else {
      return undefined;
    }
  }

  drawTopWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size / columns, y);
    ctx.stroke();
  }
  drawRightWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x + size / columns, y);
    ctx.lineTo(x + size / columns, y + size / rows);
    ctx.stroke();
  }
  drawBottomWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x, y + size / rows);
    ctx.lineTo(x + size / columns, y + size / rows);
    ctx.stroke();
  }

  drawLeftWall(x, y, size, columns, rows) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + size / rows);
    ctx.stroke();
  }

  highlight(columns) {
    let x = (this.colNum * this.parentSize) / columns + 1;
    let y = (this.rowNum * this.parentSize) / columns + 1;

    ctx.fillStyle = "yellow";
    ctx.fillRect(
      x,
      y,
      this.parentSize / columns - 3,
      this.parentSize / columns - 3
    );
  }

  removeWall(cell1, cell2) {
    // explanaiton at 45.00
    let x = cell1.colNum - cell2.colNum;
    let y = cell1.rowNum - cell2.rowNum;

    if (x === 1) {
      cell1.walls.leftWall = false;
      cell2.walls.rightWall = false;
    } else if (x === -1) {
      cell2.walls.leftWall = false;
      cell1.walls.rightWall = false;
    }

    if (y === 1) {
      cell1.walls.topWall = false;
      cell2.walls.bottomWall = false;
    } else if (y === -1) {
      cell2.walls.topWall = false;
      cell1.walls.bottomWall = false;
    }
  }

  show(size, rows, columns) {
    let x = (this.colNum * size) / columns;
    let y = (this.rowNum * size) / rows;

    ctx.strokeStyle = "white";
    ctx.fillStyle = "black";
    ctx.lineWidth = 2;

    if (this.walls.topWall) {
      // if the topwall from the walls object is true the do following thing
      this.drawTopWall(x, y, size, columns, rows);
    }
    if (this.walls.rightWall) {
      this.drawRightWall(x, y, size, columns, rows);
    }
    if (this.walls.bottomWall) {
      this.drawBottomWall(x, y, size, columns, rows);
    }
    if (this.walls.leftWall) {
      this.drawLeftWall(x, y, size, columns, rows);
    }

    if (this.visited) {
      // reason given at 32.00
      ctx.fillRect(x + 1, y + 1, size / columns - 2, size / rows - 2);
      // fillRect - a rendering technique - fillRect(x,y,width,height);
    }
  }
}

const btn1 = document.querySelector("#btn1");


btn1.addEventListener("click", () => {
  const grid_size = document.querySelector("#grid_size").value;
  let speed = document.querySelector("#speed").value;
  // speed we want in between 1 to 10 where 1 is slowest equivalent to 200ms and 10 is fastest equivalent to 20 ms
  speed = (11 - speed) * 20;
  if (finished) {
    finished = false;
    const newMaze = new Maze(800, grid_size, grid_size, speed);
    newMaze.setup();
    newMaze.draw();
  }
});
