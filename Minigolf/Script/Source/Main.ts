namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  let cmpCamera: ƒ.ComponentCamera;
  let player: ƒ.Node;
  let ball: ƒ.Node;

  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  function start(_event: CustomEvent): void {
    viewport = _event.detail;

    //get golf ball
    ball = viewport.getBranch().getChildrenByName("Ball")[0];

    //setup Camera following ball
    player = viewport.getBranch().getChildrenByName("Player")[0];
    viewport.camera = cmpCamera = player.getChild(0).getComponent(ƒ.ComponentCamera);
    viewport.camera.mtxPivot.translate(new ƒ.Vector3(0, 10, 15));
    viewport.camera.mtxPivot.rotateY(180);

    //Camera Movement
    let canvas: HTMLCanvasElement = viewport.getCanvas();
    canvas.addEventListener("pointermove", hndPointerMove);


    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    ƒ.Physics.simulate();  // if physics is included and used


    lookAtBall();


    viewport.draw();
    ƒ.AudioManager.default.update();
  }

  function hndPointerMove(_event: PointerEvent): void {

    //todo move in circular movement around ball
    cmpCamera.mtxPivot.translate(new ƒ.Vector3(0,_event.movementY*0.2,0));
  }

  function lookAtBall(): void {

    cmpCamera.mtxPivot.lookAt(ball.mtxLocal.translation)

  }

}