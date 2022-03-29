namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  let pacman: ƒ.Node;
  let walls: ƒ.Node[];
  let wallcheck: boolean;
  let direction: string;
  let speed: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);

  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  function start(_event: CustomEvent): void {
    viewport = _event.detail;
    let graph: ƒ.Node = viewport.getBranch();
    pacman = graph.getChildrenByName("Pacman")[0];
    walls = graph.getChildrenByName("WallElements")[0].getChildren();

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used

    wallcheck = false;

    //change direction in Grid and check if direction change is valid
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT, ƒ.KEYBOARD_CODE.D]) && +(pacman.mtxLocal.translation.y.toFixed(1)) % 1 ==0) {
      for (let x = 0; x < walls.length; x++) {
        if (Math.round(pacman.mtxLocal.translation.x) == walls[x].mtxLocal.translation.x - 1 && Math.round(pacman.mtxLocal.translation.y) == walls[x].mtxLocal.translation.y) {
            wallcheck = true;
        }
        }
        if (wallcheck == false) {
          speed.set(1/ 60, 0, 0);
          direction = "right";
      }
    }
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT, ƒ.KEYBOARD_CODE.A]) && +(pacman.mtxLocal.translation.y.toFixed(1)) % 1 ==0) {
      for (let x = 0; x < walls.length; x++) {
        if (Math.round(pacman.mtxLocal.translation.x) == walls[x].mtxLocal.translation.x + 1 && Math.round(pacman.mtxLocal.translation.y) == walls[x].mtxLocal.translation.y) {
            wallcheck = true;
        }
        }
        if (wallcheck == false) {
          speed.set(-1/60, 0, 0);
          direction = "left";
      }
    }
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W]) && +(pacman.mtxLocal.translation.x.toFixed(1)) % 1 ==0) {
      for (let x = 0; x < walls.length; x++) {
        if (Math.round(pacman.mtxLocal.translation.y) == walls[x].mtxLocal.translation.y - 1 && Math.round(pacman.mtxLocal.translation.x) == walls[x].mtxLocal.translation.x) {
            wallcheck = true;
        }
        }
        if (wallcheck == false) {
          speed.set(0, 1 / 60, 0);
          direction = "up";
      }
    }
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN, ƒ.KEYBOARD_CODE.S]) && +(pacman.mtxLocal.translation.x.toFixed(1)) % 1 ==0) {
      for (let x = 0; x < walls.length; x++) {
        if (Math.round(pacman.mtxLocal.translation.y) == walls[x].mtxLocal.translation.y + 1 && Math.round(pacman.mtxLocal.translation.x) == walls[x].mtxLocal.translation.x) {
            wallcheck = true;
        }
        }
        if (wallcheck == false) {
          speed.set(0, -1 / 60, 0);
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
      if (+(pacman.mtxLocal.translation.x.toFixed(1)) == walls[x].mtxLocal.translation.x -1 && Math.round(pacman.mtxLocal.translation.y) == walls[x].mtxLocal.translation.y && direction == "right") {
        speed.set(0, 0, 0);
        direction = "";
      }
      }

    pacman.mtxLocal.translate(speed);
    viewport.draw();
    ƒ.AudioManager.default.update();
  }
}