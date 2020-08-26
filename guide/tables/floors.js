(function(self) {

  const enemyTable = {
    1:  [{unitId: 0x15, level: 0x01, likelihood: 8}, {unitId: 0x16, level: 0x02, likelihood: 4}, {unitId: 0x17, level: 0x01, likelihood: 4}],
    2:  [{unitId: 0x06, level: 0x03, likelihood: 1}, {unitId: 0x15, level: 0x01, likelihood: 4}, {unitId: 0x16, level: 0x02, likelihood: 5}, {unitId: 0x17, level: 0x01, likelihood: 6}],
    3:  [{unitId: 0x06, level: 0x03, likelihood: 3}, {unitId: 0x15, level: 0x01, likelihood: 3}, {unitId: 0x16, level: 0x02, likelihood: 7}, {unitId: 0x1D, level: 0x04, likelihood: 3}],
    4:  [{unitId: 0x06, level: 0x03, likelihood: 5}, {unitId: 0x16, level: 0x02, likelihood: 5}, {unitId: 0x19, level: 0x05, likelihood: 1}, {unitId: 0x1D, level: 0x04, likelihood: 5}],
    5:  [{unitId: 0x06, level: 0x03, likelihood: 4}, {unitId: 0x19, level: 0x05, likelihood: 4}, {unitId: 0x1D, level: 0x04, likelihood: 4}, {unitId: 0x1E, level: 0x05, likelihood: 4}],
    6:  [{unitId: 0x19, level: 0x05, likelihood: 5}, {unitId: 0x1B, level: 0x06, likelihood: 4}, {unitId: 0x1D, level: 0x04, likelihood: 2}, {unitId: 0x1E, level: 0x05, likelihood: 5}],
    7:  [{unitId: 0x18, level: 0x07, likelihood: 3}, {unitId: 0x19, level: 0x05, likelihood: 3}, {unitId: 0x1B, level: 0x06, likelihood: 6}, {unitId: 0x1E, level: 0x05, likelihood: 4}],
    8:  [{unitId: 0x10, level: 0x08, likelihood: 2}, {unitId: 0x18, level: 0x07, likelihood: 4}, {unitId: 0x1B, level: 0x06, likelihood: 6}, {unitId: 0x1E, level: 0x05, likelihood: 4}],
    9:  [{unitId: 0x10, level: 0x08, likelihood: 5}, {unitId: 0x18, level: 0x07, likelihood: 5}, {unitId: 0x1A, level: 0x09, likelihood: 2}, {unitId: 0x1B, level: 0x06, likelihood: 4}],
    10: [{unitId: 0x10, level: 0x08, likelihood: 3}, {unitId: 0x16, level: 0x0A, likelihood: 6}, {unitId: 0x1A, level: 0x09, likelihood: 4}, {unitId: 0x1C, level: 0x0B, likelihood: 3}],
    11: [{unitId: 0x08, level: 0x0C, likelihood: 3}, {unitId: 0x16, level: 0x0A, likelihood: 5}, {unitId: 0x1A, level: 0x09, likelihood: 4}, {unitId: 0x1C, level: 0x0B, likelihood: 4}],
    12: [{unitId: 0x08, level: 0x0C, likelihood: 4}, {unitId: 0x1A, level: 0x09, likelihood: 5}, {unitId: 0x1A, level: 0x0B, likelihood: 1}, {unitId: 0x1C, level: 0x0B, likelihood: 4}, {unitId: 0x21, level: 0x0D, likelihood: 2}],
    13: [{unitId: 0x08, level: 0x0C, likelihood: 6}, {unitId: 0x0E, level: 0x0E, likelihood: 3}, {unitId: 0x1C, level: 0x0B, likelihood: 3}, {unitId: 0x21, level: 0x0D, likelihood: 4}],
    14: [{unitId: 0x0E, level: 0x0E, likelihood: 5}, {unitId: 0x16, level: 0x0F, likelihood: 4}, {unitId: 0x21, level: 0x0D, likelihood: 4}, {unitId: 0x29, level: 0x10, likelihood: 3}],
    15: [{unitId: 0x0E, level: 0x0E, likelihood: 5}, {unitId: 0x16, level: 0x0F, likelihood: 4}, {unitId: 0x21, level: 0x0D, likelihood: 1}, {unitId: 0x29, level: 0x10, likelihood: 6}],
    16: [{unitId: 0x16, level: 0x0F, likelihood: 5}, {unitId: 0x1E, level: 0x0F, likelihood: 5}, {unitId: 0x1F, level: 0x14, likelihood: 1}, {unitId: 0x29, level: 0x10, likelihood: 5}],
    17: [{unitId: 0x16, level: 0x02, likelihood: 2}, {unitId: 0x16, level: 0x0A, likelihood: 3}, {unitId: 0x16, level: 0x0F, likelihood: 2}, {unitId: 0x1E, level: 0x0F, likelihood: 3}, {unitId: 0x20, level: 0x11, likelihood: 5}, {unitId: 0x29, level: 0x10, likelihood: 1}],
    18: [{unitId: 0x0C, level: 0x12, likelihood: 6}, {unitId: 0x1E, level: 0x0F, likelihood: 3}, {unitId: 0x20, level: 0x11, likelihood: 7}],
    19: [{unitId: 0x0C, level: 0x12, likelihood: 6}, {unitId: 0x1E, level: 0x0F, likelihood: 2}, {unitId: 0x20, level: 0x11, likelihood: 4}, {unitId: 0x22, level: 0x13, likelihood: 4}],
    20: [{unitId: 0x0C, level: 0x12, likelihood: 4}, {unitId: 0x12, level: 0x14, likelihood: 4}, {unitId: 0x22, level: 0x13, likelihood: 4}, {unitId: 0x24, level: 0x15, likelihood: 4}],
    21: [{unitId: 0x12, level: 0x14, likelihood: 5}, {unitId: 0x15, level: 0x01, likelihood: 2}, {unitId: 0x15, level: 0x10, likelihood: 1}, {unitId: 0x22, level: 0x13, likelihood: 4}, {unitId: 0x24, level: 0x15, likelihood: 4}],
    22: [{unitId: 0x12, level: 0x14, likelihood: 4}, {unitId: 0x14, level: 0x16, likelihood: 2}, {unitId: 0x15, level: 0x01, likelihood: 4}, {unitId: 0x15, level: 0x10, likelihood: 1}, {unitId: 0x24, level: 0x15, likelihood: 5}],
    23: [{unitId: 0x12, level: 0x14, likelihood: 5}, {unitId: 0x14, level: 0x16, likelihood: 4}, {unitId: 0x23, level: 0x17, likelihood: 1}, {unitId: 0x24, level: 0x15, likelihood: 6}],
    24: [{unitId: 0x14, level: 0x16, likelihood: 7}, {unitId: 0x23, level: 0x17, likelihood: 1}, {unitId: 0x24, level: 0x15, likelihood: 5}, {unitId: 0x26, level: 0x18, likelihood: 3}],
    25: [{unitId: 0x14, level: 0x16, likelihood: 3}, {unitId: 0x20, level: 0x11, likelihood: 1}, {unitId: 0x23, level: 0x17, likelihood: 6}, {unitId: 0x26, level: 0x18, likelihood: 6}],
    26: [{unitId: 0x0A, level: 0x19, likelihood: 5}, {unitId: 0x1F, level: 0x14, likelihood: 1}, {unitId: 0x26, level: 0x18, likelihood: 6}, {unitId: 0x27, level: 0x1A, likelihood: 4}],
    27: [{unitId: 0x0A, level: 0x19, likelihood: 5}, {unitId: 0x1E, level: 0x19, likelihood: 4}, {unitId: 0x26, level: 0x18, likelihood: 3}, {unitId: 0x27, level: 0x1A, likelihood: 4}],
    28: [{unitId: 0x0A, level: 0x19, likelihood: 4}, {unitId: 0x1E, level: 0x19, likelihood: 5}, {unitId: 0x25, level: 0x1B, likelihood: 3}, {unitId: 0x27, level: 0x1A, likelihood: 4}],
    29: [{unitId: 0x0A, level: 0x19, likelihood: 5}, {unitId: 0x1E, level: 0x19, likelihood: 5}, {unitId: 0x25, level: 0x1B, likelihood: 5}, {unitId: 0x28, level: 0x1C, likelihood: 1}],
    30: [{unitId: 0x1E, level: 0x19, likelihood: 2}, {unitId: 0x25, level: 0x1B, likelihood: 3}, {unitId: 0x28, level: 0x1C, likelihood: 7}, {unitId: 0x2B, level: 0x1D, likelihood: 4}],
    31: [{unitId: 0x03, level: 0x1D, likelihood: 4}, {unitId: 0x25, level: 0x1B, likelihood: 1}, {unitId: 0x28, level: 0x1C, likelihood: 5}, {unitId: 0x2B, level: 0x1D, likelihood: 6}],
    32: [{unitId: 0x03, level: 0x1D, likelihood: 4}, {unitId: 0x28, level: 0x1C, likelihood: 4}, {unitId: 0x2A, level: 0x1E, likelihood: 4}, {unitId: 0x2B, level: 0x1D, likelihood: 4}],
    33: [{unitId: 0x03, level: 0x1D, likelihood: 5}, {unitId: 0x2A, level: 0x1E, likelihood: 6}, {unitId: 0x2B, level: 0x1D, likelihood: 3}, {unitId: 0x2C, level: 0x1E, likelihood: 2}],
    34: [{unitId: 0x03, level: 0x1D, likelihood: 4}, {unitId: 0x2A, level: 0x1E, likelihood: 5}, {unitId: 0x2B, level: 0x1D, likelihood: 2}, {unitId: 0x2C, level: 0x1E, likelihood: 5}],
    35: [{unitId: 0x03, level: 0x1D, likelihood: 4}, {unitId: 0x2A, level: 0x1E, likelihood: 5}, {unitId: 0x2C, level: 0x1E, likelihood: 6}, {unitId: 0x2D, level: 0x1E, likelihood: 1}],
    36: [{unitId: 0x1F, level: 0x14, likelihood: 1}, {unitId: 0x2A, level: 0x1E, likelihood: 5}, {unitId: 0x2C, level: 0x1E, likelihood: 5}, {unitId: 0x2D, level: 0x1E, likelihood: 5}],
    37: [{unitId: 0x03, level: 0x1D, likelihood: 4}, {unitId: 0x2A, level: 0x1E, likelihood: 4}, {unitId: 0x2C, level: 0x1E, likelihood: 4}, {unitId: 0x2D, level: 0x1E, likelihood: 4}],
    38: [{unitId: 0x03, level: 0x1D, likelihood: 4}, {unitId: 0x2A, level: 0x1E, likelihood: 4}, {unitId: 0x2C, level: 0x1E, likelihood: 4}, {unitId: 0x2D, level: 0x1E, likelihood: 4}],
    39: [{unitId: 0x03, level: 0x1D, likelihood: 4}, {unitId: 0x2A, level: 0x1E, likelihood: 4}, {unitId: 0x2C, level: 0x1E, likelihood: 4}, {unitId: 0x2D, level: 0x1E, likelihood: 4}],
    40: [{unitId: 0x38, level: 0x63, likelihood: 16}]
  }

  const eggTable = {
    1:  [{unitId: 0x06, probability: 15.625}, {unitId: 0x15, probability: 15.625}, {unitId: 0x16, probability: 12.5}, {unitId: 0x17, probability: 18.75}, {unitId: 0x19, probability: 12.5}, {unitId: 0x1B, probability: 9.375}, {unitId: 0x1D, probability: 9.375}, {unitId: 0x1E, probability: 6.25},],
    2:  [{unitId: 0x06, probability: 15.625}, {unitId: 0x15, probability: 15.625}, {unitId: 0x16, probability: 12.5}, {unitId: 0x17, probability: 18.75}, {unitId: 0x19, probability: 12.5}, {unitId: 0x1B, probability: 9.375}, {unitId: 0x1D, probability: 9.375}, {unitId: 0x1E, probability: 6.25},],
    3:  [{unitId: 0x06, probability: 15.625}, {unitId: 0x15, probability: 15.625}, {unitId: 0x16, probability: 12.5}, {unitId: 0x17, probability: 18.75}, {unitId: 0x19, probability: 12.5}, {unitId: 0x1B, probability: 9.375}, {unitId: 0x1D, probability: 9.375}, {unitId: 0x1E, probability: 6.25},],
    4:  [{unitId: 0x06, probability: 15.625}, {unitId: 0x15, probability: 15.625}, {unitId: 0x16, probability: 12.5}, {unitId: 0x17, probability: 18.75}, {unitId: 0x19, probability: 12.5}, {unitId: 0x1B, probability: 9.375}, {unitId: 0x1D, probability: 9.375}, {unitId: 0x1E, probability: 6.25},],
    5:  [{unitId: 0x06, probability: 15.625}, {unitId: 0x15, probability: 15.625}, {unitId: 0x16, probability: 12.5}, {unitId: 0x17, probability: 18.75}, {unitId: 0x19, probability: 12.5}, {unitId: 0x1B, probability: 9.375}, {unitId: 0x1D, probability: 9.375}, {unitId: 0x1E, probability: 6.25},],
    6:  [{unitId: 0x10, probability: 9.375}, {unitId: 0x18, probability: 9.375}, {unitId: 0x19, probability: 15.625}, {unitId: 0x1A, probability: 9.375}, {unitId: 0x1B, probability: 18.75}, {unitId: 0x1C, probability: 9.375}, {unitId: 0x1D, probability: 15.625}, {unitId: 0x1E, probability: 12.5},],
    7:  [{unitId: 0x10, probability: 9.375}, {unitId: 0x18, probability: 9.375}, {unitId: 0x19, probability: 15.625}, {unitId: 0x1A, probability: 9.375}, {unitId: 0x1B, probability: 18.75}, {unitId: 0x1C, probability: 9.375}, {unitId: 0x1D, probability: 15.625}, {unitId: 0x1E, probability: 12.5},],
    8:  [{unitId: 0x10, probability: 9.375}, {unitId: 0x18, probability: 9.375}, {unitId: 0x19, probability: 15.625}, {unitId: 0x1A, probability: 9.375}, {unitId: 0x1B, probability: 18.75}, {unitId: 0x1C, probability: 9.375}, {unitId: 0x1D, probability: 15.625}, {unitId: 0x1E, probability: 12.5},],
    9:  [{unitId: 0x10, probability: 9.375}, {unitId: 0x18, probability: 9.375}, {unitId: 0x19, probability: 15.625}, {unitId: 0x1A, probability: 9.375}, {unitId: 0x1B, probability: 18.75}, {unitId: 0x1C, probability: 9.375}, {unitId: 0x1D, probability: 15.625}, {unitId: 0x1E, probability: 12.5},],
    10: [{unitId: 0x10, probability: 9.375}, {unitId: 0x18, probability: 9.375}, {unitId: 0x19, probability: 15.625}, {unitId: 0x1A, probability: 9.375}, {unitId: 0x1B, probability: 18.75}, {unitId: 0x1C, probability: 9.375}, {unitId: 0x1D, probability: 15.625}, {unitId: 0x1E, probability: 12.5},],
    11: [{unitId: 0x08, probability: 9.375}, {unitId: 0x0E, probability: 9.375}, {unitId: 0x10, probability: 15.625}, {unitId: 0x18, probability: 15.625}, {unitId: 0x1A, probability: 15.625}, {unitId: 0x1C, probability: 15.625}, {unitId: 0x21, probability: 9.375}, {unitId: 0x29, probability: 9.375},],
    12: [{unitId: 0x08, probability: 9.375}, {unitId: 0x0E, probability: 9.375}, {unitId: 0x10, probability: 15.625}, {unitId: 0x18, probability: 15.625}, {unitId: 0x1A, probability: 15.625}, {unitId: 0x1C, probability: 15.625}, {unitId: 0x21, probability: 9.375}, {unitId: 0x29, probability: 9.375},],
    13: [{unitId: 0x08, probability: 9.375}, {unitId: 0x0E, probability: 9.375}, {unitId: 0x10, probability: 15.625}, {unitId: 0x18, probability: 15.625}, {unitId: 0x1A, probability: 15.625}, {unitId: 0x1C, probability: 15.625}, {unitId: 0x21, probability: 9.375}, {unitId: 0x29, probability: 9.375},],
    14: [{unitId: 0x08, probability: 9.375}, {unitId: 0x0E, probability: 9.375}, {unitId: 0x10, probability: 15.625}, {unitId: 0x18, probability: 15.625}, {unitId: 0x1A, probability: 15.625}, {unitId: 0x1C, probability: 15.625}, {unitId: 0x21, probability: 9.375}, {unitId: 0x29, probability: 9.375},],
    15: [{unitId: 0x08, probability: 9.375}, {unitId: 0x0E, probability: 9.375}, {unitId: 0x10, probability: 15.625}, {unitId: 0x18, probability: 15.625}, {unitId: 0x1A, probability: 15.625}, {unitId: 0x1C, probability: 15.625}, {unitId: 0x21, probability: 9.375}, {unitId: 0x29, probability: 9.375},],
    16: [{unitId: 0x08, probability: 15.625}, {unitId: 0x0C, probability: 9.375}, {unitId: 0x0E, probability: 15.625}, {unitId: 0x16, probability: 6.25}, {unitId: 0x1F, probability: 3.125}, {unitId: 0x20, probability: 9.375}, {unitId: 0x21, probability: 15.625}, {unitId: 0x22, probability: 9.375}, {unitId: 0x29, probability: 15.625},],
    17: [{unitId: 0x08, probability: 15.625}, {unitId: 0x0C, probability: 9.375}, {unitId: 0x0E, probability: 15.625}, {unitId: 0x16, probability: 6.25}, {unitId: 0x1F, probability: 3.125}, {unitId: 0x20, probability: 9.375}, {unitId: 0x21, probability: 15.625}, {unitId: 0x22, probability: 9.375}, {unitId: 0x29, probability: 15.625},],
    18: [{unitId: 0x08, probability: 15.625}, {unitId: 0x0C, probability: 9.375}, {unitId: 0x0E, probability: 15.625}, {unitId: 0x16, probability: 6.25}, {unitId: 0x1F, probability: 3.125}, {unitId: 0x20, probability: 9.375}, {unitId: 0x21, probability: 15.625}, {unitId: 0x22, probability: 9.375}, {unitId: 0x29, probability: 15.625},],
    19: [{unitId: 0x08, probability: 15.625}, {unitId: 0x0C, probability: 9.375}, {unitId: 0x0E, probability: 15.625}, {unitId: 0x16, probability: 6.25}, {unitId: 0x1F, probability: 3.125}, {unitId: 0x20, probability: 9.375}, {unitId: 0x21, probability: 15.625}, {unitId: 0x22, probability: 9.375}, {unitId: 0x29, probability: 15.625},],
    20: [{unitId: 0x08, probability: 15.625}, {unitId: 0x0C, probability: 9.375}, {unitId: 0x0E, probability: 15.625}, {unitId: 0x16, probability: 6.25}, {unitId: 0x1F, probability: 3.125}, {unitId: 0x20, probability: 9.375}, {unitId: 0x21, probability: 15.625}, {unitId: 0x22, probability: 9.375}, {unitId: 0x29, probability: 15.625},],
    21: [{unitId: 0x0C, probability: 15.625}, {unitId: 0x12, probability: 9.375}, {unitId: 0x14, probability: 9.375}, {unitId: 0x16, probability: 6.25}, {unitId: 0x1E, probability: 6.25}, {unitId: 0x1F, probability: 3.125}, {unitId: 0x20, probability: 15.625}, {unitId: 0x22, probability: 15.625}, {unitId: 0x23, probability: 9.375}, {unitId: 0x24, probability: 9.375},],
    22: [{unitId: 0x0C, probability: 15.625}, {unitId: 0x12, probability: 9.375}, {unitId: 0x14, probability: 9.375}, {unitId: 0x16, probability: 6.25}, {unitId: 0x1E, probability: 6.25}, {unitId: 0x1F, probability: 3.125}, {unitId: 0x20, probability: 15.625}, {unitId: 0x22, probability: 15.625}, {unitId: 0x23, probability: 9.375}, {unitId: 0x24, probability: 9.375},],
    23: [{unitId: 0x0C, probability: 15.625}, {unitId: 0x12, probability: 9.375}, {unitId: 0x14, probability: 9.375}, {unitId: 0x16, probability: 6.25}, {unitId: 0x1E, probability: 6.25}, {unitId: 0x1F, probability: 3.125}, {unitId: 0x20, probability: 15.625}, {unitId: 0x22, probability: 15.625}, {unitId: 0x23, probability: 9.375}, {unitId: 0x24, probability: 9.375},],
    24: [{unitId: 0x0C, probability: 15.625}, {unitId: 0x12, probability: 9.375}, {unitId: 0x14, probability: 9.375}, {unitId: 0x16, probability: 6.25}, {unitId: 0x1E, probability: 6.25}, {unitId: 0x1F, probability: 3.125}, {unitId: 0x20, probability: 15.625}, {unitId: 0x22, probability: 15.625}, {unitId: 0x23, probability: 9.375}, {unitId: 0x24, probability: 9.375},],
    25: [{unitId: 0x0C, probability: 15.625}, {unitId: 0x12, probability: 9.375}, {unitId: 0x14, probability: 9.375}, {unitId: 0x16, probability: 6.25}, {unitId: 0x1E, probability: 6.25}, {unitId: 0x1F, probability: 3.125}, {unitId: 0x20, probability: 15.625}, {unitId: 0x22, probability: 15.625}, {unitId: 0x23, probability: 9.375}, {unitId: 0x24, probability: 9.375},],
    26: [{unitId: 0x0A, probability: 9.375}, {unitId: 0x12, probability: 15.625}, {unitId: 0x14, probability: 15.625}, {unitId: 0x23, probability: 15.625}, {unitId: 0x24, probability: 15.625}, {unitId: 0x25, probability: 9.375}, {unitId: 0x26, probability: 9.375}, {unitId: 0x27, probability: 9.375},],
    27: [{unitId: 0x0A, probability: 9.375}, {unitId: 0x12, probability: 15.625}, {unitId: 0x14, probability: 15.625}, {unitId: 0x23, probability: 15.625}, {unitId: 0x24, probability: 15.625}, {unitId: 0x25, probability: 9.375}, {unitId: 0x26, probability: 9.375}, {unitId: 0x27, probability: 9.375},],
    28: [{unitId: 0x0A, probability: 9.375}, {unitId: 0x12, probability: 15.625}, {unitId: 0x14, probability: 15.625}, {unitId: 0x23, probability: 15.625}, {unitId: 0x24, probability: 15.625}, {unitId: 0x25, probability: 9.375}, {unitId: 0x26, probability: 9.375}, {unitId: 0x27, probability: 9.375},],
    29: [{unitId: 0x0A, probability: 9.375}, {unitId: 0x12, probability: 15.625}, {unitId: 0x14, probability: 15.625}, {unitId: 0x23, probability: 15.625}, {unitId: 0x24, probability: 15.625}, {unitId: 0x25, probability: 9.375}, {unitId: 0x26, probability: 9.375}, {unitId: 0x27, probability: 9.375},],
    30: [{unitId: 0x0A, probability: 9.375}, {unitId: 0x12, probability: 15.625}, {unitId: 0x14, probability: 15.625}, {unitId: 0x23, probability: 15.625}, {unitId: 0x24, probability: 15.625}, {unitId: 0x25, probability: 9.375}, {unitId: 0x26, probability: 9.375}, {unitId: 0x27, probability: 9.375},],
    31: [{unitId: 0x04, probability: 9.375}, {unitId: 0x0A, probability: 15.625}, {unitId: 0x25, probability: 15.625}, {unitId: 0x26, probability: 15.625}, {unitId: 0x27, probability: 15.625}, {unitId: 0x28, probability: 9.375}, {unitId: 0x2A, probability: 9.375}, {unitId: 0x2B, probability: 9.375},],
    32: [{unitId: 0x04, probability: 9.375}, {unitId: 0x0A, probability: 15.625}, {unitId: 0x25, probability: 15.625}, {unitId: 0x26, probability: 15.625}, {unitId: 0x27, probability: 15.625}, {unitId: 0x28, probability: 9.375}, {unitId: 0x2A, probability: 9.375}, {unitId: 0x2B, probability: 9.375},],
    33: [{unitId: 0x04, probability: 9.375}, {unitId: 0x0A, probability: 15.625}, {unitId: 0x25, probability: 15.625}, {unitId: 0x26, probability: 15.625}, {unitId: 0x27, probability: 15.625}, {unitId: 0x28, probability: 9.375}, {unitId: 0x2A, probability: 9.375}, {unitId: 0x2B, probability: 9.375},],
    34: [{unitId: 0x04, probability: 9.375}, {unitId: 0x0A, probability: 15.625}, {unitId: 0x25, probability: 15.625}, {unitId: 0x26, probability: 15.625}, {unitId: 0x27, probability: 15.625}, {unitId: 0x28, probability: 9.375}, {unitId: 0x2A, probability: 9.375}, {unitId: 0x2B, probability: 9.375},],
    35: [{unitId: 0x04, probability: 9.375}, {unitId: 0x0A, probability: 15.625}, {unitId: 0x25, probability: 15.625}, {unitId: 0x26, probability: 15.625}, {unitId: 0x27, probability: 15.625}, {unitId: 0x28, probability: 9.375}, {unitId: 0x2A, probability: 9.375}, {unitId: 0x2B, probability: 9.375},],
    36: [{unitId: 0x04, probability: 15.625}, {unitId: 0x28, probability: 21.875}, {unitId: 0x2A, probability: 18.75}, {unitId: 0x2B, probability: 18.75}, {unitId: 0x2C, probability: 15.625}, {unitId: 0x2D, probability: 9.375},],
    37: [{unitId: 0x04, probability: 15.625}, {unitId: 0x28, probability: 21.875}, {unitId: 0x2A, probability: 18.75}, {unitId: 0x2B, probability: 18.75}, {unitId: 0x2C, probability: 15.625}, {unitId: 0x2D, probability: 9.375},],
    38: [{unitId: 0x04, probability: 15.625}, {unitId: 0x28, probability: 21.875}, {unitId: 0x2A, probability: 18.75}, {unitId: 0x2B, probability: 18.75}, {unitId: 0x2C, probability: 15.625}, {unitId: 0x2D, probability: 9.375},],
    39: [{unitId: 0x04, probability: 15.625}, {unitId: 0x28, probability: 21.875}, {unitId: 0x2A, probability: 18.75}, {unitId: 0x2B, probability: 18.75}, {unitId: 0x2C, probability: 15.625}, {unitId: 0x2D, probability: 9.375},],
    40: []
  }

  const floor1Tutorial = "The first time you enter this floor, it will have a fixed layout with fixed items, enemies, and traps. The items are a Copper sword, Wooden shield, Fire ball (5 charges), Medicinal herb, and Pulunpa egg (80% warm). The enemy is a single level 1 Pulunpa. The trap is a single, already activated Sleep trap.";
  const floor1Alt = "\nOn all subsequent tower entries, floor 1 will randomly use one of four fixed layouts with random items, enemies, and traps being placed as usual. To view these layouts, open the custom floor tool and load the appropriate template.";
  const floor2 = "The enemies listed above are only found in floor 2 on the first tower entry. Thereafter, the player will encounter a fixed layout without items, traps, or enemies, just an encounter with Ghosh and/or Selfi.";
  const floor12 = "If the player has not already aquired it, the blue collar will spawn on this floor (unless the game spawns an item room, which places items in a different way and overwrites the blue collar)."
  const floor15 = "If the player has talked to Isaac near the windmills and has not already aquired Guru's oil pot, it can be found on this floor."
  const floor20 = "If the player has talked to Okami at the bar and has not already aquired the blue cape, it can be found on this floor."
  const floor25 = "If the player has talked to Watta to begin the water medal quest and has not aquired the water medal, the game can spawn a white Picket which is holding the water medal."
  const floor28 = "If the player has completed the necessary conditions in Cherrl's story and has not already aquired the healing herb, it can be found on this floor."
  const floor31 = "The first time the player enters this floor, they will encounter a vision of Beldo (unless the game spawns a trap room or monster den, which handle traps in a different way and overwrite the Beldo vision)."
  const floor40 = "The first time the player enters this floor, they will encounter Beldo. Subsequent visits will not have Beldo, but will have wind crystals to allow the player to return."

  const specialNotesTable = {
    1: floor1Tutorial + floor1Alt,
    2: floor2,
    12: floor12,
    15: floor15,
    20: floor20,
    25: floor25,
    28: floor28,
    31: floor31,
    40: floor40,
  }

  const exports = {
    enemyTable: enemyTable,
    eggTable: eggTable,
    specialNotesTable: specialNotesTable,
  }
  if (self) {
    self.adRando = Object.assign(self.adRando || {}, {
      floors: exports,
    })
  } else {
    module.exports = exports
  }
})(typeof(self) !== 'undefined' ? self : null)
