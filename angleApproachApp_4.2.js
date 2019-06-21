var appArea = new AppArea();
var max;
var scale;
var pan;

var button;

var back;
var front;
var contact;

function startApp() {
    window.addEventListener("resize",resize,false);
    window.addEventListener('orientationchange',resize, false);
    scale = 1;
    pan = {x : 0, y : 0};
    appArea.start();
    setUpDragPoints();
    resize();

    updateAppArea();
};

function setUpDragPoints() {
    back = new MovableCirc(appArea.canvas.width - appArea.canvas.width / 8,appArea.canvas.height - appArea.canvas.height / 8,3,"red","back wheel");
    front = new MovableCirc(appArea.canvas.width / 2,appArea.canvas.height - appArea.canvas.height / 8,3,"red","front wheel");
    contact = new MovableCirc(appArea.canvas.width / 8, appArea.canvas.height / 3,3,"red","fender contact");
};

function openFileDialog() {
    document.getElementById('input_field').focus();
    document.getElementById('input_field').click();
}

function loadImage() {
    scale = 1;
    pan = {x : 0, y : 0};
    setUpDragPoints();
    var reader = new FileReader();
    reader.onload = function(event) {
        appArea.img = new Image();
        appArea.img.onload = function() {
            updateAppArea();
        };
        appArea.img.src = event.target.result;
    };
    reader.readAsDataURL(event.target.files[0]);
};

function resize() {
    var ratio = 5/3; //width / height
    var newWidth = window.innerWidth;
    var newHeight = window.innerHeight * .8;
    var newRatio = newWidth / newHeight;

    if (newRatio > ratio) {
        newWidth = newHeight * ratio;
        appArea.canvas.style.height = newHeight + 'px';
        appArea.canvas.style.width = newWidth + 'px';
    }
    else{
        newHeight = newWidth / ratio;
        appArea.canvas.style.width = newWidth + 'px';
        appArea.canvas.style.height = newHeight + 'px';
    }
    resetZoom();
    widthRatio = appArea.canvas.width / newWidth;
    appArea.canvas.width = newWidth;
    appArea.canvas.height = newHeight;

    contact.x = contact.x / widthRatio;
    contact.y = contact.y / widthRatio;
    front.x = front.x / widthRatio;
    front.y = front.y / widthRatio;
    back.x = back.x / widthRatio;
    back.y = back.y / widthRatio;
    
    updateAppArea();
}

function updateAppArea() {
    appArea.clear(scale);
    if (appArea.img.src)
        appArea.drawImage(scale,pan);

    drawTriangle();
    
    back.draw(appArea.context);
    front.draw(appArea.context);
    contact.draw(appArea.context);
};

function AppArea() {
    this.img = new Image();
    this.canvas;

    this.start = function () {
        this.canvas = document.getElementById('appCanvas');
        this.img.cropped = false;
        this.canvas.width = 1000;
        this.canvas.height = 600;
        this.context = this.canvas.getContext("2d");
    
        this.canvas.addEventListener("mousedown", dragStart, false);
        this.canvas.addEventListener("mouseup", dragEnd, false);
        this.canvas.addEventListener("mousemove", drag, false);
        this.canvas.addEventListener("mouseout",dragEnd,false);
        this.canvas.addEventListener("touchstart", dragStart, false);
        this.canvas.addEventListener("touchend", dragEnd, false);
        this.canvas.addEventListener("touchmove", drag, {passive:false});

    };
    this.clear = function() {
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.context.fillStyle = "silver";
        this.context.fillRect(0,0,this.canvas.width, this.canvas.height);
    };
    this.drawImage = function(scale,pan) {
        var wRatio = this.canvas.width / this.img.width;
        var hRatio = this.canvas.height / this.img.height;
        var ratio = Math.min(wRatio,hRatio);

        var offsetX = this.canvas.width - (this.img.width * ratio);
        var offsetY = this.canvas.height - (this.img.height * ratio);

        if (scale === 2){
            this.context.scale(scale,scale);
            this.context.drawImage(this.img,0,0,this.img.width,this.img.height,
                pan.x/2,pan.y/2,this.img.width * ratio,this.img.height * ratio);
            this.context.scale(1/scale,1/scale);
        }
        else if (scale === 1)
            this.context.drawImage(this.img,0,0,this.img.width,this.img.height,
                0,0,this.img.width * ratio,this.img.height * ratio);
    };
};

