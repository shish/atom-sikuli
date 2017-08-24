'use babel';

export default class AtomSikuliView {
  getTitle() {return 'Sikuli';}
  getURI() {return 'atom://sikuli-command-panel';}
  getDefaultLocation() {return 'right';}
  getAllowedLocations() {return ['left', 'right', 'bottom'];}

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('atom-sikuli');

    const btns = [
      {"label": "Take Screenshot", "action": "take-screenshot"},
      {"label": "Insert Image", "action": "insert-image"},
      //{"label": "Insert Region", "action": "insert-region"},
      //{"label": "Insert Location", "action": "insert-location"},
      //{"label": "Insert Offset", "action": "insert-offset"},
      //{"label": "Insert Show", "action": "insert-show"},
      //{"label": "Insert Show In", "action": "insert-show-in"},
      {"label": "Run", "action": "run"},
      //{"label": "Run In Slow Motion", "action": "run-slowly"}
    ];
    for (var i=0; i<btns.length; i++) {
      const btn = document.createElement('button');
      btn.classList.add("btn");
      btn.classList.add("btn-block");
      btn.textContent = btns[i].label;
      btn.action = "atom-sikuli:" + btns[i].action;
      btn.onclick = () => console.log(btn.action); //atom.commands.dispatch("atom-workspace", btn.action);
      this.element.appendChild(btn);
    }
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {
    return {
      // This is used to look up the deserializer function. It can be any string, but it needs to be
      // unique across all packages!
      deserializer: 'atom-sikuli/AtomSikuliView'
    };
  }

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }
}
