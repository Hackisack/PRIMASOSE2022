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
  let movingDirection: string = "up";
  let golfHit: ƒ.ComponentAudio;

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
      cmpCamera.mtxPivot.translate(new ƒ.Vector3(0, 15, -30));
      cmpCamera.mtxPivot.rotateX(50);

      // get golf club
      club = viewport.getBranch().getChildrenByName("Club")[0];

      //sounds
      golfHit = viewport.getBranch().getChildrenByName("Sound")[0].getComponents(ƒ.ComponentAudio)[0];

      ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
      ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
      ƒ.Physics.simulate(); // if physics is included and used
      viewport.draw();
      ƒ.AudioManager.default.update();

      followBall();

      controlClub();

      golfClub();

  }

  function controlClub() { // implement real physical hit with club
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
        
        if (movingDirection == "up" && ballRigi.getVelocity().z < 8 && ballRigi.getVelocity().z > -8 && ballRigi.getVelocity().x < 8 && ballRigi.getVelocity().x > -8) {
            sound();
            ballRigi.applyImpulseAtPoint(new ƒ.Vector3(0,0,10));
            
        }
        if (movingDirection == "down" && ballRigi.getVelocity().z > -8 && ballRigi.getVelocity().z < 8 && ballRigi.getVelocity().x < 8 && ballRigi.getVelocity().x > -8) {
            sound();  
            ballRigi.applyImpulseAtPoint(new ƒ.Vector3(0,0,-10));
            
        }
        if (movingDirection == "left" && ballRigi.getVelocity().x < 8 && ballRigi.getVelocity().z < 8 && ballRigi.getVelocity().z > -8 && ballRigi.getVelocity().x > -8) {
            sound();  
            ballRigi.applyImpulseAtPoint(new ƒ.Vector3(10,0,0));
            
        }
        if (movingDirection == "right" && ballRigi.getVelocity().x > -8 && ballRigi.getVelocity().z < 8 && ballRigi.getVelocity().z > -8 && ballRigi.getVelocity().x < 8) {
            sound();
            ballRigi.applyImpulseAtPoint(new ƒ.Vector3(-10,0,0));
            
        }
       
      }
        
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
    if (ballRigi.getVelocity().z < 8 && ballRigi.getVelocity().z > -8 && ballRigi.getVelocity().x < 8 && ballRigi.getVelocity().x > -8) {
        club.getComponent(ƒ.ComponentMesh).activate(true); 
        club.getChild(0).getComponent(ƒ.ComponentMesh).activate(true); 
    }

    //hide club if not playable
    if (ballRigi.getVelocity().z > 8 || ballRigi.getVelocity().z < -8 || ballRigi.getVelocity().x > 8 || ballRigi.getVelocity().x < -8) {
      club.getComponent(ƒ.ComponentMesh).activate(false);
      club.getChild(0).getComponent(ƒ.ComponentMesh).activate(false); 
   }
  
  }

  function sound() { //play hit sound
    
    golfHit.play(true)

  }

}