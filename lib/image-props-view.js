'use babel';

import path from 'path';
import fs from 'fs';
import atom from 'atom';

export default class ImagePropsView {
  constructor(editor, hit) {
    const orig_link = hit.matchText.match(/^"(.*)"$/)[1]

    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('sikuli');

    // image basics
    const image = document.createElement("img")
    image.style = `max-height: 500px;`
    image.src = path.join(path.dirname(editor.buffer.file.path), orig_link)
    this.element.appendChild(image);

    this.element.appendChild(document.createElement("br"));

//    const dir = new atom.TextEditor({mini: true});
//    dir.setPlaceholderText("Image directory");
//    dir.setText(path.dirname(editor.buffer.file.path));
//    this.element.appendChild(dir.getElement());
    const dir = document.createElement('input');
    dir.value = path.dirname(editor.buffer.file.path);
    this.element.appendChild(dir);

    const name = document.createElement('input');
    name.value = path.basename(orig_link, ".png");
    this.element.appendChild(name);

    const ext = document.createElement('input');
    ext.value = path.extname(orig_link);
    this.element.appendChild(ext);

    // buttons
    const btnOk = document.createElement('button');
    btnOk.classList.add("btn");
    btnOk.textContent = "Ok";
    btnOk.onclick = () => {
      if(orig_link != name.value + ext.value) {
        let name_old = path.join(dir.value, orig_link)
        let name_new = path.join(dir.value, name.value + ext.value)
        console.log("Rename", name_old, "to", name_new);
        fs.rename(name_old, name_new);
        editor.setTextInBufferRange(hit.computedRange, '"' + name.value + ext.value + '"');
      }
      atom.commands.dispatch(atom.views.getView(atom.workspace), "sikuli:hide-image-props");
    };

    const btnCancel = document.createElement('button');
    btnCancel.classList.add("btn");
    btnCancel.textContent = "Cancel";
    btnCancel.onclick = () => {
      atom.commands.dispatch(atom.views.getView(atom.workspace), "sikuli:hide-image-props");
    };

    const btnBlock = document.createElement('div');
    btnBlock.classList.add("btnBlock")
    btnBlock.appendChild(btnOk);
    btnBlock.appendChild(btnCancel);
    this.element.appendChild(btnBlock);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }
}
