const IMG_WIDTH = 300;
const IMG_HEIGHT = 169;


function makeImgEl(src, width, height) {
  const imgEl = document.createElement('img');

  imgEl.setAttribute('src', src);
  imgEl.setAttribute('width', width);
  imgEl.setAttribute('height', height);

  return imgEl;
}

function openFullView(streamUrl) {
  // TODO: remove prevoiusly opened
  // TODO: make elements
  // TODO: start flv
  console.log(11111111, streamUrl)
}

function handleImgClick(streamUrl) {
  openFullView(streamUrl);
}

function instantiate(rootEl, previewSrc, streamUrl) {
  const imgEl = makeImgEl(previewSrc, IMG_WIDTH, IMG_HEIGHT);

  imgEl.onclick = () => handleImgClick(streamUrl);

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
