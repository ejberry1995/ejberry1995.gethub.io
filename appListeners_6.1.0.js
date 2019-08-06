function resizePoint(point,ratio) {
    point.x = point.x / ratio;
    point.y = point.y / ratio;
}

function toggleOverlay() {
    document.getElementById("app-start-overlay").style.display = "none";
}

function setUpListeners() {
    window.addEventListener("resize",resize,false); 
    window.addEventListener('orientationchange',resize, false); 
    raceRampApp.appScreen.canvas.addEventListener("mousedown", dragStart, false);
    raceRampApp.appScreen.canvas.addEventListener("mouseup", dragEnd, false);
    raceRampApp.appScreen.canvas.addEventListener("mousemove", drag, false);
    raceRampApp.appScreen.canvas.addEventListener("mouseout",dragEnd,false);
    raceRampApp.appScreen.canvas.addEventListener("touchstart", dragStart, false);
    raceRampApp.appScreen.canvas.addEventListener("touchend", dragEnd, false);
    raceRampApp.appScreen.canvas.addEventListener("touchmove", drag, {passive:false});
};

function resize() {
    var ratio = 2/1; //width / height
    var newWidth = document.getElementById("appCanvas-container").offsetWidth
    var newHeight = document.getElementById("appCanvas-container").offsetHeight
    var newRatio = newWidth / newHeight;

    if (newRatio >= ratio) {
        newWidth = newHeight * ratio;
        raceRampApp.appScreen.canvas.style.height = newHeight + 'px';
        raceRampApp.appScreen.canvas.style.width = newWidth + 'px';
    }
    else {
        newHeight = newWidth / ratio;
        raceRampApp.appScreen.canvas.style.width = newWidth + 'px';
        raceRampApp.appScreen.canvas.style.height = newHeight + 'px';
    }
    resetZoom();
    widthRatio = raceRampApp.appScreen.canvas.width / newWidth;
    raceRampApp.appScreen.canvas.width = newWidth;
    raceRampApp.appScreen.canvas.height = newHeight;

    resizePoint(raceRampApp.vehicle.contact,widthRatio);
    resizePoint(raceRampApp.vehicle.front,widthRatio);
    resizePoint(raceRampApp.vehicle.back,widthRatio);
    resizePoint(raceRampApp.trailer.hinge,widthRatio);
    resizePoint(raceRampApp.trailer.ground,widthRatio);
    resizePoint(raceRampApp.trailer.back,widthRatio);
    
    updateAppScreen();
}

function dragStart(e) {
    e.preventDefault();
    var loc;
    if (e.type === "touchstart")
        loc = windowToCanvas(e.touches[0].clientX, e.touches[0].clientY);
    else
        loc = windowToCanvas(e.clientX,e.clientY)
        
    var subject = getModeSubject()    

    if (subject[0].isActive(loc))
        return;
    else if(subject[1].isActive(loc))
        return;
    else if (subject[2].isActive(loc))
        return;
};

function drag(e) {
    e.preventDefault();
    var loc;
    if (e.type === "touchmove")
        loc = windowToCanvas(e.touches[0].clientX, e.touches[0].clientY);
    else
        loc = windowToCanvas(e.clientX,e.clientY)

    var subject = getModeSubject()
 
    if(subject[0].active === true){
        if (loc.x < 0)
            subject[0].x = 0;
        else if (loc.x > raceRampApp.appScreen.canvas.width)
            subject[0].x = raceRampApp.appScreen.canvas.width;
        else
            subject[0].x = loc.x;

        if (loc.y < 0)
            subject[0].y = 0;
        else if (loc.y > raceRampApp.appScreen.canvas.height)
            subject[0].y = raceRampApp.appScreen.canvas.height;
        else        
            subject[0].y = loc.y;
    }
    else if(subject[1].active === true){
        if (loc.x < 0)
            subject[1].x = 0;
        else if (loc.x > raceRampApp.appScreen.canvas.width)
            subject[1].x = raceRampApp.appScreen.canvas.width;
        else
            subject[1].x = loc.x;

        if (loc.y < 0)
            subject[1].y = 0;
        else if (loc.y > raceRampApp.appScreen.canvas.height)
            subject[1].y = raceRampApp.appScreen.canvas.height;
        else
            subject[1].y = loc.y;
    } 
    else if (subject[2].active === true){
        if (loc.x < 0)
            subject[2].x = 0;
        else if (loc.x > raceRampApp.appScreen.canvas.width)
            subject[2].x = raceRampApp.appScreen.canvas.width;
        else
            subject[2].x = loc.x;

        if (loc.y < 0)
            subject[2].y = 0;
        else if (loc.y > raceRampApp.appScreen.canvas.height)
            subject[2].y = raceRampApp.appScreen.canvas.height;
        else
            subject[2].y = loc.y;
    }

    hover(loc);

    updateAppScreen();
};

function dragEnd(e) {
    e.preventDefault();

    var subject = getModeSubject();

    subject[0].active = false;
    subject[1].active = false;
    subject[2].active = false;
    subject[0].hover = false;
    subject[1].hover = false;
    subject[2].hover = false;
    updateAppScreen();
};

function hover(loc) {
    var subject = getModeSubject();

    if (subject[0].isHovering(loc) && subject[0].active){
        subject[1].hover = false;
        subject[2].hover = false;
    }
    else if (subject[1].isHovering(loc) && subject[1].active) {
        subject[0].hover = false;
        subject[2].hover = false;
    }
    else if (subject[2].isHovering(loc) && subject[2].active){
        subject[0].hover = false;
        subject[1].hover = false;
    }
};

function btnHoverOn(e){
    var target = e.id;
    var subject = getModeSubject();

    if (target === "zoom1")
        subject[0].hover = true;
    else if (target === "zoom2")
        subject[1].hover = true;
    else if (target === "zoom3")
        subject[2].hover = true;

    updateAppScreen();
}
function btnHoverOff(e){
    var target = e.id;
    var subject = getModeSubject();

    if (target === "zoom1")
        subject[0].hover = false;
    else if (target === "zoom2")
        subject[1].hover = false;
    else if (target === "zoom3")
        subject[2].hover = false;

    updateAppScreen();
}