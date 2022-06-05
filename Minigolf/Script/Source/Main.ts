namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  let cmpCamera: ƒ.ComponentCamera;
  let playerTransform: ƒ.ComponentTransform;
  let player: ƒ.Node;
  let ball: ƒ.Node;
  let ballRigi: ƒ.ComponentRigidbody;

  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  function start(_event: CustomEvent): void {
    viewport = _event.detail;

    //get golf ball
    ball = viewport.getBranch().getChildrenByName("Ball")[0];
    ballRigi = ball.getComponent(ƒ.ComponentRigidbody);

    //setup Camera following ball
    player = viewport.getBranch().getChildrenByName("Player")[0];
    playerTransform = player.getComponent(ƒ.ComponentTransform);
    viewport.camera = cmpCamera = player.getComponent(ƒ.ComponentCamera);
    viewport.camera.mtxPivot.translate(new ƒ.Vector3(0, 15, -5));
    viewport.camera.mtxPivot.rotateX(70);
    //playerTransform.mtxLocal.translate(new ƒ.Vector3(0, 5, -15));

    //fixedPoint = ball.mtxLocal.translation;

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    ƒ.Physics.simulate();  // if physics is included and used
    viewport.draw();
    ƒ.AudioManager.default.update();

    followBall();

    controlBall();
  }

  function controlBall() {


    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.W])) { 
      ballRigi.setVelocity(new ƒ.Vector3(0, 0, 10)) 
    }
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A])) { 
      ballRigi.setVelocity(new ƒ.Vector3(10, 0, 0)) 
    }
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.S])) { 
      ballRigi.setVelocity(new ƒ.Vector3(0, 0, -10)) 
    }
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D])) { 
      ballRigi.setVelocity(new ƒ.Vector3(-10, 0, 0)) 
    }


  }

  function followBall() {
    let ballVector: ƒ.Vector3 = new ƒ.Vector3
    ballVector = ball.mtxLocal.translation
    ballVector.y = 15
    playerTransform.mtxLocal.translation = ballVector
   
  }

}