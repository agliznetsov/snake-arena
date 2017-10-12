let $ = require("jquery");
// import BoardView from './boardView.js';

// let view = new BoardView('#board', null);
// view.drawGrid();


let mainCanvas = $('#canvas')[0];
let mainContext = mainCanvas.getContext('2d');

let canvasWidth = mainCanvas.width;
let canvasHeight = mainCanvas.height;


let start = Date.now();
let counter = 0;
let x = 10;
let y = 10;

let dx = 1;
let dy = 0;

function printFps() {
    counter++;
    let now = Date.now();
    if (now - start > 1000) {
        console.log('fps', counter);
        start = now;
        counter = 0;
    }
}

function draw() {
    //printFps();

    mainContext.clearRect(0, 0, canvasWidth, canvasHeight);
    mainContext.fillStyle = '#F6F6F6';
    mainContext.fillRect(0, 0, canvasWidth, canvasHeight);

    mainContext.fillStyle = 'red';
    mainContext.fillRect(x * 20, y * 20, 20, 20);

    // call the draw function again!
    requestAnimationFrame(draw);
}


function step() {
    x += dx;
    y += dy;
    if (x >= canvasWidth / 20) {
        x = 0;
    }
    if (x < 0) {
        x = 19;
    }
    if (y >= canvasHeight / 20) {
        y = 0;
    }
    if (y < 0) {
        y = 19;
    }
    // console.log(x, y, dx, dy);
}

function onKeyDown(e) {
    console.log(e.key);
    if (e.key === "ArrowUp") {
        dx = 0;
        dy = -1;
    } else if (e.key === "ArrowDown") {
        dx = 0;
        dy = 1;
    } else if (e.key === "ArrowLeft") {
        dx = -1;
        dy = 0;
    } else if (e.key === "ArrowRight") {
        dx = 1;
        dy = 0;
    }
}

// call the draw function approximately 60 times a second
requestAnimationFrame(draw);

let timer = setInterval(step, 100);

addEventListener('keydown', onKeyDown, true);

