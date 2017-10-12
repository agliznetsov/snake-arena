const game = require('./game');
const Direction = game.Direction;

class Snake {
    constructor(id, color) {
        this.id = id;
        this.color = color;
    }

    static fromJson(data) {
        let s = new Snake(data.id, data.color);
        s.direction = data.direction;
        s.segments = data.segments;
        return s;
    }

    reset(x, y, size) {
        this.direction = Direction.RIGHT;
        this.segments = [];
        for (let i = 0; i < size; i++) {
            this.segments.push({x: x - i, y: y});
        }
    }

    move() {
        let head = this.segments[0];
        let cell = {x: head.x + this.direction.dx, y: head.y + this.direction.dy};
        this.segments.splice(this.segments.length - 1, 1);
        this.segments.splice(0, 0, cell);
    }

    size() {
        return this.segments.length;
    }

    head(cell) {
        if (cell) {
            this.segments[0] = cell;
        }
        return this.segments[0];
    }

    isHead(cell) {
        let head = this.head();
        return head.x === cell.x && head.y === cell.y;
    }

    isBody(cell) {
        for (let i = 1; i < this.segments.length; i++) {
            let s = this.segments[i];
            if (s.x === cell.x && s.y === cell.y) {
                return true;
            }
        }
        return false;
    }

    grow() {
        let tail = this.segments[this.segments.length - 1];
        this.segments.push({x: tail.h, y: tail.y});
    }

    goUp() {
        if (this.direction !== Direction.DOWN) {
            this.direction = Direction.UP;
        }
    }

    goDown() {
        if (this.direction !== Direction.UP) {
            this.direction = Direction.DOWN;
        }
    }

    goLeft() {
        if (this.direction !== Direction.RIGHT) {
            this.direction = Direction.LEFT;
        }
    }

    goRight() {
        if (this.direction !== Direction.LEFT) {
            this.direction = Direction.RIGHT;
        }
    }
}

module.exports = Snake;