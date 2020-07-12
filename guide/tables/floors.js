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
    39: [{unitId: 0x04, probability: 15.625}, {unitId: 0x28, probability: 21.875}, {unitId: 0x2A, probability: 18.75}, {unitId: 0x2B, probability: 18.75}, {unitId: 0x2C, probability: 15.625}, {unitId: 0x2D, probability: 9.375},]
    }

  const exports = {
    enemyTable: enemyTable,
    eggTable: eggTable,
  }
  if (self) {
    self.adRando = Object.assign(self.adRando || {}, {
      floors: exports,
    })
  } else {
    module.exports = exports
  }
})(typeof(self) !== 'undefined' ? self : null)
