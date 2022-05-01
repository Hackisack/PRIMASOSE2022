namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  let avatar: ƒ.Node;
  let cmpCamera: ƒ.ComponentCamera;
  let speedRotY: number = -0.1;
  let speedRotX: number = 0.2;
  let rotationX: number = 0;
  let cntWalk: ƒ.Control = new ƒ.Control("cntWalk", 6, ƒ.CONTROL_TYPE.PROPORTIONAL);
  cntWalk.setDelay(250);
  let cntStrafe: ƒ.Control = new ƒ.Control("cntStrafe", 3, ƒ.CONTROL_TYPE.PROPORTIONAL);
  cntStrafe.setDelay(250);

  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  function start(_event: CustomEvent): void {
    viewport = _event.detail;
    avatar = viewport.getBranch().getChildrenByName("Avatar")[0];

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
    // ƒ.Physics.simulate();  // if physics is included and used
    controlWalk();
    viewport.draw();
    ƒ.AudioManager.default.update();
  }

  function hndPointerMove(_event: PointerEvent): void {
    avatar.mtxLocal.rotateY(_event.movementX * speedRotY);
    rotationX += _event.movementY * speedRotX;
    rotationX = Math.min(60, Math.max(-60, rotationX));
    cmpCamera.mtxPivot.rotation = ƒ.Vector3.X(rotationX);
  }

  function controlWalk(): void {

    //W & S
    let inputWalk: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W], [ƒ.KEYBOARD_CODE.ARROW_DOWN, ƒ.KEYBOARD_CODE.S]);
    cntWalk.setInput(inputWalk);
    avatar.mtxLocal.translateZ(cntWalk.getOutput() * ƒ.Loop.timeFrameGame / 1000);

    //Shift & Sprint
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SHIFT_LEFT, ƒ.KEYBOARD_CODE.SHIFT_RIGHT]) && ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W])) {
      cntWalk.setInput(inputWalk + 2)
    }

    //A & D
    let inputStrafe: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.ARROW_LEFT, ƒ.KEYBOARD_CODE.A], [ƒ.KEYBOARD_CODE.ARROW_RIGHT, ƒ.KEYBOARD_CODE.D]);
    cntStrafe.setInput(inputStrafe);
    avatar.mtxLocal.translateX(cntStrafe.getOutput() * ƒ.Loop.timeFrameGame / 1000);
  }

  async function createForest(count: number): Promise<void> {
    let entryNode: ƒ.Node = viewport.getBranch().getChildrenByName("Environment")[0].getChildrenByName("Trees")[0];
    //viewport.getBranch().getChildrenByName("Environment")[0].getChildrenByName("Trees")[0].getChildrenByName("Tree")[0].getAllComponents()[1];

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

}