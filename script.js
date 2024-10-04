alert("There's only one way to survive: DO NOT HIT THE TAIL !");
let nodes, grid,
    foods, foodInit, 
    W, H, playBtn,
    canvas, 
    ctx, column,
    row, score, 

    gameState = "init";

const { floor, abs, sin, random, hypot, PI } = Math;

const TILE_SIZE = 10;
let velocity = {};
const touch = {};
const time =  { t0: null, t0b: null, interval: 100, bonusInterval: 4000 * 5 };

class Node {

    constructor() {
        this.segment = 1;   // 0: head, -1: tail, 1: body
        this.pos = {x: -1, y: -1};
    }

    draw() {
        let px = this.pos.x * TILE_SIZE;
        let py = this.pos.y * TILE_SIZE;
        let r = TILE_SIZE * 0.5;
        ctx.fillStyle = !this.segment ? "red"  : "green";
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

    }
};


class Food {

    constructor(type = 0) {
        let _g = grid.filter(i => i >= 0);
        let p = _g[floor(random() * _g.length)];
        this.grid = {x: floor(p % column), y: floor(p / column)};
        this.pos = {x: 0, y: 0};
        this.type = type;   // 0: regular   1: bonus
        this.maxR = TILE_SIZE * 0.25;
        this.color = this.type ? "red" : "navy";
        this.c = 0;
        if(this.type) {
            this.createdTime = new Date().getTime();
            this.deleteTime = 4000;
        }
        foods.push(this);
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2*Math.PI);
        ctx.closePath();
        ctx.fill();
    }

    update(snakeHead, t) {
        this.c += 0.08;
        this.pos.x = this.grid.x * TILE_SIZE + TILE_SIZE * 0.5;
        this.pos.y = this.grid.y * TILE_SIZE + TILE_SIZE * 0.5;
        this.r = TILE_SIZE * 0.1 + abs(sin(this.c) * this.maxR);
        let dx = snakeHead.pos.x * TILE_SIZE + TILE_SIZE * 0.5 - this.pos.x;
        let dy = snakeHead.pos.y * TILE_SIZE + TILE_SIZE * 0.5 - this.pos.y;
        let dist = hypot(dx, dy);
        if(dist <= this.r + TILE_SIZE * 0.5) {
            score += this.type ? 20 : 5;
            let newNode = new Node();
            let lastNode = nodes[nodes.length - 1];
            newNode.segment = -1;
            foods.splice(foods.indexOf(this), 1);
            lastNode.segment = 1;
            nodes.push(newNode);
            if(!this.type) new Food();
        };
        if(this.type) {
            if(abs(t - this.createdTime) >= this.deleteTime) {
                foods.splice(foods.indexOf(this), 1);
            }
        }
        this.draw();
    }
};

const update = () => {
    let t1 = new Date().getTime();
    let diff = abs(t1 - time.t0);
    let bDiff = abs(t1 - time.t0b);
    for(let i = 0; i < row; i++) {
        for(let j = 0; j < column; j++) 
            grid[i + j * row] = i + j * row;
    };
    if(bDiff >= time.bonusInterval) {
        new Food(1);    // create bonuus food
        time.t0b = t1;
    }
    if(diff >= time.interval) {
        // move each nodes
        let pos = [];   // [oldPos, newPos]
        for(let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            if(i === 0) {
                pos.push([
                    {x: node.pos.x, y: node.pos.y},
                    {x: node.pos.x + velocity.x, y: node.pos.y + velocity.y}
                ]);
            } else {
                let prevPos = pos[i - 1][0];
                pos.push([ 
                    {x: node.pos.x, y: node.pos.y}, 
                    {x: prevPos.x, y: prevPos.y}
                ]);
            }
        };
        pos.forEach((pos, i) => {
            if(pos[1].x < 0) pos[1].x = column;
            else if(pos[1].x > column) pos[1].x = 0;
            if(pos[1].y < 0) pos[1].y = row;
            else if(pos[1].y > row) pos[1].y = 0;
            nodes[i].pos.x = pos[1].x;
            nodes[i].pos.y = pos[1].y;
            if(i > 0) {
                let head = nodes[0];
                if(floor(head.pos.x) === floor(pos[1].x) && 
                    floor(head.pos.y) === floor(pos[1].y)) {
                        velocity.x = 0;
                        velocity.y = 0;
                        gameState = "over";
                        playBtn.style.left = `${innerWidth * 0.5 - innerWidth * 0.25}px`;
                }
            }
            grid[pos[1].y + pos[1].x * row] = -1;
        });
        // create first food
        if(!foodInit) {
            new Food();
            foodInit = true;
        }
        time.t0 = t1;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i = 0; i < nodes.length; i++) {
        let max = TILE_SIZE * 0.5;
        let node = nodes[i];
        node.color = !node.segment ? "green" : node.segment < 0 ? "navy" : "red";
        node.draw();
    };
    foods.forEach((food, i) => {
        if(gameState === "playing") 
            food.update(nodes[0], t1)
    });

    document.getElementById("score").innerHTML = `Score: ${score}`;
    requestAnimationFrame(update);
};

