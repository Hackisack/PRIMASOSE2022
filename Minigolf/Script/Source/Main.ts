namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  //import config json
  interface Config {
    [key: string]:any;
  }

  let viewport: ƒ.Viewport;
  let cmpCamera: ƒ.ComponentCamera;
  let player: ƒ.Node;
  let ball: ƒ.Node;
  let ballRigi: ƒ.ComponentRigidbody;
  let ball_Start:ƒ.Vector3;
  let club: ƒ.Node;
  let movingDirection: string = "up";
  let golfHit: ƒ.ComponentAudio;
  let golfWin: ƒ.ComponentAudio;
  let courses:ƒ.Node;
  let hole_one:ƒ.Node;
  let hole_one_rigi:ƒ.ComponentRigidbody;

  let timerVui: Timer;
  let hitsVui: Hits;

  let firstHit: boolean;
  let timerID:number;

  let oneTimeHit:boolean = true;

  let movingObstacle: ƒ.Node;

  //config and variables
  let config: Config;
  let hitStrength: number;
  let maxHits: number;


  document.addEventListener("interactiveViewportStarted", <EventListener><unknown>start);

 async function start(_event: CustomEvent): Promise<void> {
      viewport = _event.detail;

      //get config file
      let response: Response = await fetch("config.json");
      config = await response.json();
      hitStrength = config["hitStrength"].strength;
      maxHits = config["maxHits"].hits;

      //spawn golf ball with custom attributes
      let golfBall: GolfBall = new GolfBall("GolfBall", config["ball"].size, config["ball"].color);
      ballRigi = golfBall.getComponent(ƒ.ComponentRigidbody);
      ball = golfBall;
      viewport.getBranch().addChild(golfBall);

      // setup Camera following ball
      player = viewport.getBranch().getChildrenByName("Player")[0];
      viewport.camera = cmpCamera = player.getComponent(ƒ.ComponentCamera);
      cmpCamera.mtxPivot.translate(new ƒ.Vector3(0, 15, -30));
      cmpCamera.mtxPivot.rotateX(50);

      // get golf club
      club = viewport.getBranch().getChildrenByName("Club")[0];

      //sounds
      golfHit = viewport.getBranch().getChildrenByName("Sound")[0].getComponents(ƒ.ComponentAudio)[0];
      golfWin = viewport.getBranch().getChildrenByName("Sound")[0].getComponents(ƒ.ComponentAudio)[2];

      //ball collision with flag
      courses = viewport.getBranch().getChildrenByName("Map")[0].getChildrenByName("Courses")[0];
      hole_one = courses.getChildrenByName("Course1")[0].getChildrenByName("Hole")[0];
      hole_one_rigi = hole_one.getComponent(ƒ.ComponentRigidbody);
      hole_one_rigi.addEventListener(ƒ.EVENT_PHYSICS.COLLISION_ENTER, hitRegistration)

      //get moving Obstacle
      movingObstacle = courses.getChildrenByName("Course1")[0].getChildrenByName("Obstacles")[0].getChildrenByName("ObstacleShort")[0];

      //get ball start position
      ball_Start = golfBall.mtxLocal.translation.clone;

      //initialize Vui
      timerVui = new Timer();
      hitsVui = new Hits();
      hitsVui.maxHits = maxHits;

      //firstHit
      firstHit = true;

      //animate Obstacle
      animateMovingObstacle();

      //custom event listener
      viewport.getBranch().addEventListener("mapFinished",function (): void {sound("win")})

      ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
      ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
      ƒ.Physics.simulate(); // if physics is included and used
      viewport.draw();
      ƒ.AudioManager.default.update();

      controlClub();

      golfClub();

      maxHitsCheck();

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
        
        if (movingDirection == "up" && ballRigi.getVelocity().z < 10 && ballRigi.getVelocity().z > -10 && ballRigi.getVelocity().x < 10 && ballRigi.getVelocity().x > -10 && hitsVui.hits < hitsVui.maxHits) {
            sound("hit");
            ballRigi.applyImpulseAtPoint(new ƒ.Vector3(0,0,hitStrength));
            if(firstHit == true) {timerID = setInterval(timerFunction, 1000); firstHit = false;}
            
        }
        if (movingDirection == "down" && ballRigi.getVelocity().z > -10 && ballRigi.getVelocity().z < 10 && ballRigi.getVelocity().x < 10 && ballRigi.getVelocity().x > -10 && hitsVui.hits < hitsVui.maxHits) {
            sound("hit");  
            ballRigi.applyImpulseAtPoint(new ƒ.Vector3(0,0,-hitStrength));
            if(firstHit == true) {timerID = setInterval(timerFunction, 1000); firstHit = false;}
            
        }
        if (movingDirection == "left" && ballRigi.getVelocity().x < 10 && ballRigi.getVelocity().z < 10 && ballRigi.getVelocity().z > -10 && ballRigi.getVelocity().x > -10 && hitsVui.hits < hitsVui.maxHits) {
            sound("hit");  
            ballRigi.applyImpulseAtPoint(new ƒ.Vector3(hitStrength,0,0));
            if(firstHit == true) {timerID = setInterval(timerFunction, 1000); firstHit = false;}
            
        }
        if (movingDirection == "right" && ballRigi.getVelocity().x > -10 && ballRigi.getVelocity().z < 10 && ballRigi.getVelocity().z > -10 && ballRigi.getVelocity().x < 10 && hitsVui.hits < hitsVui.maxHits) {
            sound("hit");
            ballRigi.applyImpulseAtPoint(new ƒ.Vector3(-hitStrength,0,0));
            if(firstHit == true) {timerID = setInterval(timerFunction, 1000); firstHit = false;}
            
        }
       
      }
        
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
    if (ballRigi.getVelocity().z < 9.9 && ballRigi.getVelocity().z > -9.9 && ballRigi.getVelocity().x < 9.9 && ballRigi.getVelocity().x > -9.9) {
        club.getComponent(ƒ.ComponentMesh).activate(true); 
        club.getChild(0).getComponent(ƒ.ComponentMesh).activate(true); 
        oneTimeHit = true;
    }

    //hide club if not playable
    if (ballRigi.getVelocity().z > 9.9 || ballRigi.getVelocity().z < -9.9 || ballRigi.getVelocity().x > 9.9 || ballRigi.getVelocity().x < -9.9 || hitsVui.hits >= hitsVui.maxHits) {
      club.getComponent(ƒ.ComponentMesh).activate(false);
      club.getChild(0).getComponent(ƒ.ComponentMesh).activate(false); 
   }

   if(club.getComponent(ƒ.ComponentMesh).isActive == false && oneTimeHit == true){hitsFunction(); oneTimeHit = false}
  
  }

  function sound(type: string) { //play hit sound
    if (type == "hit"){golfHit.play(true)};

    if (type == "win"){golfWin.play(true); console.log("dysfkhjhgsghdjfgkjfhdgf")};
    

  }

  function hitRegistration(){
    //reset ball to start and stop any movement
    ballRigi.setPosition(ball_Start);
    ballRigi.setRotation(new ƒ.Vector3(0,0,0));
    ballRigi.setVelocity(new ƒ.Vector3(0,0,0));
    
    //reset timer and firstHit variable
    firstHit = true;
    clearInterval(timerID);
    timerVui.seconds = 0;
    timerVui.minutes = 0;

    hitsVui.hits = 0;

    //dispatch custom Event
    ball.dispatchEvent(new CustomEvent("mapFinished", {bubbles: true}));
  
    
}

