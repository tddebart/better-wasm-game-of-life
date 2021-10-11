import {Universe, Cell} from "better-wasm-game-of-life";
import { memory } from "better-wasm-game-of-life/better_wasm_game_of_life_bg";
import Stats from "stats.js";

// Framerate
let stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

const CELL_SIZE = 5; // px
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

// Construct the universe, and get its width and height.
const universe = Universe.new(100, 100);
const width = universe.width();
const height = universe.height();

// Give the canvas room for all of our cells and a 1px border
// around each of them.
const canvas = document.getElementById("game-of-life-canvas");
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;

const ctx = canvas.getContext('2d');

let animationId = null;

const renderLoop = () => {
    stats.begin()

    universe.tick();

    drawGrid();
    drawCells();

    stats.end();

    animationId = requestAnimationFrame(renderLoop);
};

const isPaused = () => {
    return animationId === null;
};

//#region pause button
const playPauseButton = document.getElementById("play-pause");

const play = () => {
    playPauseButton.textContent = "⏸";
    renderLoop();
};

const pause = () => {
    playPauseButton.textContent = "▶";
    cancelAnimationFrame(animationId);
    animationId = null;
};

// noinspection JSUnusedLocalSymbols
playPauseButton.addEventListener("click", event => {
    if (isPaused()) {
        play();
    } else {
        pause();
    }
});
//#endregion

const drawGrid = () => {
    ctx.beginPath();
    ctx.strokeStyle = GRID_COLOR;

    // Vertical lines.
    for (let i = 0; i <= width; i++) {
        ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
        ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
    }

    // Horizontal lines.
    for (let j = 0; j <= height; j++) {
        ctx.moveTo(0,                           j * (CELL_SIZE + 1) + 1);
        ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
    }

    ctx.stroke();
};

const getIndex = (row, column) => {
    return row * width + column;
};

const drawCells = () => {
    const cellsPtr = universe.cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

    ctx.beginPath();

    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const idx = getIndex(row, col);

            ctx.fillStyle = cells[idx] === Cell.Dead
                ? DEAD_COLOR
                : ALIVE_COLOR;

            ctx.fillRect(
                col * (CELL_SIZE + 1) + 1,
                row * (CELL_SIZE + 1) + 1,
                CELL_SIZE,
                CELL_SIZE
            );
        }
    }

    ctx.stroke();
};

var mouseDown = 0;
document.body.onmousedown = function() {
    mouseDown = 1;
}
document.body.onmouseup = function() {
    mouseDown = 0;
}

canvas.addEventListener("mousemove", event => {
    if(mouseDown === 1) {
        turnCell(event, true)
    }
});
canvas.addEventListener("click", event => {
    turnCell(event, true)
});
// canvas.addEventListener("contextmenu", event => {
//     turnCell(event, false)
// });

function turnCell(event, on) {
    const boundingRect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / boundingRect.width;
    const scaleY = canvas.height / boundingRect.height;

    const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
    const canvasTop = (event.clientY - boundingRect.top) * scaleY;

    const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
    const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);
    if(on === true) {
        universe.cell_on(row, col);
    } else {
        universe.cell_off(row,col)
    }

    drawGrid()
    drawCells()
}

document.getElementById('clear').onclick = Clear

function Clear() {
    for (let i = 0; i < universe.width(); i++) {
        for (let j = 0; j < universe.height(); j++) {
            universe.cell_off(j,i);
        }
    }
    drawGrid()
    drawCells()
}

document.addEventListener('contextmenu', event => event.preventDefault());

// canvas.addEventListener('mousemove', function(evt) {
//     let mousePos = getMousePos(canvas, evt);
//     const idx = getIndex(Math.floor(mousePos.x/canvas.width*width), Math.floor(mousePos.y/canvas.height*height));
//     universe.cells[idx] = 1
//     console.log(Math.floor(mousePos.x/canvas.width*width), Math.floor(mousePos.y/canvas.height*height))
// }, false);

// function getMousePos(canvas, evt) {
//     let rect = canvas.getBoundingClientRect();
//     return {
//         x: evt.clientX - rect.left,
//         y: evt.clientY - rect.top
//     };
// }

// start the game
play();

