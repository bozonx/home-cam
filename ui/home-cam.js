const IMG_WIDTH = 300;
const IMG_HEIGHT = 169;


function makeImgEl(src, width, height) {
  const imgEl = document.createElement('input');

  imgEl.setAttribute('src', src);
  imgEl.setAttribute('width', width);
  imgEl.setAttribute('height', height);

  return imgEl;
}

function handleImgClick(event) {

}

function instantiate(rootEl, previewSrc) {
  const imgEl = makeImgEl(previewSrc, IMG_WIDTH, IMG_HEIGHT);

  imgEl.onclick = handleImgClick();

  rootEl.append(imgEl);
}


window.place = function (elementSelector, previewSrc) {
  if (elementSelector.indexOf('.') === 0) {
    const elements = document.getElementsByClassName(elementSelector);

    for (let el of elements) {
      instantiate(el, previewSrc);
    }
  }
  else if (elementSelector.indexOf('#') === 0) {
    const el = document.getElementById(elementSelector);

    instantiate(el, previewSrc);
  }
  else {
    throw new Error(`Incorrect selector "${elementSelector}"`);
  }
};
