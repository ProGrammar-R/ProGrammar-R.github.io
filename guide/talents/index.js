(function(window) {

  let pageIsSetUp = false;

  let talents;

  if (self) {
    talents = self.adRando.talents;
  } else {
    talents = require('../tables/talents');
  }

  function setUpInnerPage() {
    const talentListElement = document.getElementById("talent-list");
    talents.talentTable.forEach(tableEntry => {
      const listItemElement = document.createElement('li');
      talentListElement.appendChild(listItemElement);
      const linkElement = document.createElement('a');
      linkElement.href = 'talent.html?talentId=' + tableEntry.talentId;
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