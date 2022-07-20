declare namespace Script {
    import ƒ = FudgeCore;
    class CustomComponentScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        constructor();
        hndEvent: (_event: Event) => void;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class FollowBall extends ƒ.ComponentScript {
        private static graph;
        private static ball;
        private static playerTransform;
        static readonly iSubclass: number;
        constructor();
        hndEvent: (_event: Event) => void;
        followBall: (_event: Event) => void;
    }
}
declare namespace Script {
}
declare namespace Script {
    import ƒ = FudgeCore;
    class Timer extends ƒ.Mutable {
        minutes: number;
        seconds: number;
        constructor();
        protected reduceMutator(_mutator: ƒ.Mutator): void;
    }
    class Hits extends ƒ.Mutable {
        hits: number;
        maxHits: number;
        constructor();
        protected reduceMutator(_mutator: ƒ.Mutator): void;
    }
}
