(function(window) {

  let units;
  
  let pageIsSetUp = false;

  if (self) {
    units = self.adRando.units;
  } else {
    units = require('../tables/units');
  }

  function setUpInnerPage() {
    const unitListElement = document.getElementById("unit-list");
    units.unitTable.forEach(tableEntry => {
      const listItemElement = document.createElement('li');
      unitListElement.appendChild(listItemElement);
      const linkElement = document.createElement('a');
      if (!tableEntry.name.includes(" ")) {
        linkElement.href = 'unit.html?name=' + tableEntry.name;
      } else {
        linkElement.href = 'unit.html?unitId=' + tableEntry.unitId;
      }
      linkElement.innerText = tableEntry.name;
      listItemElement.appendChild(linkElement);
    });
    return true;
  }

  if (window) {
    if (!pageIsSetUp) {
      setUpInnerPage()
      pageIsSetUp = true;
    }
  }
})(typeof(window) !== 'undefined' ? window : null)