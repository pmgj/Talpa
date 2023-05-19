import Talpa from "./Talpa.js";
import CellState from "./CellState.js";
import Cell from "./Cell.js";

class GUI {
    constructor() {
        this.game = null;
        this.origin = null;
        this.images = { PLAYER1: 'Blue-Circle.svg', PLAYER2: 'Red-Circle.svg', EMPTY: '' };
    }
    coordinates(cell) {
        return new Cell(cell.parentNode.rowIndex, cell.cellIndex);
    }
    printBoard(board) {
        let tbody = document.querySelector("tbody");
        tbody.innerHTML = "";
        for (let i = 0; i < board.length; i++) {
            let tr = document.createElement("tr");
            tbody.appendChild(tr);
            for (let j = 0; j < board[i].length; j++) {
                let td = document.createElement("td");
                tr.appendChild(td);
                if (board[i][j] !== CellState.EMPTY) {
                    let img = document.createElement("img");
                    img.src = `images/${this.images[board[i][j]]}`;
                    img.ondragstart = this.drag.bind(this);
                    td.appendChild(img);
                }
                td.onclick = this.play.bind(this);
                td.ondragover = this.allowDrop.bind(this);
                td.ondrop = this.drop.bind(this);
            }
        }
    }
    drag(evt) {
        let td = evt.currentTarget;
        this.origin = td.parentNode;
    }
    allowDrop(evt) {
        evt.preventDefault();
    }
    drop(evt) {
        evt.preventDefault();
        let td = evt.currentTarget;
        if (this.game.playerCanCapture()) {
            try {
                let mr = this.game.move(this.coordinates(this.origin), this.coordinates(td));
                td.innerHTML = "";
                td.appendChild(this.origin.firstChild);
                this.changeMessage(mr);
            } catch (ex) {
                this.setMessage(ex.message);
            }
        }
        this.origin = null;
    }
    printPath(path) {
        let table = document.querySelector("table");
        path.forEach(({ x, y }, index) => {
            table.rows[x].cells[y].style.animationName = "path";
            table.rows[x].cells[y].textContent = index + 1;
        });
    }
    changeMessage(m) {
        let objs = { DRAW: "Draw!", PLAYER2: "Red's win!", PLAYER1: "Blue's win!" };
        if (objs[m]) {
            this.setMessage(`Game Over! ${objs[m]}`);
            let path = [];
            this.game.checkPath(CellState.EMPTY, path);
            this.printPath(path);
        } else {
            let msgs = { PLAYER1: "Blue's turn.", PLAYER2: "Red's turn." };
            this.setMessage(msgs[this.game.getTurn()]);
        }
    }
    setMessage(message) {
        let msg = document.getElementById("message");
        msg.textContent = message;
    }
    init() {
        let iSize = document.getElementById("size");
        let iStart = document.getElementById("start");
        iSize.onchange = this.init.bind(this);
        iSize.focus();
        iStart.onclick = this.init.bind(this);
        let size = iSize.valueAsNumber;
        this.game = new Talpa(size, size);
        this.game.startBoard();
        let board = this.game.getBoard();
        this.printBoard(board);
        this.changeMessage();
    }
    play(evt) {
        let td = evt.currentTarget;
        const time = 1000;
        if (this.game.playerCanCapture()) {
            if (this.origin) {
                try {
                    let mr = this.game.move(this.coordinates(this.origin), this.coordinates(td));
                    let image = this.origin.firstChild;
                    let opponentImage = td.firstChild;
                    let { x: or, y: oc } = this.coordinates(this.origin);
                    let { x: dr, y: dc } = this.coordinates(td);
                    let tableData = document.querySelector("td");
                    let size = tableData.offsetWidth;
                    let anim = image.animate([{ top: 0, left: 0 }, { top: `${(dr - or) * size}px`, left: `${(dc - oc) * size}px` }], time);
                    anim.onfinish = () => {
                        td.innerHTML = "";
                        td.appendChild(image);
                    };
                    let anim2 = opponentImage.animate([{ opacity: 1 }, { opacity: 0 }], time);
                    anim2.onfinish = () => {
                        this.changeMessage(mr);
                    };
                } catch (ex) {
                    this.setMessage(ex.message);
                }
                this.origin = null;
            } else {
                this.origin = td;
            }
        } else {
            try {
                let mr = this.game.move(this.coordinates(td));
                let image = td.firstChild;
                let anim2 = image.animate([{ opacity: 1 }, { opacity: 0 }], time);
                anim2.onfinish = () => {
                    td.innerHTML = "";
                    this.changeMessage(mr);
                };
            } catch (ex) {
                this.setMessage(ex.message);
            }
        }
    }
}
let gui = new GUI();
gui.init();