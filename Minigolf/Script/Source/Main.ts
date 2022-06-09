namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  let cmpCamera: ƒ.ComponentCamera;
  let playerTransform: ƒ.ComponentTransform;
  let player: ƒ.Node;
  let ball: ƒ.Node;
  let ballRigi: ƒ.ComponentRigidbody;
  let club: ƒ.Node;
  let clubRigi: ƒ.ComponentRigidbody;
  let movingDirection: string = "up";

  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  function start(_event: CustomEvent): void {
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
      clubRigi = club.getComponent(ƒ.ComponentRigidbody);

      ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
      ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  //test
  function update(_event: Event): void {
      ƒ.Physics.simulate(); // if physics is included and used
      viewport.draw();
      ƒ.AudioManager.default.update();

      followBall();

      controlClub();

      golfClub();
  }

  function controlClub() { // simple controls for testing
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
        //currently only accounting for the same direction. Check for other movement (movement allowed)
        if (movingDirection == "up" && ballRigi.getVelocity().z < 1) {
            ballRigi.applyImpulseAtPoint(new ƒ.Vector3(0,0,10));
        }
        if (movingDirection == "down" && ballRigi.getVelocity().z > -1) {
            ballRigi.applyImpulseAtPoint(new ƒ.Vector3(0,0,-10));
        }
        if (movingDirection == "left" && ballRigi.getVelocity().x < 1) {
            ballRigi.applyImpulseAtPoint(new ƒ.Vector3(10,0,0));
        }
        if (movingDirection == "right" && ballRigi.getVelocity().x > -1) {
            ballRigi.applyImpulseAtPoint(new ƒ.Vector3(-10,0,0));
        }
       
      }
        //ballRigi.applyImpulseAtPoint(new ƒ.Vector3(0,0,10));
        //ballRigi.setVelocity(new ƒ.Vector3(0, 0, 10));
  }

  function followBall() { // Camera uses ball translation
      let ballVector: ƒ.Vector3 = new ƒ.Vector3;
      ballVector = ball.mtxLocal.translation.clone;
      ballVector.y = 15;
      playerTransform.mtxLocal.translation = ballVector;
  }

  function golfClub() { // Club uses ball translation
    
    //club follow ball and rotation
    let rotationVector: ƒ.Vector3 = new ƒ.Vector3;
    let ballVectorTwo: ƒ.Vector3 = new ƒ.Vector3;
    ballVectorTwo = ball.mtxLocal.translation.clone;

    if (movingDirection == "up") {
        ballVectorTwo.z -= 1;
        rotationVector.y = 90;
    }
    if (movingDirection == "down") {
        ballVectorTwo.z += 1;
        rotationVector.y = 90;
    }
    if (movingDirection == "left") {
        ballVectorTwo.x -= 1;
        rotationVector.y = 0;
    }
    if (movingDirection == "right") {
        ballVectorTwo.x += 1;
        rotationVector.y = 0;
    }

    club.mtxLocal.translation = ballVectorTwo;
    club.mtxLocal.rotation = rotationVector;

    //hide club if not playable
    if (ballRigi.getVelocity().z > 1 || ballRigi.getVelocity().z < -1 || ballRigi.getVelocity().x > 1 || ballRigi.getVelocity().x < -1) {
       club.getComponent(ƒ.ComponentMesh).activate(false);
    }
    else if (ballRigi.getVelocity().z < 1 || ballRigi.getVelocity().z > -1 || ballRigi.getVelocity().x < 1 || ballRigi.getVelocity().x > -1) {
        club.getComponent(ƒ.ComponentMesh).activate(true); 
    }
  }

}
