const IMG_WIDTH = 300;
const IMG_HEIGHT = 169;
const MODAL_WRAPPER_ID = 'home-cam__modal-wrapper';

const modalTpl = `<div id="home-cam__modal">` +
  `<div id="home-cam__body">` +
    //`<div id="home-cam__close"><span aria-hidden="true">&times;</span></div>` +
    `<div id="home-cam__stream"></div>` +
  `</div>` +
  `</div>`;


function makeImgEl(src, width, height) {
  const imgEl = document.createElement('img');

  imgEl.setAttribute('src', src);
  imgEl.setAttribute('width', width);
  imgEl.setAttribute('height', height);

  return imgEl;
}

function removeModal() {
  const modalWrapperEl = document.getElementById(MODAL_WRAPPER_ID);

  if (modalWrapperEl) modalWrapperEl.remove();
}

function closeModal() {
  removeModal();
}

function openFullView(streamUrl) {
  // remove prevoiusly opened
  removeModal();

  const modal = document.createElement('div');

  modal.setAttribute('id', MODAL_WRAPPER_ID);
  modal.innerHTML = modalTpl.trim();
  document.body.append(modal);

  const modalInner = document.getElementById('home-cam__modal');

  modalInner.onclick = closeModal;

  startStream(streamUrl);
}

function startStream(streamUrl) {
  if (flvjs.isSupported()) {
    var videoElement = document.getElementById('videoElement');
    var flvPlayer = flvjs.createPlayer({
      type: 'flv',
      url: streamUrl
    });
    flvPlayer.attachMediaElement(videoElement);
    flvPlayer.load();
    flvPlayer.play();
  }
}

function handleImgClick(streamUrl) {
  openFullView(streamUrl);
}

function instantiate(rootEl, previewSrc, streamUrl) {
  const imgEl = makeImgEl(previewSrc, IMG_WIDTH, IMG_HEIGHT);

  imgEl.onclick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    handleImgClick(streamUrl);
  };

  rootEl.append(imgEl);
}


window.placeCam = function (elementSelector, previewSrc, streamUrl) {
  if (elementSelector.indexOf('.') === 0) {
    const elements = document.getElementsByClassName(elementSelector.slice(1));

    if (!elements.length) {
      throw new Error(`Can't find elements "${elementSelector}"`);
    }

    for (let el of elements) {
      instantiate(el, previewSrc, streamUrl);
    }
  }
  else if (elementSelector.indexOf('#') === 0) {
    const el = document.getElementById(elementSelector.slice(1));

    if (!el) {
      throw new Error(`Can't find element "${elementSelector}"`);
    }

    instantiate(el, previewSrc, streamUrl);
  }
  else {
    throw new Error(`Incorrect selector "${elementSelector}"`);
  }
};
