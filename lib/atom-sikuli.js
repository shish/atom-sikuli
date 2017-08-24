'use babel';

import path from 'path';

import AtomSikuliView from './atom-sikuli-view';
import { CompositeDisposable, Disposable } from 'atom';

export default {

  atomSikuliView: null,
  commandPanel: null,
  subscriptions: null,

  showThumbnails: true,

  activate(state) {
    atom.workspace.observeTextEditors((editor) => {
      //if (editor.getGrammar().name === 'MagicPython') {
        this.processTextBuffer(editor)

        editor.onDidStopChanging(this.processTextBuffer.bind(null, editor))
      //}
    })


    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      "atom-sikuli:toggle-command-list": () => this.toggle_command_list(),
      "atom-sikuli:toggle-thumbnails": () => this.toggle_thumbnails(),
      "atom-sikuli:take-screenshot": () => this.take_screenshot(),
      "atom-sikuli:insert-image": () => this.insert_image(),
      "atom-sikuli:run": () => this.run(),
    }));
    this.subscriptions.add(atom.workspace.addOpener(uri => {
      if (uri === 'atom://sikuli-command-panel') {
        return new AtomSikuliView(state.atomSikuliViewState);
      }
    }));
    this.subscriptions.add(new Disposable(() => {
      atom.workspace.getPaneItems().forEach(item => {
        if (item instanceof AtomSikuliView) {
          item.destroy();
        }
      });
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    return {
//      atomSikuliViewState: this.atomSikuliView.serialize(),
    };
  },

  deserializeAtomSikuliView(serialized) {
    return new AtomSikuliView();
  },

  // ===================================================================

  toggle_command_list() {
    console.log('AtomSikuli: toggle command list');
    atom.workspace.toggle('atom://sikuli-command-panel');
  },
  toggle_thumbnails() {
    console.log('AtomSikuli: toggle thumbnails');
    this.showThumbnails = !this.showThumbnails;
  },

  take_screenshot() {
    console.log('AtomSikuli: take screenshot');
  },
  insert_image() {
    console.log('AtomSikuli: insert image');
  },
  run() {
    console.log('AtomSikuli: run');
  },

  rename(hit) {
    var newName = prompt("New name:", hit.matchText)
    console.log(hit.computedRange, "->", newname)

    //return unless editor = atom.workspace.getActiveTextEditor()
    //selection = editor.getLastSelection()
    //clipboardText = atom.clipboard.read()
    //selection.insertText("[#{selection.getText()}](#{clipboardText})")
  },

  processTextBuffer(editor) {
    console.log("processTextBuffer")
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

    return editor.scan(/"([_a-zA-Z0-9]*.png)"/g, (hit) => {
      const hitIsMarked = !!currentValidMarkers.find((marker) => {
        return hit.computedRange.start.row == marker.getBufferRange().start.row
      })

      if (!hitIsMarked) {
        const link = hit.matchText.match(/^"([-_a-zA-Z0-9]+.png)"$/)[1]
        const imageContainer = document.createElement("div")
        const image = document.createElement("img")
        const marker = editor.markBufferRange(hit.computedRange, {invalidate: "inside"})

        imageContainer.appendChild(image)
        imageContainer.style = `padding: 5px; display: none; padding-left: `+(hit.match.index * 8.5)+`px;`

        image.style = `max-height: 100px;`
        image.src = path.join(path.dirname(editor.buffer.file.path), link)
        image.onclick = () => this.rename(hit)
        image.onload = () => imageContainer.style.display = "block"

        marker.bufferMarker.setProperties({isImiMarker: true})

        return editor.decorateMarker(marker, {type: "block", item: imageContainer, position: "before"})
      }
    })
  }

};
