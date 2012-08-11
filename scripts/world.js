// Main Javascript objects and methods
// ***********************************


function Board(dimensions, numCreatures, creatureSpeed, creatureSize) {
    this.dims = dimensions;
    this.creatures = [];
    this.inWorldPoly = [];
    
    // Add the corners of the polygon
    this.inWorldPoly.push([0,            0            ]);
    this.inWorldPoly.push([0,            this.dims[1] ]);
    this.inWorldPoly.push([this.dims[0], this.dims[1] ]);
    this.inWorldPoly.push([this.dims[0], 0            ]);

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
            this.creatures[i].move(this.inWorldPoly);
        }
    }

    this.updateCreatureSpeed = function(newSpeed) {
        for (c in this.creatures)
            this.creatures[c].speed = newSpeed;
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
    myBoard.draw();
}

var intervalID;
var isRunning = false;
function MoveCreatures() {
    if (!isRunning) {
        isRunning = true;
        intervalID = setInterval("myBoard.move(); myBoard.draw();", 50);
    }
}

function StopCreatures() {
    clearInterval(intervalID);
    isRunning = false;
}

function UpdateCreatureSpeed(val) {
    myBoard.updateCreatureSpeed(parseFloat(val));
}