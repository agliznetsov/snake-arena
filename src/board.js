const game = require('./game');
const Player = require('./player');
const Snake = require('./snake');
const _ = require('lodash');

let counter = 0;

class Board {
    constructor(width, height, appleCount) {
        this.appleCount = appleCount;
        this.width = width;
        this.height = height;
        this.snakes = [];
        this.players = [];
        this.apples = [];
    }

    static fromJson(data) {
        let b = new Board(data.width, data.height, data.appleCount);
        b.apples = data.apples;
        b.players = data.players;
        for (let s of data.snakes) {
            b.snakes.push(Snake.fromJson(s));
        }
        return b;
    }

    moveSnakes() {
        for (let snake of this.snakes) {
            snake.move();
            this.checkBounds(snake);
        }
        for (let snake of this.snakes) {
            this.checkCollision(snake);
        }
        for (let snake of this.snakes) {
            if (snake.dead) {
                snake.dead = false;
                snake.reset(
                    Math.ceil(Math.random() * this.width),
                    Math.ceil(Math.random() * this.height),
                    1);
            } else {
                this.checkApples(snake);
            }
        }
    }

    checkBounds(snake) {
        let h = snake.head();
        if (h.x >= this.width) {
            h.x = 0;
        }
        if (h.x < 0) {
            h.x = this.width - 1;
        }
        if (h.y >= this.height) {
            h.y = 0;
        }
        if (h.y < 0) {
            h.y = this.height - 1;
        }
    }

    checkCollision(snake) {
        if (snake.isBody(snake.head())) {
            snake.dead = true;
            console.log("dead");
        }
        for (let s of this.snakes) {
            if (snake.id !== s.id && (s.isBody(snake.head()) || s.isHead(snake.head()))) {
                snake.dead = true;
                console.log("dead");
            }
        }
    }

    checkApples(snake) {
        let h = snake.head();
        for (let i = 0; i < this.apples.length; i++) {
            let a = this.apples[i];
            if (a.x === h.x && a.y === h.y) {
                this.apples.splice(i, 1);
                snake.grow();
                let score = snake.size();
                let players = _.filter(this.players, {id: snake.id});
                players[0].score += score;
                break;
            }
        }
    }

    isEmpty(cell) {
        for (let snake of this.snakes) {
            if (snake.isBody(cell) || snake.isHead(cell)) {
                return false;
            }
        }
        for (let a of this.apples) {
            if (a.x === cell.x && a.y === cell.y) {
                return false;
            }
        }
        return true;
    }

    step() {
        this.moveSnakes();
        if (this.apples.length < this.appleCount) {
            this.addApple();
        }
    }

    addPlayer(name) {
        let id = ++counter;
        let color = game.COLORS[(id - 1) % game.COLORS.length];
        this.players.push(new Player(id, color, name));
        let snake = new Snake(id, color);
        snake.reset(
            Math.ceil(Math.random() * this.width),
            Math.ceil(Math.random() * this.height),
            2);
        this.snakes.push(snake);
        return id;
    }

    removePlayer(id) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].id === id) {
                this.players.splice(i, 1);
            }
        }
        for (let i = 0; i < this.snakes.length; i++) {
            if (this.snakes[i].id === id) {
                this.snakes.splice(i, 1);
            }
        }
    }

    getSnake(id) {
        let arr = _.filter(this.snakes, {id: id});
        return arr[0];
    }

    addApple() {
        let i = 100;
        while (i > 0) {
            i--;
            let cell = {
                x: Math.floor(Math.random() * this.width),
                y: Math.floor(Math.random() * this.height)
            };
            if (this.isEmpty(cell)) {
                this.apples.push(cell);
                break;
            }
        }
    }
}

module.exports = Board;