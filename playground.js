// Main Javascript objects and methods
// ***********************************

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
    this.heading = 2.0 * Math.PI * Math.random();
    this.speed = speed;
    this.width = width;
    
    this.getPos = function() {return [this.x, this.y] };
    this.randomMove = function(xLimits, yLimits) {
        // Pick a random position to move to given the limits
        // specified. No wrapping around the limits
        var randomHeading = this.heading + Math.PI/4.0 * (Math.random()*2 - 1);
        
        // Sometimes they'll just turn around
        //if (Math.random() < 0.10)
        //    randomHeading += Math.PI;
        
        randomHeading = randomHeading % (2.0 * Math.PI);
        
        randomVector = [
            Math.cos(randomHeading) * this.speed,
            Math.sin(randomHeading) * this.speed];
        this.heading = randomHeading;
        
        this.x = bound(xLimits, this.x + Math.round(randomVector[0]));
        this.y = bound(yLimits, this.y + Math.round(randomVector[1]));
    }

    this.move = this.randomMove;

}

function Board(dimensions, numCreatures, creatureSpeed, creatureSize) {
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
        // Clear the playing space
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the playing space
        drawRect(0,0,this.dims[0], this.dims[1], '#2BB8FF');

        // Draw the creatures
        for (var i = 0; i < this.creatures.length; i++) {
            pos = this.creatures[i].getPos();
            w = this.creatures[i].width;
            drawRect(pos[0],pos[1],w,w,'#FF0000');
        }
    }
    
    this.move = function() {
        for (var i = 0; i < this.creatures.length; i++) {
            // Move each creature by calling its own MOVE function, but
            // give it the valid limits of the world
            var cWidth = this.creatures[i].width;
            this.creatures[i].move(
                [0 + Math.floor(cWidth/2), this.dims[0] - Math.ceil(cWidth/2)],
                [0 + Math.floor(cWidth/2), this.dims[1] - Math.ceil(cWidth/2)]);
        }
    }
}

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x,y,w,h);
}

// These globals are probably not the best way to do this
var canvas, ctx

function NewGame() {
    canvas = document.getElementById("mycanvas");
    ctx = canvas.getContext("2d");

    var width = parseInt(document.getElementById("board_width").value);
    var nCreatures = parseInt(document.getElementById("num_creatures").value)
    var height = width;
    var creatureSpeed = Math.ceil(1 * width / 100);
    var creatureWidth = Math.ceil(width / 100);

    canvas.width = width;
    canvas.height = width;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    myBoard = new Board([width,height], nCreatures, creatureSpeed, creatureWidth);
    var obj = document.getElementById("result");
    obj.textContent = "";

  
    myBoard.draw();
}

var intervalID;
var isRunning = false;
function MoveCreatures() {
    if (!isRunning) {
        intervalID = setInterval("myBoard.move(); myBoard.draw();", 50);
        isRunning = true;
    }
}

function StopCreatures() {
    clearInterval(intervalID);
    isRunning = false;
}
