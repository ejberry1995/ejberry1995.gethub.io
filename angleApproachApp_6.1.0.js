POINT_COLOR = "red";

var raceRampApp = {
    appScreen : new AppScreen(),
    scale : 1, 
    pan : {x : 0, y : 0},
    vehicle : [],
    trailer : [],
    trailerMode : false,
    vehicleAngle : -1
} 

//view points
function startApp() {
    raceRampApp.appScreen.start();
    raceRampApp.vehicle = setUpVehicle();
    raceRampApp.trailer = setUpTrailer();
    setUpVehicle();
    setUpTrailer();
    resize();
    setUpListeners();
};

//initialize and set up dragable points
function setUpVehicle() {
    vehicle = [];
    var width = raceRampApp.appScreen.canvas.width;
    var height = raceRampApp.appScreen.canvas.height;
    vehicle["img"] = new Image();
    vehicle["back"] = new MovableCirc( width - width / 8, height - height / 8,
        3,POINT_COLOR,"back wheel");

    vehicle["front"] = new MovableCirc(width / 2,height - height / 8,
        3,POINT_COLOR,"front wheel");

    vehicle["contact"] = new MovableCirc(width / 8, height /3,
        3,POINT_COLOR,"fender contact");
    return vehicle;
};

function setUpTrailer() {
    trailer = [];
    var width = raceRampApp.appScreen.canvas.width;
    var height = raceRampApp.appScreen.canvas.height;
    trailer["img"] = new Image();
    trailer["back"] = new MovableCirc(width - width / 8,height - height / 8,
        3,POINT_COLOR,"back wheel");

    trailer["hinge"] = new MovableCirc(width / 2, height /3,
        3,POINT_COLOR,"hinge point");

    trailer["ground"] = new MovableCirc(width / 8,height -height / 8,
        3,POINT_COLOR,"ground contact");

    return trailer;
};

function loadImage() {
    raceRampApp.scale = 1;
    raceRampApp.pan = {x : 0, y : 0};
    //setUpDragPoints();
    var reader = new FileReader();
    reader.onload = function(event) {
        if (trailerMode === false){
            raceRampApp.vehicle.img = new Image();
            raceRampApp.vehicle.img.onload = function() {
                updateAppScreen();
            };
        
            raceRampApp.vehicle.img.src = event.target.result;
        }
        else {
            raceRampApp.trailer.img = new Image();
            raceRampApp.trailer.img.onload = function() {
                updateAppScreen();
            };
        
            raceRampApp.trailer.img.src = event.target.result;
        }
    };
    reader.readAsDataURL(event.target.files[0]);
};

function updateAppScreen() {
    raceRampApp.appScreen.clear(raceRampApp.scale);

    if (!raceRampApp.trailerMode) {
        raceRampApp.appScreen.drawImage(raceRampApp.scale,raceRampApp.pan,raceRampApp.vehicle.img);
        if (raceRampApp.scale === 1){
            raceRampApp.appScreen.boundsChecking(raceRampApp.vehicle.back);
            raceRampApp.appScreen.boundsChecking(raceRampApp.vehicle.front);
            raceRampApp.appScreen.boundsChecking(raceRampApp.vehicle.contact);
        }
        calculateVehicleRampAngle();
    
        raceRampApp.vehicle.back.draw(raceRampApp.appScreen.context);
        raceRampApp.vehicle.front.draw(raceRampApp.appScreen.context);
        raceRampApp.vehicle.contact.draw(raceRampApp.appScreen.context);
    }
    else {
        raceRampApp.appScreen.drawImage(raceRampApp.scale,raceRampApp.pan,raceRampApp.trailer.img);
        if (raceRampApp.scale === 1){
            raceRampApp.appScreen.boundsChecking(raceRampApp.trailer.back);
            raceRampApp.appScreen.boundsChecking(raceRampApp.trailer.ground);
            raceRampApp.appScreen.boundsChecking(raceRampApp.trailer.hinge);
        }
        calculateTrailerRampAngle();

        raceRampApp.trailer.back.draw(raceRampApp.appScreen.context);
        raceRampApp.trailer.ground.draw(raceRampApp.appScreen.context);
        raceRampApp.trailer.hinge.draw(raceRampApp.appScreen.context);
    }

};

