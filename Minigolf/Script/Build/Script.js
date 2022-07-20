"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class CustomComponentScript extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(CustomComponentScript);
        // Properties may be mutated by users in the editor via the automatically created user interface
        message = "CustomComponentScript added to ";
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
                    ƒ.Debug.log(this.message, this.node);
                    break;
                case "componentRemove" /* COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                    break;
                case "nodeDeserialized" /* NODE_DESERIALIZED */:
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    break;
            }
        };
    }
    Script.CustomComponentScript = CustomComponentScript;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class FollowBall extends ƒ.ComponentScript {
        static graph;
        static ball;
        static playerTransform;
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(FollowBall);
        // Properties may be mutated by users in the editor via the automatically created user interface
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
        }
        hndEvent = (_event) => {
            ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.followBall);
        };
        followBall = (_event) => {
            let rigibody = this.node.getComponent(ƒ.ComponentRigidbody);
            if (!FollowBall.graph) {
                FollowBall.graph = ƒ.Project.resources["Graph|2022-06-01T10:11:57.783Z|46113"];
                FollowBall.ball = FollowBall.graph.getChildrenByName("Ball")[0];
                FollowBall.playerTransform = FollowBall.graph.getChildrenByName("Player")[0].getComponent(ƒ.ComponentTransform);
            }
            let ballVector = new ƒ.Vector3;
            ballVector = FollowBall.ball.mtxLocal.translation.clone;
            ballVector.y = 15;
            FollowBall.playerTransform.mtxLocal.translation = ballVector;
        };
    }
    Script.FollowBall = FollowBall;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    let cmpCamera;
    let playerTransform;
    let player;
    let ball;
    let ballRigi;
    let ball_Start;
    let club;
    let movingDirection = "up";
    let golfHit;
    let courses;
    let hole_one;
    let hole_one_rigi;
    //TODO add all Vui elements and functionality
    let timerVui;
    let hitsVui;
    let firstHit;
    let timerID;
    let oneTimeHit = true;
    //config and variables
    let config;
    let hitStrength;
    let maxHits;
    //TODO Textures and beauty
    document.addEventListener("interactiveViewportStarted", start);
    async function start(_event) {
        viewport = _event.detail;
        //get config file
        let response = await fetch("config.json");
        config = await response.json();
        hitStrength = config["hitStrength"].strength;
        maxHits = config["maxHits"].hits;
        // get golf ball
        ball = viewport.getBranch().getChildrenByName("Ball")[0];
        ballRigi = ball.getComponent(ƒ.ComponentRigidbody);
        // setup Camera following ball
        player = viewport.getBranch().getChildrenByName("Player")[0];
        playerTransform = player.getComponent(ƒ.ComponentTransform);
        viewport.camera = cmpCamera = player.getComponent(ƒ.ComponentCamera);
        cmpCamera.mtxPivot.translate(new ƒ.Vector3(0, 15, -30));
        cmpCamera.mtxPivot.rotateX(50);
        // get golf club
        club = viewport.getBranch().getChildrenByName("Club")[0];
        //sounds
        golfHit = viewport.getBranch().getChildrenByName("Sound")[0].getComponents(ƒ.ComponentAudio)[0];
        //ball collision with flag
        courses = viewport.getBranch().getChildrenByName("Map")[0].getChildrenByName("Courses")[0];
        hole_one = courses.getChildrenByName("Course1")[0].getChildrenByName("Hole")[0];
        hole_one_rigi = hole_one.getComponent(ƒ.ComponentRigidbody);
        hole_one_rigi.addEventListener("ColliderEnteredCollision" /* COLLISION_ENTER */, hitRegistration);
        //get ball start position
        ball_Start = ball.mtxLocal.translation.clone;
        //initialize Vui
        timerVui = new Script.Timer();
        hitsVui = new Script.Hits();
        hitsVui.maxHits = maxHits;
        //firstHit
        firstHit = true;
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        ƒ.Physics.simulate(); // if physics is included and used
        viewport.draw();
        ƒ.AudioManager.default.update();
        //followBall();
        controlClub();
        golfClub();
        maxHitsCheck();
    }
    function controlClub() {
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.W])) {
            movingDirection = "up";
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A])) {
            movingDirection = "left";
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.S])) {
            movingDirection = "down";
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D])) {
            movingDirection = "right";
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE])) {
            if (movingDirection == "up" && ballRigi.getVelocity().z < 10 && ballRigi.getVelocity().z > -10 && ballRigi.getVelocity().x < 10 && ballRigi.getVelocity().x > -10 && hitsVui.hits < hitsVui.maxHits) {
                sound();
                ballRigi.applyImpulseAtPoint(new ƒ.Vector3(0, 0, hitStrength));
                if (firstHit == true) {
                    timerID = setInterval(timerFunction, 1000);
                    firstHit = false;
                }
            }
            if (movingDirection == "down" && ballRigi.getVelocity().z > -10 && ballRigi.getVelocity().z < 10 && ballRigi.getVelocity().x < 10 && ballRigi.getVelocity().x > -10 && hitsVui.hits < hitsVui.maxHits) {
                sound();
                ballRigi.applyImpulseAtPoint(new ƒ.Vector3(0, 0, -hitStrength));
                if (firstHit == true) {
                    timerID = setInterval(timerFunction, 1000);
                    firstHit = false;
                }
            }
            if (movingDirection == "left" && ballRigi.getVelocity().x < 10 && ballRigi.getVelocity().z < 10 && ballRigi.getVelocity().z > -10 && ballRigi.getVelocity().x > -10 && hitsVui.hits < hitsVui.maxHits) {
                sound();
                ballRigi.applyImpulseAtPoint(new ƒ.Vector3(hitStrength, 0, 0));
                if (firstHit == true) {
                    timerID = setInterval(timerFunction, 1000);
                    firstHit = false;
                }
            }
            if (movingDirection == "right" && ballRigi.getVelocity().x > -10 && ballRigi.getVelocity().z < 10 && ballRigi.getVelocity().z > -10 && ballRigi.getVelocity().x < 10 && hitsVui.hits < hitsVui.maxHits) {
                sound();
                ballRigi.applyImpulseAtPoint(new ƒ.Vector3(-hitStrength, 0, 0));
                if (firstHit == true) {
                    timerID = setInterval(timerFunction, 1000);
                    firstHit = false;
                }
            }
        }
    }
    function golfClub() {
        //club follow ball and rotation
        let rotationVector = new ƒ.Vector3;
        let ballVectorTwo = new ƒ.Vector3;
        ballVectorTwo = ball.mtxLocal.translation.clone;
        if (movingDirection == "up") {
            ballVectorTwo.z += 1;
            rotationVector.y = 0;
        }
        if (movingDirection == "down") {
            ballVectorTwo.z -= 1;
            rotationVector.y = 180;
        }
        if (movingDirection == "left") {
            ballVectorTwo.x += 1;
            rotationVector.y = 90;
        }
        if (movingDirection == "right") {
            ballVectorTwo.x -= 1;
            rotationVector.y = 270;
        }
        club.mtxLocal.translation = ballVectorTwo;
        club.mtxLocal.rotation = rotationVector;
        //show club again
        if (ballRigi.getVelocity().z < 9.9 && ballRigi.getVelocity().z > -9.9 && ballRigi.getVelocity().x < 9.9 && ballRigi.getVelocity().x > -9.9) {
            club.getComponent(ƒ.ComponentMesh).activate(true);
            club.getChild(0).getComponent(ƒ.ComponentMesh).activate(true);
            oneTimeHit = true;
        }
        //hide club if not playable
        if (ballRigi.getVelocity().z > 9.9 || ballRigi.getVelocity().z < -9.9 || ballRigi.getVelocity().x > 9.9 || ballRigi.getVelocity().x < -9.9 || hitsVui.hits >= hitsVui.maxHits) {
            club.getComponent(ƒ.ComponentMesh).activate(false);
            club.getChild(0).getComponent(ƒ.ComponentMesh).activate(false);
        }
        if (club.getComponent(ƒ.ComponentMesh).isActive == false && oneTimeHit == true) {
            hitsFunction();
            oneTimeHit = false;
        }
    }
    function sound() {
        golfHit.play(true);
    }
    function hitRegistration() {
        //reset ball to start and stop any movement
        ballRigi.setPosition(ball_Start);
        ballRigi.setRotation(new ƒ.Vector3(0, 0, 0));
        ballRigi.setVelocity(new ƒ.Vector3(0, 0, 0));
        //reset timer and firstHit variable
        firstHit = true;
        clearInterval(timerID);
        timerVui.seconds = 0;
        timerVui.minutes = 0;
        hitsVui.hits = 0;
    }
    function timerFunction() {
        if (timerVui.seconds <= 58) {
            timerVui.seconds++;
        }
        else {
            timerVui.minutes++;
            timerVui.seconds = 0;
        }
    }
    function hitsFunction() {
        hitsVui.hits++;
    }
    function maxHitsCheck() {
        //reset on last hit. Wait for last hit to finish (until nearly stopped)
        if (hitsVui.hits >= hitsVui.maxHits && ballRigi.getVelocity().x > -0.2 && ballRigi.getVelocity().z < 0.2 && ballRigi.getVelocity().z > -0.2 && ballRigi.getVelocity().x < 0.2) {
            hitRegistration();
        }
    }
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    var ƒUi = FudgeUserInterface;
    class Timer extends ƒ.Mutable {
        minutes = 0;
        seconds = 0;
        constructor() {
            super();
            let timerVui = document.querySelector("div#timer");
            console.log(new ƒUi.Controller(this, timerVui));
        }
        reduceMutator(_mutator) { }
    }
    Script.Timer = Timer;
    class Hits extends ƒ.Mutable {
        hits = 0;
        maxHits = 0;
        constructor() {
            super();
            let hitsVui = document.querySelector("div#hits");
            console.log(new ƒUi.Controller(this, hitsVui));
        }
        reduceMutator(_mutator) { }
    }
    Script.Hits = Hits;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map