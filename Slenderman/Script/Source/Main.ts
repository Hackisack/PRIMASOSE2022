namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let dialog: HTMLDialogElement;

  let viewport: ƒ.Viewport;
  
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
    let graph: ƒ.Graph = <ƒ.Graph>ƒ.Project.resources["Graph|2022-04-14T13:06:24.657Z|49930"];
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
    viewport.draw();
    canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", {
      bubbles: true,
      detail: viewport
    }));
  }

  function start(_event: CustomEvent): void {
    viewport = _event.detail;
    viewport.camera.mtxPivot.translate(new ƒ.Vector3(0,100, 0));
    viewport.camera.mtxPivot.rotateX(90);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    // ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // ƒ.Physics.simulate();  // if physics is included and used
    viewport.draw();
    ƒ.AudioManager.default.update();
  }
}