function calculateVehicleRampAngle() {
    var plane = new Line(raceRampApp.vehicle.back.x,raceRampApp.vehicle.back.y,
        raceRampApp.vehicle.front.x,raceRampApp.vehicle.front.y); 
    var hypotenuse = new Line(raceRampApp.vehicle.contact.x,raceRampApp.vehicle.contact.y,
        raceRampApp.vehicle.front.x,raceRampApp.vehicle.front.y);

    var intersect = plane.findIntersect(hypotenuse);
    var opposite = new Line(intersect.x,intersect.y,raceRampApp.vehicle.contact.x,raceRampApp.vehicle.contact.y);

    ctx = raceRampApp.appScreen.context;
    ctx.beginPath();
    ctx.strokeStyle = LINE_COLOR;
    ctx.moveTo(plane.x, plane.y);
    ctx.lineTo(plane.x2,plane.y2);
    ctx.lineTo(hypotenuse.x,hypotenuse.y);
    ctx.lineTo(intersect.x,intersect.y);
    ctx.lineTo(hypotenuse.x2,hypotenuse.y2);
    ctx.stroke();

    ctx = raceRampApp.appScreen.context;
    ctx.font = "30px Arial"

    vehicleAngle = getAngleFromSides("sin",opposite,hypotenuse);
    document.getElementById("angle").innerHTML = "Approximate Angle: " 
    + round(vehicleAngle,2);
};

function calculateTrailerRampAngle() {
    var plane = new Line(raceRampApp.trailer.back.x,raceRampApp.trailer.back.y,
        raceRampApp.trailer.ground.x,raceRampApp.trailer.ground.y); 
    var hypotenuse = new Line(raceRampApp.trailer.hinge.x,raceRampApp.trailer.hinge.y,
        raceRampApp.trailer.ground.x,raceRampApp.trailer.ground.y);

    var intersect = plane.findIntersect(hypotenuse);
    var opposite = new Line(intersect.x,intersect.y,
        raceRampApp.trailer.hinge.x,raceRampApp.trailer.hinge.y);
    var adjacent = new Line (intersect.x,intersect.y,
        raceRampApp.trailer.ground.x,raceRampApp.trailer.ground.y)

    ctx = raceRampApp.appScreen.context;
    ctx.beginPath();
    ctx.strokeStyle = LINE_COLOR;
    ctx.moveTo(plane.x, plane.y);
    ctx.lineTo(plane.x2,plane.y2);
    ctx.lineTo(hypotenuse.x,hypotenuse.y);
    ctx.lineTo(intersect.x,intersect.y);
    ctx.lineTo(hypotenuse.x2,hypotenuse.y2);
    ctx.stroke();

    ctx = raceRampApp.appScreen.context;
    ctx.font = "30px Arial"
    var trailerAngle = getAngleFromSides("sin",opposite,hypotenuse);

    var trailerRampLength = document.getElementById("ramp_length").value;

    var trailerHeight = opposite.getDistance();
    //console.log("trailerHeight = " + trailerHeight);
    var trailerDistance = adjacent.getDistance();
    
    var travelDistance = hypotenuse.getDistance();
    //console.log("travelDistance = " + travelDistance);
    var trueTrailerDistance = Math.cos(trailerAngle / 180 * Math.PI) * trailerRampLength;
    console.log("trueTrailerDistance = " + trueTrailerDistance);
    var trueTravelDistance = travelDistance / trailerDistance * trueTrailerDistance;
    console.log("trueTravelDistance = " + trueTravelDistance);
    console.log("trailerHeight = " + (Math.sin(trailerAngle / 180 * Math.PI) * trailerRampLength));
    var trueRampDistance = trueTravelDistance - trueTrailerDistance;
    console.log("trueRampDistance = " + trueRampDistance);
    console.log("vehicle Angle " + vehicleAngle)
    var trueRampHeight = Math.cos(vehicleAngle / 180 * Math.PI) * trueRampDistance;
    console.log("trueRampHeight: " + trueRampHeight);
    document.getElementById("angle").innerHTML = "Max Ramp Height: " 
    + round(trueRampHeight,2) + " Max Ramp Angle = " + vehicleAngle;
};

