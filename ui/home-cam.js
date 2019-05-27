
function getElTpl(src) {
  return `<img src="${src}">`;
}

function instantiate(el) {

}


window.place = function (elementSelector) {
  if (elementSelector.indexOf('.') === 0) {
    const elements = document.getElementsByClassName(elementSelector);

    for (let el of elements) {
      instantiate(el);
    }
  }
  else if (elementSelector.indexOf('#') === 0) {
    const el = document.getElementById(elementSelector);

    instantiate(el);
  }
  else {
    throw new Error(`Incorrect selector "${elementSelector}"`);
  }
};
