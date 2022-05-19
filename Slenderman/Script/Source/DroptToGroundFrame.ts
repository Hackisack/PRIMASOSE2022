namespace Script {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization

  export class DroptToGroundFrame extends ƒ.ComponentScript {
    private static graph: ƒ.Graph;
    private static ground: ƒ.Node;
    private static cmpMeshTerrain: ƒ.ComponentMesh;
    private static meshTerrain: ƒ.MeshTerrain;

    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(DroptToGroundFrame);
    // Properties may be mutated by users in the editor via the automatically created user interface

    constructor() {
      super();

      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR) return;
      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
      
    }
    public hndEvent = (_event: Event): void => {
      
      ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.setHeight);  
    }

    public setHeight = (_event: Event): void => {
      let rigibody: ƒ.ComponentRigidbody = <ƒ.ComponentRigidbody> this.node.getComponent(ƒ.ComponentRigidbody); 
      if (!DroptToGroundFrame.graph) {
        DroptToGroundFrame.graph = ƒ.Project.resources["Graph|2022-04-14T13:06:24.657Z|49930"] as ƒ.Graph;
        DroptToGroundFrame.ground = DroptToGroundFrame.graph.getChildrenByName("Environment")[0].getChildrenByName("Ground")[0];
        DroptToGroundFrame.cmpMeshTerrain = DroptToGroundFrame.ground.getComponent(ƒ.ComponentMesh);
        DroptToGroundFrame.meshTerrain = <ƒ.MeshTerrain>DroptToGroundFrame.cmpMeshTerrain.mesh;
      }
      const distance = DroptToGroundFrame.meshTerrain.getTerrainInfo(
        this.node.mtxLocal.translation,
        DroptToGroundFrame.cmpMeshTerrain.mtxWorld
      ).distance;

      if (distance <= 0) {
        
        rigibody.translateBody(new ƒ.Vector3(0,-distance, 0));
        
      }
      
      
      //this.node.mtxLocal.translateY(-distance);
    };
  }
}