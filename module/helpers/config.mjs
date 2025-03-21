export const PUNKAPOCALYPTIC = {};
export const ROOT_FOLDER = "systems/punkapocalyptic/";
/**
 * The set of Ability Scores used within the system.
 * @type {Object}
 */
PUNKAPOCALYPTIC.abilities = {
  muscles: 'PUNKAPOCALYPTIC.Ability.Muscles.long',
  meat: 'PUNKAPOCALYPTIC.Ability.Meat.long',
  hands: 'PUNKAPOCALYPTIC.Ability.Hands.long',
  feet: 'PUNKAPOCALYPTIC.Ability.Feet.long',
  brains: 'PUNKAPOCALYPTIC.Ability.Brains.long',
  eyes: 'PUNKAPOCALYPTIC.Ability.Eyes.long',
  mouth: 'PUNKAPOCALYPTIC.Ability.Mouth.long',
  guts: 'PUNKAPOCALYPTIC.Ability.Guts.long',
  //education: 'PUNKAPOCALYPTIC.Ability.Education.long',
};

PUNKAPOCALYPTIC.abilityImages = {
  muscles: '/systems/punkapocalyptic/assets/icons/biceps.png',
  meat: '/systems/punkapocalyptic/assets/icons/meat.png',
  hands: '/systems/punkapocalyptic/assets/icons/hello.png',
  feet: '/systems/punkapocalyptic/assets/icons/footprint.png',
  brains: '/systems/punkapocalyptic/assets/icons/brain.png',
  eyes: '/systems/punkapocalyptic/assets/icons/eyes.png',
  mouth: '/systems/punkapocalyptic/assets/icons/open-mouth.png',
  guts: '/systems/punkapocalyptic/assets/icons/intestines.png',
};

PUNKAPOCALYPTIC.abilityAbbreviations = {
  muscles: 'PUNKAPOCALYPTIC.Ability.Muscles.abbr',
  meat: 'PUNKAPOCALYPTIC.Ability.Meat.abbr',
  hands: 'PUNKAPOCALYPTIC.Ability.Hands.abbr',
  feet: 'PUNKAPOCALYPTIC.Ability.Feet.abbr',
  brains: 'PUNKAPOCALYPTIC.Ability.Brains.abbr',
  eyes: 'PUNKAPOCALYPTIC.Ability.Eyes.abbr',
  mouth: 'PUNKAPOCALYPTIC.Ability.Mouth.abbr',
  guts: 'PUNKAPOCALYPTIC.Ability.Guts.abbr',
  //education: 'PUNKAPOCALYPTIC.Ability.Education.long',
};

PUNKAPOCALYPTIC.otherAttributes = {
  grit: 'PUNKAPOCALYPTIC.OtherAttributes.Grit.long',
  reach: 'PUNKAPOCALYPTIC.OtherAttributes.Reach.long',
  education: 'PUNKAPOCALYPTIC.OtherAttributes.Education.long',
  size: 'PUNKAPOCALYPTIC.OtherAttributes.Size.long',
  mutations: 'PUNKAPOCALYPTIC.OtherAttributes.Mutations.long',
};

PUNKAPOCALYPTIC.otherAttributesImages = {
  grit: '/systems/punkapocalyptic/assets/icons/grit.png',
  reach: '/systems/punkapocalyptic/assets/icons/reach.png',
  education: '/systems/punkapocalyptic/assets/icons/education.png',
  size: '/systems/punkapocalyptic/assets/icons/size.png',
  mutations: '/systems/punkapocalyptic/assets/icons/mutations.png',
}

PUNKAPOCALYPTIC.resources = {
  bullets: "PUNKAPOCALYPTIC.Resource.Bullets.long",
  food: "PUNKAPOCALYPTIC.Resource.Food.long",
  water: "PUNKAPOCALYPTIC.Resource.Water.long",
  //sorte: "PUNKAPOCALYPTIC.Resource.Sorte.long",
  medicine: "PUNKAPOCALYPTIC.Resource.Medicine.long",
  power: "PUNKAPOCALYPTIC.Resource.Power.long",
  fuel: "PUNKAPOCALYPTIC.Resource.Fuel.long",
  //luck: 'PUNKAPOCALYPTIC.OtherAttributes.Luck.long',
  //distancia: "PUNKAPOCALYPTIC.Resource.Distancia.long",
};

PUNKAPOCALYPTIC.resourceImages = {
  bullets: "/systems/punkapocalyptic/assets/icons/resource-icon-bullet.png",
  food: "/systems/punkapocalyptic/assets/icons/resource-icon-food.png",
  water: "/systems/punkapocalyptic/assets/icons/resource-icon-water.png",
  //sorte: "/systems/punkapocalyptic/assets/icons/resource-shamrock.png",
  medicine: "/systems/punkapocalyptic/assets/icons/resource-icon-medicine.png",
  power: "/systems/punkapocalyptic/assets/icons/resource-icon-power.png",
  fuel: "/systems/punkapocalyptic/assets/icons/resource-icon-fuel.png",
  //luck: '/systems/punkapocalyptic/assets/icons/resource-icon-luck.png',
  //distancia: "/systems/punkapocalyptic/assets/resources/path-distance.svg",
};

