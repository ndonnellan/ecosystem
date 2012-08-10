// Main Javascript objects and methods
// ***********************************
//  RULES:
// The board should be an 8x8 grid and by default 10 hidden mines are
// randomly placed into the board.
// The interface should support these three functions:
//  New Game    - start a new, randomly generated game.
//  Validate    - check that a user has correctly marked all the tiles
//              and end the game in either victory or failure.
//  Cheat       - in any manner you deem appropriate, reveal the locations 
//              of the mines without ending the game.
//
// ************************************************************************************

function bound(limits, value) {
    if (limits[0] >= limits[1])
        throw "Limits must be ordered increasing";
        
    return Math.max(limits[0], Math.min(limits[1], value));
}
function norm(vector) {
    magnitude = Math.sqrt(Math.pow(vector[0],2.0) + Math.pow(vector[1],2.0));
    return [vector[0] / magnitude, vector[1] / magnitude];
}
function Creature(posX, posY, speed, width) {
    this.x = posX;
    this.y = posY;
    this.speed = speed;
    this.width = width;
    
    this.getPos = function() {return [this.x, this.y] };
    this.randomMove = function(xLimits, yLimits) {
        // Pick a random position to move to given the limits
        // specified. No wrapping around the limits
        
        randomVector = norm([Math.random()*2.0 - 1, Math.random()*2.0 - 1]);
        this.x = bound(xLimits, this.x + randomVector[0]);
        this.y = bound(yLimits, this.y + randomVector[1]);
    }

}
function randomWithoutReplace(N, maxN) {
    // Return N unique integers between 0 and maxN
    if (maxN < N) {
        alert("Number of unique integers requested must be less than max integer size");
    }
    
    var numList = new Array(maxN);
    var uniqueList = new Array(N);
    var idx;
    for (var i = 0; i < numList.length; i++) {
        numList[i] = i;
    }
    
    for (var k = 0; k < uniqueList.length; k++) {
        idx = Math.floor(Math.random() * numList.length);
        uniqueList[k] = numList[idx];
        numList.splice(idx, 1);
    }
    
    return uniqueList;
}
function Board(dimensions, numCreatures, creatureSpeed, creatureSize) {
    var N = dimensions[0] *dimensions[1];
    this.dims = dimensions;

    this.creatures = [];
    
    // Create creature positions by randomly selecting positions
    // on the dimensions of the board.
    for (var i = 0; i < numCreatures; i++){
        this.creatures.push(
            new Creature(this.dims[0] * Math.random(), this.dims[1] * Math.random(),
            creatureSpeed, creatureSize)
            );
    }


    
    this.draw = function () {
        var w = 1;
        var pos = [];
        // Draw the playing space
        drawRect(0,0,this.dims[0], this.dims[1], '#2BB8FF');

        // Draw the creatures
        for (var i = 0; i < this.creatures.length; i++) {
            pos = this.creatures[i].getPos();
            w = this.creatures[i].width;
            drawCreature(pos[0],pos[1],w,w,'#FF0000');
        }
    }
    
    this.move = function() {
        for (var i = 0; i < this.creatures.length; i++) {
            // Move each creature by a random amount
            this.creatures[i].randomMove([0, this.dims[0]], [0, this.dims[1]]);
        }
    }
}

function drawCreature(x, y, w, h, color) {
   
//    ctx.clearRect(x, y, w, h);
    drawRect(x, y, w, h, color);
}

function drawRect(x,y,w,h,color) {
    ctx.fillStyle = color;
    ctx.fillRect(x,y,w,h);
}

// These globals are probably not the best way to do this
var canvas, ctx, dx, dy, x0, y0, n, m, dw, dh, myBoard, nCreatures;
var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;

// Disable menu from popping up when right-clicking
document.oncontextmenu = function() {return false;};

function NewGame() {
    canvas = document.getElementById("mycanvas");
    ctx = canvas.getContext("2d");

    dx = 4; dy = 4; x0 = 0; y0 = 0;
    n = parseInt(document.getElementById("num_tiles").value);
    nCreatures = parseInt(document.getElementById("num_creatures").value)
    m = n;
    dw = canvas.width / n; dh = canvas.height / m;
    var speed = 2;
    ctx.clearRect(x0, y0, canvas.width, canvas.height);
    myBoard = new Board([n,m], nCreatures, speed, n * 0.01);
    var obj = document.getElementById("result");
    obj.textContent = "";
    
    if (document.defaultView && document.defaultView.getComputedStyle) {
        stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
        stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
        styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
        styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
    }
  
    myBoard.draw();
}
var intervalID;
function MoveCreatures() {
    intervalID = setInterval("myBoard.move(); myBoard.draw();", 100);
}

function StopCreatures() {
    clearInterval(intervalID);
}
