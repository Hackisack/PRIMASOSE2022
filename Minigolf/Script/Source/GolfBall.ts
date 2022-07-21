namespace Script {
    import ƒ = FudgeCore;
  
    export class GolfBall extends ƒ.Node {
  
      constructor(_name: string, size:number, color:string) {
        super(_name);
  
        const mesh: ƒ.MeshSphere = new ƒ.MeshSphere("GolfBall", 30, 30);
        const material: ƒ.Material = new ƒ.Material("MaterialBall", ƒ.ShaderFlat);
  
        const cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
        const mtxMatrix: ƒ.Matrix4x4 = new ƒ.Matrix4x4();
        mtxMatrix.translation = new ƒ.Vector3(0, size, 0);
        mtxMatrix.scaling = new ƒ.Vector3(size, size, size);
        cmpTransform.mtxLocal = mtxMatrix;
        
        const cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(mesh);

        const cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(material);
        cmpMaterial.clrPrimary = ƒ.Color.CSS(color);

        const cmpRigibody: ƒ.ComponentRigidbody = new ƒ.ComponentRigidbody(1,ƒ.BODY_TYPE.DYNAMIC, ƒ.COLLIDER_TYPE.SPHERE, ƒ.COLLISION_GROUP.DEFAULT);
        cmpRigibody.initialization = ƒ.BODY_INIT.TO_NODE;
        cmpRigibody.friction = 0.4;
        cmpRigibody.restitution = 0.3;
        cmpRigibody.mass = 1;
        cmpRigibody.dampRotation = 0.3;
        cmpRigibody.dampTranslation = 0.3;
        cmpRigibody.effectGravity = 1;
  
        this.addComponent(cmpTransform);
        this.addComponent(cmpMesh);
        this.addComponent(cmpMaterial);
        this.addComponent(cmpRigibody);
  
      } 
    
    }
  }