PUNKAPOCALYPTIC.commonAttributes = {
  speed: "PUNKAPOCALYPTIC.Other.Speed.long",
}

PUNKAPOCALYPTIC.commonAttributeImages = {
  speed: "/systems/punkapocalyptic/assets/icons/quick.png",
}

PUNKAPOCALYPTIC.weaponCategories = {
  "melee": "PUNKAPOCALYPTIC.WeaponCategory.Melee.long",
  "ranged": "PUNKAPOCALYPTIC.WeaponCategory.Ranged.long",
  "area": "PUNKAPOCALYPTIC.WeaponCategory.Area.long",
  "explosive": "PUNKAPOCALYPTIC.WeaponCategory.Explosive.long",
  "thrown": "PUNKAPOCALYPTIC.WeaponCategory.Thrown.long",
}

PUNKAPOCALYPTIC.weaponTraits = {
  "AreaAttack": "PUNKAPOCALYPTIC.WeaponTrait.AreaAttack.long",
  "BurstFire": "PUNKAPOCALYPTIC.WeaponTrait.BurstFire.long",
  "Cumbersome": "PUNKAPOCALYPTIC.WeaponTrait.Cumbersome.long",
  "Defensive": "PUNKAPOCALYPTIC.WeaponTrait.Defensive.long",
  "Finesse": "PUNKAPOCALYPTIC.WeaponTrait.Finesse.long",
  "Firearm": "PUNKAPOCALYPTIC.WeaponTrait.Firearm.long",
  "FullAuto": "PUNKAPOCALYPTIC.WeaponTrait.FullAuto.long",
  "Range": "PUNKAPOCALYPTIC.WeaponTrait.Range.long",
  "Reach": "PUNKAPOCALYPTIC.WeaponTrait.Reach.long",
  "Reload": "PUNKAPOCALYPTIC.WeaponTrait.Reload.long",
  "Shitty": "PUNKAPOCALYPTIC.WeaponTrait.Shitty.long",
  "Special": "PUNKAPOCALYPTIC.WeaponTrait.Special.long",
  "Thrown": "PUNKAPOCALYPTIC.WeaponTrait.Thrown.long",
  "Unreliable": "PUNKAPOCALYPTIC.WeaponTrait.Unreliable.long",
}

PUNKAPOCALYPTIC.weaponTraitDescriptions = {
  "AreaAttack": "PUNKAPOCALYPTIC.WeaponTrait.AreaAttack.tooltip",
  "BurstFire": "PUNKAPOCALYPTIC.WeaponTrait.BurstFire.tooltip",
  "Cumbersome": "PUNKAPOCALYPTIC.WeaponTrait.Cumbersome.tooltip",
  "Defensive": "PUNKAPOCALYPTIC.WeaponTrait.Defensive.tooltip",
  "Finesse": "PUNKAPOCALYPTIC.WeaponTrait.Finesse.tooltip",
  "Firearm": "PUNKAPOCALYPTIC.WeaponTrait.Firearm.tooltip",
  "FullAuto": "PUNKAPOCALYPTIC.WeaponTrait.FullAuto.tooltip",
  "Range": "PUNKAPOCALYPTIC.WeaponTrait.Range.tooltip",
  "Reach": "PUNKAPOCALYPTIC.WeaponTrait.Reach.tooltip",
  "Reload": "PUNKAPOCALYPTIC.WeaponTrait.Reload.tooltip",
  "Shitty": "PUNKAPOCALYPTIC.WeaponTrait.Shitty.tooltip",
  "Special": "PUNKAPOCALYPTIC.WeaponTrait.Special.tooltip",
  "Thrown": "PUNKAPOCALYPTIC.WeaponTrait.Thrown.tooltip",
  "Unreliable": "PUNKAPOCALYPTIC.WeaponTrait.Unreliable.tooltip",
}

PUNKAPOCALYPTIC.inventoryTypes = [
  "weapon", "item", "power", "armor"
]
PUNKAPOCALYPTIC.benefitSubTypes = [
  "talent", "benefit"
]

PUNKAPOCALYPTIC.items = {
  armor: "TYPES.Item.armor",
  trait: "TYPES.Item.trait",
  weapon: "TYPES.Item.weapon",
  item: "TYPES.Item.item",
  special_activity: "TYPES.Item.special_activity",
  background: "TYPES.Item.background",
  //talent: "TYPES.Item.talent",
  benefit: "TYPES.Item.benefit",
  path: "TYPES.Item.path",
  mutation: "TYPES.Item.mutation"
}

PUNKAPOCALYPTIC.itemImages = {
  armor: "icons/equipment/shield/buckler-wooden-boss-lightning.webp",
  trait: "icons/skills/trades/academics-investigation-puzzles.webp",
  weapon: "icons/weapons/clubs/club-spiked-glowing.webp",
  item: "icons/tools/fasteners/washer-square-steel-grey.webp",
  special_activity: "icons/magic/control/silhouette-aura-energy.webp",
  background: "icons/sundries/documents/document-sealed-signatures-red.webp",
  //talent: "icons/magic/perception/eye-slit-orange.webp",
  benefit: "icons/magic/perception/eye-slit-orange.webp",
  path: "icons/skills/social/intimidation-impressing.webp",
  mutation: "icons/magic/symbols/triangle-glowing-green.webp",
  default: "icons/svg/item-bag.svg"
}

