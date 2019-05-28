/*
 * Parameters:
 * * streamUrl - url to main stream. Required
 * * thumbUrl - url to thumb jpeg which is updating. Required
 * * thumbWidth - width of thumb. Default is 300
 * * thumbHeight - height of thumb. Default is 169
 * * thumbUpdatingIntervalSec - interval between updating of thumb in seconds. Default is 10.
 */


class FullViewModal {
  _modalWrapperId= 'home-cam__modal-wrapper';
  _streamElId = 'home-cam__stream';
  _modalTpl = `<div id="home-cam__modal">` +
    `<div id="home-cam__body">` +
    //`<div id="home-cam__close"><span aria-hidden="true">&times;</span></div>` +
    `<video id="${this._streamElId}"></video>` +
    `</div>` +
    `</div>`;

  open(streamUrl) {
    // remove prevoiusly opened
    this._removeModal();
    // create a new dom tree
    this._createDom();

    const modalInner = document.getElementById('home-cam__modal');

    modalInner.onclick = () => {
      this._removeModal();
    };

    this._startStream(streamUrl);
  }


  _createDom() {
    const modal = document.createElement('div');

    modal.setAttribute('id', this._modalWrapperId);
    modal.innerHTML = this._modalTpl.trim();
    document.body.append(modal);
  }

  _removeModal() {
    const modalWrapperEl = document.getElementById(this._modalWrapperId);

    if (modalWrapperEl) modalWrapperEl.remove();
  }

  _startStream(streamUrl) {
    if (flvjs.isSupported()) {
      const videoElement = document.getElementById(this._streamElId);
      const flvPlayer = flvjs.createPlayer({
        type: 'flv',
        url: streamUrl
      });

      flvPlayer.attachMediaElement(videoElement);
      flvPlayer.load();
      flvPlayer.play();
    }
  }

}


class Camera {
  defaultImgWidth = 300;
  defaultImgHeight = 169;
  defaultUpdatingIntervalSec = 10;


  constructor(rootEl, fullViewModal, params) {
    this._rootEl = rootEl;
    this._fullViewModal = fullViewModal;
    this._params = params;
    this._updatingIntervalSec = this.defaultUpdatingIntervalSec || params.thumbUpdatingIntervalSec;
    this._imgEl = document.createElement('img');
  }


  init() {
    this._createDom();
    this._startUpdating();
  }


  _createDom() {
    const imgEl = this._makeImgEl();

    imgEl.onclick = () => {
      this._fullViewModal.open(this._params.streamUrl);
    };

    this._rootEl.append(imgEl);
  }

  _makeImgEl() {
    const width = this._params.thumbWidth || this.defaultImgWidth;
    const height = this._params.thumbHeight || this.defaultImgHeight;
    //const imgEl = document.createElement('img');

    this._imgEl.setAttribute('src', this._params.thumbUrl);
    this._imgEl.setAttribute('width', width);
    this._imgEl.setAttribute('height', height);

    return this._imgEl;
  }

  // TODO: while modal is oppened - don't update

  _startUpdating() {
    setInterval(() => {
      this._imgEl.setAttribute('src', this._params.thumbUrl);
    }, this._updatingIntervalSec * 1000);
  }

}


window.placeCam = function (elementSelector, params) {
  const fullViewModal = new FullViewModal(params);

  if (elementSelector.indexOf('.') === 0) {
    const elements = document.getElementsByClassName(elementSelector.slice(1));

    if (!elements.length) {
      throw new Error(`Can't find elements "${elementSelector}"`);
    }

    for (let el of elements) {
      const camera = new Camera(el, fullViewModal, params);

      camera.init();
    }
  }
  else if (elementSelector.indexOf('#') === 0) {
    const el = document.getElementById(elementSelector.slice(1));

    if (!el) {
      throw new Error(`Can't find element "${elementSelector}"`);
    }

    const camera = new Camera(el, fullViewModal, params);

    camera.init();
  }
  else {
    throw new Error(`Incorrect selector "${elementSelector}"`);
  }
};
