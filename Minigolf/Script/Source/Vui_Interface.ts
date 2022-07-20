namespace Script {
    import ƒ = FudgeCore;
    import ƒUi = FudgeUserInterface
  
    export class Timer extends ƒ.Mutable {
      public minutes: number = 0;
      public seconds: number = 0;
  
      public constructor() {
        super();
        let timerVui: HTMLDivElement = document.querySelector("div#timer");
        console.log(new ƒUi.Controller(this, timerVui));
      }
  
      protected reduceMutator(_mutator: ƒ.Mutator): void { /* */ }
    }

    export class Hits extends ƒ.Mutable {
        public hits: number = 0;
        public maxHits: number = 0;
    
        public constructor() {
          super();
          let hitsVui: HTMLDivElement = document.querySelector("div#hits");
          console.log(new ƒUi.Controller(this, hitsVui));
        }
    
        protected reduceMutator(_mutator: ƒ.Mutator): void { /* */ }
      }

  }