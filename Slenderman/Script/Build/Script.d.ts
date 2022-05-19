declare namespace Script {
    import ƒ = FudgeCore;
    class DropToGroundInitial extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        constructor();
        hndEvent: (_event: Event) => void;
        setHeight: (_event: Event) => void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class DroptToGroundFrame extends ƒ.ComponentScript {
        private static graph;
        private static ground;
        private static cmpMeshTerrain;
        private static meshTerrain;
        static readonly iSubclass: number;
        constructor();
        hndEvent: (_event: Event) => void;
        setHeight: (_event: Event) => void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    let avatar: ƒ.Node;
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Slenderman extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        private timeToChange;
        private direction;
        constructor();
        hndEvent: (_event: Event) => void;
        private move;
    }
}
declare namespace Script {
    import ƒAid = FudgeAid;
    enum JOB {
        FOLLOW = 0,
        FLEE = 1
    }
    export class StateMachine extends ƒAid.ComponentStateMachine<JOB> {
        static readonly iSubclass: number;
        private static instructions;
        private cmpBody;
        private time;
        constructor();
        static get(): ƒAid.StateMachineInstructions<JOB>;
        private static transitDefault;
        private static actFollow;
        private static actFlee;
        private hndEvent;
        private update;
    }
    export {};
}
