(function(window) {

  let pageIsSetUp = false;

  function setUpInnerPage() {
    const floorListElement = document.getElementById("floor-list");
    for (let floor = 1; floor <= 40; floor++) {
      const listItemElement = document.createElement('li');
      floorListElement.appendChild(listItemElement);
      const linkElement = document.createElement('a');
      linkElement.href = 'floor.html?number=' + floor;
      linkElement.innerText = floor;
      listItemElement.appendChild(linkElement);
    }
    return true;
  }

  if (window) {
    if (!pageIsSetUp) {
      setUpInnerPage()
      pageIsSetUp = true;
    }
  }
})(typeof(window) !== 'undefined' ? window : null)