const restart = () => {
    playBtn.style.left = `${-innerWidth * 0.6}px`;
    nodes = [];
    foods = [];
    grid = [];
    score = 0;
    foodInit = false;
    gameState = "playing";
    velocity.y = 1;
    velocity.x = 0;
    let startX = floor(random() * (column - 3) + 3);
    let startY = floor(random() * (row - 3) + 3);
    for(let i = 0; i < 3; i++) {
        let n = new Node();
        n.pos = {x: startX + i, y: startY};
        if(i === 0) n.segment = 0;
        else if(i === length - 1) n.segment = -1;
        nodes.push(n);
    };
    time.t0 = new Date().getTime();
    time.t0b = new Date().getTime();
};

const events = () => {

    const move = (axis, dir) => {
        if(gameState === "playing") {
            let n = nodes[0];
            if(n.pos.x >= 0 && n.pos.x < column && n.pos.y >= 0 && n.pos.y < row)  {
                let s = 1;
                if(axis === "x") {
                    if(!velocity.x) {
                        velocity.x = dir.toLowerCase().includes("right") ? s : -s;
                        velocity.y = 0;
                    }
                } else if(axis === "y") {
                    if(!velocity.y) {
                        velocity.y = dir.toLowerCase().includes("down") ? s : -s;
                        velocity.x = 0;
                    }
                }
            }
        }
    };
    
    window.addEventListener("keydown", e => {
        if(e.key === "ArrowRight" || e.key === "ArrowLeft") {
            move("x", e.key);
        } else if(e.key === "ArrowUp" || e.key === "ArrowDown") {
            move("y", e.key);
        }
    });
    
    window.addEventListener("touchstart", e => {
        touch.x = e.touches[0].pageX;
        touch.y = e.touches[0].pageY;
        touch.isActive = true;
    });
    
    window.addEventListener("touchmove", e => {
        if(touch.isActive) {
            let dx = e.touches[0].pageX - touch.x;
            let dy = e.touches[0].pageY - touch.y;
            if(abs(dx) > abs(dy)) {
                move("x", dx < 0 ? "left":"right");
            } else {
                move("y", dy < 0 ? "up":"down");
            }
            touch.isActive = false;
        }
    })
;
    
    playBtn.onclick = () => restart();
};

const main = () => {
    canvas = document.getElementById("cvs");
    playBtn = document.getElementById("play");
    let min = Math.min(innerWidth, innerHeight);
    let size = min * 0.75;
    // set canvas width
    column = floor(size / TILE_SIZE);
    row = floor(size / TILE_SIZE);
    canvas.width = column * TILE_SIZE;
    canvas.height = row * TILE_SIZE;
    canvas.setAttribute("style", `
        border: 2px solid #000;
        width: ${canvas.width}px;
        height: ${canvas.height}px;
    `);

    ctx = canvas.getContext("2d");
    restart();
    events();
    requestAnimationFrame(update);
};

addEventListener("load", main);