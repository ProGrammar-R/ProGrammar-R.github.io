(function(self) {

  const talentTable = [
    {talentId: 0x1, name: "Quick", description: "Unit is able to act twice per round, like if the unit had the Speed Up status condition." },
    {talentId: 0x2, name: "HP Increased", description: "Effective maximum HP is double what it would otherwise be while the unit has this talent, capped at 255. If the unit loses this talent, maximum HP reverts to the normal value." },
    {talentId: 0x4, name: "MP Increased", description: "Effective maximum MP is double what it would otherwise be while the unit has this talent, capped at 255. If the unit loses this talent, maximum MP reverts to the normal value. This talent goes unused." },
    {talentId: 0x8, name: "Strength Increased", description: "Effective maximum ATK is double what it would otherwise be while the unit has this talent, capped at 255. If the unit loses this talent, maximum ATK reverts to the normal value. This was originally intended to increase the damage dealt by Koh’s attacks by 1/8 for every collared familiar with this talent, but this does not work due to a bug. " },
    {talentId: 0x10, name: "Hard", description: "Effective maximum DEF is double what it would otherwise be while the unit has this talent, capped at 255. If the unit loses this talent, maximum DEF reverts to the normal value." },
    {talentId: 0x20, name: "Growth Promoted", description: "If this unit kills another unit, the EXP given by the killed monster is doubled." },
    {talentId: 0x40, name: "Increase EXP given", description: "This unit gives double the EXP it normally would when defeated. This talent goes unused and has no official name." },
    {talentId: 0x80, name: "Magic Attack increased", description: "Effective spell levels are double what they would otherwise be. If the unit loses this talent, effective spell levels return to normal." },
    {talentId: 0x100, name: "MP Consumption Decreased", description: "All actions have the MP cost reduced to 50% (rounded up). For rounding purposes, the smallest possible unit of MP consumption is 1/256." },
    {talentId: 0x4000, name: "Lowering ATK may not work", description: "Units with this talent are unaffected by a Viper’s inherent trait that can lower a target’s ATK when hit by the Viper. If at least one collared familiar has this talent, this ATK lowering effect will not affect either collared familiar or Koh." },
    {talentId: 0x8000, name: "Electric Shock", description: "If an attack makes contact with a unit with this talent and the attacker is unarmed or wielding a metal weapon and the attacker does not have an Earth shield equipped, a portion of the damage dealt will be reflected back at the attacker. The damage reflected back is 1/4 (rounded down) with a minimum of 1 damage dealt. If the attacker has a Leather or Wooden shield equipped, the damage is 50% of this, rounded up. If the attacker has any other shield equipped, the damage is increased by 1." },
    {talentId: 0x10000, name: "Rustproof", description: "Units with this talent will not have equipped, metallic weapons and shields rust (decrease in quality by 1) when hit by a rust trap or Acid Rain spell. If at least one collared familiar has this talent, rust will not affect either collared familiar or Koh. Compared to other -proof talents, it is the only one without a hyphen in the official name." },
    {talentId: 0x20000, name: "Abduct-proof", description: "Enemy-controlled Garudas will not use their Abduct ability on units with this talent. If at least one collared familiar has this talent, enemy-controlled Garudas will not abduct either collared familiar. This talent has no official name." },
    {talentId: 0x40000, name: "Bark-proof", description: "Units with this talent are unaffected by a Zu’s Bark loudly ability. If at least one collared familiar has this talent, barks will not affect either collared familiar. This talent has no official name." },
    {talentId: 0x80000, name: "Stealing-proof", description: "Units with this talent are unaffected by a Picket’s Steal ability. If at least one collared familiar has this talent, attempts at stealing will not affect either collared familiar or Koh. This talent has no official name." },
    {talentId: 0x100000, name: "Unbrainwashable", description: "Units with this talent are unaffected by a Blume’s Brainwash ability. If at least one collared familiar has this talent, attempts at brainwashing will not affect either collared familiar." },
    {talentId: 0x200000, name: "Atrocious", description: "Unit is more likely to deal critical hits, as if it had the Angry status condition. Does not stack with the Angry status condition." },
    {talentId: 0x400000, name: "Does not survive fusion", description: "When fusing monsters, this unit’s type will not be the resulting unit type as if the other monster was holding a Leva fruit. In the event that both monsters in an attempted fusion have this talent or are holding Leva fruits, the fusion will not take place. This talent also prevents units from evolving, but it is not possible for a unit that evolves to obtain this talent without using glitches. This talent has no official name." },
    {talentId: 0x800000, name: "Survives fusion", description: "When fusing monsters, this unit’s type will be the resulting unit type as if it was holding a Leva fruit. In the event that both monsters in an attempted fusion have this talent or are holding Leva fruits, the fusion will not take place. This talent also prevents units from evolving, but it is not possible for a unit that evolves to obtain this talent without using glitches. This talent has no official name." },
    {talentId: 0x2000000, name: "Sleep-proof", description: "Units with this talent are unaffected by the Sleep status. If at least one collared familiar has this talent, Sleep will not affect either collared familiar or Koh." },
    {talentId: 0x4000000, name: "Confusion-proof", description: "Units with this talent are unaffected by the Confusion status. If at least one collared familiar has this talent, Confusion will not affect either collared familiar or Koh. No ordinary monster has this talent, only special units like Walls, but it is still given an official name." },
    {talentId: 0x8000000, name: "Blinder-proof", description: "Units with this talent are unaffected by the Blindness status. If at least one collared familiar has this talent, Blindness will not affect either collared familiar or Koh." },
    {talentId: 0x10000000, name: "Paralysis-proof", description: "Units with this talent are unaffected by the Paralysis status. If at least one collared familiar has this talent, Paralysis will not affect either collared familiar or Koh." },
    {talentId: 0x20000000, name: "Poison-proof", description: "Units with this talent are unaffected by the Poison status. If at least one collared familiar has this talent, Poison will not affect either collared familiar or Koh." },
    {talentId: 0x40000000, name: "Spell-proof", description: "Units with this talent are still susceptable to the Sealed status effect, but this status is removed when leveling up or otherwise causing stats to be recalculated." },
  ]

  function getTalentTableEntry(talentId) {
    const tableEntries = talentTable.filter(tableEntry => { if (tableEntry.talentId === talentId) return tableEntry});
    if (tableEntries.length > 0) {
      return tableEntries[0];
    }
    return null;
  }

  function getAllTalentsByTalentBitmask(talentBitmask) {
    return talentTable.filter(talentEntry => (talentEntry.talentId & talentBitmask) !== 0);
  }

  const exports = {
    talentTable: talentTable,
    getTalentTableEntry: getTalentTableEntry,
    getAllTalentsByTalentBitmask: getAllTalentsByTalentBitmask,
  }
  if (self) {
    self.adRando = Object.assign(self.adRando || {}, {
      talents: exports,
    })
  } else {
    module.exports = exports
  }
})(typeof(self) !== 'undefined' ? self : null)
