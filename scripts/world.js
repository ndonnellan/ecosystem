// World methods and objects
// ***********************************
var myZoo = new Zoo();

function World(dimensions, numCreatures, creatureSpeed, poly) {
    this.dims = dimensions;
    this.creatures = [];
    this.inWorldPoly = [];
    this.outWorldPoly = [];
    this.speedMax = 10;
    this.speedDist = 5;

    var canvas = document.getElementById("mycanvas");
    var ctx = canvas.getContext("2d");
    
    // Add the corners of the polygon
    if (!poly){
        this.inWorldPoly = rectPoly(0,0,this.dims[0], this.dims[1]);
    } else {
        this.inWorldPoly = poly;
    }
    setError("");

    this.getRandomSpeed = function(){
        var d = this.speedMax * (1-this.speedDist);
        var s = Math.random() * (this.speedMax - d) + d;
        if (s == NaN)
            throw "NaN speed computed";

        return s;
    }
    this.seedCreature = function(creatureObj){
        this.creatures.push(creatureObj);
        creatureObj.speed = this.getRandomSpeed();

        var p;
        var maxIter = 100;
        var k = 0;
        do {
            p = $V([this.dims[0] * Math.random(),
                this.dims[1] * Math.random()]);
            k += 1;
        } while ((!inPolygon(this.inWorldPoly, p) 
            || inManyPolygons(this.outWorldPoly, p)) && k < maxIter)

        if (k == maxIter) {
            setError("Could not populate map efficiently");
            return
        }
        creatureObj.setPos(p);

    }
    
    // Create creature positions by randomly selecting positions
    // on the dimensions of the world.
    for (var i = 0; i < numCreatures; i++){
        this.seedCreature(new myZoo.BlueCreature(this));
    }

    this.draw = function () {
        var w = 1;
        var pos = [];
        // Clear the playing space
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the playing space
        drawPoly(this.inWorldPoly, '#2BB8FF')

        // Draw obstacles
        for (var i = 0; i < this.outWorldPoly.length; i++){
            drawPoly(this.outWorldPoly[i], '#FFF');
        }
        // Draw the creatures
        for (var i = 0; i < this.creatures.length; i++) {
            pos = this.creatures[i].getPos();
            w = this.creatures[i].width;
            drawRect(pos.e(1)- w/2, pos.e(2) - w/2, w, w,this.creatures[i].color);
        }
    }
    
    this.move = function() {
        for (var i = 0; i < this.creatures.length; i++) {
            // Move each creature by calling its own MOVE function, but
            // give it the valid limits of the world
            var cWidth = this.creatures[i].width;
            this.creatures[i].move(
                this.outWorldPoly.concat([this.inWorldPoly]));
        }
    }

    this.updateCreatureSpeed = function() {
        for (c in this.creatures)
            this.creatures[c].speed = this.getRandomSpeed();
    }

    this.updateCreatureNumbers = function(newNumber) {
        var oldNumber = this.creatures.length;
        if (oldNumber < newNumber){
            for (var i = 0; i < newNumber - oldNumber;i++){
                this.seedCreature(new myZoo.BlueCreature(this));
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

        // Start with a square and add obstacles within it
        this.inWorldPoly = rectPoly(0,0,dims[0], dims[1]);

        var nObstacles = randomInt([1, 5]);
        this.outWorldPoly = [];
        var x0, y0;

        setError("");
        for (var i = 0; i < nObstacles; i++){
            // Create a rectangle with random X,Y position (within
            // the limits of the world) with random width and height
            // (within some limits)
            x0 = randomFloat([0, dims[0]]);
            y0 = randomFloat([0, dims[1]]);

            this.outWorldPoly.push(
                rectPoly(
                    x0,y0,
                    randomFloat([dims[0] * .01, Math.min(dims[0] * .50, dims[0]-x0)]),
                    randomFloat([dims[1] * .01, Math.min(dims[1] * .50, dims[1]-y0)])
                    )
                );
        }

        this.creatures = [];

        for (var n = 0; n < nCreatures; n++) {
            this.seedCreature(new myZoo.BlueCreature(this));
        }

        this.draw();

    }
}