function openFileDialog() {
    document.getElementById('img_input').focus();
    document.getElementById('img_input').click();
}

function zoomOut() {
    resetZoom();

    updateAppScreen();
};

function getModeSubject() {
    var subject = [];
    if (!raceRampApp.trailerMode){
        subject[0] = raceRampApp.vehicle.back;
        subject[1] = raceRampApp.vehicle.front;
        subject[2] = raceRampApp.vehicle.contact;
    }
    else {
        subject[0] = raceRampApp.trailer.back;
        subject[1] = raceRampApp.trailer.ground;
        subject[2] = raceRampApp.trailer.hinge;        
    }
    return subject;
}

function resetZoom() {
    var subject = getModeSubject();

    if (raceRampApp.pan.x != 0) {
        subject[0].x -= raceRampApp.pan.x;
        subject[1].x -= raceRampApp.pan.x;
        subject[2].x -= raceRampApp.pan.x;
        raceRampApp.pan.x = 0;
    }
    if (raceRampApp.pan.y != 0) {
        subject[0].y -= raceRampApp.pan.y;
        subject[1].y -= raceRampApp.pan.y;
        subject[2].y -= raceRampApp.pan.y;
        raceRampApp.pan.y = 0;
    }

    subject[0].scalePoint(1/raceRampApp.scale);
    subject[1].scalePoint(1/raceRampApp.scale);
    subject[2].scalePoint(1/raceRampApp.scale);

    raceRampApp.scale = 1;
}

function zoomIn(e) {   
    resetZoom();
    
    raceRampApp.scale = 2;

    var target = e.id;
    panToPoint(target);

    var subject = getModeSubject();

    subject[0].scalePoint(raceRampApp.scale);
    subject[1].scalePoint(raceRampApp.scale);
    subject[2].scalePoint(raceRampApp.scale);

    console.log(subject[0].x)
    if (raceRampApp.pan.x != 0) {
        subject[0].x += raceRampApp.pan.x;
        subject[1].x += raceRampApp.pan.x;
        subject[2].x += raceRampApp.pan.x;
    }
    if (raceRampApp.pan.y != 0) {
        subject[0].y += raceRampApp.pan.y;
        subject[1].y += raceRampApp.pan.y;
        subject[2].y += raceRampApp.pan.y;
    }
    console.log(raceRampApp.vehicle.back.x);
    console.log("pan: " + raceRampApp.pan.x + ", " + raceRampApp.pan.y);

    updateAppScreen();
};

function panToPoint(target) {
    console.log(target);
    var subject = getModeSubject();
    var point;

    if (target === "zoom1")
        point = subject[0];
    else if (target === "zoom2")
        point = subject[1]
    else if (target == "zoom3")
        point = subject[2]
 
    console.log("point = " + point.x + ", " + point.y )
    raceRampApp.pan.x = (raceRampApp.appScreen.canvas.width/2) - (point.x * 2);
    raceRampApp.pan.y = (raceRampApp.appScreen.canvas.height/2) - (point.y * 2);

};

function switchMode() {
    if (!raceRampApp.trailerMode) {
        if (raceRampApp.scale != 1) {
            resetZoom();
        }
        raceRampApp.appScreen.img = trailer.img;
        raceRampApp.trailerMode = true;
        document.getElementById("mode_btn").innerHTML = "Vehicle";
        document.getElementById("img_btn").innerHTML = "Select Trailer Image"; 
        document.getElementById("ramp_length").style.display = "block";

    }
    else {
        if (raceRampApp.scale != 1) {
            resetZoom();
        }
        raceRampApp.appScreen.img = vehicle.img;
        raceRampApp.trailerMode = false;
        document.getElementById("mode_btn").innerHTML = "Trailer";
        document.getElementById("img_btn").innerHTML = "Select Vehicle Image";
        document.getElementById("ramp_length").style.display = "none";

    }
    var subject = getModeSubject();

    document.getElementById("zoom1").innerHTML = subject[0].name;
    document.getElementById("zoom2").innerHTML = subject[1].name;
    document.getElementById("zoom3").innerHTML = subject[2].name;

    updateAppScreen();
}