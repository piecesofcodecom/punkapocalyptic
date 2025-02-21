export const PUNKAPOCALYPTIC = {};

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
  education: 'PUNKAPOCALYPTIC.Ability.Education.long',
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
  education: 'PUNKAPOCALYPTIC.Ability.Education.abbr',
};

PUNKAPOCALYPTIC.resources = {
  balas: "PUNKAPOCALYPTIC.Resource.Balas.long",
  comida: "PUNKAPOCALYPTIC.Resource.Comida.long",
  agua: "PUNKAPOCALYPTIC.Resource.Agua.long",
  sorte: "PUNKAPOCALYPTIC.Resource.Sorte.long",
  remedio: "PUNKAPOCALYPTIC.Resource.Remedio.long",
  energia: "PUNKAPOCALYPTIC.Resource.Energia.long",
  combustivel: "PUNKAPOCALYPTIC.Resource.Combustivel.long",
  distancia: "PUNKAPOCALYPTIC.Resource.Distancia.long",
};

PUNKAPOCALYPTIC.resourceImages = {
  balas: "/systems/punkapocalyptic/assets/resources/ammo.svg",
  comida: "/systems/punkapocalyptic/assets/resources/food.svg",
  agua: "/systems/punkapocalyptic/assets/resources/waterskin.svg",
  sorte: "/systems/punkapocalyptic/assets/resources/shamrock.svg",
  remedio: "/systems/punkapocalyptic/assets/resources/medicines.svg",
  energia: "/systems/punkapocalyptic/assets/resources/lightning-helix.svg",
  combustivel: "/systems/punkapocalyptic/assets/resources/oil-drum.svg",
  distancia: "/systems/punkapocalyptic/assets/resources/path-distance.svg",
};

PUNKAPOCALYPTIC.items = {
  trait: "TYPES.Item.trait",
  weapon: "TYPES.Item.weapon",
  item: "TYPES.Item.item",
  special_activity: "TYPES.Item.special_activity",
  background: "TYPES.Item.background"
}

PUNKAPOCALYPTIC.itemImages = {
  trait: "icons/skills/trades/academics-investigation-puzzles.webp",
  weapon: "icons/weapons/clubs/club-spiked-glowing.webp",
  item: "icons/tools/fasteners/washer-square-steel-grey.webp",
  special_activity: "icons/magic/control/silhouette-aura-energy.webp",
  background: "icons/skills/trades/academics-investigation-study-blue.webp",
  default: "icons/svg/item-bag.svg"
}

// TODO add all aflicoes

PUNKAPOCALYPTIC.statusEffects = [{
  label: "Assustado",
  icon: "icons/svg/downgrade.svg",
  changes: [
    {
      key: "system.abilities.strength.value",
      mode: 2,
      value: "-2"
    }
  ],
  duration: { seconds: 60 },
  flags: {
    mySystem: { description: "Strength is reduced by 2 for 1 minute." }
  }
}]
