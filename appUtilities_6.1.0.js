//color pallet
LINE_COLOR = "white";
BACKGROUND = "silver";

function windowToCanvas(x, y) {
    var bbox = raceRampApp.appScreen.canvas.getBoundingClientRect(); 

    return { x: x - bbox.left * (raceRampApp.appScreen.canvas.width  / bbox.width),
            y: y - bbox.top  * (raceRampApp.appScreen.canvas.height / bbox.height)};
};

function AppScreen() {
    this.canvas;

    this.start = function () {
        this.canvas = document.getElementById('appCanvas');
        this.canvas.width = 1000;
        this.canvas.height = 500;
        this.context = this.canvas.getContext("2d");
    };
    this.clear = function() {
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.context.fillStyle = BACKGROUND;
        this.context.fillRect(0,0,this.canvas.width, this.canvas.height);
    };
    this.drawImage = function(scale,pan,img) {
        if (img.src) {
            var wRatio = this.canvas.width / img.width;
            var hRatio = this.canvas.height / img.height;
            var ratio = Math.min(wRatio,hRatio);

            //var offsetX = this.canvas.width - (img.width * ratio);
            //var offsetY = this.canvas.height - (img.height * ratio);

            if (scale === 2){
                this.context.scale(scale,scale);
                this.context.drawImage(img,0,0,img.width,img.height,
                    pan.x/2,pan.y/2,img.width * ratio,img.height * ratio);
                this.context.scale(1/scale,1/scale);
            }
            else if (scale === 1)
                this.context.drawImage(img,0,0,img.width,img.height,
                    0,0,img.width * ratio,img.height * ratio);
        }
    };
    this.boundsChecking = function(point) {
        if (point.x < 0 )
            point.x = 0 + point.r;
        else if (point >= this.canvas.width)
            point.x = this.canvas.height - point.r;
        if (point.y < 0 )
            point.y = 0 + point.r;
        else if (point.y >= this.canvas.height)
            point.y = this.canvas.height - point.r ;     
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
            ctx.strokeStyle = LINE_COLOR; 
            ctx.arc(this.x, this.y, this.r * 4 + 1,0,2 * Math.PI);
            ctx.stroke()            
            ctx.globalAlpha = 1;
            if (!this.active)
            this.drawToolTip(ctx);
        }
        else {
            ctx.beginPath();
            ctx.strokeStyle = LINE_COLOR; 
            ctx.arc(this.x, this.y, this.r + 1,0,2 * Math.PI);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.fillStyle = LINE_COLOR;
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

function getAngleFromSides(type,opposite,hypotenuse) {
    var angleDeg;
    
    if (type === "sin") {
        var o = opposite.getDistance();
        var h = hypotenuse.getDistance();
    
        var angleRad = Math.asin(o/h);
        angleDeg = angleRad * (180 / Math.PI);
    }

    return angleDeg;
};

