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
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    let cmpCamera;
    let playerTransform;
    let player;
    let ball;
    let ballRigi;
    let club;
    let movingDirection = "up";
    let golfHit;
    document.addEventListener("interactiveViewportStarted", start);
    function start(_event) {
        viewport = _event.detail;
        // get golf ball
        ball = viewport.getBranch().getChildrenByName("Ball")[0];
        ballRigi = ball.getComponent(ƒ.ComponentRigidbody);
        // setup Camera following ball
        player = viewport.getBranch().getChildrenByName("Player")[0];
        playerTransform = player.getComponent(ƒ.ComponentTransform);
        viewport.camera = cmpCamera = player.getComponent(ƒ.ComponentCamera);
        cmpCamera.mtxPivot.translate(new ƒ.Vector3(0, 15, 0));
        cmpCamera.mtxPivot.rotateX(90);
        // get golf club
        club = viewport.getBranch().getChildrenByName("Club")[0];
        //sounds
        golfHit = viewport.getBranch().getChildrenByName("Sound")[0].getComponents(ƒ.ComponentAudio)[0];
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        ƒ.Physics.simulate(); // if physics is included and used
        viewport.draw();
        ƒ.AudioManager.default.update();
        followBall();
        controlClub();
        golfClub();
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
            if (movingDirection == "up" && ballRigi.getVelocity().z < 4 && ballRigi.getVelocity().z > -4 && ballRigi.getVelocity().x < 4 && ballRigi.getVelocity().x > -4) {
                sound();
                ballRigi.applyImpulseAtPoint(new ƒ.Vector3(0, 0, 10));
            }
            if (movingDirection == "down" && ballRigi.getVelocity().z > -4 && ballRigi.getVelocity().z < 4 && ballRigi.getVelocity().x < 4 && ballRigi.getVelocity().x > -4) {
                sound();
                ballRigi.applyImpulseAtPoint(new ƒ.Vector3(0, 0, -10));
            }
            if (movingDirection == "left" && ballRigi.getVelocity().x < 4 && ballRigi.getVelocity().z < 4 && ballRigi.getVelocity().z > -4 && ballRigi.getVelocity().x > -4) {
                sound();
                ballRigi.applyImpulseAtPoint(new ƒ.Vector3(10, 0, 0));
            }
            if (movingDirection == "right" && ballRigi.getVelocity().x > -4 && ballRigi.getVelocity().z < 4 && ballRigi.getVelocity().z > -4 && ballRigi.getVelocity().x < 4) {
                sound();
                ballRigi.applyImpulseAtPoint(new ƒ.Vector3(-10, 0, 0));
            }
        }
    }
    function followBall() {
        let ballVector = new ƒ.Vector3;
        ballVector = ball.mtxLocal.translation.clone;
        ballVector.y = 15;
        playerTransform.mtxLocal.translation = ballVector;
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
        if (ballRigi.getVelocity().z < 4 && ballRigi.getVelocity().z > -4 && ballRigi.getVelocity().x < 4 && ballRigi.getVelocity().x > -4) {
            club.getComponent(ƒ.ComponentMesh).activate(true);
            club.getChild(0).getComponent(ƒ.ComponentMesh).activate(true);
        }
        //hide club if not playable
        if (ballRigi.getVelocity().z > 4 || ballRigi.getVelocity().z < -4 || ballRigi.getVelocity().x > 4 || ballRigi.getVelocity().x < -4) {
            club.getComponent(ƒ.ComponentMesh).activate(false);
            club.getChild(0).getComponent(ƒ.ComponentMesh).activate(false);
        }
    }
    function sound() {
        golfHit.play(true);
    }
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map