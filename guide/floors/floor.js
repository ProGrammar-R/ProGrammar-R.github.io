(function(window) {

  let elements;
  let floors;
  let spells;
  let units;
  
  let pageIsSetUp = false;

  if (self) {
    elements = self.adRando.elements;
    floors = self.adRando.floors;
    spells = self.adRando.spells;
    units = self.adRando.units;
  } else {
    elements = require('../tables/elements');
    floors = require('../tables/floors');
    spells = require('../tables/spells');
    units = require('../tables/units');
  }

  function calculateStat(baseStat, statGrowth, level, c) {
    return Math.min(baseStat + Math.floor((baseStat*statGrowth*(level-1)) / c), 255);
  }

  function calculateHp(baseHp, hpGrowth, level) {
    return Math.min(
      baseHp
      + Math.floor(hpGrowth*(level-1) / 16)
      + Math.floor(2896 * hpGrowth * Math.sqrt(hpGrowth * (level - 1)) / 32768)
      , 255);
  }

  function calculateExpGiven(baseExp, expGrowth, level) {
    return (baseExp * level + Math.floor(Math.pow(level - 1, 2) * (baseExp + expGrowth * (level - 1)) / 512)) % 65535;
  }

  function createStats(entry, floorEntry, templateId) {
    let template = document.getElementById(templateId);
    let clone = template.content.cloneNode(true);
    let level = floorEntry.level;
    clone.getElementById("name").innerText += " " + entry.name;
    clone.getElementById("name").href = '../units/unit.html?name=' + entry.name;
    clone.getElementById("level").innerText += " " + level;
    clone.getElementById("probability").innerText += " " + floorEntry.likelihood / .16 + "%";
    clone.getElementById("native_element").innerText += " " + processAttribute("nativeElement", entry.nativeElement);
    clone.getElementById("atk").innerText += " " + calculateStat(entry.baseAtk, entry.growthAtk, level, 64);
    clone.getElementById("def").innerText += " " + calculateStat(entry.baseDef, entry.growthDef, level, 64);
    clone.getElementById("mp").innerText += " " + calculateStat(entry.baseMp, entry.growthMp, level, 1024);
    clone.getElementById("luck").innerText += " " + calculateStat(entry.baseLuck, entry.growthLuck, level, 1024);
    clone.getElementById("hp").innerText += " " + calculateHp(entry.baseHp, entry.growthHp, level);
    clone.getElementById("exp").innerText += " " + calculateExpGiven(entry.baseExp, entry.growthExp, level);
    return clone;
  }

  function appendEgg(unitEntry, floorEntry, templateName) {
    let template = document.getElementById(templateName);
    let cloneNode = template.content.cloneNode(true);
    cloneNode.getElementById("egg_name").innerText += " " + unitEntry.name;
    cloneNode.getElementById("egg_name").href = '../units/unit.html?name=' + unitEntry.name;
    cloneNode.getElementById("probability").innerText += " " + floorEntry.probability + "%";
    document.getElementById("egg_probabilities").appendChild(cloneNode);
  }

  function processAttribute(attribute, value) {
    switch(attribute) {
      case "nativeSpellId":
      case "hiddenSpellId":
        return spells.getSpellBySpellId(value).name;
      case "evolvesInto":
        return value.length > 0 ? units.getUnitTableEntry(parseInt(value, 16)).name : "N/A";
      case "nativeElement":
        return elements.getElementNameByElementId(value);
      case "weaponDamage":
      case "specialDamage":
      case "accuracy":
      case "specialAccuracy":
        if (value !== "by equipment" && value !== "") {
          return parseInt(value, 16);
        }
        return value;
      default:
        return value.toString();
    }
  }

  function setUpInnerPage() {
    const url = new URL(window.location.href)
    const floorNumber = parseInt(url.searchParams.get('number'));
    const previousLink = document.getElementById("previous_floor");
    const nextLink = document.getElementById("next_floor");
    if (floorNumber < 2) {
      previousLink.parentNode.removeChild(previousLink);
    } else {
      previousLink.href = "floor.html?number=" + (floorNumber - 1);
    }
    if (floorNumber >= 40) {
      nextLink.parentNode.removeChild(nextLink);
    } else {
      nextLink.href = "floor.html?number=" + (floorNumber + 1);
    }
    document.getElementById("floor_number").innerText += " " + floorNumber;
    const enemiesEntry = floors.enemyTable[floorNumber];
    if (!enemiesEntry) {
      return false;
    }
    enemiesEntry.forEach(tableEntry => {
      const unitEntry = units.getUnitTableEntry(tableEntry.unitId);
      if (unitEntry) {
        let cloneNode = createStats(unitEntry, tableEntry, "enemy_stats_template");
        document.getElementById("enemy_stats").appendChild(cloneNode);
      }
    })
    const eggsEntry = floors.eggTable[floorNumber];
    if (!enemiesEntry) {
      return false;
    }
    eggsEntry.forEach(tableEntry => {
      const unitEntry = units.getUnitTableEntry(tableEntry.unitId);
      if (unitEntry) {
        appendEgg(unitEntry, tableEntry, "egg_probabilities_template");
      }
    })
    const notesEntry = floors.specialNotesTable[floorNumber];
    if (notesEntry) {
      document.getElementById("floor_notes").innerText = notesEntry;
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