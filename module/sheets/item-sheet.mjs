import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

import * as utils from '../helpers/utils.mjs';

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class PunkapocalypticItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['punkapocalyptic', 'sheet', 'item'],
      width: 495,
      height: 530,
      dragDrop: [{ dropSelector: ".sheet-body"}],
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'description',
        },
      ],
    });
  }

  /** @override */
  get template() {
    const path = 'systems/punkapocalyptic/templates/item';
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.hbs`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.hbs`.
    return `${path}/item-${this.item.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = this.document.toPlainObject();

    // Enrich description info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedDescription = await TextEditor.enrichHTML(
      this.item.system.description,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Necessary in v11, can be removed in v12
        async: true,
        // Data to fill in for inline rolls
        rollData: this.item.getRollData(),
        // Relative UUID resolution
        relativeTo: this.item,
      }
    );


    // Add the item's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;
    context.abilities = CONFIG.PUNKAPOCALYPTIC.abilities;
    if (itemData.system?.damage) {
      context.system.formula = itemData.system.damage.diceNum + "d" + itemData.system.damage.diceSize;
      if (Number(itemData.system.damage.diceBonus) > 0) {
        context.system.formula = context.system.formula + "+" + itemData.system.damage.diceBonus
      } else if (Number(itemData.system.damage.diceBonus) < 0) {
        context.system.formula = context.system.formula + String(itemData.system.damage.diceBonus);
      }
    }

    if (itemData.system.hasOwnProperty("level")) {
      context.levels = [];
      for (const key in CONFIG.PUNKAPOCALYPTIC.pathLevels) {
        context.levels.push({
          id: key,
          label: game.i18n.localize(CONFIG.PUNKAPOCALYPTIC.pathLevels[key])
        })
      }
    }

    if (context.system?.resources) {
      for (const key in context.system.resources) {
        context.system.resources[key].icon = CONFIG.PUNKAPOCALYPTIC.resourceImages[key];
      }
    }

    // Adding a pointer to CONFIG.PUNKAPOCALYPTIC
    context.config = CONFIG.PUNKAPOCALYPTIC;

    // Prepare active effects for easier access
    context.effects = prepareActiveEffectCategories(this.item.effects);
    context.initial_items = [];
    context.mission4_items = [];
    if (this.item.type == "background") {
      const talentUuids = this.item.system.itemIds || [];
      for (const uuid of talentUuids) {
        let item = await fromUuid(uuid);
        if (!item) {
          item = {
            uuid: uuid
          }
        }
        if (item.system?.missions) {
          if (item.system.missions == "4") {
            context.mission4_items.push(item);
          }
        } else {
          context.initial_items.push(item);
        }
      }
      //context.talents = this.item.system.talents;
    } else if (this.item.type == "weapon") {
      context.categories = CONFIG.PUNKAPOCALYPTIC.weaponCategories;
      const weapon_traits = this.item.system.traits
        .split(",")
        .map(trait => trait.replace(/\(.*?\)/g, '').trim().toLowerCase());
      context.traits = [];
      for (const key in CONFIG.PUNKAPOCALYPTIC.weaponTraits) {
        const trait_tranlated = game.i18n.localize(CONFIG.PUNKAPOCALYPTIC.weaponTraits[key]).toLowerCase();
        if (weapon_traits.includes(trait_tranlated)) {
          context.traits.push({
            label: game.i18n.localize(CONFIG.PUNKAPOCALYPTIC.weaponTraits[key]),
            description: game.i18n.localize(CONFIG.PUNKAPOCALYPTIC.weaponTraitDescriptions[key]),
          });
        }
      }
    } else if (this.item.type == "path") {
      const talentUuids = this.item.system.itemIds || [];
      for (const uuid of talentUuids) {
        let item = await fromUuid(uuid);
        if (!item) {
          item = {
            uuid: uuid
          }
        }
        context.initial_items.push(item);
      }
      context.initial_items.sort((a, b) => a.name.localeCompare(b.name))
     
      //context.talents = this.item.system.talents;
    } else if (this.item.type == "mutation") {
      context.mutationTypes = [];
      for (const key in CONFIG.PUNKAPOCALYPTIC.mutationTypes) {
        context.mutationTypes.push({
          id: key,
          label: game.i18n.localize(CONFIG.PUNKAPOCALYPTIC.mutationTypes[key])
      });
      }
    }

    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.

    // Active Effect management
    html.on('click', '.effect-control', (ev) =>
      onManageActiveEffect(ev, this.item)
    );
    html.on('click', '.editable', (ev) =>
      this.editItem(ev, this.item)
    );
    html.on('click', '.item-associate', (ev) => {
      this._onItemAssociate(ev);
    });

    html.on('click', '.item-open', async (ev) => {
      await this._onItemOpen(ev);
    });

    html.on('click', '.item-remove', (ev) => {
      this._onItemRemove(ev);
    });
  }

  async _onItemOpen(event) {
    const row = event.currentTarget.closest('li');
    const item = await fromUuid(row.dataset.itemUuid);
    item.sheet.render(true);

  }

  async _onItemRemove(event) {
    const row = event.currentTarget.closest('li');
    const uuid = row.dataset.itemUuid;
    const itemIds = this.item.system.itemIds || [];
    console.warn("UID", uuid);
    console.warn(itemIds);
    const index = itemIds.indexOf(uuid);
    if (index > -1) {
      itemIds.splice(index, 1);
      await this.item.update({ "system.itemIds": itemIds });
    }
  }

  async _onItemAssociate(event) {
    try {
      const data = await foundry.applications.api.DialogV2.prompt({
        window: { title: `Associar Talento: ${this.item.name}` },
        content: `<label for="talent-uuid">UUID do Talento:</label>
                  <input type="text" id="talent-uuid" name="talentUuid" />`,
        ok: {
          label: "Salvar",
          callback: async (event, button, dialog) => {
            const talentUuid = button.form.elements.talentUuid.value.trim();
            if (talentUuid) {
              const itemIds = this.item.system.itemIds || [];
              const item = await fromUuid(talentUuid);
              if (item) {
                itemIds.push(talentUuid);
              }
              await this.item.update({ "system.itemIds": itemIds });
            }
          }
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  async editItem(event, item) {
    const dataset = event.currentTarget.dataset;
    let data = {};
    const rootPath = dataset.path;
    const pathDiceNum = rootPath + ".diceNum";
    const pathDiceBonus = rootPath + ".diceBonus";
    const pathDiceSize = rootPath + ".diceSize";
    console.warn("editItem", dataset, rootPath, pathDiceNum, pathDiceBonus, pathDiceSize);
    console.warn("item", utils.getValueByPath(item, rootPath));
    if (item.type == "weapon") {
      try {
        data = await foundry.applications.api.DialogV2.prompt({
          window: { title: `Dano: ${item.name}` },
          content: `<label for="dice-number">Dados:</label>
          <input type="number" id="dice-number" name="diceNum" value="${utils.getValueByPath(item, pathDiceNum)}" min="0" />
          <label for="dice-size">Dado:</label>
          <select id="dice-size" name="diceSize">
            <option value="4" ${utils.getValueByPath(item, pathDiceSize) == 4 ? 'selected' : ''}>d4</option>
            <option value="6" ${utils.getValueByPath(item, pathDiceSize) == 6 ? 'selected' : ''}>d6</option>
            <option value="8" ${utils.getValueByPath(item, pathDiceSize) == 8 ? 'selected' : ''}>d8</option>
            <option value="12" ${utils.getValueByPath(item, pathDiceSize) == 12 ? 'selected' : ''}>d12</option>
            <option value="20" ${utils.getValueByPath(item, pathDiceSize) == 20 ? 'selected' : ''}>d20</option>
          </select>
          <label for="dice-mod">Modificador:</label>
          <input type="number" id="dice-mod" name="diceBonus" value="${utils.getValueByPath(item, pathDiceBonus)}" />`,
          ok: {
            label: "Salvar",
            callback: async (event, button, dialog) => {
              const diceNum = parseInt(button.form.elements.diceNum.value, 10);
              const diceBonus = parseInt(button.form.elements.diceBonus.value, 10);
              const diceSize = parseInt(button.form.elements.diceSize.value, 10);
              await this.item.update({
                [pathDiceNum]: diceNum,
                [pathDiceBonus]: diceBonus,
                [pathDiceSize]: diceSize
              });
            }
          }
        });
      } catch (e) {
        return;
      }
    }
  }
  async _onDrop(event) {
    event.preventDefault();

    // Extract dropped data
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch (err) {
      console.error("Error parsing drop data:", err);
      return;
    }

    console.log("Dropped data:", data);
    if (!['background','path'].includes(this.item.type)) {
      return;
    }
    // Ensure it's an valid item
    if (data.type !== "Item") {
      ui.notifications.warn("You can only drop items here.");
      return;
    }

    // Retrieve the dropped item document
    let droppedItem = await fromUuid(data.uuid);
    if (!droppedItem) {
      console.error("Dropped item not found.");
      return;
    }

    if(droppedItem.type != 'benefit') {
      console.error("Only benefits are allowed.");
      return;
    }

    console.log(`Dropped item "${droppedItem.name}" with ID: ${droppedItem.id}`);

    // Get the current list of item IDs and update
    let itemIds = foundry.utils.duplicate(this.item.system.itemIds || []);

    // Avoid duplicates
    if (!itemIds.includes(data.uuid)) {
      itemIds.push(data.uuid);
      await this.item.update({ "system.itemIds": itemIds });
      ui.notifications.info(`Added "${droppedItem.name}" to the item.`);
    } else {
      ui.notifications.warn(`"${droppedItem.name}" is already linked.`);
    }
  }
}
