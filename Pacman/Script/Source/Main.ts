namespace Script {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  let pacman: ƒ.Node;
  let walls: ƒ.Node[];
  let wallcheck: boolean;
  let wallCheckMonster: boolean;
  let direction: string = "";
  let directionMonster: string = "";
  let speed: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
  let speedMonster: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
  let dialog: HTMLDialogElement;
  let waka: ƒ.ComponentAudio;
  let animations: ƒAid.SpriteSheetAnimations;
  let sprite: ƒAid.NodeSprite;
  let monster: ƒ.Node;

  window.addEventListener("load", init)

  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  function init(_event: Event): void {
    dialog = document.querySelector("dialog");
    dialog.querySelector("h1").textContent = document.title;
    dialog.addEventListener("click", function (_event: Event) {
      // @ts-ignore until HTMLDialog is implemented by all browsers and available in dom.d.ts
      dialog.close();
      startInteractiveViewport();
    });
    //@ts-ignore
    dialog.showModal();
  }
  // setup and start interactive viewport
  async function startInteractiveViewport(): Promise<void> {
    // load resources referenced in the link-tag
    await ƒ.Project.loadResourcesFromHTML();
    ƒ.Debug.log("Project:", FudgeCore.Project.resources);
    // pick the graph to show
    let graph: ƒ.Graph = <ƒ.Graph>ƒ.Project.resources["Graph|2022-03-19T21:24:21.962Z|18014"];
    ƒ.Debug.log("Graph:", graph);
    if (!graph) {
      alert("Nothing to render. Create a graph with ƒat least a mesh, material and probably some light");
      return;
    }
    // setup the viewport
    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    let canvas: HTMLCanvasElement = document.querySelector("canvas");
    let viewport: ƒ.Viewport = new ƒ.Viewport();

    viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
    ƒ.Debug.log("Viewport:", viewport);
    // hide the cursor when interacting, also suppressing right-click menu
    canvas.addEventListener("mousedown", canvas.requestPointerLock);
    canvas.addEventListener("mouseup", function () {
      document.exitPointerLock();
    });
    //setup audio
    ƒ.AudioManager.default.listenTo(graph);
    ƒ.Debug.log("Audio:", ƒ.AudioManager.default);

    //load Sprite
    let imgSpriteSheet: ƒ.TextureImage = new ƒ.TextureImage();
    await imgSpriteSheet.load("Textures/pacman-Sheet.png");

    let spriteSheet: ƒ.CoatTextured = new ƒ.CoatTextured(undefined, imgSpriteSheet)

    //generate sprite
    animations = {};
    let spriteName: string = "pacman";
    let tempSprite: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation(spriteName, spriteSheet);
    tempSprite.generateByGrid(ƒ.Rectangle.GET(0, 0, 64, 64), 14, 70, ƒ.ORIGIN2D.CENTER, ƒ.Vector2.X(64));
    animations[spriteName] = tempSprite;

    //draw viewport once for immediate feedback
    viewport.draw();
    canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", {
      bubbles: true,
      detail: viewport
    }));
  }

  function start(_event: CustomEvent): void {
    viewport = _event.detail;
    let graph: ƒ.Node = viewport.getBranch();
    pacman = graph.getChildrenByName("Pacman")[0];
    walls = graph.getChildrenByName("WallElements")[0].getChildren();
    waka = graph.getChildrenByName("Sound")[0].getComponents(ƒ.ComponentAudio)[1];

    viewport.camera.mtxPivot.translate(new ƒ.Vector3(1.5, 1.5, 15));
    viewport.camera.mtxPivot.rotateY(180);

    monster = createMonster();
    graph.addChild(monster);

    //add sprite to pacman node
    sprite = new ƒAid.NodeSprite("Sprite");
    sprite.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
    sprite.setAnimation(<ƒAid.SpriteSheetAnimation>animations["pacman"]);
    sprite.setFrameDirection(1);

    sprite.mtxLocal.translateZ(0.5);
    sprite.framerate = 20;

    pacman.addChild(sprite);
    pacman.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 0);


    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used

    if (direction == "") {
      waka.play(false);
    }
    else if (!waka.isPlaying) { waka.play(true) }

    moveMonster();

    wallcheck = false;
    //change direction in Grid and check if direction change is valid
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT, ƒ.KEYBOARD_CODE.D]) && +(pacman.mtxLocal.translation.y.toFixed(1)) % 1 == 0) {
      for (let x = 0; x < walls.length; x++) {
        if (Math.round(pacman.mtxLocal.translation.x) == walls[x].mtxLocal.translation.x - 1 && Math.round(pacman.mtxLocal.translation.y) == walls[x].mtxLocal.translation.y) {
          wallcheck = true;
        }
      }
      if (wallcheck == false) {
        speed.set(1 / 30, 0, 0);
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
        speed.set(-1 / 30, 0, 0);
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
        speed.set(0, 1 / 30, 0);
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
        speed.set(0, -1 / 30, 0);
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
    rotateSprite(direction);
    pacman.mtxLocal.translate(speed);
    monster.mtxLocal.translate(speedMonster);
    viewport.draw();
    //ƒ.AudioManager.default.update();
  }

  function rotateSprite(direction: string) {
    if (direction == "left") {

      if (sprite.mtxLocal.scaling.x != -1) {
        sprite.mtxLocal.scaleX(-1);
      }
    }

    if (direction == "right") {

      if (sprite.mtxLocal.scaling.x == -1) {
        sprite.mtxLocal.scaleX(-1);
      }
    }

    if (direction == "up") {

      if (sprite.mtxLocal.scaling.x != -1) {
        sprite.mtxLocal.scaleX(-1);
      }
    }

    if (direction == "down") {

      if (sprite.mtxLocal.scaling.x != -1) {
        sprite.mtxLocal.scaleX(-1);
      }
    }

  }

  function createMonster(): ƒ.Node {
    let node: ƒ.Node = new ƒ.Node("Monster")

    let mesh: ƒ.MeshSphere = new ƒ.MeshSphere();
    let material: ƒ.Material = new ƒ.Material("MaterialGhost", ƒ.ShaderLit, new ƒ.CoatColored());
    let cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
    let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(mesh);
    let cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(material);

    cmpMaterial.clrPrimary = ƒ.Color.CSS("red");

    node.addComponent(cmpTransform);
    node.addComponent(cmpMesh);
    node.addComponent(cmpMaterial);

    node.mtxLocal.translateX(1);
    node.mtxLocal.translateY(1);

    return node;
  }

  function moveMonster(): void {
    wallCheckMonster = false;
    if (+(monster.mtxLocal.translation.x.toFixed(1)) % 1 == 0 && +(monster.mtxLocal.translation.y.toFixed(1)) % 1 == 0) {

      let randomDirection = Math.floor(Math.random() * (3 + 1));
      if (randomDirection == 0&& +(monster.mtxLocal.translation.x.toFixed(1)) % 1 == 0) { //up
        for (let x = 0; x < walls.length; x++) {
          if (Math.round(monster.mtxLocal.translation.y) == walls[x].mtxLocal.translation.y + 1 && Math.round(monster.mtxLocal.translation.x) == walls[x].mtxLocal.translation.x) {
            wallCheckMonster = true;
          }
        }
        if (wallCheckMonster == false) {
          speedMonster.set(0, 1 / 30, 0);
          directionMonster = "up";
        }
      }
      if (randomDirection == 1 && +(monster.mtxLocal.translation.x.toFixed(1)) % 1 == 0) { //down
        for (let x = 0; x < walls.length; x++) {
          if (Math.round(monster.mtxLocal.translation.y) == walls[x].mtxLocal.translation.y - 1 && Math.round(monster.mtxLocal.translation.x) == walls[x].mtxLocal.translation.x) {
            wallCheckMonster = true;
          }
        }
        if (wallCheckMonster == false) {
          speedMonster.set(0, -1 / 30, 0);
          directionMonster = "down";
        }

      }
      if (randomDirection == 2&& +(monster.mtxLocal.translation.y.toFixed(1)) % 1 == 0) { //left
        for (let x = 0; x < walls.length; x++) {
          if (Math.round(monster.mtxLocal.translation.x) == walls[x].mtxLocal.translation.x + 1 && Math.round(monster.mtxLocal.translation.y) == walls[x].mtxLocal.translation.y) {
            wallCheckMonster = true;
          }
        }
        if (wallCheckMonster == false) {
          speedMonster.set(-1/30, 0, 0);
          directionMonster = "left";
        }

      }
      if (randomDirection == 3&& +(monster.mtxLocal.translation.y.toFixed(1)) % 1 == 0) { //right
        for (let x = 0; x < walls.length; x++) {
          if (Math.round(monster.mtxLocal.translation.x) == walls[x].mtxLocal.translation.x - 1 && Math.round(monster.mtxLocal.translation.y) == walls[x].mtxLocal.translation.y) {
            wallCheckMonster = true;
          }
        }
        if (wallCheckMonster == false) {
          speedMonster.set(1/30, 0, 0);
          directionMonster = "right";
        }

      }
      for (let x = 0; x < walls.length; x++) {
        if (+(monster.mtxLocal.translation.y.toFixed(1)) == walls[x].mtxLocal.translation.y + 1 && Math.round(monster.mtxLocal.translation.x) == walls[x].mtxLocal.translation.x && direction == "down") {
          speedMonster.set(0, 0, 0);
          direction = "";
        }
        if (+(monster.mtxLocal.translation.y.toFixed(1)) == walls[x].mtxLocal.translation.y - 1 && Math.round(monster.mtxLocal.translation.x) == walls[x].mtxLocal.translation.x && direction == "up") {
          speedMonster.set(0, 0, 0);
          direction = "";
        }
        if (+(monster.mtxLocal.translation.x.toFixed(1)) == walls[x].mtxLocal.translation.x + 1 && Math.round(monster.mtxLocal.translation.y) == walls[x].mtxLocal.translation.y && direction == "left") {
          speedMonster.set(0, 0, 0);
          direction = "";
        }
        if (+(monster.mtxLocal.translation.x.toFixed(1)) == walls[x].mtxLocal.translation.x - 1 && Math.round(monster.mtxLocal.translation.y) == walls[x].mtxLocal.translation.y && direction == "right") {
          speedMonster.set(0, 0, 0);
          direction = "";
        }
      }
    }
  }

}