function MovableCirc(x,y,r,c,n) {
    this.x = x; // x-coordinate
    this.y = y; // y-coordinate
    this.r = r; // radius
    this.active = false; // currently being moved?
    this.hover = false; // mouse currently hovering?
    this.color = c; // fill color
    this.name = n;
    this.draw = function(ctx,scale) {
        //draw a solid circle on the canvas
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r,0,2 * Math.PI);
        ctx.fillStyle = this.color;        
        ctx.fill();

        if (this.hover){
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r * 4,0,2 * Math.PI);
            ctx.fill(); 
            ctx.beginPath();
            ctx.strokeStyle = 'white'; 
            ctx.arc(this.x, this.y, this.r * 4 + 1,0,2 * Math.PI);
            ctx.stroke()            
            ctx.globalAlpha = 1;
            if (!this.active)
            this.drawToolTip(ctx);
        }
        else {
            ctx.beginPath();
            ctx.strokeStyle = 'white'; 
            ctx.arc(this.x, this.y, this.r + 1,0,2 * Math.PI);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.arc(this.x,this.y,1,0,2 * Math.PI);
        ctx.fill();
    }; 
    this.isActive = function(loc) {
        // check if contact is being made with this object
        if ((loc.x >= this.x - this.r * 4 && loc.x <= this.x + this.r * 4)
            && (loc.y >= this.y - this.r * 4 && loc.y <= this.y + this.r * 4)){
                this.active = true;
            }
        else
            this.active = false;
            
        return this.active;
    };
    this.isHovering = function(loc){
        if ((loc.x >= this.x - this.r * 4 && loc.x <= this.x + this.r * 4)
            && (loc.y >= this.y - this.r * 4 && loc.y <= this.y + this.r * 4)){
            this.hover = true;
        }
        else {
            this.hover = false;
        }
        return this.hover;
    };
    this.drawToolTip = function(ctx) {
        ctx.font = "11px Arial";
        ctx.fillText(this.name,this.x, this.y - this.r * 5);
    };
    this.scalePoint = function(scale) {
        this.x = this.x * scale;
        this.y = this.y * scale;
    };
};

function Line(x,y,x2,y2) {
    this.x = x;
    this.y = y;
    this.x2 = x2;
    this.y2 = y2;
    this.slope = 0;
    this.yIntercept = 0;
    this.findSlope = function() {
        if (this.y === this.y2)
            this.slope = "undefined";
        else
            this.slope = (this.y - this.y2) / (this.x - this.x2);
    };
    this.getPerpendicularSlope = function() {
        if (this.slope === "undefined")
            return 0;
        else if (this.slope === 0)
            return "undefined"
        else
            return -1 / this.slope;
    };
    this.findIntersect = function(line2) {
        this.findSlope();
        if (this.slope ===  "undefined") {
            return {x : line2.x, y : this.y};
        } else if (this.slope === 0){
            return {x : this.x, y : line2.y};
        } else {
            slope2 = this.getPerpendicularSlope()
        
            var xI = ((-1 * slope2 * line2.x) + line2.y 
                    + (this.slope * this.x) - this.y) 
                    / (this.slope - slope2);
            var yI = slope2 * (xI - line2.x) + line2.y;

            return {x : xI, y : yI};
        };
    };
    this.getDistance = function() {
        return Math.sqrt(Math.pow(this.x2 - this.x, 2) 
                    + Math.pow(this.y2 - this.y, 2));
    };
};

function round(value,decimals) {
    // https://www.jacklmoore.com/notes/rounding-in-javascript/
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
};

function getAngle(hypotenuse,opposite) {
    var o = opposite.getDistance();
    var h = hypotenuse.getDistance();

    var angleRad = Math.asin(o/h);
    var angleDeg = angleRad * (180 / Math.PI);
    document.getElementById("angle").innerHTML = "Approximate Angle of Approach: " + round(angleDeg,2);
    return angleDeg;
};

function drawTriangle() {
    var plane = new Line(back.x,back.y,front.x,front.y); 
    var hypotenuse = new Line(contact.x,contact.y,front.x,front.y);

    var intersect = plane.findIntersect(hypotenuse);
    var opposite = new Line(intersect.x,intersect.y,contact.x,contact.y);

    ctx = appArea.context;
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.moveTo(plane.x, plane.y);
    ctx.lineTo(plane.x2,plane.y2);
    ctx.lineTo(hypotenuse.x,hypotenuse.y);
    ctx.lineTo(intersect.x,intersect.y);
    ctx.lineTo(hypotenuse.x2,hypotenuse.y2);
    ctx.stroke();

    ctx = appArea.context;
    ctx.font = "30px Arial"
    getAngle(hypotenuse,opposite);
};

