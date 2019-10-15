/*
 * Parameters:
 * * streamUrl - url to main stream. Required
 * * thumbUrl - url to thumb jpeg which is updating. Required
 * * thumbWidth - width of thumb. Default is 300
 * * thumbHeight - height of thumb. Default is 169
 * * thumbUpdateIntervalSec - interval between updating of thumb in seconds. Default is 10.
 */


let uniqIndex = 0;


class FullViewModal {
  constructor() {
    // this is persistent element
    this._modalRootId= 'home-cam__modal-root';
    // this element adds and removes on open/close
    this._modalId= 'home-cam__modal';
    this._streamElId = 'home-cam__stream';
    this._openEventName = 'modal-open';
    this._closeEventName = 'modal-close';
    this._modalTpl = `<div id="home-cam__modal">` +
      `<div id="home-cam__loader"><div>Connecting ...</div></div>` +
      `<div id="home-cam__body">` +
      //`<div id="home-cam__close"><span aria-hidden="true">&times;</span></div>` +
      `<video id="${this._streamElId}"></video>` +
      `</div>` +
      `</div>`;

    const modalRootEl = document.createElement('div');

    modalRootEl.setAttribute('id', this._modalRootId);
    document.body.append(modalRootEl);
  }

  open(streamUrl) {
    // remove previously opened
    this._removeModal();
    // create an inner modal
    this._createDom();

    const modalRootEl = document.getElementById(this._modalRootId);
    const modalEl = document.getElementById(this._modalId);
    const event = new CustomEvent(this._openEventName);

    modalEl.onclick = () => {
      this._handleModalClose();
    };

    modalRootEl.dispatchEvent(event);
    this._startStream(streamUrl);
  }

  onOpen(cb) {
    const modalRootEl = document.getElementById(this._modalRootId);

    modalRootEl.addEventListener(this._openEventName, cb);
  }

  onClose(cb) {
    const modalRootEl = document.getElementById(this._modalRootId);

    modalRootEl.addEventListener(this._closeEventName, cb);
  }


  _handleModalClose() {
    const modalRootEl = document.getElementById(this._modalRootId);
    const event = new CustomEvent(this._closeEventName);

    modalRootEl.dispatchEvent(event);
    this._removeModal();
  }

  _createDom() {
    const modalRootEl = document.getElementById(this._modalRootId);

    modalRootEl.innerHTML = this._modalTpl.trim();
  }

  _removeModal() {
    const modal = document.getElementById(this._modalId);

    if (modal) modal.remove();
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
  constructor(rootEl, fullViewModal, params) {
    this.defaultImgWidth = 300;
    this.defaultImgHeight = 169;
    this.defaultUpdatingIntervalSec = 10;

    this._rootEl = rootEl;
    this._fullViewModal = fullViewModal;
    this._params = params;
    this._updatingIntervalSec = params.thumbUpdateIntervalSec || this.defaultUpdatingIntervalSec;
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

    // don't update thumb while modal is opened
    this._fullViewModal.onOpen(() => {
      this._stopInterval();
    });

    // carry on updating thumb on modal close
    this._fullViewModal.onClose(() => {
      this._updateThumb();
      this._startUpdating();
    });

    this._rootEl.append(imgEl);
  }

  _makeImgEl() {

    // TODO: maybe not use width and height if they aren't set

    const width = this._params.thumbWidth || this.defaultImgWidth;
    const height = this._params.thumbHeight || this.defaultImgHeight;

    this._imgEl.setAttribute('src', this._params.thumbUrl);
    this._imgEl.setAttribute('width', width);
    this._imgEl.setAttribute('height', height);

    return this._imgEl;
  }

  _startUpdating() {
    this.updateInterval = setInterval(() => {
      this._updateThumb();
    }, this._updatingIntervalSec * 1000);
  }

  _stopInterval() {
    clearInterval(this.updateInterval);
    delete this.updateInterval;
  }

  _updateThumb() {
    this._imgEl.setAttribute('src', `${this._params.thumbUrl}?s=${this._makeUniqIndex()}`);
  }

  _makeUniqIndex() {
    uniqIndex++;

    if (uniqIndex >= 1024) uniqIndex = 0;

    return uniqIndex;
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
