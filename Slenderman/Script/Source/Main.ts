namespace Script {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  export let avatar: ƒ.Node;
  let slenderman: ƒ.Node;
  //let avatarRigi: ƒ.ComponentRigidbody;
  let cmpCamera: ƒ.ComponentCamera;
  let speedRotY: number = -0.1;
  let speedRotX: number = 0.2;
  let rotationX: number = 0;
  let flashlight: ƒ.ComponentLight;
  // let gamestate: GameState;
  let cntWalk: ƒ.Control = new ƒ.Control("cntWalk", 6, ƒ.CONTROL_TYPE.PROPORTIONAL);
  cntWalk.setDelay(250);
  let cntStrafe: ƒ.Control = new ƒ.Control("cntStrafe", 3, ƒ.CONTROL_TYPE.PROPORTIONAL);
  cntStrafe.setDelay(250);

  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  function start(_event: CustomEvent): void {
    viewport = _event.detail;
    avatar = viewport.getBranch().getChildrenByName("Avatar")[0];
    slenderman = viewport.getBranch().getChildrenByName("Slenderman")[0];
    //avatarRigi = viewport.getBranch().getChildrenByName("Avatar")[0].getComponent(ƒ.ComponentRigidbody);
    flashlight = avatar.getChildrenByName("Torch")[0].getComponent(ƒ.ComponentLight);

    // gamestate = new GameState();

    animation();

    viewport.camera = cmpCamera = avatar.getChild(0).getComponent(ƒ.ComponentCamera);
    let canvas: HTMLCanvasElement = viewport.getCanvas();
    canvas.addEventListener("pointermove", hndPointerMove);
    canvas.requestPointerLock();

    //custom Code
    createForest(49); //One Tree already placed
    //custom Code

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    ƒ.Physics.simulate();  // if physics is included and used
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

  function hndPointerMove(_event: PointerEvent): void {
    avatar.getComponent(ƒ.ComponentRigidbody).rotateBody(ƒ.Vector3.Y(_event.movementX * speedRotY));

    rotationX += _event.movementY * speedRotX;
    rotationX = Math.min(60, Math.max(-60, rotationX));
    cmpCamera.mtxPivot.rotation = ƒ.Vector3.X(rotationX);
  }

  function toggleFlashlight(): void {
    
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.L])) {
      flashlight.activate(!flashlight.isActive);
    }

  }

  function controlWalk(): void {

    const input: number = ƒ.Keyboard.mapToTrit(
      [ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP],
      [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN]
    );

    cntWalk.setInput(input);
    cntWalk.setFactor(ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SHIFT_LEFT]) ? 5 : 2);

    const input2: number = ƒ.Keyboard.mapToTrit(
      [ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT],
      [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]
    );

    // variante mit physics

    const vector = new ƒ.Vector3(
      (1.5 * input2 * ƒ.Loop.timeFrameGame) / 20,
      0,
      (cntWalk.getOutput() * ƒ.Loop.timeFrameGame) / 20
    );

    vector.transform(avatar.mtxLocal, false);

    avatar.getComponent(ƒ.ComponentRigidbody).setVelocity(vector);
  }

  async function createForest(count: number): Promise<void> {
    let entryNode: ƒ.Node = viewport.getBranch().getChildrenByName("Environment")[0].getChildrenByName("Trees")[0];

    for (let x = 0; x < count; x++) {

      let newNode: ƒ.Node = new ƒ.Node("Tree" + x);
      newNode.addComponent(new ƒ.ComponentTransform());
      newNode.mtxLocal.translateX(getRandomInt(-30, 30));
      newNode.mtxLocal.translateZ(getRandomInt(-30, 30));

      let treeGraph: ƒ.Graph = <ƒ.Graph>ƒ.Project.resources["Graph|2022-04-26T14:47:20.548Z|80877"];
      let treeInstance: ƒ.GraphInstance = await ƒ.Project.createGraphInstance(treeGraph);

      newNode.addChild(treeInstance);

      let script: ƒ.ComponentScript = new Script.DropToGroundInitial;
      newNode.addComponent(script);

      //add 5 Pages to Trees (one already placed)
      if (x < 4) {
        
        let pageGraph: ƒ.Graph = <ƒ.Graph>ƒ.Project.resources["Graph|2022-05-01T10:55:28.972Z|52969"];
        let pageInstance: ƒ.GraphInstance = await ƒ.Project.createGraphInstance(pageGraph);

        newNode.addChild(pageInstance);

      }
      
      entryNode.addChild(newNode);

    }

  }

  function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  function animation() {

    let time0: number = 0;
    let time1: number = 5000;
    let value0: number = 0;
    let value1: number = 5;

    let animseq: ƒ.AnimationSequence = new ƒ.AnimationSequence();
      animseq.addKey(new ƒ.AnimationKey(time0, value0));
      animseq.addKey(new ƒ.AnimationKey(time1, value1));
  
      let animStructure: ƒ.AnimationStructure = {
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

      let fps: number = 60;

      let animation: ƒ.Animation = new ƒ.Animation("testAnimation", animStructure, fps);

      let cmpAnimator: ƒ.ComponentAnimator = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE["LOOP"], ƒ.ANIMATION_PLAYBACK["TIMEBASED_CONTINOUS"]);
      cmpAnimator.scale = 1;

      slenderman.addComponent(cmpAnimator);
      cmpAnimator.activate(true);
  }

}