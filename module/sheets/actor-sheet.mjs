import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class PunkapocalypticActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    const options = super.defaultOptions
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['punkapocalyptic', 'sheet', 'actor'],
      width: 840,
      height: 899,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'features',
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/punkapocalyptic/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.document.toPlainObject();

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Adding a pointer to CONFIG.PUNKAPOCALYPTIC
    context.config = CONFIG.PUNKAPOCALYPTIC;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Enrich biography info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedBiography = await TextEditor.enrichHTML(
      this.actor.system.biography,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Necessary in v11, can be removed in v12
        async: true,
        // Data to fill in for inline rolls
        rollData: this.actor.getRollData(),
        // Relative UUID resolution
        relativeTo: this.actor,
      }
    );

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(
      // A generator that returns all effects stored on the actor
      // as well as any items
      this.actor.allApplicableEffects()
    );

    return context;
  }

  /**
   * Character-specific context modifications
   *
   * @param {object} context The context object to mutate
   */
  _prepareCharacterData(context) {
    // This is where you can enrich character-specific editor fields
    // or setup anything else that's specific to this type
    console.warn(context.actor)
    for (const ability in context.actor.system.abilities) {
      context.actor.system.abilities[ability].tooltip = game.i18n.localize(`PUNKAPOCALYPTIC.Ability.${ability.capitalize()}.Tooltip`);
    }

    if (context.actor.type == "npc") {
      delete context.actor.system.abilities.education;
    }
    return context
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {object} context The context object to mutate
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const weapons = [];
    const features = [];
    const traits = [];
    const activities = [];
    const background = context.items.find(i => i.type == "background") || { name: "Histórico", description: "" }
    console.warn(background)
    const spells = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: [],
    };

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === 'feature') {
        features.push(i);
      } else if (i.type === 'trait') {
        traits.push(i);
      } else if (i.type === 'weapon') {
        let bonus = i.system.damage.diceBonus >= 0 ? "+" + i.system.damage.diceBonus : i.system.damage.diceBonus
        bonus = Number(bonus) != 0 ? String(bonus) : "";
        i.system.damage_formula = i.system.damage.diceNum + "d" + i.system.damage.diceSize + bonus;
        weapons.push(i);
      } else if (i.type === 'special_activity') {
        activities.push(i);
      }
      // Append to spells.
      else if (i.type === 'spell') {
        if (i.system.spellLevel != undefined) {
          spells[i.system.spellLevel].push(i);
        }
      }
    }

    if (context.system?.resources) {
      for (const key in context.system.resources) {
        context.system.resources[key].icon = CONFIG.PUNKAPOCALYPTIC.resourceImages[key];
      }
    }

    // Assign and return
    context.gear = gear;
    context.features = features;
    context.spells = spells;
    context.traits = traits;
    context.weapons = weapons;
    context.activities = activities;
    context.background = background;
    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    if (this.actor.type == "npc") {
      this.position.width = 700;
      this.position.height = 675;
      this.setPosition(this.position);
    }

    // Render the item sheet for viewing/editing prior to the editable check.
    html.on('click', '.item-edit', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });
    html.on('click', '.decrease', (ev) => {
      const new_value = this.actor.system.health.current - 1;
      if (new_value >= 0)
        this.actor.update({ "system.health.current": new_value })
    });
    html.on('click', '.increase', (ev) => {
      const new_value = this.actor.system.health.current + 1;
      if (new_value <= this.actor.system.health.max)
        this.actor.update({ "system.health.current": new_value })
    });


    // Handle clicking the profile div to open FilePicker
    html.on('click', '.profile-img', (ev) => {
      console.log()
      const fp = new FilePicker({
        type: 'image',
        current: ev.currentTarget.style.backgroundImage.replace(/^url\(["']?/, '').replace(/["']?\)$/, ''),
        callback: path => {
          ev.currentTarget.style.backgroundImage = `url(${path})`;
          this.actor.update({ img: path });
          //ev.currentTarget.closest('form').find('input[name="img"]').val(path).change();
        }
      });
      fp.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.on('click', '.item-create', this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.on('click', '.item-delete', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.on('click', '.effect-control', (ev) => {
      const row = ev.currentTarget.closest('li');
      const document =
        row.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(row.dataset.parentId);
      onManageActiveEffect(ev, document);
    });

    // Rollable abilities.
    html.on('click', '.rollable', this._onRoll.bind(this));
    html.on('contextmenu', '.rollable', this._onRollDialog.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return;
        li.setAttribute('draggable', true);
        li.addEventListener('dragstart', handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = foundry.utils.duplicate(header.dataset);
    // Initialize a default name.
    const name = game.i18n.localize(`PUNKAPOCALYPTIC.New.${type.capitalize()}`);
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system['type'];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  async getAbilityDialog() {
    let ability = "";
    const abilities = Object.entries(CONFIG.PUNKAPOCALYPTIC.abilities);
    let content = '<h4>Escolha a abilidade para esse item</h4><select name="ability" type="text" ><option value="" selected></option>';
    for (const key of abilities) {
      content += `<option value="${key[0]}">${game.i18n.localize(key[1])}</option>`;
    }
    content += "</select>"
    try {
      ability = await foundry.applications.api.DialogV2.prompt({
        window: { title: `Escolha um atributo` },
        content: content,
        ok: {
          label: "Rollar",
          callback: (event, button, dialog) => button.form.elements.ability.value || ""
        }
      });
    } catch (e) {
      console.log("User did not roll.");
      console.log(e)
      return;
    }
    return ability;

  }

  async _onRollDialog(event) {
    let mod = 0;
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    try {
      mod = await foundry.applications.api.DialogV2.prompt({
        window: { title: `Rollagem de atributo: ${dataset.label}` },
        content: '<h4>Modificador da rolagem</h4><input name="mod" type="number" value="" autofocus>',
        ok: {
          label: "Rollar",
          callback: (event, button, dialog) => button.form.elements.mod.valueAsNumber || 0
        }
      });
    } catch (e) {
      console.log("User did not roll.");
      console.log(e)
      return;
    }
    this._onRoll(event, mod);

  }
  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onRoll(event, mod = 0) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'damage') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.rollDamage();
      } else {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item.type == "weapon") {
          if (item.system.roll.ability == "") {
            const ability = await this.getAbilityDialog()
            await item.update({ "system.roll.ability": ability })
          }
          item.system.formula = "1d20+" + (this.actor.system.abilities[item.system.roll.ability].mod)
          console.warn(item.system.formula)
        }
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll + "+" + mod, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

  async _onDropItemCreate(itemData, event) {
    if (super._onDropItemCreate) {
      await super._onDropItemCreate(itemData, event);
    }
    if (itemData.type == "background") {
      const new_value = this.actor.system.abilities[itemData.system.ability.id].value + itemData.system.ability.bonus;
      const current_background = this.actor.items.find((i) => i.type == "background");
      const new_path = `system.abilities.${itemData.system.ability.id}.value`;
      await this.actor.update({ [new_path]: Number(new_value) });
      await this.resourcesFromBackground(itemData)
      if (current_background) {
        const old_value = this.actor.system.abilities[current_background.system.ability.id].value - current_background.system.ability.bonus;
        const old_path = `system.abilities.${current_background.system.ability.id}.value`;
        await this.actor.update({ [old_path]: old_value });
        await this.removeResourcesFromBackground(current_background)
        await this.actor.deleteEmbeddedDocuments("Item", [current_background.id])
      }
    }
  }

  async removeResourcesFromBackground(item) {
    if (item.type != "background") {
      return;
    }

    const actorResources = foundry.utils.deepClone(this.actor.system.resources); // Clone to avoid direct mutation
    const itemResources = item.system.resources || {}; // Ensure item has resources

    let updatedResources = {}; // Store only changed values

    // Loop through the resources in the item
    for (const [resourceKey, resourceData] of Object.entries(itemResources)) {
      if (actorResources.hasOwnProperty(resourceKey)) {
        // Ensure the resource has a valid number value
        const itemValue = Number(resourceData.value) || 0;
        const currentValue = Number(actorResources[resourceKey].value) || 0;

        // Update the resource value in the cloned data
        updatedResources[`system.resources.${resourceKey}.value`] = currentValue - itemValue;
      }
    }

    // Check if there's something to update
    if (Object.keys(updatedResources).length > 0) {
      await this.actor.update(updatedResources);
      console.log("Updated actor resources:", updatedResources);
    } else {
      console.log("No resources to update.");
    }
  }

  async resourcesFromBackground(item) {
    if (item.type != "background") {
      return;
    }

    const actorResources = foundry.utils.deepClone(this.actor.system.resources); // Clone to avoid direct mutation
    const itemResources = item.system.resources || {}; // Ensure item has resources

    let updatedResources = {}; // Store only changed values

    // Loop through the resources in the item
    for (const [resourceKey, resourceData] of Object.entries(itemResources)) {
      if (actorResources.hasOwnProperty(resourceKey)) {
        // Ensure the resource has a valid number value
        const itemValue = Number(resourceData.value) || 0;
        const currentValue = Number(actorResources[resourceKey].value) || 0;

        // Update the resource value in the cloned data
        updatedResources[`system.resources.${resourceKey}.value`] = currentValue + itemValue;
      }
    }

    // Check if there's something to update
    if (Object.keys(updatedResources).length > 0) {
      await this.actor.update(updatedResources);
      console.log("Updated actor resources:", updatedResources);
    } else {
      console.log("No resources to update.");
    }
  }

}
