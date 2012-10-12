// ---------------------------------------------
// ----------- ZOO -----------------------------
// ---------------------------------------------
//
// All creatures are kept in the zoo
//
//
function Zoo (){
    self.wallApproach = function(creature, wallPoint) {
        // If there is any intersection within the maximum distance, only travel
        // as far as the intersection (but don't go to it!)
        var almostThere = wallPoint.dup()
            .subtract(creature.pos).x(0.9).add(creature.pos);

        creature.pos = almostThere;
        creature.speedLast = creature.speedLast * 0.9;
    }

    self.wallStop = function(creature, wallPoint) {
        //Alternative to wallApproach that retreats to the last point 
        //(probably not good for large speeds)
        creature.pos = creature.posLast.dup();
        creature.speedLast = 0;
        creature.heading = (creature.heading + Math.PI) % (Math.PI * 2);
    }

    // ***********************
    // Default Creature class
    // ***********************
    self.Creature = function(world) {
        this.world = world;
        this.pos = $V([0, 0]);
        this.posLast = this.pos.dup();

        this.heading = 2.0 * Math.PI * Math.random();
        this.speed = 2;
        this.speedLast = 0;
        this.width = 3;
        this.color = '#FF0000';
        this.maxDetectRange = 10;

        // Declaring variables using VAR instead of setting properties of THIS
        // emulates private properties, since they are only accessible within this scope
        // and nested scopes, such as the functions below.
        this.maxHeadingCone = Math.PI * 2.0;
        this.maxConeShrink = 7 * Math.PI / 4.0;
    }
    self.Creature.prototype.setPos = function(point) {this.pos = point.dup();}
    self.Creature.prototype.getPos = function() {return this.pos };
    self.Creature.prototype.getRandomHeading = function(currentHeading) {
    	// getRandomHeading: Momentum is approximated
        // by shrinking the cone of available headings. The slower the creature
        // is moving, the bigger the cone of available headings. No penalty for
        // acceleration.
    	return currentHeading + 
    		(Math.random() - 0.5) *
             (this.maxHeadingCone - this.maxConeShrink * this.speedLast/this.speed);
    }
    self.Creature.prototype.randomMove = function(polygonCoords) {
        // Pick a random position to move to given the limits
        // specified. No wrapping around the limits.
        if (this.speed == 0) {
            return;
        }
        var randomHeading = this.getRandomHeading(this.heading);
        

        // Sometimes they'll just turn around
        //if (Math.random() < 0.10)
        //    randomHeading += Math.PI;
        
        randomHeading = randomHeading % (2.0 * Math.PI);
        
        var randomVector = $V([
            Math.cos(randomHeading) * this.speed,
            Math.sin(randomHeading) * this.speed]);
        this.heading = randomHeading;
        
        // Now attempt to move the amount requested given the limitations of the world
        // I'm kind of cheating in my usage of closestIntersection because it expects some
        // sort of direction vector (usually normalized) and a maximum distance. Since 
        // RANDOMVECTOR is not normalized, I just use 1 as the max distance.
        var closest = closestIntersection(polygonCoords, this.pos, randomVector, this.speed);

        if (closest) {
            wallApproach(this,closest);
        	// if (this.speed > 20) {
         //        wallApproach(this, closest);
         //    } else {
         //        wallStop(this, closest);
         //    }

        } else {
        	this.pos = this.pos.add(randomVector);
        	this.speedLast = this.speed;
        }

        if (!this.pos){
            throw "Invalid position!";
        }


    }

    self.Creature.prototype.move = function(polygonList) {
        this.posLast = this.pos.dup();
        this.randomMove(polygonList);
        if (!this.speed)
            throw "Undefined SPEED";
    }

    self.Creature.prototype.detect = function(creatureList) {
        // Determine if any of the creatures in the list are close to this creature
        // and return a vector to the closest one
        return false;
        var close;
        var magClose;
        var diff;
        for (c in creatureList) {
            if (creatureList[c] != this) {
                diff = creatureList[c].pos.subtract(this.pos);
                if (!close){
                    close = diff.dup();
                    magClose = close.modulus();
                } else {
                    if (diff.modulus() < magClose) {
                        close = diff.dup();
                        magClose = close.modulus();
                    }
                }
            }
        }

        if (magClose < this.maxDetectRange)
            return close;
        else
            return false;
    }


    // *****************
    // BLUE CREATURES!!!
    // *****************
    self.BlueCreature = function(world) {
        self.Creature.call(this, world);
        this.color = '#0000FF';
        this.speed = 3;
        this.curiosity = 0.1; // Increase to follow more, make negative to run away

    }

    self.BlueCreature.prototype = new self.Creature();
    self.BlueCreature.prototype.constructor = self.BlueCreature;

    self.BlueCreature.prototype.getRandomHeading = function(heading) {
        // The Blue creature's random heading function is weighted
        // toward close other creatures
        var newHeading = self.Creature.prototype.getRandomHeading.call(this, heading);
        var close = this.detect(this.world.creatures);
        var vector = sph2cart(1, newHeading);
        var newVector;
        if (close){
            newVector = close.toUnitVector().x(this.curiosity).add(vector);
            newHeading = Math.atan2(newVector.e(1), newVector.e(2));
        }

        return newHeading;
    }

    return self;
};