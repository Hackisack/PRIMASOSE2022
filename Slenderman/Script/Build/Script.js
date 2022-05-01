"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class DropToGroundInitial extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(DropToGroundInitial);
        // Properties may be mutated by users in the editor via the automatically created user interface
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
                    this.node.addEventListener("renderPrepare" /* RENDER_PREPARE */, this.setHeight);
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
        setHeight = (_event) => {
            const graph = ƒ.Project.resources["Graph|2022-04-14T13:06:24.657Z|49930"];
            const ground = graph.getChildrenByName("Environment")[0].getChildrenByName("Ground")[0];
            const cmpMeshTerrain = ground.getComponent(ƒ.ComponentMesh);
            const meshTerrain = cmpMeshTerrain.mesh;
            const distance = meshTerrain.getTerrainInfo(this.node.mtxLocal.translation, cmpMeshTerrain.mtxWorld).distance;
            this.node.mtxLocal.translateY(-distance);
        };
    }
    Script.DropToGroundInitial = DropToGroundInitial;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class DroptToGroundFrame extends ƒ.ComponentScript {
        static graph;
        static ground;
        static cmpMeshTerrain;
        static meshTerrain;
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(DroptToGroundFrame);
        // Properties may be mutated by users in the editor via the automatically created user interface
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
        }
        hndEvent = (_event) => {
            ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.setHeight);
        };
        setHeight = (_event) => {
            if (!DroptToGroundFrame.graph) {
                DroptToGroundFrame.graph = ƒ.Project.resources["Graph|2022-04-14T13:06:24.657Z|49930"];
                DroptToGroundFrame.ground = DroptToGroundFrame.graph.getChildrenByName("Environment")[0].getChildrenByName("Ground")[0];
                DroptToGroundFrame.cmpMeshTerrain = DroptToGroundFrame.ground.getComponent(ƒ.ComponentMesh);
                DroptToGroundFrame.meshTerrain = DroptToGroundFrame.cmpMeshTerrain.mesh;
            }
            const distance = DroptToGroundFrame.meshTerrain.getTerrainInfo(this.node.mtxLocal.translation, DroptToGroundFrame.cmpMeshTerrain.mtxWorld).distance;
            this.node.mtxLocal.translateY(-distance);
        };
    }
    Script.DroptToGroundFrame = DroptToGroundFrame;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    let avatar;
    let cmpCamera;
    let speedRotY = -0.1;
    let speedRotX = 0.2;
    let rotationX = 0;
    let cntWalk = new ƒ.Control("cntWalk", 6, 0 /* PROPORTIONAL */);
    cntWalk.setDelay(250);
    let cntStrafe = new ƒ.Control("cntStrafe", 3, 0 /* PROPORTIONAL */);
    cntStrafe.setDelay(250);
    document.addEventListener("interactiveViewportStarted", start);
    function start(_event) {
        viewport = _event.detail;
        avatar = viewport.getBranch().getChildrenByName("Avatar")[0];
        viewport.camera = cmpCamera = avatar.getChild(0).getComponent(ƒ.ComponentCamera);
        let canvas = viewport.getCanvas();
        canvas.addEventListener("pointermove", hndPointerMove);
        canvas.requestPointerLock();
        //custom Code
        createForest(49); //One Tree already placed
        //custom Code
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // ƒ.Physics.simulate();  // if physics is included and used
        controlWalk();
        viewport.draw();
        ƒ.AudioManager.default.update();
    }
    function hndPointerMove(_event) {
        avatar.mtxLocal.rotateY(_event.movementX * speedRotY);
        rotationX += _event.movementY * speedRotX;
        rotationX = Math.min(60, Math.max(-60, rotationX));
        cmpCamera.mtxPivot.rotation = ƒ.Vector3.X(rotationX);
    }
    function controlWalk() {
        //W & S
        let inputWalk = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W], [ƒ.KEYBOARD_CODE.ARROW_DOWN, ƒ.KEYBOARD_CODE.S]);
        cntWalk.setInput(inputWalk);
        avatar.mtxLocal.translateZ(cntWalk.getOutput() * ƒ.Loop.timeFrameGame / 1000);
        //Shift & Sprint
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SHIFT_LEFT, ƒ.KEYBOARD_CODE.SHIFT_RIGHT]) && ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W])) {
            cntWalk.setInput(inputWalk + 2);
        }
        //A & D
        let inputStrafe = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.ARROW_LEFT, ƒ.KEYBOARD_CODE.A], [ƒ.KEYBOARD_CODE.ARROW_RIGHT, ƒ.KEYBOARD_CODE.D]);
        cntStrafe.setInput(inputStrafe);
        avatar.mtxLocal.translateX(cntStrafe.getOutput() * ƒ.Loop.timeFrameGame / 1000);
    }
    async function createForest(count) {
        let entryNode = viewport.getBranch().getChildrenByName("Environment")[0].getChildrenByName("Trees")[0];
        //viewport.getBranch().getChildrenByName("Environment")[0].getChildrenByName("Trees")[0].getChildrenByName("Tree")[0].getAllComponents()[1];
        for (let x = 0; x < count; x++) {
            let newNode = new ƒ.Node("Tree" + x);
            newNode.addComponent(new ƒ.ComponentTransform());
            newNode.mtxLocal.translateX(getRandomInt(-30, 30));
            newNode.mtxLocal.translateZ(getRandomInt(-30, 30));
            let treeGraph = ƒ.Project.resources["Graph|2022-04-26T14:47:20.548Z|80877"];
            let treeInstance = await ƒ.Project.createGraphInstance(treeGraph);
            newNode.addChild(treeInstance);
            let script = new Script.DropToGroundInitial;
            newNode.addComponent(script);
            //add 5 Pages to Trees (one already placed)
            if (x < 4) {
                let pageGraph = ƒ.Project.resources["Graph|2022-05-01T10:55:28.972Z|52969"];
                let pageInstance = await ƒ.Project.createGraphInstance(pageGraph);
                newNode.addChild(pageInstance);
            }
            entryNode.addChild(newNode);
        }
    }
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class Slenderman extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(Slenderman);
        // Properties may be mutated by users in the editor via the automatically created user interface
        timeToChange = 0;
        direction = ƒ.Vector3.ZERO();
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
                    this.node.addEventListener("renderPrepare" /* RENDER_PREPARE */, this.move);
                    break;
            }
        };
        move = (_event) => {
            this.node.mtxLocal.translate(ƒ.Vector3.SCALE(this.direction, ƒ.Loop.timeFrameGame / 1000));
            if (this.timeToChange > ƒ.Time.game.get())
                return;
            this.timeToChange = ƒ.Time.game.get() + 1000;
            this.direction = ƒ.Random.default.getVector3(new ƒ.Vector3(-1, 0, -1), new ƒ.Vector3(1, 0, 1));
        };
    }
    Script.Slenderman = Slenderman;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map