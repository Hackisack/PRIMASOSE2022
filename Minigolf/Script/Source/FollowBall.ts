namespace Script {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization

  export class FollowBall extends ƒ.ComponentScript {
    private static graph: ƒ.Graph;
    private static ball: ƒ.Node;
    private static playerTransform: ƒ.ComponentTransform;

    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(FollowBall);
    // Properties may be mutated by users in the editor via the automatically created user interface

    constructor() {
      super();

      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR) return;
      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
      
    }
    public hndEvent = (_event: Event): void => {
      
      ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.followBall);  
    }

    public followBall = (_event: Event): void => {
      let rigibody: ƒ.ComponentRigidbody = <ƒ.ComponentRigidbody> this.node.getComponent(ƒ.ComponentRigidbody); 
      if (!FollowBall.graph) {
        FollowBall.graph = ƒ.Project.resources["Graph|2022-06-01T10:11:57.783Z|46113"] as ƒ.Graph;
        FollowBall.ball = FollowBall.graph.getChildrenByName("Ball")[0];
        FollowBall.playerTransform = FollowBall.graph.getChildrenByName("Player")[0].getComponent(ƒ.ComponentTransform);
      }
      
      let ballVector: ƒ.Vector3 = new ƒ.Vector3;
      ballVector = FollowBall.ball.mtxLocal.translation.clone;
      ballVector.y = 15;
      FollowBall.playerTransform.mtxLocal.translation = ballVector;
    };
  }
}