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
    let pacman;
    let walls;
    let wallcheck;
    let direction;
    let speed = new ƒ.Vector3(0, 0, 0);
    document.addEventListener("interactiveViewportStarted", start);
    function start(_event) {
        viewport = _event.detail;
        let graph = viewport.getBranch();
        pacman = graph.getChildrenByName("Pacman")[0];
        walls = graph.getChildrenByName("WallElements")[0].getChildren();
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // ƒ.Physics.simulate();  // if physics is included and used
        wallcheck = false;
        //change direction in Grid and check if direction change is valid
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT, ƒ.KEYBOARD_CODE.D]) && +(pacman.mtxLocal.translation.y.toFixed(1)) % 1 == 0) {
            for (let x = 0; x < walls.length; x++) {
                if (Math.round(pacman.mtxLocal.translation.x) == walls[x].mtxLocal.translation.x - 1 && Math.round(pacman.mtxLocal.translation.y) == walls[x].mtxLocal.translation.y) {
                    wallcheck = true;
                }
            }
            if (wallcheck == false) {
                speed.set(1 / 60, 0, 0);
                direction = "right";
            }
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT, ƒ.KEYBOARD_CODE.A]) && +(pacman.mtxLocal.translation.y.toFixed(1)) % 1 == 0) {
            for (let x = 0; x < walls.length; x++) {
                if (Math.round(pacman.mtxLocal.translation.x) == walls[x].mtxLocal.translation.x + 1 && Math.round(pacman.mtxLocal.translation.y) == walls[x].mtxLocal.translation.y) {
                    wallcheck = true;
                }
            }
            if (wallcheck == false) {
                speed.set(-1 / 60, 0, 0);
                direction = "left";
            }
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W]) && +(pacman.mtxLocal.translation.x.toFixed(1)) % 1 == 0) {
            for (let x = 0; x < walls.length; x++) {
                if (Math.round(pacman.mtxLocal.translation.y) == walls[x].mtxLocal.translation.y - 1 && Math.round(pacman.mtxLocal.translation.x) == walls[x].mtxLocal.translation.x) {
                    wallcheck = true;
                }
            }
            if (wallcheck == false) {
                speed.set(0, 1 / 60, 0);
                direction = "up";
            }
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN, ƒ.KEYBOARD_CODE.S]) && +(pacman.mtxLocal.translation.x.toFixed(1)) % 1 == 0) {
            for (let x = 0; x < walls.length; x++) {
                if (Math.round(pacman.mtxLocal.translation.y) == walls[x].mtxLocal.translation.y + 1 && Math.round(pacman.mtxLocal.translation.x) == walls[x].mtxLocal.translation.x) {
                    wallcheck = true;
                }
            }
            if (wallcheck == false) {
                speed.set(0, -1 / 60, 0);
                direction = "down";
            }
        }
        //check if Pacman bumps into wall
        for (let x = 0; x < walls.length; x++) {
            if (+(pacman.mtxLocal.translation.y.toFixed(1)) == walls[x].mtxLocal.translation.y + 1 && Math.round(pacman.mtxLocal.translation.x) == walls[x].mtxLocal.translation.x && direction == "down") {
                speed.set(0, 0, 0);
                direction = "";
            }
            if (+(pacman.mtxLocal.translation.y.toFixed(1)) == walls[x].mtxLocal.translation.y - 1 && Math.round(pacman.mtxLocal.translation.x) == walls[x].mtxLocal.translation.x && direction == "up") {
                speed.set(0, 0, 0);
                direction = "";
            }
            if (+(pacman.mtxLocal.translation.x.toFixed(1)) == walls[x].mtxLocal.translation.x + 1 && Math.round(pacman.mtxLocal.translation.y) == walls[x].mtxLocal.translation.y && direction == "left") {
                speed.set(0, 0, 0);
                direction = "";
            }
            if (+(pacman.mtxLocal.translation.x.toFixed(1)) == walls[x].mtxLocal.translation.x - 1 && Math.round(pacman.mtxLocal.translation.y) == walls[x].mtxLocal.translation.y && direction == "right") {
                speed.set(0, 0, 0);
                direction = "";
            }
        }
        pacman.mtxLocal.translate(speed);
        viewport.draw();
        ƒ.AudioManager.default.update();
    }
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map