(function(self) {

  const defaultOptions = 'P:safe'

  const TYPE = {
    HERB:     0x1,
    FRUIT:    0x2,
    SEED:     0x3,
    BALL:     0x4,
    BEAM:     0x5,
    CRYSTAL:  0x6,
    BELL:     0x7,
    GLASSES:  0x8,
    LOUPE:    0x9,
    SAND:     0xA,
    GIFT:     0xB,
    SPECIAL:  0xC,
    QUEST:    0xD,
    COIN:     0xE,
    SWORD:    0xF,
    WAND:     0x10,
    SHIELD:   0x11,
    EGG:      0x12,
    FAMILIAR: 0x13,
    TRAP:     0x15,
  }

  const romAddresses = {
    pauseAfterDeathText:     0x55b71,
    initialStatsTable:       0x57f30, //RAM 0x8006d168
    trapTable:               0x5e7a8, //RAM 0x80072cd0
    angelFirstWord:         0xee5f97,
    checkKohDeathTopFloor: 0x1c5e360, //RAM 0x8008e058
    pauseAfterDeathCode:   0x1c5e470,
    beldoCrashFixPart1:    0x1c6c354, //RAM 0x8009a3cc
    beldoCrashFixPart2:    0x1c6d498, //RAM 0x8009b2b0
    turnMonsterSpawnRate:  0x1c73d14, //RAM 0x800a0e1c
    initMonsterSpawnRate:  0x1c7a720, //RAM 0x800a69e8
    goUpTrapIncrement:     0x1ca4fe8, //RAM 0x800cbad0
    statGrowthTable:       0x1cb9c94, //RAM 0x800ddcbc
    isExhaustedBattleText: 0x1cbcc3c,
    multiElevatorSpawns1:  0x1ea5b1c, //RAM 0x80017a34
    trapRollMaxSingleRm1:  0x1eae330, //RAM 0x8001f078
    trapRollMaxPerFloor1:  0x1eae398, //RAM 0x8001f0e0
    trapRollLowestId1:     0x1eae420, //RAM 0x8001f168
    multiElevatorSpawns2:  0x217f86c, //RAM 0x80017a34
    trapRollMaxSingleRm2:  0x2188080, //RAM 0x8001f078
    trapRollMaxPerFloor2:  0x21880e8, //RAM 0x8001f0e0
    trapRollLowestId2:     0x2188170, //RAM 0x8001f168
    floorMonsterTable:     0x24638e8, //RAM 0x800ddc7c
    tutorialFloorLayout:   0x248ce50,
    tutorialElevatorYpos:  0x248cf73,
    tutorialStartingItems: 0x248cf78, // X Y ID category status quality
    tutorialTrap:          0x248cf9e, // X Y ID category
    tutorialPulunpa:       0x248cfac, // X Y ID category ??? level
    beldoLocation:         0x263cbb2, //RAM 0x800e604a
    beldoLevel:            0x263cbb7,
    beldoSetFast:          0x31cddcc, //RAM 0x80169fa4
    beldoInvulnerability:  0x31d0aa0, //RAM 0x8016c688
    customBeldoCode:       0x31d6ed4, //RAM 0x80171dac
    beldoIdle:             0x31d91b4, //RAM 0x80173bcc
  }

  //offsets in bytes
  const monsterStats = {
    attack: 0,
    defense: 1,
    agility: 2,
    luck: 3,
    mp: 4,
    hp: 5,
    xpGiven: 6,
    spell1Id: 8,
    spell1Level: 9,
    spell1LevelAlt: 10,
    spell2Id: 11,
    spell2Level: 12,
    spell2LevelAlt: 13,
    spell3Id: 14,
    spell3Level: 15,
    spell3LevelAlt: 16,
    level: 17,
    ai: 18, //maybe? seems unused
    id: 19,
    element: 20,
    pushable: 21,
    flyingLiftable: 22, //04 Flying 08 liftable
  }

  const spells = {
    poison: 0x0d,
    lagrave: 0x2b,
  }

  const initialStatsRowLength = 24;
  const statGrowthRowLength = 8;

  const lcgConstants = {modulus: 0x1fffFFFFffff, multiplier: 0x5DEECE66D, increment: 11,}

  const exports = {
    defaultOptions: defaultOptions,
    TYPE: TYPE,
    romAddresses: romAddresses,
    monsterStats: monsterStats,
    spells: spells,
    initialStatsRowLength: initialStatsRowLength,
    statGrowthRowLength: statGrowthRowLength,
    lcgConstants: lcgConstants,
    sectorSize: 0x930,
  }
  if (self) {
    self.adRando = Object.assign(self.adRando || {}, {
      constants: exports,
    })
  } else {
    module.exports = exports
  }
})(typeof(self) !== 'undefined' ? self : null)
