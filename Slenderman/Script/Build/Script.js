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
            let rigibody = this.node.getComponent(ƒ.ComponentRigidbody);
            if (!DroptToGroundFrame.graph) {
                DroptToGroundFrame.graph = ƒ.Project.resources["Graph|2022-04-14T13:06:24.657Z|49930"];
                DroptToGroundFrame.ground = DroptToGroundFrame.graph.getChildrenByName("Environment")[0].getChildrenByName("Ground")[0];
                DroptToGroundFrame.cmpMeshTerrain = DroptToGroundFrame.ground.getComponent(ƒ.ComponentMesh);
                DroptToGroundFrame.meshTerrain = DroptToGroundFrame.cmpMeshTerrain.mesh;
            }
            const distance = DroptToGroundFrame.meshTerrain.getTerrainInfo(this.node.mtxLocal.translation, DroptToGroundFrame.cmpMeshTerrain.mtxWorld).distance;
            if (distance <= 0) {
                rigibody.translateBody(new ƒ.Vector3(0, -distance, 0));
            }
            //this.node.mtxLocal.translateY(-distance);
        };
    }
    Script.DroptToGroundFrame = DroptToGroundFrame;
})(Script || (Script = {}));
// namespace Script {
//     import ƒ = FudgeCore;
//     import ƒUi = FudgeUserInterface;
//     export class GameState extends ƒ.Mutable {
//       public battery: number = 1;
//       public constructor() {
//         super();
//         const domVui: HTMLDivElement = document.querySelector("div#vui");
//         console.log("Vui-Controller", new ƒUi.Controller(this, domVui));
//       }
//       protected reduceMutator(_mutator: ƒ.Mutator): void {}
//     }
//   }
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    let slenderman;
    //let avatarRigi: ƒ.ComponentRigidbody;
    let cmpCamera;
    let speedRotY = -0.1;
    let speedRotX = 0.2;
    let rotationX = 0;
    let flashlight;
    // let gamestate: GameState;
    let cntWalk = new ƒ.Control("cntWalk", 6, 0 /* PROPORTIONAL */);
    cntWalk.setDelay(250);
    let cntStrafe = new ƒ.Control("cntStrafe", 3, 0 /* PROPORTIONAL */);
    cntStrafe.setDelay(250);
    document.addEventListener("interactiveViewportStarted", start);
    function start(_event) {
        viewport = _event.detail;
        Script.avatar = viewport.getBranch().getChildrenByName("Avatar")[0];
        slenderman = viewport.getBranch().getChildrenByName("Slenderman")[0];
        //avatarRigi = viewport.getBranch().getChildrenByName("Avatar")[0].getComponent(ƒ.ComponentRigidbody);
        flashlight = Script.avatar.getChildrenByName("Torch")[0].getComponent(ƒ.ComponentLight);
        // gamestate = new GameState();
        animation();
        viewport.camera = cmpCamera = Script.avatar.getChild(0).getComponent(ƒ.ComponentCamera);
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
        ƒ.Physics.simulate(); // if physics is included and used
        controlWalk();
        viewport.draw();
        ƒ.AudioManager.default.update();
        toggleFlashlight();
        // if (flashlight.isActive) {
        //   gamestate.battery -= 0.001;
        // }
        // else {
        //   gamestate.battery += 0.001;
        // }
    }
    function hndPointerMove(_event) {
        Script.avatar.getComponent(ƒ.ComponentRigidbody).rotateBody(ƒ.Vector3.Y(_event.movementX * speedRotY));
        rotationX += _event.movementY * speedRotX;
        rotationX = Math.min(60, Math.max(-60, rotationX));
        cmpCamera.mtxPivot.rotation = ƒ.Vector3.X(rotationX);
    }
    function toggleFlashlight() {
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.L])) {
            flashlight.activate(!flashlight.isActive);
        }
    }
    function controlWalk() {
        const input = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP], [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN]);
        cntWalk.setInput(input);
        cntWalk.setFactor(ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SHIFT_LEFT]) ? 5 : 2);
        const input2 = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT], [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]);
        // variante mit physics
        const vector = new ƒ.Vector3((1.5 * input2 * ƒ.Loop.timeFrameGame) / 20, 0, (cntWalk.getOutput() * ƒ.Loop.timeFrameGame) / 20);
        vector.transform(Script.avatar.mtxLocal, false);
        Script.avatar.getComponent(ƒ.ComponentRigidbody).setVelocity(vector);
    }
    async function createForest(count) {
        let entryNode = viewport.getBranch().getChildrenByName("Environment")[0].getChildrenByName("Trees")[0];
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
    function animation() {
        let time0 = 0;
        let time1 = 5000;
        let value0 = 0;
        let value1 = 5;
        let animseq = new ƒ.AnimationSequence();
        animseq.addKey(new ƒ.AnimationKey(time0, value0));
        animseq.addKey(new ƒ.AnimationKey(time1, value1));
        let animStructure = {
            components: {
                ComponentTransform: [
                    {
                        "ƒ.ComponentTransform": {
                            mtxLocal: {
                                translation: {
                                    x: animseq,
                                    y: animseq
                                }
                            }
                        }
                    }
                ]
            }
        };
        let fps = 60;
        let animation = new ƒ.Animation("testAnimation", animStructure, fps);
        let cmpAnimator = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE["LOOP"], ƒ.ANIMATION_PLAYBACK["TIMEBASED_CONTINOUS"]);
        cmpAnimator.scale = 1;
        slenderman.addComponent(cmpAnimator);
        cmpAnimator.activate(true);
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
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    let JOB;
    (function (JOB) {
        JOB[JOB["FOLLOW"] = 0] = "FOLLOW";
        JOB[JOB["FLEE"] = 1] = "FLEE";
    })(JOB || (JOB = {}));
    class StateMachine extends ƒAid.ComponentStateMachine {
        static iSubclass = ƒ.Component.registerSubclass(StateMachine);
        static instructions = StateMachine.get();
        cmpBody;
        time = 0;
        constructor() {
            super();
            this.instructions = StateMachine.instructions; // setup instructions with the static set
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
        static get() {
            let setup = new ƒAid.StateMachineInstructions();
            setup.transitDefault = StateMachine.transitDefault;
            setup.setAction(JOB.FOLLOW, this.actFollow);
            setup.setAction(JOB.FLEE, this.actFlee);
            return setup;
        }
        static transitDefault(_machine) {
            console.log("Transit to", _machine.stateNext);
        }
        static async actFollow(_machine) {
            if (Script.avatar) {
                _machine.node.mtxLocal.translate(ƒ.Vector3.SCALE(ƒ.Vector3.Z(), ƒ.Loop.timeFrameGame / 1000));
                if (_machine.time > ƒ.Time.game.get()) {
                    return;
                }
                _machine.time = ƒ.Time.game.get() + 1000;
                _machine.node.mtxLocal.lookAt(Script.avatar.mtxLocal.translation, ƒ.Vector3.Y(), true);
            }
        }
        static async actFlee(_machine) {
            if (Script.avatar) {
                _machine.node.mtxLocal.translate(
                //TODO Negate Vector
                ƒ.Vector3.SCALE(ƒ.Vector3.Z(), ƒ.Loop.timeFrameGame / 1000));
                if (_machine.time > ƒ.Time.game.get()) {
                    return;
                }
                _machine.time = ƒ.Time.game.get() + 1000;
                _machine.node.mtxLocal.lookAt(Script.avatar.mtxLocal.translation, ƒ.Vector3.Y(), true);
            }
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
                    ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                    this.transit(JOB.FOLLOW);
                    break;
                case "componentRemove" /* COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                    ƒ.Loop.removeEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                    break;
                case "nodeDeserialized" /* NODE_DESERIALIZED */:
                    this.cmpBody = this.node.getComponent(ƒ.ComponentRigidbody);
                    this.cmpBody.addEventListener("TriggerEnteredCollision" /* TRIGGER_ENTER */, (_event) => {
                        if (_event.cmpRigidbody.node.name == "Avatar")
                            this.transit(JOB.FLEE);
                    });
                    break;
            }
        };
        update = (_event) => {
            this.act();
        };
    }
    Script.StateMachine = StateMachine;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map