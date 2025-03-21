// Import document classes.
import { PunkapocalypticActor } from './documents/actor.mjs';
import { PunkapocalypticItem } from './documents/item.mjs';
// Import sheet classes.
import { PunkapocalypticActorSheet } from './sheets/actor-sheet.mjs';
import { PunkapocalypticNPCSheet } from './sheets/npc-sheet.mjs';
import { PunkapocalypticItemSheet } from './sheets/item-sheet.mjs';
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { PUNKAPOCALYPTIC } from './helpers/config.mjs';
// Import DataModel classes
import * as models from './data/_module.mjs';
import {createLuckTracker} from './helpers/luck-tracker.mjs';

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.on('ready', async function () {
  CONFIG.statusEffects = []
  for (const key in CONFIG.PUNKAPOCALYPTIC.statusEffects) {
    const label = await game.i18n.localize(CONFIG.PUNKAPOCALYPTIC.statusEffects[key]);
    const img = CONFIG.PUNKAPOCALYPTIC.statusEffectImages[key];
    CONFIG.statusEffects.push(
      {
        id: key,
        name: label,
        description: label,
        img: img,
        changes: [
        ],
        duration: {},
        flags: {
          punkapocalyptic: {
            description: label,
          }
        }
    })
  }
})
Hooks.once('init', async function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.punkapocalyptic = {
    PunkapocalypticActor,
    PunkapocalypticItem,
    rollItemMacro,
  };

  // Add custom constants for configuration.
  CONFIG.PUNKAPOCALYPTIC = PUNKAPOCALYPTIC;

  // CONFIG.statusEffects.push(...PUNKAPOCALYPTIC.statusEffects);

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '1d20 + @abilities.eyes.mod',
    decimals: 2,
  };

  // Define custom Document and DataModel classes
  CONFIG.Actor.documentClass = PunkapocalypticActor;

  // Note that you don't need to declare a DataModel
  // for the base actor/item classes - they are included
  // with the Character/NPC as part of super.defineSchema()
  CONFIG.Actor.dataModels = {
    character: models.PunkapocalypticCharacter,
    npc: models.PunkapocalypticNPC,
    vehicle: models.Punkapocalypticvehicle
  }
  CONFIG.Item.documentClass = PunkapocalypticItem;
  CONFIG.Item.dataModels = {
    item: models.PunkapocalypticItem,
    //feature: models.PunkapocalypticFeature,
    //spell: models.PunkapocalypticSpell,
    weapon: models.PunkapocalypticItemWeapon,
    trait: models.PunkapocalypticTrait,
    special_activity: models.PunkapocalypticSpecialActivity,
    background: models.PunkapocalypticBackgroundItem,
    talent: models.PunkapocalypticItemTalent,
    benefit: models.PunkapocalypticItemBenefit,
    path: models.PunkapocalypticPathItem,
    armor: models.PunkapocalypticItemArmor,
    mutation: models.PunkapocalypticItemMutation,
  }

  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('punkapocalyptic', PunkapocalypticActorSheet, {
    makeDefault: true,
    label: 'PUNKAPOCALYPTIC.SheetLabels.Actor',
  });
  Actors.registerSheet("punkapocalyptic", PunkapocalypticNPCSheet, {
    types: ["npc"],
    makeDefault: true,
    label: "Punkapocalyptic NPC Sheet"
  });
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('punkapocalyptic', PunkapocalypticItemSheet, {
    makeDefault: true,
    label: 'PUNKAPOCALYPTIC.SheetLabels.Item',
  });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

Handlebars.registerHelper("hasProperty", function (obj, key, options) {
  if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      return options.fn(this);
  } else {
      return options.inverse(this);
  }
});

Handlebars.registerHelper('healthStyle', function healthStyle(current, max) {
  let progress = 100;
  if (current <= max) {
    progress = (current / max) * 100;
  }
  let color;
  
  if (progress === 0) {
      color = "black";
  } else if (progress < 30) {
      color = "darkred";
  } else if (progress < 100) {
      color = "red";
  } else {
      color = "#aa0000"; // Fully red at max
  }
  
  return `width: ${progress}%; background-color: ${color};`;
})


// Handlebars.registerHelper('comparestring', function(a, b, options) {
//   if (typeof options === "undefined" || typeof options.fn !== "function") {
//     console.error("Handlebars Helper 'comparestring' called without proper options:", { a, b, options });
//     return "";
//   }


//   // Ensure 'a' is defined before comparison
//   if (a === undefined || a === null) a = "";

//   // If values match, return the true block
//   if (a === b) return options.fn(this);

