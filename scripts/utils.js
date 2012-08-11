// UTILITIES **********************

function vectorize(v){
	if (!v.length)
		return [v];

	return v;
}
function bound(limits, value) {
    if (limits[0] >= limits[1])
        throw "Limits must be ordered increasing";
        
    return Math.max(limits[0], Math.min(limits[1], value));
}

function norm(vector) {
    magnitude = mag(vector);
    var newVector = vector.slice(0);;
    for (var i = 0; i < vector.length; i++) {
    	newVector[i] /= magnitude;
    }
    return newVector;
}

function mag(vector) {
	var m = 0;
	for (var i = 0; i < vector.length; i++) {
		m += Math.pow(vector[i],2.0);
	}

	return Math.sqrt(m);
}

function inPolygon(polygonCoords, pointCoords) {
	// Check to see if the point passed in is within the polygon
}

function addVector(p1, p2) {
	var p3 = p1.slice(0);
	for (var i = 0; i < p1.length; i++) {
		p3[i] += p2[i];
	}
	return p3;
}

function subtractVector(p1,p2) {
	var p3 = p1.slice(0);
	for (var i = 0; i < p1.length; i++) {
		p3[i] -= p2[i];
	}
	return p3;	
}

function multiplyVector(p1, p2) {
	p1 = vectorize(p1);
	p2 = vectorize(p2);
	var p3 = p1.slice(0);
	if (!p2.length || p2.length == 1) {
		if (!p1.length || p1.length == 1) {
			return p1 * p2;
		} else {
			for (var i = 0; i < p1.length; i++) {
				p3[i] = p3[i] * p2;
			}
		}

	} else {
		if (!p1.length || p1.length == 1) {
			p3 = p2.slice(0);
			for (var i = 0; i < p2.length; i++) {
				p3[i] = p3[i] * p1;
			}
		} else {
			if (p1.length != p2.length)
				throw "Cannot multiply vectors of different length"

			for (var i = 0; i < p1.length; i++) {
				p3[i] = p1[i] * p2[i];
			}
		}
	}

	return p3;
}

function getFacingPoints(pointList, point, direction) {
	// Return the subset of points in POINTLIST that are within
	// 180 degrees of POINT when facing in DIRECTION
	facingPoints = [];
	var normDirection = norm(direction);
	var nextDirection;

	for (var i = 0; i < pointList.length; i++){
		nextDirection = norm(subtractVector(pointList[i], point));
		if (allSignEqual(nextDirection, direction))
			facingPoints.push(pointList[i]);
	}
}

function sign(value) {
	if (!value.length || value.length==1)
		return (value < 0) ? -1 : 1;

	var s = [];
	for (var i = 1; i < value.length; i++) {
		if (value[0] < 0){
			s.push(-1);
		} else {
			s.push(1);
		}
	}

	return s;
}

function allSignEqual(v1, v2){
	for (var i = 1; i < v1.length; i++) {
		if (sign(v1[i]) != sign(v2[i]))
			return false;
	}

	return true;
}


function closestIntersection(polygonCoords, pointCoords, directionVector, maxDistance) {
	// Return the point that is a result of the intersection of
	// the line running from POINTCOORDS via DIRECTIONVECTOR
	// and a polygon edge. Only return the closest intersection that
	// is in the same direction as DIRECTIONVECTOR

	if (!maxDistance)
		maxDistance = 1000;

	var p1 = pointCoords;
	var p2 = addVector(pointCoords, multiplyVector(directionVector, maxDistance));
	var intersections = [];
	var result = false;
	for (var i = 0; i < polygonCoords.length; i++) {
		result = intersectLineLine(
			polygonCoords[i], polygonCoords[(i + 1) % polygonCoords.length],
			p1, p2);

		if (result) {
			intersections.push(result);
		}
	}

	// Get only the points in the front field of view
	//intersections = getFacingPoints(intersections, p1, directionVector);

	if (!intersections || intersections.length == 0)
		return false;

	if (intersections.length == 1)
		return intersections[0];

	// Otherwise, there are multiple interesections, so we have to 
	// find the closest one
	var closest = intersections.pop();
	var next = [];
	while (intersections) {
		next = intersections.pop();
		if (mag(subtractVector(pointCoords, next)) 
			> mag(subtractVector(pointCoords, closest)))
			closest = next;
	}

	return closest;

}

// HELFPUL REFERENCE:
//	http://www.kevlindev.com/gui/math/intersection/Intersection.js
function intersectLineLine(a1, a2, b1, b2) {
    var result = false;
    
    var ua_t = (b2[0] - b1[0]) * (a1[1] - b1[1]) - (b2[1] - b1[1]) * (a1[0] - b1[0]);
    var ub_t = (a2[0] - a1[0]) * (a1[1] - b1[1]) - (a2[1] - a1[1]) * (a1[0] - b1[0]);
    var u_b  = (b2[1] - b1[1]) * (a2[0] - a1[0]) - (b2[0] - b1[0]) * (a2[1] - a1[1]);

    if ( u_b != 0 ) {
        var ua = ua_t / u_b;
        var ub = ub_t / u_b;

        if ( 0 <= ua && ua <= 1 && 0 <= ub && ub <= 1 ) {
            result = [a1[0] + ua * (a2[0] - a1[0]),
                    a1[1] + ua * (a2[1] - a1[1])];
        }
    }

    return result;
};