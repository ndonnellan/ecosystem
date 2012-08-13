// World methods and objects
// ***********************************

function World(dimensions, numCreatures, creatureSpeed, poly) {
    this.dims = dimensions;
    this.creatures = [];
    this.inWorldPoly = [];

    var canvas = document.getElementById("mycanvas");
    var ctx = canvas.getContext("2d");
    
    // Add the corners of the polygon
    if (!poly){
        this.inWorldPoly.push([0,            0            ]);
        this.inWorldPoly.push([0,            this.dims[1] ]);
        this.inWorldPoly.push([this.dims[0], this.dims[1] ]);
        this.inWorldPoly.push([this.dims[0], 0            ]);
    } else {
        this.inWorldPoly = poly;
    }
    setError("");

    this.seedCreature = function(creatureObj){
        this.creatures.push(creatureObj);
        var p;
        var maxIter = 100;
        var k = 0;
        do {
            p = [this.dims[0] * Math.random(),
                this.dims[1] * Math.random()]
            k += 1;
        } while (!inPolygon(this.inWorldPoly, p) && k < maxIter)

        if (k == maxIter) {
            setError("Could not populate map efficiently");
            return
        }
        creatureObj.setPos(p[0],p[1]);
    }
    
    // Create creature positions by randomly selecting positions
    // on the dimensions of the world.
    for (var i = 0; i < numCreatures; i++){
        this.seedCreature(new BlueCreature(this));
    }

    this.draw = function () {
        var w = 1;
        var pos = [];
        // Clear the playing space
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the playing space
        drawPoly(this.inWorldPoly, '#2BB8FF')

        // Draw the creatures
        for (var i = 0; i < this.creatures.length; i++) {
            pos = this.creatures[i].getPos();
            w = this.creatures[i].width;
            drawRect(pos[0] - w/2, pos[1] - w/2, w, w,this.creatures[i].color);
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

    this.updateCreatureNumbers = function(newNumber) {
        var oldNumber = this.creatures.length;
        if (oldNumber < newNumber){
            for (var i = 0; i < newNumber - oldNumber;i++){
                this.seedCreature(new BlueCreature(this));
            }
        } else {
            for (var i = 0; i < oldNumber - newNumber; i++) {
                this.creatures.pop();
            }
        }
        this.draw();
    }
    this.updateCuriosity = function(val) {
        for (c in this.creatures) {
            if (this.creatures[c].hasOwnProperty('curiosity'))
                this.creatures[c].curiosity = val;
        }
    }

    this.setRandomMap = function () {
        // Save the existing settings.
        var dims = this.dims;
        var nCreatures = this.creatures.length;
        var newPoly = [];
        var nEdges = Math.round(Math.random() * 4) + 3;
        setError("");
        for (var i = 0; i < nEdges; i++){
            newPoly.push(
                [dims[0]*Math.random(),dims[1]*Math.random()]);
        }

        this.inWorldPoly = newPoly;
        this.creatures = [];

        for (var n = 0; n < nCreatures; n++) {
            this.seedCreature(new BlueCreature(this));
        }

        this.draw();

    }
}
