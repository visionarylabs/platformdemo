/**
    JavaScript Platformer Game Demo
**/

// Game Constants
var gravity = 0.35; //.35
var friction = .8; //.9
var gameStatus = 0;

// Game Objects
var hero = {};

//global vars
var w = window;
var mouse = {x:0,y:0};

//global funcs
var reset = {};

//blocks
var block = function(width,height,x,y,type){
    var width = width;
    var height = height;
    var x = x;
    var y = y;
    var type = type;
    var falling = false;
    var floating = false;
    var trap = false;
    var hoverRight = false;
    var hoverLeft = false;
    return{
        width: width,
        height: height,
        x: x,
        y: y,
        type: type,
        falling: falling,
        floating: floating
    }
}
var blocks = new Array();

var makeblock = function(width,height,x,y,type){
    var temp = block(width,height,x,y,type);
    blocks.push(temp);
}

/** RUN GAME **/
var runGame = function(){

    /*create the canvas*/
    //var canvas = document.createElement("canvas");
    var canvas = document.getElementById('game-canvas');
    var ctx = canvas.getContext("2d");

    canvas.width = 640;
    canvas.height = 480;
    canvas.id = 'game-canvas';

    //PLAYER CONTROLLER
    canvas.addEventListener('mousemove', function(e) {
        mouse = getMousePos(canvas,e);
    });
    
    canvas.addEventListener('mouseout', function(e) {
        mouse = {x:-1,y:-1};
    });
    
    canvas.addEventListener('click', function(e) {
        click = getMousePos(canvas,e);
        processClick(click);
    });
    
    function getMousePos(canvas,e) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: Math.floor(e.clientX - rect.left),
          y: Math.floor(e.clientY - rect.top)
        };
    }
    
    function processClick(click){
        console.log(click);
        if( click.y > canvas.height / 2 ){
            console.log('jump');
            console.log('jumping? ' + hero.jumping);
            console.log('grounded? ' + hero.grounded);
            heroJump();
        }else if(click.x > canvas.width / 2 ){
            hero.x += 5;
        }else if(click.x < canvas.width / 2 ){
            hero.x -= 5;
        }
    }

    // Hero image
    var heroReady = false;
    var heroImage = new Image();
    heroImage.onload = function () {
        heroReady = true;
    };
    heroImage.src = "images/sprite-hero.png";

    // Game objects

    //HERO
    hero = {
        speed: 10, // movement in pixels per second
        jumpSpeed : 10,
        width: 40,
        height: 40,
        velx: 0,
        vely: 0,
        x: 0,
        y: 0,
        jumping : false,
        grounded : false,
        goingup : false
    };

    //START THE GAME!
    gameStatus = 1;

    // Handle keyboard controls
    var keysDown = {};

    //Key Listeners
    addEventListener("keydown", function (e) {
        keysDown[e.keyCode] = true;
    }, false);

    addEventListener("keyup", function (e) {
        delete keysDown[e.keyCode];
    }, false);

    // Reset the game when the player catches a portal
    reset = function () {
        gameStatus = 1;
        hero.x = 10;
        hero.y = 600;
        hero.velx = 0;
        hero.vely = 0;
        hero.grounded = false;
        hero.goingup = false;
        blocks = new Array();
    };

    //init and build the level
    var init = function(){
        reset();
        makeblock(50,50,150,350);
        makeblock(50,50,300,350);
        makeblock(50,50,450,350);
    };

    //if the hero is on the ground jump!
    function heroJump(){
        if (hero.grounded == true && hero.jumping == false) {
            hero.jumping = true;
            hero.grounded = false; //hero not on the ground anymore
            hero.y = hero.y + 1;
            hero.vely = -hero.jumpSpeed * 1;
        }
    }

    // Update game objects
    // Check inputs for how to update sprites
    var update = function (delta) {

        var modifier = delta * 100;

        //Jumping
        if (38 in keysDown || 32 in keysDown ) { // Player holding up or space
            heroJump();
        }

        if (37 in keysDown) { // Player holding left
            if (hero.velx > -hero.speed) {
                hero.velx--;
            }
        }
        if (39 in keysDown) { // Player holding right
            if (hero.velx < hero.speed) {
                hero.velx++;
            }
        }

        // ESC KEY
        if (27 in keysDown) {
            gameStatus = 1;
            reset();
        }

        //Friction
        //slow down the hero
        hero.velx *= friction;
        //snap to 0 if close to 0
        if( hero.velx < .01 && hero.velx > -.01 ){
            hero.velx = 0;
        }

        //Gravity
        hero.vely += gravity;
        if( hero.vely >= 0 ){
            hero.goingup = false;
        }else{
            hero.goingup = true;
        }

        // stop hero on screen edge
        if (hero.x >= canvas.width - heroImage.width) {
            hero.x = canvas.width - heroImage.width;
        }else if (hero.x <= 0) {
            hero.x = 0;
        }

        // stop hero on the floor
        if (hero.y >= canvas.height - heroImage.height) {
            hero.y = canvas.height - heroImage.height;
        }else if (hero.y <= 0) {
            hero.y = 0;
        }

        //check blocks
        hero.grounded = false;
        for(i=0;i<blocks.length;i++){
            var dir = colCheck(hero, blocks[i]);
            //if you hit any side do this:
            if (dir === "l" || dir === "r" || dir === "t" || dir === "b") {

            }
            if (dir === "l" || dir === "r") {
                hero.velx = 0;
                hero.jumping = false;
            } else if (dir === "b") { //if the hero lands on top
                hero.grounded = true;
                hero.jumping = false;
            } else if (dir === "t") {
                hero.vely *= -1;
            }
        }
        if(hero.y == canvas.height - heroImage.height && !hero.goingup){
            hero.grounded = true;
            hero.jumping = false;
        }
        if(hero.grounded && !hero.goingup){
            hero.vely = 0;
        }

        //move the hero
        hero.x += hero.velx * modifier;
        hero.y += hero.vely * modifier;

    };

    // check block hits
    function colCheck(shapeA, shapeB) {
        // get the vectors to check against
        var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
            vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
            // add the half widths and half heights of the objects
            hWidths = (shapeA.width / 2) + (shapeB.width / 2),
            hHeights = (shapeA.height / 2) + (shapeB.height / 2),
            colDir = null;

        // if the x and y vector are less than the half width or half height,
        // they we must be inside the object, causing a collision
        if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
            var oX = hWidths - Math.abs(vX), oY = hHeights - Math.abs(vY);
            if (oX >= oY) {
                if (vY > 0) {
                    colDir = "t";
                    shapeA.y += oY;
                } else {
                    colDir = "b";
                    shapeA.y -= oY;
                }
            } else {
                if (vX > 0) {
                    colDir = "l";
                    shapeA.x += oX;
                } else {
                    colDir = "r";
                    shapeA.x -= oX;
                }
            }
        }
        return colDir;
    }


    // Draw everything
    var render = function () {
        ctx.clearRect(0,0,canvas.width, canvas.height);
        
        if (heroReady) {
            ctx.drawImage(heroImage, hero.x, hero.y);
        }

        //draw blocks
        for(i=0; i < blocks.length; i++){
            ctx.fillStyle = "rgb(50,50,50)";
            ctx.fillRect(blocks[i].x,blocks[i].y,blocks[i].width,blocks[i].height);
        }
    };

    // The main game loop
    var main = function () {
        var now = Date.now();
        var delta = now - then;

        update(delta / 1000);
        render();

        then = now;

        // Request to do this again ASAP
        requestAnimationFrame(main);
    };

    // Cross-browser support for requestAnimationFrame
    var w = window;
    requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

    // Let's play this game!
    var then = Date.now();
    init();
    main();

}