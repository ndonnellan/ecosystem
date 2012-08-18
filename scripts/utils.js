// UTILITIES **********************

function vectorize(v){
    if (!v.length)
        return [v];

    return v;
}

function randomInt(range, numInts){
    if (!numInts || numInts == 1)
        return Math.round(Math.random() * range[1] + range[0]);

    var intArray = [];
    for (var i = 0; i < numInts; i++)
        intArray.push(randomInt(range));

    return intArray;
}

function randomFloat(range, numFloats){
    if (!numFloats || numFloats == 1)
        return Math.random() * range[1] + range[0];

    var floatArray = [];
    for (var i = 0; i < numFloats; i++)
        floatArray.push(randomFloat(range));

    return floatArray;
}

function rectPoly(x,y,w,h){
    // Like canvas drawRect
    return [
        $V([x,      y    ]),
        $V([x,      y + h]),
        $V([x + w,  y + h]),
        $V([x + w,  y    ])];
}
function bound(limits, value) {
    if (limits[0] >= limits[1])
        throw "Limits must be ordered increasing";
        
    return Math.max(limits[0], Math.min(limits[1], value));
}

function angleBetween(v1, v2){
    return Math.acos(v1.dot(v2) / (v1.modulus() * v2.modulus()));
}

function matrixMax(matrix, dim){
    // Returns max value of a collection of vectors along a dimension
    // Dimensions start at 1 (not zero)
    var max;
    var val;
    for (var i = 0; i < matrix.length; i++){
        val = matrix[i].e(dim);
        if (i == 0){
            max = val;
        } else {
            max = max >= val ? max : val;
        }
    }
    return max;
}

function matrixMin(matrix, dim){
    // Returns min value of a collection of vectors along a dimension
    // Dimensions start at 1 (not zero)
    var min;
    var val;
    for (var i = 0; i < matrix.length; i++){
        val = matrix[i].e(dim);
        if (i == 0){
            min = val;
        } else {
            min = min <= val ? min : val;
        }
    }
    return min;
}

function mergePolygons(polygonList){
    var combinedPolygon = [];
    for (var i = 0; i < polygonList.length; i++){
        combinedPolygon = combinedPolygon.concat(polygonList[i]);
    }

    return combinedPolygon;
}

function inPolygon(polygonCoords, p) {
    // Check to see if the point passed in is within the polygon
    
    // First check for simple bounding (rectangular)
    var xMax, xMin, yMax, yMin;
    xMin = matrixMin(polygonCoords,1);
    xMax = matrixMax(polygonCoords,1);
    yMin = matrixMin(polygonCoords,2);
    yMax = matrixMax(polygonCoords,2);
    var x = p.e(1), y = p.e(2);

    if (p.e(1) < xMin || p.e(1) > xMax || p.e(2) < yMin || p.e(2) > yMax)
        return false;

    // More complicated answer
    var i, j, c;
    var c = false;
    var v = polygonCoords;

    // Taken from:
    //  http://stackoverflow.com/questions/217578/point-in-polygon-aka-hit-test
    for (i = 0; i < v.length; i++) {
        j = (i + 1) % v.length;
        if ( ((v[i].e(2) > p.e(2)) != (v[j].e(2) > p.e(2))) &&
         (p.e(1) < (v[j].e(1) - v[i].e(1)) * (p.e(2)-v[i].e(2)) / (v[j].e(2)-v[i].e(2)) + v[i].e(1)) )
           c = !c;
    }
    return c;
}

function inManyPolygons(polygonList, p){
    var k = 0;
    while (k < polygonList.length){
        if (inPolygon(polygonList[k], p))
            return true;
        k++;
    }

    return false;
}

function getFacingPoints(pointList, point, direction) {
    // Return the subset of points in POINTLIST that are within
    // 180 degrees of POINT when facing in DIRECTION
    facingPoints = [];
    var normDirection = direction.modulus();
    var nextDirection;

    for (var i = 0; i < pointList.length; i++){
        nextDirection = pointList[i].subtract(point).modulus();
        if (allSignEqual(nextDirection, direction))
            facingPoints.push(pointList[i]);
    }
}

function sign(v) {
    // Return sign of vector
    var vSign = v.dup();
    vSign.each(function(elem){return (elem >= 0) ? 1 : -1;});
    return vSign;
}

function allSignEqual(v1, v2){
    return sign(v1).isEqual(sign(v2));
}


function closestIntersection(polygonList, pointCoords, directionVector, maxDistance) {
    // Return the point that is a result of the intersection of
    // the line running from POINTCOORDS via DIRECTIONVECTOR
    // and a polygon edge. Only return the closest intersection that
    // is in the same direction as DIRECTIONVECTOR

    if (!maxDistance)
        maxDistance = 1000;

    var p1 = pointCoords;
    var p2 = directionVector.x(maxDistance).add(pointCoords);
    var intersections = [];
    var result = false;
    var polygonCoords = [];
    var isIn, willBeIn;
    var k = polygonList.length - 1;

    // Remove polygons that the current point is not in and the next point is not in
    while (k >= 0){
        isIn = inPolygon(polygonList[k], p1);
        willBeIn = inPolygon(polygonList[k], p2);
        if ((!isIn && !willBeIn) || (isIn && willBeIn))
            polygonList.splice(k,1);
        k--;
    }

    if (polygonList.length == 0)
        return false;

    for (var n = 0; n < polygonList.length; n++){
        polygonCoords = polygonList[n];
        for (var i = 0; i < polygonCoords.length; i++) {
            result = intersectLineLine(
                polygonCoords[i], polygonCoords[(i + 1) % polygonCoords.length],
                p1, p2);

            if (result) {
                intersections.push(result);
            }
        }
    }

    // Get only the points in the front field of view
    if (intersections.length == 0)
        return false;

    if (intersections.length == 1)
        return intersections[0];

    // Otherwise, there are multiple interesections, so we have to 
    // find the closest one
    var closest = intersections.pop();
    var next = [];
    while (intersections && intersections.length > 0) {
        next = intersections.pop();
        if (pointCoords.subtract(next).modulus()
            > pointCoords.subtract(closest).modulus())
            closest = next.dup();
    }

    return closest;

}

// HELFPUL REFERENCE:
//  http://www.kevlindev.com/gui/math/intersection/Intersection.e(2)s
function intersectLineLine(a1, a2, b1, b2) {
    var result = false;
    
    var ua_t = (b2.e(1) - b1.e(1)) * (a1.e(2) - b1.e(2)) - (b2.e(2) - b1.e(2)) * (a1.e(1) - b1.e(1));
    var ub_t = (a2.e(1) - a1.e(1)) * (a1.e(2) - b1.e(2)) - (a2.e(2) - a1.e(2)) * (a1.e(1) - b1.e(1));
    var u_b  = (b2.e(2) - b1.e(2)) * (a2.e(1) - a1.e(1)) - (b2.e(1) - b1.e(1)) * (a2.e(2) - a1.e(2));

    if ( u_b != 0 ) {
        var ua = ua_t / u_b;
        var ub = ub_t / u_b;

        if ( 0 <= ua && ua <= 1 && 0 <= ub && ub <= 1 ) {
            result = $V([a1.e(1) + ua * (a2.e(1) - a1.e(1)),
                    a1.e(2) + ua * (a2.e(2) - a1.e(2))]);
        }
    }

    return result;
};

function sph2cart(r, theta) {
    return [r * Math.cos(theta), r * Math.sin(theta)];

}