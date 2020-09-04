(function(window) {

  let constants;
  let monsters;
  let floors;

  if (self) {
    constants = self.adRando.constants;
    monsters = self.adRando.monsters;
    floors = self.adRando.floors;
  } else {
    constants = require('../constants');
    monsters = require('../monsters');
    floors = require('../guide/tables/floors');
  }

  const monsterSlotsPerFloor = 16;
  const maxMonsterId = 0x2d;
  const maxFloor = 39;

  let copy;
  
  const elems = {};

  let pageIsSetUp = false;


  function getFloorSpawnsByNumber(floorArray, floorNumber) {
    if (floorArray[floorNumber - 1] && floorArray[floorNumber - 1].floor == floorNumber) {
      return floorArray[floorNumber - 1];
    }
    return floorArray.filter(floorEntry => floorEntry.floor == floorNumber)[0];
  }

  function tryParsingJson(data) {
    try {
      const floorSpawns = JSON.parse(data);
      const floorContainers = document.getElementsByName('floor-container');
      for (let i = 0; i < floorContainers.length; i++) {
        setFloorNodeByObject(floorContainers[i], getFloorSpawnsByNumber(floorSpawns.monsters, i + 1));
      }
    } catch (error) {
      logToOutput(error.message);
    }
  }

  function importFileHandler(event) {
    if (elems.importFile.files[0]) {
      const reader = new FileReader();
      reader.onload = function() {
        tryParsingJson(this.result);
      }
      reader.readAsText(elems.importFile.files[0]);
    }
    event.preventDefault();
    event.stopPropagation();
  }

  function exportFileHandler(event) {
    const exportText = {'monsters':[]}
    const floorContainers = document.getElementsByName('floor-container');
    for (let i = 0; i < floorContainers.length; i++){
      exportText.monsters[i] = getFloorNodeAsObject(floorContainers[i]);
    }
    const urlDownload = URL.createObjectURL(new Blob([JSON.stringify(exportText)], {
      type: 'text/json; charset=UTF-8',
    }));
    const downloadFileElem = document.getElementById('download-file');
    downloadFileElem.href = urlDownload;
    downloadFileElem.download = 'customSpawns.json';
    downloadFileElem.click();
    URL.revokeObjectURL(urlDownload);
    event.preventDefault();
    event.stopPropagation();
  }

  async function logToOutput(message) {
    elems.importOutput.value = message;
    await new Promise(handler => setTimeout(handler, 5000));
    elems.importOutput.value = '';
  }

  function getFloorNodeAsObject(floorNode) {
    const floorNumber = floorNode.getElementsByClassName('floor-number')[0];
    const result = {'floor': parseInt(floorNumber.innerText), 'spawns':[]};
    const spawnNodes = floorNode.getElementsByTagName('fieldset');
    for (let slot = 0; slot < spawnNodes.length; slot++) {
      result['spawns'][slot]={'unitId': parseInt(spawnNodes[slot].getElementsByTagName('select')[0].value),
                               'level': parseInt(spawnNodes[slot].getElementsByTagName('input')[0].value)};
    }
    return result;
  }

  function setFloorNodeByObject(floorNode, spawns) {
    const spawnNodes = floorNode.getElementsByTagName('fieldset');
    for (let slot = 0; slot < spawnNodes.length; slot++) {
      spawnNodes[slot].getElementsByTagName('select')[0].value = spawns.spawns[slot].unitId & 0xff;
      spawnNodes[slot].getElementsByTagName('input')[0].value = spawns.spawns[slot].level & 0xff;
    }
  }

  function onPaste(event) {
    //make paste button appear
    setFloorNodeByObject(event.target.parentNode.parentNode, copy);
    event.preventDefault();
    event.stopPropagation();
  }

  function onCopy(event) {
    //make paste button appear
    if (!copy) {
      let customStyles;
      for (let i = 0; i < document.styleSheets.length; i++) {
        if (document.styleSheets[i].href.endsWith("/index.css")) {
          customStyles = document.styleSheets[i];
          break;
        }
      }
      for (let i = 0; i < customStyles.rules.length; i++) {
        if (customStyles.rules[i].selectorText === 'div.hflow #paste') {
          customStyles.deleteRule(i);
          break;
        }
      }
      customStyles.insertRule('div.hflow #paste { display: inherit;}');
    }
    copy = getFloorNodeAsObject(event.target.parentNode.parentNode);
    event.preventDefault();
    event.stopPropagation();
  }

  function setUpPage() {
    const allFloorsNode = document.getElementById('spawns-area');
    for (let floor = 1; floor <= maxFloor; floor++) {
      const floorNode = document.getElementById('floor-template').content.cloneNode(true);
      if (floor % 2 != 0) {
        floorNode.getElementById("floor-container").classList.add("soft-bg");
      }
      floorNode.getElementById('copy').addEventListener('click', onCopy);
      floorNode.getElementById('paste').addEventListener('click', onPaste);

      floorNode.getElementById('floor-number').innerText = floor;

      const floorTable = floors.enemyTable[floor];
      for (let slot = 0; slot < monsterSlotsPerFloor; slot++) {
        let floorTableEntry;
        let slotUsage = 0;
        for (tableIndex = 0; tableIndex < floorTable.length; tableIndex++) {
          if (slot < slotUsage + floorTable[tableIndex].likelihood) {
            floorTableEntry = floorTable[tableIndex];
            break;
          } else {
            slotUsage += floorTable[tableIndex].likelihood;
          }
        }
        const spawnNode = document.getElementById('spawn-template').content.cloneNode(true);
        spawnNode.getElementById('monster-level').value = floorTableEntry.level;
        const monsterNode = spawnNode.getElementById('monster-id');
        const noneOption = document.createElement('option');
        noneOption.value = 0;
        noneOption.innerText = "None";
        monsterNode.appendChild(noneOption);
        monsters.allMonsters.forEach(function(monster) {
          if (monster.ID > 0 && monster.ID <= maxMonsterId) {
            const option = document.createElement('option');
            option.value = monster.ID;
            option.id = 'monster-' + monster.name;
            option.innerText = monster.name;
            monsterNode.appendChild(option);
          }
        })
        monsterNode.value = floorTableEntry.unitId;
        const floorSpawns = floorNode.getElementById('floor-spawns');
        floorSpawns.appendChild(spawnNode);
      }
      allFloorsNode.appendChild(floorNode);
    }
    elems.importOutput = document.getElementById('import-output');
    elems.importFile = document.getElementById('import-file');
    elems.importFile.addEventListener('change', importFileHandler);
    document.getElementById('export-file').addEventListener('click', exportFileHandler);
    return true;
  }

  if (window) {
    if (!pageIsSetUp) {
      pageIsSetUp = setUpPage();
    }
  }
})(typeof(window) !== 'undefined' ? window : null)