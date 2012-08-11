// ---------------------------------------------
// ----------- ZOO -----------------------------
// ---------------------------------------------
//
// All creatures are kept in the zoo and must
// implement the following methods:
//		getPos(): 				returns a position vector
//		move(polygonCoords): 	updates the position vector 
//								based on a polygon of available moves
//
//	Each creature must be initialized with a position X and Y

function Creature(posX, posY) {
    this.pos = [posX, posY];

    this.heading = 2.0 * Math.PI * Math.random();
    this.speed = 2;
    this.speedLast = 0;
    this.width = 10;
    var maxHeadingCone = Math.PI * 2.0;
    var maxConeShrink = 7 * Math.PI / 4.0;

    this.getPos = function() {return this.pos };
    this.getRandomHeading = function(currentHeading) {
    	// getRandomHeading: Momentum is approximated
        // by shrinking the cone of available headings. The slower the creature
        // is moving, the bigger the cone of available headings. No penalty for
        // acceleration.
    	return currentHeading + 
    		(Math.random() - 0.5) * (maxHeadingCone - maxConeShrink * this.speedLast/this.speed);
    }
    this.randomMove = function(polygonCoords) {
        // Pick a random position to move to given the limits
        // specified. No wrapping around the limits. 
        var randomHeading = this.getRandomHeading(this.heading);
        
        // Sometimes they'll just turn around
        //if (Math.random() < 0.10)
        //    randomHeading += Math.PI;
        
        randomHeading = randomHeading % (2.0 * Math.PI);
        
        var randomVector = [
            Math.cos(randomHeading) * this.speed,
            Math.sin(randomHeading) * this.speed];
        this.heading = randomHeading;
        
        // Now attempt to move the amount requested given the limitations of the world
        // I'm kind of cheating in my usage of closestIntersection because it expects some
        // sort of direction vector (usually normalized) and a maximum distance. Since 
        // RANDOMVECTOR is not normalized, I just use 1 as the max distance.
        var closest = closestIntersection(polygonCoords, this.pos, randomVector, 1);

        if (closest) {
        	// If there is any intersection within the maximum distance, only travel
        	// as far as the intersection (but don't go to it!)
        	var almostThere = addVector(this.pos,
        		multiplyVector(0.9, subtractVector(closest,this.pos)));

        	this.pos = almostThere;
        	this.speedLast = this.speedLast * 0.9;
        } else {
        	this.pos = addVector(this.pos, randomVector);
        	this.speedLast = this.speed;
        }


    }

    this.move = this.randomMove;

}