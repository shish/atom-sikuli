'use babel';

import path from 'path';
import fs from 'fs';
import etch from 'etch';
import {TextEditor, TextBuffer} from 'atom';
/** @jsx etch.dom */

const default_pattern = {
  similarity: "0.75",
  offset: "0, 0",
};

function parse_pattern(text) {
  let matches = text.match(/^(?:Pattern\()?"(.*\.png)"\)?((?:\.[a-z]+\([^)]*\))*)$/);
  let pattern = {
    name: matches[1],
    similarity: default_pattern.similarity,
    offset: default_pattern.offset,
  };
  let argRe = /\.([a-z]+)\(([^)]*)\)/g;
  while ((argMatch = argRe.exec(matches[3])) !== null) {
    pattern[argMatch[1]] = argMatch[2];
  }
  return pattern;
}

function write_pattern(pattern) {
  function changed(attr) {
    return pattern[attr].getText() != default_pattern[attr];
  }

  let params = "";
  if(changed("similarity")) {
    params += ".similarity(" + pattern.similarity.getText() + ")";
  }
  if(changed("offset")) {
    params += ".offset(" + pattern.offset.getText() + ")";
  }

  let text = '"' + pattern.name.getText() + '"';
  if(params != "") {
    text = "Pattern(" + text + ")" + params;
  }
  return text;
}

export default class ImagePropsView {
  constructor(editor, hit) {
    const pattern = parse_pattern(hit.matchText)

    this.properties = {
      hit: hit,
      editor: editor,
      image: path.join(path.dirname(editor.buffer.file.path), pattern.name),
      pattern: pattern,
    };
    this.buffers = {
      dir: new TextBuffer({text: path.dirname(this.properties.editor.buffer.file.path)}),
      name: new TextBuffer({text: this.properties.pattern.name}),
      similarity: new TextBuffer({text: this.properties.pattern.similarity}),
      offset: new TextBuffer({text: this.properties.pattern.offset}),
    };
    etch.initialize(this);
  }

  render() {
    let dir = etch.dom(TextEditor, {mini: true, buffer: this.buffers.dir});
    let name = etch.dom(TextEditor, {mini: true, buffer: this.buffers.name});
    let similarity = etch.dom(TextEditor, {mini: true, buffer: this.buffers.similarity});
    let offset = etch.dom(TextEditor, {mini: true, buffer: this.buffers.offset});
    // <tr><td>Dir:</td><td>{dir}</td></tr>

    return <div className="sikuli">
      <img src={this.properties.image} on={{click: this._set_offset}} style="max-height: 500px;" />
      <table style="width: 100%;">
        <tr><td>Name:</td><td style="width: 90%;">{name}</td></tr>
        <tr><td>Similarity:</td><td>{similarity}</td></tr>
        <tr><td>Offset:</td><td>{offset}</td></tr>
      </table>
      <div className="btnBlock">
        <button className="btn" on={{click: this._test}}>Test</button>
        <button className="btn" on={{click: this._ok}}>Ok</button>
        <button className="btn" on={{click: this._cancel}}>Cancel</button>
      </div>
    </div>;
  }

  _set_offset(event) {
    this.buffers.offset.setText(
      "" +
      Math.floor(event.offsetX - event.srcElement.width/2) +
      ", " +
      Math.floor(event.offsetY - event.srcElement.height/2)
    );
  }

  _test(event) {
    let new_text = write_pattern(this.buffers);
    console.log(new_text);
  }

  _ok(event) {
    let name_old = path.join(this.buffers.dir.getText(), this.properties.pattern.name)
    let name_new = path.join(this.buffers.dir.getText(), this.buffers.name.getText())

    if(name_old != name_new) {
      console.log("Rename", name_old, "to", name_new);
      fs.rename(name_old, name_new);
    }

    let new_text = write_pattern(this.buffers);
    if(new_text != this.properties.hit.matchText) {
      this.properties.editor.setTextInBufferRange(this.properties.hit.computedRange, new_text);
    }

    atom.commands.dispatch(atom.views.getView(atom.workspace), "sikuli:hide-image-props");
  }

  _cancel(event) {
    atom.commands.dispatch(atom.views.getView(atom.workspace), "sikuli:hide-image-props");
  }

  update (props, children) {
    // perform custom update logic here...
    // then call `etch.update`, which is async and returns a promise
    return etch.update(this)
  }

  // Optional: Destroy the component. Async/await syntax is pretty but optional.
  async destroy () {
    // call etch.destroy to remove the element and destroy child components
    await etch.destroy(this)
    // then perform custom teardown logic here...
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
