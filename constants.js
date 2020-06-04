(function(self) {

  const defaultOptions = 'P:safe'

  const TYPE = {
    HERB:     0x1,
    FRUIT:    0x2,
    SEED:     0x3,
    BALL:     0x4,
    SCROLL:   0x5,
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
    ELEVATOR: 0x14,
    TRAP:     0x15,
  }

  const TRAP_TYPES = {
    spawns: 0, //pseudo type
    reversal: 1,
    slow: 2,
    warp: 3,
    goUp: 4,
    chaos: 5,
    //blank
    bomb: 7,
    slam: 8,
    sleep: 9,
    blinder: 10,
    poison: 11,
    prison: 12,
    frog: 13,
    bump: 14,
    crack: 15,
    upheaval: 16,
    seal: 17,
    rust: 18,
    monsterDen: 19,
  }

  const rowLength = {
    trap: 12,
    initialStats: 24,
    statGrowth: 8,
  }

  const romAddresses = {
    balloonDescription:      0x10ca8, //RAM 0x8002f220
    malletDescription:       0x10e40, //RAM 0x8002f3b8
    ropeDescription:         0x10e84, //RAM 0x8002f3ec
    goUpTrapDescription:     0x13260, //RAM 0x80031318
    anUpperFloorText:        0x1329b, //RAM 0x80031353
    initialRedCollarStatus:  0x1ecd8, //RAM 0x8003b5d0
    pauseAfterDeathText:     0x55b71,
    initialStatsTable:       0x57f30, //RAM 0x8006d168
    elevatorIcon:            0x5e786, //RAM 0x80072cae
    suspiciousElevatorDesc:  0x5e7a4, //RAM 0x80072ccc
    trapTable:               0x5e7a8, //RAM 0x80072cd0
    itemCategoryTable:       0x5f01c, //RAM 0x80073414
    elevatorUseOptions:      0x5f1bc, //RAM 0x800735b4
    itemCategoryNamesKanji:  0x6f128, //RAM 0x800813e0
    markQuestAsLoaded1:     0x6cc7f8, //RAM 0x80022090
    markQuestAsLoaded2:     0x6cc814, //RAM 0x800220ac
    towerItemCap:           0x70f624, //RAM 0x800a0c5c
    angelFirstWord:         0xee5f97,
    checkKohDeathTopFloor: 0x1c5e360, //RAM 0x8008e058
    pauseAfterDeathCode:   0x1c5e470,
    elevatorAltPath:       0x1c6a62f, //RAM 0x80098a37
    beldoCrashFixPart1:    0x1c6c354, //RAM 0x8009a3cc
    beldoCrashFixPart2:    0x1c6d498, //RAM 0x8009b2b0
    placeMonsterRollGamma: 0x1c73950, //RAM 0x800a0a58
    placeMonsterLeveledUp: 0x1c73a00, //RAM 0x800a0b08
    turnMonsterSpawnRate:  0x1c73d14, //RAM 0x800a0e1c
    popupExperience1:      0x1c762a4, //RAM 0x800a2eec
    popupExperience2:      0x1c76450, //RAM 0x800a2f68
    initMonsterSpawnRate:  0x1c7a720, //RAM 0x800a69e8
    resetElementStartAtk:  0x1c88fd0, //RAM 0x800b34e8
    resetElementAfterMix:  0x1c898cc, //RAM 0x800b3cb4
    experiencePopupBug:    0x1c8ad8c, //RAM 0x800b4f14
    eggBombLevelUp:        0x1c8dee4, //RAM 0x800b794c
    goUpTrapIncrement:     0x1ca4fe8, //RAM 0x800cbad0
    monsterDenLeveledUp:   0x1ca88b0, //RAM 0x800cec78
    usedBallItemTable:     0x1cb922c, //RAM 0x800dd384
    statGrowthTable:       0x1cb9c94, //RAM 0x800ddcbc
    itemCategDamageTable:  0x1cb95ac, //RAM 0x800dd704
    salamParticleGraphic:  0x1cbc978, //RAM 0x800e03b0
    isExhaustedBattleText: 0x1cbcc3c,
    toUpstairsBattleText:  0x1cbe450, //RAM 0x800e1af8
    hardcodeKohProperty1:  0x1ea5094, //RAM 0x800170dc
    multiElevatorSpawns1:  0x1ea5b1c, //RAM 0x80017a34
    predefElevatorAppear1: 0x1ea68cf, //RAM 0x800186b7
    callCheckFor2ndTower1: 0x1ea692c, //RAM 0x80018714
    callReplaceKewneTut1:  0x1ea7210, //RAM 0x80018ec8
    floor2CheckFirstTime1: 0x1ea7324, //RAM 0x80018fdc
    tutorialFloorId1:      0x1ea75b8, //RAM 0x80019140
    checkIfTower2Availbl1: 0x1ea7f70, //RAM 0x800199c8
    windCrystalCheck1:     0x1ead384, //RAM 0x8001e32c
    trapRollMaxSingleRm1:  0x1eae330, //RAM 0x8001f078
    setTrapsInitBudget1:   0x1eae388, //RAM 0x8001f0d0
    trapRollMaxPerFloor1:  0x1eae398, //RAM 0x8001f0e0
    setTrapsChooseType1:   0x1eae410, //RAM 0x8001f158
    trapRollLowestId1:     0x1eae420, //RAM 0x8001f168
    hardcodeKohProperty2:  0x217ede4, //RAM 0x800170dc
    multiElevatorSpawns2:  0x217f86c, //RAM 0x80017a34
    predefElevatorAppear2: 0x218061f, //RAM 0x800186b7
    callCheckFor2ndTower2: 0x218067c, //RAM 0x80018714
    callReplaceKewneTut2:  0x2180f60, //RAM 0x80018ec8
    floor2CheckFirstTime2: 0x2181074, //RAM 0x80018fdc
    tutorialFloorId2:      0x2181308, //RAM 0x80019140
    checkIfTower2Availbl2: 0x2181cc0, //RAM 0x800199c8
    windCrystalCheck2:     0x21870d4, //RAM 0x8001e32c
    trapRollMaxSingleRm2:  0x2188080, //RAM 0x8001f078
    setTrapsInitBudget2:   0x21880d8, //RAM 0x8001f0d0
    trapRollMaxPerFloor2:  0x21880e8, //RAM 0x8001f0e0
    setTrapsChooseType2:   0x2188160, //RAM 0x8001f158
    trapRollLowestId2:     0x2188170, //RAM 0x8001f168
    floorMonsterTable:     0x24638e8, //RAM 0x800ddc7c
    tutorialFloorLayout:   0x248ce50,
    tutorialElevatorYpos:  0x248cf73,
    tutorialStartingItems: 0x248cf78, // X Y ID category status quality
    tutorialTrap:          0x248cf9e, // X Y ID category
    tutorialPulunpa:       0x248cfac, // X Y ID category ??? level
    tutorialNewElevator:   0x248d844,
    f2suspElevAppearance:  0x2492b66, //RAM 0x800eadb0
    f2waterAppearance:     0x2492c87,
    debugFloorLayout:      0x2493360, 
    debugFloorElevator:    0x249338e, // X Y 00 00 00 00
    debugFloorFirstItem:   0x2493394, // X Y ID category status quality
    debugFloorItemEnd:     0x2493514,
    kohsReplyToGhoshPart:  0x2497096, //RAM 0x800f8dfe (this is the space after "[No thank")
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

  const lcgConstants = {modulus: 0x1fffFFFFffff, multiplier: 0x5DEECE66D, increment: 11,}

  const exports = {
    defaultOptions: defaultOptions,
    TYPE: TYPE,
    TRAP_TYPES: TRAP_TYPES,
    rowLength: rowLength,
    romAddresses: romAddresses,
    monsterStats: monsterStats,
    spells: spells,
    lcgConstants: lcgConstants,
    sectorSize: 0x930,
    sectorDataSize: 0x800,
    headerSize: 0x18,
  }
  if (self) {
    self.adRando = Object.assign(self.adRando || {}, {
      constants: exports,
    })
  } else {
    module.exports = exports
  }
})(typeof(self) !== 'undefined' ? self : null)
