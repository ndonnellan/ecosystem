// USER INTERFACE methods and objects
// ***********************************

// These globals are probably not the best way to do this
var canvas, ctx, myWorld;

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x,y,w,h);
}

function drawPoly(coords, color){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(coords[0][0], coords[0][1]);

    for (i = 1; i < coords.length; i++){
        ctx.lineTo(coords[i][0],coords[i][1]);
    }

    ctx.closePath();
    ctx.fill();
}

function NewGame() {
    canvas = document.getElementById("mycanvas");
    ctx = canvas.getContext("2d");

    var width = parseInt(document.getElementById("board_width").value);
    var nCreatures = parseInt($("#slider_num_blue_creatures").slider("value"))
    var height = width;
    var creatureSpeed = Math.ceil(1 * width / 100);
    var creatureWidth = Math.ceil(width / 100);

    canvas.width = width;
    canvas.height = width;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    myWorld = new World([width,height], nCreatures, creatureSpeed); 
    UpdateCreatureSpeed($("#slider_creature_speed").slider("value")); 
    myWorld.draw();
}

var intervalID;
var isRunning = false;
function MoveCreatures() {
    if (!isRunning) {
        isRunning = true;
        intervalID = setInterval("myWorld.move(); myWorld.draw();", 50);
    }
}

function StopCreatures() {
    clearInterval(intervalID);
    isRunning = false;
}

function UpdateCreatureSpeed(val) {
    var valNum = parseFloat(val);
    
    if (valNum > myWorld.dims[0] * 0.3) {
        // Limit the creature speed to 30% of the board width
        valNum = myWorld.dims[0] * 0.3;
        var speedInput = document.getElementById("creature_speed");
        creature_speed.value = valNum + "";
        setError("Cannot set speed above 30% of board width");
    } else {
        setError("");
    }

    myWorld.updateCreatureSpeed(valNum);
}

function setError(str){
    var err = document.getElementById("error_label");
    err.innerText = str;
}

function UpdateCreatureNumbers(val) {
    myWorld.updateCreatureNumbers(parseFloat(val));
}

function UpdateCuriosity(val) {
    myWorld.updateCuriosity(parseFloat(val));
}

function RandomMap() {
    myWorld.setRandomMap();
}

$(function() {
    $("#slider_num_blue_creatures").slider({
        slide: function(event, ui){
            UpdateCreatureNumbers(ui.value);
        },
        min: 0,
        max: 200

    });
});

$(function() {
    $("#slider_creature_speed").slider({
        slide: function(event, ui){
            UpdateCreatureSpeed(ui.value);
        },
        min: 0,
        max: 10,
        value: 2
    });
});