function timerFunction(){
    
    if (timerVui.seconds <= 58) {timerVui.seconds++;}
    else {timerVui.minutes++; timerVui.seconds = 0;}

}

function hitsFunction(){
    
    hitsVui.hits++;

}

function maxHitsCheck(){

    //reset on last hit. Wait for last hit to finish (until nearly stopped)
    if (hitsVui.hits >= hitsVui.maxHits && ballRigi.getVelocity().x > -0.2 && ballRigi.getVelocity().z < 0.2 && ballRigi.getVelocity().z > -0.2 && ballRigi.getVelocity().x < 0.2) {
        hitRegistration();
        
    }

}

function animateMovingObstacle(){
    
    let time0: number = 0;
    let time1: number = 3000;
    let time2: number = 6000;
    let value0: number = -23.9;
    let value1: number = -15.9;
    let value2: number = -23.9;

    let animseq: ƒ.AnimationSequence = new ƒ.AnimationSequence();
      animseq.addKey(new ƒ.AnimationKey(time0, value0));
      animseq.addKey(new ƒ.AnimationKey(time1, value1));
      animseq.addKey(new ƒ.AnimationKey(time2, value2));
  
      let animStructure: ƒ.AnimationStructure = {
        components: {
          ComponentTransform: [
            {
              "ƒ.ComponentTransform": {
                mtxLocal: {
                  translation: {
                    y: animseq
                  }
                }
              }
            }
          ]
        }
      };

      let fps: number = 60;

      let animation: ƒ.Animation = new ƒ.Animation("obstacleAnimation", animStructure, fps);

      let cmpAnimator: ƒ.ComponentAnimator = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE["LOOP"], ƒ.ANIMATION_PLAYBACK["TIMEBASED_CONTINOUS"]);
      cmpAnimator.scale = 1;

      movingObstacle.addComponent(cmpAnimator);
      cmpAnimator.activate(true);

}

}


