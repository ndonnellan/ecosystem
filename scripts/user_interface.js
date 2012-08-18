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
    ctx.moveTo(coords[0].e(1), coords[0].e(2));

    for (i = 1; i < coords.length; i++){
        ctx.lineTo(coords[i].e(1),coords[i].e(2));
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
    myWorld.updateCreatureSpeed();
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

function setError(str){
    var err = document.getElementById("error_label");
    err.innerText = str;
}

function UpdateCreatureNumbers(val) {
    myWorld.updateCreatureNumbers(parseFloat(val));
    myWorld.updateCreatureSpeed();
}

function UpdateCuriosity(val) {
    myWorld.updateCuriosity(parseFloat(val));
}

function RandomMap() {
    myWorld.setRandomMap();
    myWorld.updateCreatureSpeed();
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
            myWorld.speedMax = parseFloat(ui.value);
            myWorld.updateCreatureSpeed();
        },
        min: 0,
        max: 10,
        value: 2
    });
});

$(function() {
    $("#slider_speed_dist").slider({
        slide: function(event, ui){
            myWorld.speedDist = parseFloat(ui.value);
            myWorld.updateCreatureSpeed();
        },
        min: 0,
        max: 1,
        value: 1,
        step: 0.01
    });
});