PUNKAPOCALYPTIC.pathLevels = {
  novice: "PUNKAPOCALYPTIC.Path.Novice.long",
  expert: "PUNKAPOCALYPTIC.Path.Expert.long",
  master: "PUNKAPOCALYPTIC.Path.Master.long"
}

PUNKAPOCALYPTIC.attackIcons = {
  0: ROOT_FOLDER + "assets/icons/fist.png", //unarmed
  1: ROOT_FOLDER + "assets/icons/melee.png", //melee
  2: ROOT_FOLDER + "assets/icons/double-melee.png", // 2 melee
  3: ROOT_FOLDER + "assets/icons/ranged.png", //ranged
  4: ROOT_FOLDER + "assets/icons/ranged.png",// melee + ranged
  6: ROOT_FOLDER + "assets/icons/ranged.png",// 2 ranged
}

PUNKAPOCALYPTIC.statusEffects = {
  frightened:   "PUNKAPOCALYPTIC.Statuses.Frightened.long",
  stunned:      "PUNKAPOCALYPTIC.Statuses.Stunned.long",
  blinded:      "PUNKAPOCALYPTIC.Statuses.Blinded.long",
  confused:     "PUNKAPOCALYPTIC.Statuses.Confused.long",
  impaired:     "PUNKAPOCALYPTIC.Statuses.Impaired.long",
  sickened:     "PUNKAPOCALYPTIC.Statuses.Sickened.long",
  fatigued:     "PUNKAPOCALYPTIC.Statuses.Fatigued.long",
  immobilized:  "PUNKAPOCALYPTIC.Statuses.Immobilized.long",
  unconscious:  "PUNKAPOCALYPTIC.Statuses.Unconscious.long",
  insane:       "PUNKAPOCALYPTIC.Statuses.Insane.long",
  proned:       "PUNKAPOCALYPTIC.Statuses.Proned.long",
  slowed:       "PUNKAPOCALYPTIC.Statuses.Slowed.long",
}

PUNKAPOCALYPTIC.statusEffectImages = {
  frightened:   "icons/svg/terror.svg",
  stunned:      "icons/svg/stoned.svg",
  blinded:      "icons/svg/blind.svg",
  confused:     "icons/svg/daze.svg",
  impaired:     "icons/svg/silenced.svg",
  sickened:     "icons/svg/poison.svg",
  fatigued:     "icons/svg/sleep.svg",
  immobilized:  "icons/svg/padlock.svg",
  unconscious:  "icons/svg/unconscious.svg",
  insane:       "icons/svg/paralysis.svg",
  proned:       "icons/svg/falling.svg",
  slowed:       "icons/svg/down.svg",
}

PUNKAPOCALYPTIC.attacks = {
  "melee": "PUNKAPOCALYPTIC.Attack.Melee",
  "ranged": "PUNKAPOCALYPTIC.Attack.Ranged",
}

PUNKAPOCALYPTIC.attackDefaultItems = {
  "hand": {
    "id": "hand",
    "_id": "hand",
    "name": "Mão vazia",
    "img": PUNKAPOCALYPTIC.attackIcons[0],
    "system": {
      "roll": {
        "ability": "muscles",
        "bonus": 0,
        "formula": "1d20+@abilities.muscles.mod"
      },
      "damage": {
        "diceNum": 1,
        "diceSize": 6,
        "diceBonus": -3,
        "formula": "1d6-3"
      }
    }
  }
}

PUNKAPOCALYPTIC.vehicleStatistics = {
  handling:     "PUNKAPOCALYPTIC.Vehicle.Handling.long",
  acceleration: "PUNKAPOCALYPTIC.Vehicle.Acceleration.long",
  braking :     "PUNKAPOCALYPTIC.Vehicle.Braking.long",
  topVelocity:  "PUNKAPOCALYPTIC.Vehicle.TopVelocity.long",
  fuel:         "PUNKAPOCALYPTIC.Vehicle.Fuel.long",
  locations:    "PUNKAPOCALYPTIC.Vehicle.Locations.long",
  occupants:    "PUNKAPOCALYPTIC.Vehicle.Occupants.long",
  cargo:        "PUNKAPOCALYPTIC.Vehicle.Cargo.long",
}

PUNKAPOCALYPTIC.vehicleAcceleration = {
  0: "standard",
  1: "slow",
  2: "fast",
  3: "super-fast"
}

PUNKAPOCALYPTIC.mutationTypes = {
  physic: "PUNKAPOCALYPTIC.Mutation.Physic.long",
  mental: "PUNKAPOCALYPTIC.Mutation.Mental.long"
}

PUNKAPOCALYPTIC.progress_function = (actor) => {
  const next_level = actor.system.missions + 1;
    const options = [];
    actor.update({ "system.missions": (next_level) })
  console.warn("progress for actor",actor);
}
