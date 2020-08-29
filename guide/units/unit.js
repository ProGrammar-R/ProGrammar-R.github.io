(function(window) {

  let elements;
  let floors;
  let spells;
  let talents;
  let units;
  
  let pageIsSetUp = false;

  if (self) {
    elements = self.adRando.elements;
    floors = self.adRando.floors;
    spells = self.adRando.spells;
    talents = self.adRando.talents;
    units = self.adRando.units;
  } else {
    elements = require('../tables/elements');
    floors = require('../tables/floors');
    spells = require('../tables/spells');
    talents = require('../tables/talents');
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

  function createStats(entry, level, templateId) {
    let template = document.getElementById(templateId);
    let clone = template.content.cloneNode(true);
    clone.getElementById("level").innerText += " " + level;
    clone.getElementById("atk").innerText += " " + calculateStat(entry.baseAtk, entry.growthAtk, level, 64);
    clone.getElementById("def").innerText += " " + calculateStat(entry.baseDef, entry.growthDef, level, 64);
    clone.getElementById("agility").innerText += " " + calculateStat(entry.baseAgility, entry.growthAgility, level, 64);
    clone.getElementById("mp").innerText += " " + calculateStat(entry.baseMp, entry.growthMp, level, 1024);
    clone.getElementById("luck").innerText += " " + calculateStat(entry.baseLuck, entry.growthLuck, level, 1024);
    clone.getElementById("hp").innerText += " " + calculateHp(entry.baseHp, entry.growthHp, level);
    clone.getElementById("exp").innerText += " " + calculateExpGiven(entry.baseExp, entry.growthExp, level);
    return clone;
  }

  function createStatsForAllFloors(entry) {
    for (let i = 1; i < Object.getOwnPropertyNames(floors.enemyTable).length + 1; i++) {
      floors.enemyTable[i].forEach(floorEntry => {
        if (floorEntry.unitId === entry.unitId) {
          let cloneNode = createStats(entry, floorEntry.level, "enemy_stats_template");
          cloneNode.getElementById("floor").innerText += " " + i;
          cloneNode.getElementById("probability").innerText += " " + floorEntry.likelihood / .16 + "%";
          document.getElementById("enemy_stats").appendChild(cloneNode);
        }
      });
    }
  }

  function createStatsForAllLevels(entry) {
    for (let i = 1; i < 100; i++) {
      document.getElementById("stats_by_level").appendChild(createStats(entry, i, "stats_by_level_template"));
    }
  }

  function createEggProbabilitiesForAllFloors(entry) {
    for (let i = 1; i < 40; i++) {
      floors.eggTable[i].forEach(floorEntry => {
        if (floorEntry.unitId === entry.unitId) {
          let template = document.getElementById("egg_probabilities_template");
          let cloneNode = template.content.cloneNode(true);
          cloneNode.getElementById("floor").innerText += " " + i;
          cloneNode.getElementById("probability").innerText += " " + floorEntry.probability + "%";
          document.getElementById("egg_probabilities").appendChild(cloneNode);
        }
      });
    }
  }

  function appendTalentLink(talentEntry, templateId) {
    const clone = document.getElementById(templateId).content.cloneNode(true);
    const cloneLink = clone.getElementById("talent_link");
    cloneLink.innerText = talentEntry.name;
    cloneLink.href = "../talents/talent.html?talentId=" + talentEntry.talentId;
    document.getElementById("talents").appendChild(clone);
  }

  function createTalents(entry, templateId) {
    talents.getAllTalentsByTalentBitmask(entry.talentIds).forEach(talentEntry => appendTalentLink(talentEntry, templateId));
  }

  function jsonNameToElementName(jsonName) {
    let elementName = "";
    for (let i = 0; i < jsonName.length; i++) {
      if (jsonName[i] < "a") {
        elementName += "_" + jsonName[i].toLowerCase();
      } else {
        elementName += jsonName[i];
      }
    }
    return elementName;
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
    const unitId = parseInt(url.searchParams.get('unitId'));
    const entry = !!unitId ? units.getUnitTableEntry(unitId) : units.getUnitTableEntryByName(url.searchParams.get('name'));
    if (!entry) {
      return false;
    }
    document.getElementById("unit_name").innerText += " " + entry.name;
    const attributes = Object.getOwnPropertyNames(entry);
    attributes.forEach(attribute => {
      const foundElement = document.getElementById(jsonNameToElementName(attribute));
      if (foundElement) {
        foundElement.innerText += " " + processAttribute(attribute, entry[attribute]);
      }
    });
    createTalents(entry, "talent_template");
    createStatsForAllLevels(entry);
    createStatsForAllFloors(entry);
    createEggProbabilitiesForAllFloors(entry);
    return true;
  }

  if (window) {
    if (!pageIsSetUp) {
      setUpInnerPage()
      pageIsSetUp = true;
    }
  }
})(typeof(window) !== 'undefined' ? window : null)