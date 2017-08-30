'use babel';

import fs from 'fs';
import path from 'path';
import remote from 'remote';
import child_process from 'child_process';

import CommandPanelView from './command-panel-view';
import ImagePropsView from './image-props-view';
import { pattern_multi } from './pattern';
import { CompositeDisposable, Disposable } from 'atom';

export default {
  commandPanel: null,
  subscriptions: null,

  showThumbnails: true,

  activate(state) {
    this.modalPanel = null;

    atom.workspace.observeTextEditors((editor) => {
      if(editor.getPath() && editor.getPath().indexOf(".sikuli/") > 0) {
        this.processTextBuffer(editor)
        editor.onDidStopChanging(this.processTextBuffer.bind(null, editor))
      }
    })

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      "sikuli:toggle-command-list": () => this.toggle_command_list(),
      "sikuli:toggle-thumbnails": () => this.toggle_thumbnails(),
      "sikuli:take-screenshot": () => this.take_screenshot(),
      "sikuli:insert-image": () => this.insert_image(),
      "sikuli:hide-image-props": () => this.hide_image_props(),
      "sikuli:run": () => this.run(),
    }));
    this.subscriptions.add(atom.workspace.addOpener(uri => {
      if (uri === 'atom://sikuli-command-panel') {
        return new CommandPanelView(state.commandPanelState);
      }
    }));
    this.subscriptions.add(new Disposable(() => {
      atom.workspace.getPaneItems().forEach(item => {
        if (item instanceof CommandPanelView) {
          item.destroy();
        }
      });
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {},

  deserializeCommandPanelView(serialized) {
    return new CommandPanelView();
  },

  // ===================================================================
  _getCurrentPath() {
    if(!atom.workspace.getActiveTextEditor()) {
        return;
    }
    return atom.workspace.getActiveTextEditor().getPath();
  },
  _insertImage(file) {
    let currentPath = this._getCurrentPath()
    if(!currentPath) {return;}

    let dest = path.dirname(currentPath) + "/" + path.basename(file);
    fs.createReadStream(file).pipe(fs.createWriteStream(dest));
    return atom.workspace.getActiveTextEditor().insertText('"' + path.basename(file) + '"');
  },
  // ===================================================================

  toggle_command_list() {
    atom.workspace.toggle('atom://sikuli-command-panel');
  },
  toggle_thumbnails() {
    this.showThumbnails = !this.showThumbnails;
  },

  take_screenshot() {
    let ss = "/tmp/" + Math.floor(new Date()) + ".png";
    let child = child_process.exec("screencapture -s " + ss, (error, stdout, stderr) => {
      if (error !== null) {
          console.log(`exec error: ${error}`);
      }
      else {
        this._insertImage(ss);
        fs.unlink(ss);
      }
    });
  },
  insert_image() {
    let files = remote.dialog.showOpenDialog(
      remote.getCurrentWindow(),
      {
        properties: ['openFile'],
        filters: [{name: "Images", extensions: ['png']}],
      }
    );
    if(files && files.length) {
      this._insertImage(files[0])
    }
  },
  run() {
    console.log('AtomSikuli: run');
  },

  show_image_props(editor, hit) {
    this.imagePropsView = new ImagePropsView(editor, hit);
    this.modalPanel = atom.workspace.addModalPanel({item: this.imagePropsView.getElement(), visible: false});
    this.modalPanel.show();
//    var newName = prompt("New name:", hit.matchText)
//    console.log(hit.computedRange, "->", newname)

    //return unless editor = atom.workspace.getActiveTextEditor()
    //selection = editor.getLastSelection()
    //clipboardText = atom.clipboard.read()
    //selection.insertText("[#{selection.getText()}](#{clipboardText})")
  },
  hide_image_props() {
    this.modalPanel.hide();
    this.modalPanel.destroy();
    this.imagePropsView.destroy();
  },

  processTextBuffer(editor) {
    const currentMarkers = editor.getMarkers()
    const currentValidMarkers = []

    currentMarkers.forEach((marker) => {
      if (marker.bufferMarker && marker.bufferMarker.properties.isImiMarker) {
        if (!marker.isValid()) {
          marker.destroy()
        } else {
          currentValidMarkers.push(marker)
        }
      }
    })

    //  (?:\.[a-z]+\([^\)]*\))*
    //  [a-zA-Z0-9_-]
    //return editor.scan(//g, (hit) => {
    return editor.scan(pattern_multi, (hit) => {
    //return editor.scan(/"([^"]*?\.png)"/g, (hit) => {
    //return editor.scan(/"([a-zA-Z0-9_-]*\.png)"/g, (hit) => {
      console.log(hit.matchText);
      const hitIsMarked = !!currentValidMarkers.find((marker) => {
        return hit.computedRange.start.row == marker.getBufferRange().start.row
      })

      if (!hitIsMarked) {
        const link = hit.matchText.match(/"(.*?)"/)[1]
        const imageContainer = document.createElement("div")
        const image = document.createElement("img")
        const marker = editor.markBufferRange(hit.computedRange, {invalidate: "inside"})

        imageContainer.appendChild(image)
        imageContainer.style = `padding: 5px; display: none; padding-left: `+(hit.match.index * 8.5)+`px;`

        image.style = `max-height: 100px;`
        image.src = path.join(path.dirname(editor.buffer.file.path), link)
        image.onclick = () => this.show_image_props(editor, hit)
        image.onload = () => imageContainer.style.display = "block"

        marker.bufferMarker.setProperties({isImiMarker: true})

        return editor.decorateMarker(marker, {type: "block", item: imageContainer, position: "before"})
      }
    });
  }

};
