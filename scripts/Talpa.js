import CellState from "./CellState.js";
import Cell from "./Cell.js";
import Player from "./Player.js";
import Winner from "./Winner.js";

export default class Talpa {
    constructor(nrows, ncols) {
        this.rows = nrows;
        this.cols = ncols;
        this.board = Array(nrows).fill().map(() => Array(ncols).fill(CellState.EMPTY));
        this.turn = Player.PLAYER1;    
    }
    startBoard() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j += 2) {
                if (i % 2 === 0) {
                    this.board[i][j] = CellState.PLAYER1;
                    this.board[i][j + 1] = CellState.PLAYER2;
                } else {
                    this.board[i][j] = CellState.PLAYER2;
                    this.board[i][j + 1] = CellState.PLAYER1;
                }
            }
        }
    }
    getBoard() {
        return this.board;
    }
    move(beginCell, endCell) {
        let { x: or, y: oc } = beginCell;
        let piece = this.turn === Player.PLAYER1 ? CellState.PLAYER1 : CellState.PLAYER2;
        if (this.board[or][oc] !== piece) {
            throw new Error("Origin is not of the current player.");
        }
        if (this.playerCanCapture()) {
            let { x: dr, y: dc } = endCell;
            if (!beginCell || !endCell) {
                throw new Error("Origin or destination is undefined.");
            }
            if (!this.onBoard(beginCell) || !this.onBoard(endCell)) {
                throw new Error("Origin or destination is not on board.");
            }
            if (this.board[dr][dc] === piece || this.board[dr][dc] === CellState.EMPTY) {
                throw new Error("Destination does not contain an opponent piece.");
            }
            let cells = [new Cell(or - 1, oc), new Cell(or + 1, oc), new Cell(or, oc - 1), new Cell(or, oc + 1)];
            if (cells.filter(c => c.equals(endCell)).length === 0) {
                throw new Error("Destination is not ortogonnaly positioned in relation to origin.");
            }
            this.board[dr][dc] = this.board[or][oc];
            this.board[or][oc] = CellState.EMPTY;
        } else {
            if (!beginCell) {
                throw new Error("Origin is undefined.");
            }
            if (!this.onBoard(beginCell)) {
                throw new Error("Origin is not on board.");
            }
            this.board[or][oc] = CellState.EMPTY;
        }
        let result = this.endOfGame();
        this.turn = this.turn === Player.PLAYER1 ? Player.PLAYER2 : Player.PLAYER1;
        return result;
    }
    canCapture(cell) {
        let cells = [new Cell(cell.x - 1, cell.y), new Cell(cell.x + 1, cell.y), new Cell(cell.x, cell.y - 1), new Cell(cell.x, cell.y + 1)];
        for (let c of cells) {
            if (this.onBoard(c) && this.board[c.x][c.y] !== this.board[cell.x][cell.y] && this.board[c.x][c.y] !== CellState.EMPTY) {
                return true;
            }
        }
        return false;
    }
    playerCanCapture() {
        let player = this.turn === Player.PLAYER1 ? CellState.PLAYER1 : CellState.PLAYER2;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.board[i][j] === player && this.canCapture(new Cell(i, j))) {
                    return true;
                }
            }
        }
        return false;
    }
    endOfGame() {
        return this.checkPath(CellState.EMPTY);
    }
    checkPath(piece, path = []) {
        if (this.turn === Player.PLAYER1) {
            for (let i = 0; i < this.rows; i++) {
                if (this.board[i][0] === piece && this.checkSpace(new Cell(i, 0), CellState.PLAYER2, path)) {
                    return Winner.PLAYER2;
                }
            }
            for (let i = 0; i < this.cols; i++) {
                if (this.board[0][i] === piece && this.checkSpace(new Cell(0, i), CellState.PLAYER1, path)) {
                    return Winner.PLAYER1;
                }
            }
        } else {
            for (let i = 0; i < this.cols; i++) {
                if (this.board[0][i] === piece && this.checkSpace(new Cell(0, i), CellState.PLAYER1, path)) {
                    return Winner.PLAYER1;
                }
            }
            for (let i = 0; i < this.rows; i++) {
                if (this.board[i][0] === piece && this.checkSpace(new Cell(i, 0), CellState.PLAYER2, path)) {
                    return Winner.PLAYER2;
                }
            }
        }
        return Winner.NONE;
    }
    checkSpace(cCell, player, path = []) {
        path.push(cCell);
        let { x: row, y: col } = cCell;
        let coords = [new Cell(row - 1, col), new Cell(row + 1, col), new Cell(row, col - 1), new Cell(row, col + 1)];
        for (let i = 0; i < coords.length; i++) {
            let { x, y } = coords[i];
            let cells = path.filter(c => c.equals(coords[i]));
            if (cells.length === 0 && this.onBoard(coords[i]) && this.board[x][y] === CellState.EMPTY) {
                if (player === CellState.PLAYER1 && x === this.rows - 1) {
                    path.push(coords[i]);
                    return true;
                }
                if (player === CellState.PLAYER2 && y === this.cols - 1) {
                    path.push(coords[i]);
                    return true;
                }
                if (this.checkSpace(coords[i], player, path)) {
                    return true;
                }
            }
        }
        path.pop();
        return false;
    }
    getTurn() {
        return this.turn;
    }
    onBoard({ x, y }) {
        let inLimit = (value, limit) => value >= 0 && value < limit;
        return inLimit(x, this.rows) && inLimit(y, this.cols);
    }
}