(function(self) {

  let constants;

  if (self) {
    constants = self.adRando.constants
  } else {
    constants = require('../constants')
  }

  const tilesPerAxis = 64;
  const NO_SPAWN = 99;

  let exportBytes = {};

  let floor = null;
  
  function ensureHexStringHasTwoDigits(hexString) {
    if (hexString.length < 2) {
      return '0'+hexString;
    }
    return hexString;
  }

  function fillBytes(toWrite, count) {
    for (let i = 0; i < count; i++){
      exportBytes.data[exportBytes.index++] = toWrite & 0xff;
    }
  }

  function writeByte(toWrite, index) {
    if (index === null) {
      exportBytes.data[exportBytes.index++] = toWrite & 0xff;
    } else {
      exportBytes.data[index] = toWrite & 0xff;
    }
  }

  function writeUshort(toWrite, index) {
    if (index === null) {
      exportBytes.data[exportBytes.index++] = toWrite >>> 8;
      exportBytes.data[exportBytes.index++] = toWrite & 0xff;
    } else {
      exportBytes.data[index] = toWrite >>> 8;
      exportBytes.data[index+1] = toWrite & 0xff;
    }
  }

  function writeLEUshort(toWrite, index) {
    if (index === null) {
      exportBytes.data[exportBytes.index++] = toWrite & 0xff;
      exportBytes.data[exportBytes.index++] = toWrite >>> 8;
    } else {
      exportBytes.data[index] = toWrite & 0xff;
      exportBytes.data[index+1] = toWrite >>> 8;
    }
  }

  function writeLEShort(toWrite, index) {
    writeLEUshort(toWrite, index);
  }

  function putTwoBytes(toWrite, index, data) {
    data[index] = toWrite & 0xff;
    data[index+1] = toWrite >>> 8;
  }

  function writeRooms() {
    for (let room of floor.rooms) {
      writeLEUshort(room.xCoord, null);
      writeLEUshort(room.yCoord, null);
      writeLEUshort(room.xSize, null);
      writeLEUshort(room.ySize, null);
      for (let waypoint of room.waypoints) {
        writeByte(waypoint.xCoord, null);
        writeByte(waypoint.yCoord, null);
        writeLEUshort(waypoint.relativeHeight, null);
      }
      writeUshort(0, null);
    }
    fillBytes(0, 8);
  }
  
  function writeElevators() {
    for (let elevator of floor.elevators) {
      writeByte(elevator.xCoord, null);
      writeByte(elevator.yCoord, null);
      writeUshort(elevator.type, null);
    }
    writeUshort(0, null);
  }

  function writeItems() {
    let count = 0;
    for (let item of floor.items) {
      if (count++ >= 32) {
        break;
      }
      writeByte(item.xCoord, null);
      writeByte(item.yCoord, null);
      writeByte(item.id, null);
      writeByte(item.category, null);
      writeByte(item.status, null);
      writeByte(item.quality, null);
    }
    if (!floor.spawnRandomItems) {
      writeByte(NO_SPAWN, null);
      fillBytes(0, 5);
    }
    writeUshort(0, null);
  }
  
  function writeTraps() {
    let count = 0;
    for (let trap of floor.traps) {
      if (count++ >= 30) {
        break;
      }
      writeByte(trap.xCoord, null);
      writeByte(trap.yCoord, null);
      writeByte(trap.id, null);
      writeByte(constants.TYPE.TRAP, null);
      writeByte(trap.status, null);
      writeByte(trap.level, null);
    }
    if (!floor.spawnRandomTraps) {
      writeByte(NO_SPAWN, null);
      fillBytes(0, 5);
    }
    writeUshort(0, null);
    return count;
  }
  
  function writeMonsters(count) {
    for (let monster of floor.monsters) {
      if (count++ >= 31) {
        break;
      }
      writeByte(monster.xCoord, null);
      writeByte(monster.yCoord, null);
      writeByte(monster.id, null);
      writeByte(constants.TYPE.FAMILIAR, null);
      writeByte(monster.unk_0, null);
      writeByte(monster.level, null);
    }
    if (!floor.spawnRandomMonsters) {
      writeByte(NO_SPAWN, null);
      fillBytes(0, 5);
    }
    writeUshort(0, null);
  }

  function convertTilesToArray() {
    const bytesPerTile = 6;
    const unpackedSize = tilesPerAxis * tilesPerAxis * bytesPerTile;
    const unpackedFloorTiles = {
      index: 0,
      data: new Uint8Array(unpackedSize),
      straightBytesToReadCount: 0,
      numBytes: unpackedSize,
    };
    for (let tile of floor.tiles) {
      const offset = (tilesPerAxis * tile.yCoord + tile.xCoord) * bytesPerTile;
      putTwoBytes(tile.appearance, offset, unpackedFloorTiles.data);
      putTwoBytes(tile.height, offset + 2, unpackedFloorTiles.data);
      putTwoBytes(tile.status, offset + 4, unpackedFloorTiles.data);
    }
    return unpackedFloorTiles;
  }

  function areAtEnd(src) {
    return src.index === src.numBytes;
  }

  function getNumberOfMatchingBytes(src, fromIndex) {
    let matchingBytes = 0;
    while (src.index + matchingBytes < src.numBytes && matchingBytes < 0x100 &&
      src.data[src.index + matchingBytes] === src.data[fromIndex + matchingBytes]) {
        matchingBytes++;
    }
    return matchingBytes;
  }

  function getLookbackDistance(src) {
    const maxLookbackDistance = 0xfff;
    let optimalLookbackDistance = -1;
    let optimalLookbackDistanceMatchingBytes = 0;
    for (let lookbackDistance = 1; src.index >= lookbackDistance && lookbackDistance <= maxLookbackDistance; lookbackDistance++) {
      if (src.data[src.index] == src.data[src.index - lookbackDistance]) {
        const matchingBytes = getNumberOfMatchingBytes(src, src.index - lookbackDistance);
        if (matchingBytes > optimalLookbackDistanceMatchingBytes) {
          optimalLookbackDistance = lookbackDistance;
          optimalLookbackDistanceMatchingBytes = matchingBytes;
        }
      }
    }
    src.straightBytesToReadCount = optimalLookbackDistanceMatchingBytes;
    return optimalLookbackDistance;
  }

  function pushControlBit(pushedBit) {
    const indexOfLastBitInByte = 7;
    if (exportBytes.controlBitIndex <= 0) {
      console.log("\nWriting control byte " + ensureHexStringHasTwoDigits(exportBytes.controlByte.toString(16)));
      writeByte(exportBytes.controlByte, exportBytes.controlIndex);
      exportBytes.controlIndex = exportBytes.index;
      exportBytes.index++;
      exportBytes.controlByte = pushedBit << indexOfLastBitInByte;
      exportBytes.controlBitIndex = indexOfLastBitInByte;
    } else {
      exportBytes.controlByte >>= 1;
      exportBytes.controlByte |= (pushedBit << indexOfLastBitInByte);
      exportBytes.controlBitIndex--;
    }
  }

  function packData(src) {
    const maxIndex = 8;
    exportBytes.controlIndex= exportBytes.index;
    exportBytes.controlByte= 0;
    exportBytes.controlBitIndex= 0;
   
    let lookbackDistance = 0;
    do {
       /* Read a control byte. For each 0 bit from LS to MS,
        * copy a byte from src to set. If exhaust the control
        * byte, read another. If encounter 1 bit, stop.*/
      while (true) {
        if (areAtEnd(src)) {
          pushControlBit(1);
          pushControlBit(0);
          exportBytes.data[exportBytes.controlIndex] = exportBytes.controlByte >> (maxIndex - exportBytes.controlBitIndex);
          return exportBytes;
        }
        lookbackDistance = getLookbackDistance(src);
        if (src.straightBytesToReadCount > 1) {
          pushControlBit(1);
          break;
        }
        pushControlBit(0);
        exportBytes.data[exportBytes.index++] = src.data[src.index++];
        console.log("new " + ensureHexStringHasTwoDigits(exportBytes.data[exportBytes.index-1].toString(16)));
      }
      console.log("\nLookback " + lookbackDistance + "  repeatCount " + src.straightBytesToReadCount);
  
      if (lookbackDistance > 0x100 || src.straightBytesToReadCount > 5 || src.straightBytesToReadCount == 1) {
        pushControlBit(0);
        if (src.straightBytesToReadCount > 0x11 || src.straightBytesToReadCount <= 2) {
          console.log("        lookbackUshort " + (lookbackDistance << 4).toString(16) + "  ");
          writeUshort(lookbackDistance << 4, null);
          console.log("repeatByte "+ ensureHexStringHasTwoDigits((src.straightBytesToReadCount - 1).toString(16)));
          writeByte(src.straightBytesToReadCount - 1, null);
        } else {
          console.log("        lookback|repeat  "+ ((lookbackDistance << 4) | (src.straightBytesToReadCount - 2)).toString(16));
          writeUshort((lookbackDistance << 4) | (src.straightBytesToReadCount - 2), null);
        }
      } else {
        pushControlBit(1);
        let bytesToReadLess2 = src.straightBytesToReadCount - 2;
        pushControlBit((bytesToReadLess2 & 0x2) >> 1);
        pushControlBit(bytesToReadLess2 & 0x1);
        if (lookbackDistance == 0x100) {
          lookbackDistance = 0;
        }
        console.log("        Bits + repeatByte " + ensureHexStringHasTwoDigits(src.straightBytesToReadCount.toString(16)));
        writeByte(lookbackDistance, null);
      }
      src.index += src.straightBytesToReadCount;
    } while (true);
  }

  function writeTiles() {
    const unpackedTiles = convertTilesToArray();
    packData(unpackedTiles);
  }

  function writeFloor(floorToWrite) {
    floor = floorToWrite;
    exportBytes = {  data: new Uint8Array(floor.sizeInSectors * constants.sectorDataSize),
      index: 0,
      controlIndex: 0,
      controlByte: 0,
      controlBitIndex: 0,
    }
    
    writeLEUshort(6, null);
    writeLEUshort(6, null);
  
    writeRooms();
    writeElevators();
    writeItems();
    writeTraps();
    writeMonsters();
    writeTiles();
    return exportBytes;
  }

  const exports = {
    writeFloor: writeFloor,
  }
  if (self) {
    self.adRando = Object.assign(self.adRando || {}, {
      pack: exports,
    })
  } else {
    module.exports = exports
  }
}) (typeof(self) !== 'undefined' ? self : null)
