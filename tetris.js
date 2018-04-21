const electron = require('electron');
const path = require('path');
const url = require('url');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.


const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length -1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type)
{
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
            }
        });
    });
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player); 
        playerReset();
        // player.matrix = nextTetris2
        arenaSweep();
        updateScore();
       
        
       

    }
    dropCounter = 0;
}

function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
}


function playerReset() {

// const pieces = 'TJLOSZI';

//     var nextPiece = pieces[pieces.length * Math.random() | 0];
//     var nextPiece2 = pieces[pieces.length * Math.random() | 0];

//     nextTetris2 = createPiece(nextPiece2);
    //                 if (nextPiece2 === "T") {document.getElementById('showNextTetris').innerText = "T";
    //          } else if (nextPiece2 === "J") {document.getElementById('showNextTetris').innerText = "J";
    //          } else if (nextPiece2 === "L") {document.getElementById('showNextTetris').innerText = "L";
    //          } else if (nextPiece2 === "O") {document.getElementById('showNextTetris').innerText = "O";
    //          } else if (nextPiece2 === "S") {document.getElementById('showNextTetris').innerText = "S";
    //          } else if (nextPiece2 === "Z") {document.getElementById('showNextTetris').innerText = "Z";
    //          } else if (nextPiece2 === "I") {document.getElementById('showNextTetris').innerText = "I";
    //       } 

// createTetris();
    
    createTetris(nextPiece, nextPiece2);
    
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();

      }
    
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    lastTime = time;

    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById('score').innerText = player.score;

}



document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 81) {
        playerRotate(-1);
    } else if (event.keyCode === 87) {
        playerRotate(1);
    }
});

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

const arena = createMatrix(12, 20);

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};

const pieces = 'TJLOSZI';
var nextPiece = pieces[pieces.length * Math.random() | 0];
var nextPiece2 = pieces[pieces.length * Math.random() | 0];

function createTetris(nextPiece, nextPiece2) {

// for (i = 0; i < 5; i++) {

nextTetris = createPiece(nextPiece);
nextTetris2= createPiece(nextPiece2);
                    if (nextPiece2 === "T") {document.getElementById('showNextTetris').innerText = "T";
             } else if (nextPiece2 === "J") {document.getElementById('showNextTetris').innerText = "J";
             } else if (nextPiece2 === "L") {document.getElementById('showNextTetris').innerText = "L";
             } else if (nextPiece2 === "O") {document.getElementById('showNextTetris').innerText = "O";
             } else if (nextPiece2 === "S") {document.getElementById('showNextTetris').innerText = "S";
             } else if (nextPiece2 === "Z") {document.getElementById('showNextTetris').innerText = "Z";
             } else if (nextPiece2 === "I") {document.getElementById('showNextTetris').innerText = "I";
          } 
 player.matrix = nextTetris

while (player.pos.y == 0) {

console.log('abcd');
player.matrix = nextTetris2;

}

// player.matrix =  "nextTetris" + i + 1

// }

    // if (collide(arena, player)) {
    //     player.pos.y--;
    //     merge(arena, player); 
    //     player.pos.y = 0; 
    //   }
      


}

playerReset();
updateScore();
update();




let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.