function windowToCanvas(x, y) {
    var bbox = appArea.canvas.getBoundingClientRect(); 

    if (!appArea.img.cropped)
        return { x: x - bbox.left * (appArea.canvas.width  / bbox.width),
                y: y - bbox.top  * (appArea.canvas.height / bbox.height)};
};

function dragStart(e) {
    e.preventDefault();
    var loc;
    if (e.type === "touchstart")
        loc = windowToCanvas(e.touches[0].clientX, e.touches[0].clientY);
    else
        loc = windowToCanvas(e.clientX,e.clientY) 
   
   if (back.isActive(loc)) {
        return;
   } 
   else if(front.isActive(loc)){
        return;
   }else if (contact.isActive(loc)){
        return;
   }
};

function drag(e) {
    e.preventDefault();

    var loc;
    if (e.type === "touchmove")
        loc = windowToCanvas(e.touches[0].clientX, e.touches[0].clientY);
    else
        loc = windowToCanvas(e.clientX,e.clientY)
 
    if(back.active === true){
        if (loc.x < 0)
            back.x = 0;
        else if (loc.x > appArea.canvas.width)
            back.x = appArea.canvas.width;
        else
            back.x = loc.x;

        if (loc.y < 0)
            back.y = 0;
        else if (loc.y > appArea.canvas.width)
            back.y = appArea.canvas.width;
        else        
            back.y = loc.y;
    }
    else if(front.active === true){
        if (loc.x < 0)
            front.x = 0;
        else if (loc.x > appArea.canvas.width)
            front.x = appArea.canvas.width;
        else
            front.x = loc.x;

        if (loc.y < 0)
            front.y = 0;
        else if (loc.y > appArea.canvas.width)
            front.y = appArea.canvas.width;
        else
            front.y = loc.y;
    } 
    else if (contact.active === true){
        if (loc.x < 0)
            contact.x = 0;
        else if (loc.x > appArea.canvas.width)
            contact.x = appArea.canvas.width;
        else
            contact.x = loc.x;

        if (loc.y < 0)
            contact.y = 0;
        else if (loc.y > appArea.canvas.width)
            contact.y = appArea.canvas.width;
        else
            contact.y = loc.y;
    }

    hover(loc);

    updateAppArea();
};

function dragEnd(e) {
    e.preventDefault();
    back.active = false;
    front.active = false;
    contact.active = false;
    back.hover = false;
    front.hover = false;
    contact.hover = false;
    updateAppArea();
};

function hover(loc) {
    if (contact.isHovering(loc) && contact.active){
        front.hover = false;
        back.hover = false;
    }
    else if (front.isHovering(loc) && front.active) {
        back.hover = false;
        contact.hover = false;
    }
    else if (back.isHovering(loc) && back.active){
        front.hover = false;
        contact.hover = false;
    }
};

function zoomOut() {
    resetZoom();

    updateAppArea();
};

function resetZoom() {
    if (pan.x != 0) {
        front.x -= pan.x;
        back.x -= pan.x;
        contact.x -= pan.x;
        pan.x = 0;
    }
    if (pan.y != 0) {
        front.y -= pan.y;
        back.y -= pan.y;
        contact.y -= pan.y;
        pan.y = 0;
    }

    front.scalePoint(1/scale);
    back.scalePoint(1/scale);
    contact.scalePoint(1/scale);

    scale = 1;
}

function zoomIn(target) {
    resetZoom();

    scale = 2;

    if (target === "front")
        zoomOnPoint(front);
    else if (target === "back")
        zoomOnPoint(back);
    else if (target == "contact")
        zoomOnPoint(contact);

    front.scalePoint(scale);
    back.scalePoint(scale);
    contact.scalePoint(scale);

    if (pan.x != 0) {
        front.x += pan.x;
        back.x += pan.x;
        contact.x += pan.x;
    }
    if (pan.y != 0) {
        front.y += pan.y;
        back.y += pan.y;
        contact.y += pan.y;
    }
    updateAppArea();
};

function zoomOnPoint(point) {
        pan.x = (appArea.canvas.width/2) - (point.x * 2);
        pan.y = (appArea.canvas.height/2) - (point.y * 2);
};

function btnHoverOn(target){
    if (target === "front")
        front.hover = true;
    else if (target === "back")
        back.hover = true;
    else if (target === "contact")
        contact.hover = true;

    updateAppArea();
}
function btnHoverOff(target){
    if (target === "front")
        front.hover = false;
    else if (target === "back")
        back.hover = false;
    else if (target === "contact")
        contact.hover = false;

    updateAppArea();
}
