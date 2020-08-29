(function(window) {

  let talents;
  let units;
  
  let pageIsSetUp = false;

  if (self) {
    talents = self.adRando.talents;
    units = self.adRando.units;
  } else {
    talents = require('../tables/talents');
    units = require('../tables/units');
  }

  function appendMonsterWithTalent(unitEntry, templateId, parentId) {
    let template = document.getElementById(templateId);
    let clone = template.content.cloneNode(true);
    let linkElement = clone.getElementById("monster_name");
    linkElement.innerText = unitEntry.name;
    linkElement.href = '../units/unit.html?unitId=' + unitEntry.unitId;
    document.getElementById(parentId).appendChild(clone);
  }

  function populateAllMonstersWithTalent(entry, templateId, parentId) {
    units.unitTable.filter(unitEntry => (unitEntry.talentIds & entry.talentId) !== 0).forEach(unitEntry => appendMonsterWithTalent(unitEntry, templateId, parentId));
  }

  function setUpInnerPage() {
    const url = new URL(window.location.href)
    const talentId = parseInt(url.searchParams.get('talentId'));
    const talentEntry = talents.getTalentTableEntry(talentId);
    if (!talentEntry) {
      return false;
    }
    document.getElementById("name").innerText += " " + talentEntry.name;
    document.getElementById("description").innerText = talentEntry.description;
    document.getElementById("talent_id").innerText += " " + talentEntry.talentId;
    populateAllMonstersWithTalent(talentEntry, "monster_with_talent_template", "monsters_with_talent");
    
    return true;
  }

  if (window) {
    if (!pageIsSetUp) {
      setUpInnerPage()
      pageIsSetUp = true;
    }
  }
})(typeof(window) !== 'undefined' ? window : null)