//   // Only call `options.inverse` if it's provided
//   return typeof options.inverse === "function" ? options.inverse(this) : "";
// });
Handlebars.registerHelper('comparestring', function(a = "", b, options) {
  if (typeof options.fn !== "function") {
    console.error("Handlebars Helper 'comparestring' called without proper options:", { a, b, options });
    return "";
  }

  return a === b ? options.fn(this) : (typeof options.inverse === "function" ? options.inverse(this) : "");
});

// Handlebars.registerHelper('capitalize', function(str) {
//   if (typeof str !== "string" || str.length === 0) return "";
//   return str.charAt(0).toUpperCase() + str.slice(1);
// });
Handlebars.registerHelper('capitalize', function(str) {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
});

// Handlebars.registerHelper('healthPercentage', function(currentLife, maxLife) {
//   if (maxLife <= 0) return "0%"; // Avoid division by zero
//   if (currentLife > maxLife) maxLife = currentLife;
//   let percentage = (currentLife / maxLife) * 100;
//   return percentage + "%"; // Return as a percentage string
// });

Handlebars.registerHelper('healthPercentage', function(currentLife, maxLife) {
  if (maxLife <= 0) return "0%"; // Avoid division by zero
  let percentage = (currentLife / Math.max(currentLife, maxLife)) * 100;
  return percentage + "%"; // Return as a percentage string
});

function parseList(list) {
  if (typeof list === 'string') {
    return list.split(',').map(str => str.trim());
  }
  return list;
}

Handlebars.registerHelper('ifIn', function(item, list, options) {
  list = parseList(list);
  return list.indexOf(item) > -1 ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifNotIn', function(item, list, options) {
  list = parseList(list);
  return list.indexOf(item) === -1 ? options.fn(this) : options.inverse(this);
});
// Handlebars.registerHelper('ifIn', function(item, list, options) {
//   if (typeof list === 'string') {
//     list = list.split(',').map(function(str) {
//       return str.trim();
//     });
//   }
  
//   // Check if the item is NOT in the list.
//   if (list.indexOf(item) > -1) {
//     return options.fn(this);
//   }
  
//   // Otherwise, render the inverse (else) block.
//   return options.inverse(this);
// });

// Handlebars.registerHelper('ifNotIn', function(item, list, options) {
//   // If the list is provided as a string, split it into an array by commas.
//   if (typeof list === 'string') {
//     list = list.split(',').map(function(str) {
//       return str.trim();
//     });
//   }
  
//   // Check if the item is NOT in the list.
//   if (list.indexOf(item) === -1) {
//     return options.fn(this);
//   }
  
//   // Otherwise, render the inverse (else) block.
//   return options.inverse(this);
// });

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));
  createLuckTracker();
});

Hooks.on("renderChatMessage", (message, html, data) => {
  // Handle weapon damage rolls
  html.find(".roll-damage").click(async (event) => {
    event.preventDefault();
    let button = event.currentTarget;
    let weaponId = button.dataset.itemId;
    let actorId = button.dataset.actorId;
    let tokenId = button.dataset.tokenId;
    
    let actor = game.actors.get(actorId);
    if (tokenId) {
      let token = canvas.tokens.get(tokenId);
      if (!token) return ui.notifications.warn("Token not found.");
      actor = token.actor;
    }
    
    if (!actor) return ui.notifications.warn("Actor not found.");
    
    // Retrieve the weapon from the actor's items.
    let item = actor.items.get(weaponId) || CONFIG.PUNKAPOCALYPTIC.attackDefaultItems[weaponId];
    if (!item) return ui.notifications.warn("Weapon not found on actor.");
    item.rollDamage();
  });

  html.find(".roll-range").click(async (event) => {
    event.preventDefault();
    let button = event.currentTarget;
    let weaponId = button.dataset.itemId;
    let actorId = button.dataset.actorId;
    let tokenId = button.dataset.tokenId;
    
    let actor = game.actors.get(actorId);
    if (tokenId) {
      let token = canvas.tokens.get(tokenId);
      if (!token) return ui.notifications.warn("Token not found.");
      actor = token.actor;
    }
    
    if (!actor) return ui.notifications.warn("Actor not found.");
    
    // Retrieve the weapon from the actor's items.
    let item = actor.items.get(weaponId) || CONFIG.PUNKAPOCALYPTIC.attackDefaultItems[weaponId];
    if (!item) return ui.notifications.warn("Weapon not found on actor.");
    item.rollRange();
  });
});





/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== 'Item') return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn(
      'You can only create macro buttons for owned Items'
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.punkapocalyptic.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'punkapocalyptic.itemMacro': true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }

    // Trigger the item roll
    item.roll();
  });
}
