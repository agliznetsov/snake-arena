console.log("Starting app...");

const Store = require("./store");
const Board = require("./board");
const d3 = require('d3');
const webSocket = require('websocket');
const http = require('http');
const _ = require('lodash');

const PORT = 2525;
const CELL_SIZE = 20;

const store = new Store({
    userName: "Anonymous",
    speed: "5",
    host: "localhost"
});

let clients;
let board;
let snake;
let clientConnection;

function onKeyDown(e) {
    if (snake) {
        snake.turn(e.key);
    } else if (clientConnection) {
        clientConnection.sendUTF("turn:" + e.key);
    }
}

function draw() {
    if (board) {
        let canvas = document.getElementById('canvas');
        let context = canvas.getContext('2d');
        canvas.width = board.width * CELL_SIZE;
        canvas.height = board.height * CELL_SIZE;

        context.fillStyle = '#F6F6F6';
        context.strokeStyle = 'black';
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.strokeRect(0, 0, canvas.width, canvas.height);

        context.strokeStyle = '#E0E0E0';
        for (let x = 0; x < board.width; x++) {
            context.strokeRect(x * CELL_SIZE, 0, x * CELL_SIZE, canvas.height);
        }
        for (let y = 0; y < board.height; y++) {
            context.strokeRect(0, y * CELL_SIZE, canvas.width, y * CELL_SIZE);
        }

        for (let a of board.apples) {
            context.fillStyle = 'black';
            context.beginPath();
            context.arc(
                a.x * CELL_SIZE + CELL_SIZE / 2,
                a.y * CELL_SIZE + CELL_SIZE / 2,
                CELL_SIZE / 2,
                0, 2 * Math.PI);
            context.fill();
        }

        for (let snake of board.snakes) {
            context.fillStyle = snake.color;
            // context.strokeStyle = '#A0A0A0';
            for (let s of snake.segments) {
                context.fillRect(s.x * CELL_SIZE, s.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                // context.strokeRect(s.x * CELL_SIZE, s.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
            let h = snake.head();
            context.fillStyle = 'black';
            context.beginPath();
            context.arc(
                h.x * CELL_SIZE + CELL_SIZE / 2,
                h.y * CELL_SIZE + CELL_SIZE / 2,
                5, 0, 2 * Math.PI);
            context.fill();
        }
    }
    requestAnimationFrame(draw);
}

function displayStats() {
    if (board) {
        let container = d3.select('#players');
        container.selectAll("*").remove();

        let sorted = _.orderBy(board.players, ["score"], ["desc"]);
        for (let p of sorted) {
            let row = container.append("div").classed("player-row", true).style("background-color", p.color);
            row.append("div").classed("player-name", true).text(p.name);
            row.append("div").classed("player-score", true).text(p.score);
        }
    }
}

function loadConfig() {
    d3.select("#userName").property("value", store.get("userName"));
    d3.select("#host").property("value", store.get("host"));
    d3.select("#speed").property("value", store.get("speed"));
    d3.select("#connect").on("click", connect);
    d3.select("#start").on("click", start);
}

function saveConfig() {
    store.set("userName", d3.select("#userName").property("value"));
    store.set("host", d3.select("#host").property("value"));
    store.set("speed", d3.select("#speed").property("value"));
}

function connect() {
    saveConfig();
    console.log("connect");

    let client = new webSocket.client();

    client.on('connectFailed', function (error) {
        console.error(error);
    });

    client.on('connect', function (connection) {
        console.log("connected");
        clientConnection = connection;
        showBoard();

        connection.on('error', function (error) {
            console.error("Connection Error: ", error);
        });

        connection.on('close', function () {
            console.log('Connection Closed');
        });

        connection.on('message', function (message) {
            try {
                let json = JSON.parse(message.utf8Data);
                board = Board.fromJson(json);
            } catch (e) {
                console.error("invalid json", message.utf8Data);
            }
        });

        connection.sendUTF("player:" + store.get("userName"));
    });

    let url = "ws://" + store.get("host") + ":" + PORT + "/";
    client.connect(url);
}

function start() {
    saveConfig();
    console.log("start");

    clients = [];
    board = new Board(30, 20, 3);
    board.addPlayer(store.get("userName"));
    snake = board.snakes[0];

    let server = http.createServer(function (request, response) {
    });
    server.listen(PORT, function () {
        console.log("Server is listening on port ", PORT);
    });

    let wsServer = new webSocket.server({
        httpServer: server
    });

    wsServer.on('request', function (request) {
        console.log('Connection from origin ' + request.origin + '.');
        let connection = request.accept(null, request.origin);
        let index = clients.push(connection) - 1;
        let id;

        connection.on('message', function (message) {
            if (message.type === 'utf8') {
                let arr = message.utf8Data.split(":");
                if (arr[0] === "player") {
                    id = board.addPlayer(arr[1]);
                } else if (arr[0] === "turn") {
                    if (id >= 0) {
                        let snake = board.getSnake(id);
                        snake.turn(arr[1]);
                    }
                }
            }
        });

        connection.on('close', function (connection) {
            console.log("Player disconnected.");
            clients.splice(index, 1);
            if (id >= 0) {
                board.removePlayer(id);
            }
        });
    });

    let timer = setInterval(function () {
        board.step();
        broadcast();
    }, 500 / store.get("speed"));

    showBoard();
}

function broadcast() {
    if (clients) {
        let data = JSON.stringify(board);
        for (let c of clients) {
            c.sendUTF(data);
        }
    }
}

function showBoard() {
    addEventListener('keydown', onKeyDown, true);
    requestAnimationFrame(draw);
    displayStats();
    setInterval(displayStats, 500);
    d3.select("#menu").attr("hidden", true);
    d3.select("#board").attr("hidden", false);
}

loadConfig();