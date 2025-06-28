// Import document classes.
import { PunkapocalypticActor } from './documents/actor.mjs';
import { PunkapocalypticItem } from './documents/item.mjs';
// Import sheet classes.
import { PunkapocalypticActorSheet } from './sheets/actor-sheet.mjs';
import { PunkapocalypticNPCSheet } from './sheets/npc-sheet.mjs';
import { PunkapocalypticVehicleSheet } from './sheets/vehicle-sheet.mjs';
import { PunkapocalypticItemSheet } from './sheets/item-sheet.mjs';
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { PUNKAPOCALYPTIC } from './helpers/config.mjs';
// Import DataModel classes
import * as models from './data/_module.mjs';

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
      });

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
    vehicleAccessory: models.PunkapocalypticItem,
    vehicleUpgrade: models.PunkapocalypticItem,
    vehiclePart: models.PunkapocalypticItemParts,

    //feature: models.PunkapocalypticFeature,
    //spell: models.PunkapocalypticSpell,
    weapon: models.PunkapocalypticItemWeapon,
    trait: models.PunkapocalypticTrait,
    specialActivity: models.PunkapocalypticSpecialActivity,
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
  Actors.registerSheet("punkapocalyptic", PunkapocalypticVehicleSheet, {
    types: ["vehicle"],
    makeDefault: true,
    label: "Punkapocalyptic Vehicle Sheet"
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

Handlebars.registerHelper('comparestring', function (a = "", b, options) {
  if (typeof options.fn !== "function") {
    console.error("Handlebars Helper 'comparestring' called without proper options:", { a, b, options });
    return "";
  }

  return a === b ? options.fn(this) : (typeof options.inverse === "function" ? options.inverse(this) : "");
});

Handlebars.registerHelper('capitalize', function (str) {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
});

Handlebars.registerHelper('healthPercentage', function (currentLife, maxLife) {
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

Handlebars.registerHelper('ifIn', function (item, list, options) {
  list = parseList(list);
  return list.indexOf(item) > -1 ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifNotIn', function (item, list, options) {
  list = parseList(list);
  return list.indexOf(item) === -1 ? options.fn(this) : options.inverse(this);
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('init', async function () {
  game.settings.register("punkapocalyptic", "groupLuck", {
    name: "Group Luck",
    hint: "Stores the group's luck for the mission.",
    scope: "world",
    config: false,
    type: Number,
    default: 0,  // Default value (can be anything)
    onChange: value => {
      console.log(`Group Luck updated to: ${value}`);
    }
  });
});

Hooks.once('ready', function () {
  if (!game.user.isGM) {
    ui.notifications.warn("Only the GM can roll for group luck.");
    return false;
  }
  const sidebarMenu = document.querySelector("#sidebar-tabs menu");
  if (!sidebarMenu) return;

  // Create the <li> container
  const li = document.createElement("li");

  // Create the button
  const button = document.createElement("button");
  button.type = "button";
  button.classList.add("ui-control", "plain", "icon", "fa-solid", "fa-clover", "green");
  button.setAttribute("aria-label", "Session's Luck");
  button.setAttribute("data-tooltip", "Session's Luck"); // if you want a tooltip
  button.dataset.action = "roll-dice";

  // Add click behavior
  button.addEventListener("click", async () => {

    if (!game.user.isGM) {
      ui.notifications.warn("Only the GM can roll for group luck.");
      return false;
    }

    // Create a dialog to ask the GM how many d6 to roll
    const response = await foundry.applications.api.DialogV2.wait({
      title: await game.i18n.localize("PUNKAPOCALYPTIC.Dialogs.FortuneRoll.title"),
      content: `
          <p>${await game.i18n.localize("PUNKAPOCALYPTIC.Dialogs.FortuneRoll.description")}</p>
          <form>
              <div class="form-group">
                  <input type="number" id="numDice" name="numDice" value="1" min="1" style="width: 50px;">
              </div>
          </form>
      `,
      buttons: [
        {
          label: "Roll",
          default: true,
          callback: async (event, button, dialog) => {
            console.warn("Dialog action triggered:", button.form.numDice.value);
            let numDice = Math.max(1, parseInt(button.form.numDice.value) || 1); // Ensure at least 1
            let rollFormula = `${numDice}d6`;

            let roll = await new Roll(rollFormula).evaluate({ evaluateSync: true }); // Async evaluation for modern Foundry
            let luckValue = roll.total;

            // Store the luck value in game settings
            await game.settings.set("punkapocalyptic", "groupLuck", luckValue);

            // Send a private roll result to the GM
            ChatMessage.create({
              content: `<strong>${await game.i18n.localize("PUNKAPOCALYPTIC.ChatMessage.FortuneResult")}:</strong> ${luckValue}`,
              whisper: [game.user.id], // Only the GM sees this
              blind: true,
              speaker: ChatMessage.getSpeaker({ alias: "Game Master" }),
              rolls: [roll].filter(Boolean)
            });
            ui.players?.render(true);
            return "wew2"; // Return a value to indicate the action	
          }
        },
        {
          label: "Cancel",
          action: "cancel"
        }
      ]
    });

  });



  // Append everything
  li.appendChild(button);
  sidebarMenu.insertBefore(li, sidebarMenu.lastElementChild); // insert before collapse button
});

Hooks.on("renderChatMessageHTML", (message, html, data) => {

  const damageButtons = html.querySelectorAll(".roll-damage");

  damageButtons.forEach(button => {
    button.addEventListener('click', async (event) => {
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
  });

  const rangeButtons = html.querySelectorAll(".roll-range");

  rangeButtons.forEach(button => {
    button.addEventListener('click', async (event) => {
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

  const applyDamageButtons = html.querySelectorAll(".apply-damage");

  applyDamageButtons.forEach(button => {
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      const dataset = event.target.dataset;
      const targets = Array.from(game.user.targets);
      if (targets.length == 0) {
        ui.notifications.warn("Não há alvos selecionados");
      } else {
        for (let i=0; i< targets.length; i++) {
          targets[i].actor.applyDamage(dataset.damage);
        }
      }
    })
  })
});

Hooks.on('userConnected', async (user, connected) => {
  const gm = game.users.activeGM;
  const useGroupLuck = game.settings.get('punkapocalyptic', 'groupLuck');
  if (user.isGM || !gm?.isSelf || !useGroupLuck) return;
  ui.players?.render(true);
});

Hooks.on("renderPlayers", (_list, html, options) => {
  const users = html.querySelectorAll(".player");
  users.forEach((el) => new GroupLuckDisplay(el));
});

class GroupLuckDisplay {
  constructor(element) {
    this.element = element;
    this.userId = element.dataset.userId;
    this.player = game.users.get(this.userId);
    if (this.player?.isGM) return; // Only show for players
    this.render();
  }

  async render() {
    const counter = document.createElement("span");
    counter.classList.add("luck-counter");
    counter.style.textAlign = "right";

    const currentLuck = await game.settings.get("punkapocalyptic", "groupLuck") ?? 0;
    if (game.user.isGM)
      counter.innerHTML = `<i class="fa-solid fa-clover green"></i> ${currentLuck}`;
    else
      counter.innerHTML = `<i class="fa-solid fa-clover green"></i> ???`;
    counter.dataset.tooltip = "Group Luck";

    counter.addEventListener("click", async (event) => {
      // Get the current value
      const currentLuck = game.settings.get("punkapocalyptic", "groupLuck");

      // Create the chat message
      ChatMessage.create({
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ user: game.user }),
        content: `
    <p><strong><i class="fa-solid fa-clover green"></i> ${game.i18n.format("PUNKAPOCALYPTIC.ChatMessage.FortuneUseTitle", { username: game.user.name })}</strong></p>
    <button style="width: 100%;" type="button" class="use-luck">${game.i18n.localize("PUNKAPOCALYPTIC.ChatMessage.FortuneUseButton")}</button>
  `
      });
    });

    this.element.append(counter);
  }
}

Hooks.on("renderChatMessageHTML", (message, html, data) => {
  const fortuneButton = html.querySelectorAll(".use-luck");
  fortuneButton.forEach(button => {
    button.addEventListener("click", async () => {
      const current = game.settings.get("punkapocalyptic", "groupLuck");

      // Prevent going below zero
      if (current <= 0) {
        ui.notifications.warn("No more luck points!");
        return;
      }

      // Decrease luck
      await game.settings.set("punkapocalyptic", "groupLuck", current - 1);

      // Update display
      const luckCount = html.querySelector("#luck-count");
      if (luckCount) luckCount.textContent = current - 1;

      // Optional: disable button after use
      const useLuckButtons = html.querySelectorAll(".use-luck");
      useLuckButtons.forEach(button => button.disabled = true);


      // Optional: notify all 🍀 
      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ user: game.user }),
        content: `<p><i class="fa-solid fa-clover green"></i> ${game.i18n.format("PUNKAPOCALYPTIC.ChatMessage.FortuneUsed", { username: game.user.name })}</p>`
      });
      ui.players?.render(true); // Refresh player list to show updated luck
    });
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
