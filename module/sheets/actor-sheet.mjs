import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';
import * as utils from '../helpers/utils.mjs';
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
      width: 540,
      height: 965,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'main',
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
      await this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      await this._prepareItems(context);
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
    for (const ability in context.actor.system.abilities) {
      context.actor.system.abilities[ability].tooltip = game.i18n.localize(CONFIG.PUNKAPOCALYPTIC.abilityTooltips[ability]);
      context.actor.system.abilities[ability].img = CONFIG.PUNKAPOCALYPTIC.abilityImages[ability];
    }

    if (context.actor.system?.resources) {
      for (const key in context.actor.system.resources) {
        context.actor.system.resources[key].icon = CONFIG.PUNKAPOCALYPTIC.resourceImages[key];
      }
    }

    if (context.actor.system?.otherAttributes) {
      for (const key in context.actor.system.otherAttributes) {
        context.actor.system.otherAttributes[key].icon = CONFIG.PUNKAPOCALYPTIC.otherAttributesImages[key];
        context.actor.system.otherAttributes[key].label = CONFIG.PUNKAPOCALYPTIC.otherAttributes[key];

      }
    }

    context.actor.system.speed["label"] = game.i18n.localize(CONFIG.PUNKAPOCALYPTIC.commonAttributes["speed"]);
    context.actor.system.speed["img"] = CONFIG.PUNKAPOCALYPTIC.commonAttributeImages["speed"];


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
  async _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const inventory = [];
    const features = [];
    const traits = [];
    const activities = [];
    const benefits = [];
    const mutations = [];
    const background = [];
    let background_name = game.i18n.localize("PUNKAPOCALYPTIC.SheetLabels.Background");
    //await context.items.find(i => i.type == "background") || { name: "Histórico", system: { description: "" } }
    // context.enrichedBackground = await TextEditor.enrichHTML(
    //   background.system.description,
    //   {
    //     // Whether to show secret blocks in the finished html
    //     secrets: this.document.isOwner,
    //     // Necessary in v11, can be removed in v12
    //     async: true,
    //     // Data to fill in for inline rolls
    //     rollData: this.actor.getRollData(),
    //     // Relative UUID resolution
    //     relativeTo: background,
    //   }
    // );

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      // Append to gear.
      if (i.type === 'feature') {
        features.push(i);
      } else if (CONFIG.PUNKAPOCALYPTIC.inventoryTypes.includes(i.type)) {
        inventory.push(i);
      } else if (i.type === 'specialActivity') {
        activities.push(i);
      } else if (CONFIG.PUNKAPOCALYPTIC.benefitSubTypes.includes(i.type)) {
        benefits.push(i);
      } else if (i.type == "trait") {
        traits.push(i);
      } else if (i.type == "mutation") {
        mutations.push(i);
      } else if (["background", "path"]) {
        if (i.type == "background") {
          background_name = i.name;
        }
        background.push(i);
      }
    }

    const equipped = context.items.filter(i => i.type == "weapon" && i.system.equipped);
    if (equipped.length == 0) {
      equipped.push(CONFIG.PUNKAPOCALYPTIC.defaultItems["hand"])
      equipped.push(CONFIG.PUNKAPOCALYPTIC.defaultItems["hand"])
    } else {
      for (const key in equipped) {
        equipped[key].system.roll.formula = `1d20+@abilities.${equipped[key].system.roll.ability}.mod`;
        equipped[key].system.damage.formula = `${equipped[key].system.damage.diceNum}d${equipped[key].system.damage.diceSize} + ${equipped[key].system.damage.diceBonus}`;
      }
      if (equipped.length < 2) {
        equipped.push(CONFIG.PUNKAPOCALYPTIC.defaultItems["hand"])
      }
    }


    // Assign and return

    context.equipped = equipped;
    context.gear = gear;
    context.features = features;
    //context.spells = spells;
    context.traits = traits;
    context.inventory = inventory;
    context.activities = activities;
    context.background = background;
    context.benefits = benefits;
    context.mutations = mutations;
    context.background_name = background_name;
    const effects = Array.from(context.effects);
    context.showeffects = effects.filter(i => !i.disabled);
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
      this.options.classes.push("npc-sheet");
    }

    // Render the item sheet for viewing/editing prior to the editable check.
    html.on('click', '.item-edit', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });
    html.on('click', '.decrease', (ev) => {
      const new_value = this.actor.system.health.value - 1;
      if (new_value >= 0)
        this.actor.update({ "system.health.value": new_value })
    });
    html.on('click', '.increase', (ev) => {
      const new_value = this.actor.system.health.value + 1;
      if (new_value <= (this.actor.system.health.max))
        this.actor.update({ "system.health.value": new_value })
    });

    html.on('click', '.profile-img-circle', (ev) => {
      ev.stopPropagation();
    });

    html.on('contextmenu', '.profile-img', (ev) => {
      {
        new ImagePopout(this.actor.img, {
          title: "Actor Popout",
          shareable: true,
        }).render(true);
      }
    });
    // Handle clicking the profile div to open FilePicker
    html.on('click', '.profile-img', (ev) => {
      const fp = new FilePicker({
        type: 'image',
        current: ev.currentTarget.dataset.img.replace(/^url\(["']?/, '').replace(/["']?\)$/, ''),
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

    html.on('click', '.pc-progress', (ev) => {
      if (this.actor.isOwner) {
        this._missionProgress();
      }
    })

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

  async _missionProgress() {
    const actor = this.actor;

    CONFIG.PUNKAPOCALYPTIC.progress_function(this.actor);

  }

  async chooseOption() {
    const option = await foundry.applications.api.DialogV2.wait({
      window: { title: "Criar item" },
      content: "<p>Escolha o tipo de item:</p>",
      modal: true,
      buttons: [
        { label: "Coisa", action: "item" },
        { label: "Arma", action: "weapon" },
        { label: "Veste", action: "armor" }
      ]
    });

    return option;
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
    let type = header.dataset.type;
    if (type == 'item') {
      type = await this.chooseOption();
    }
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
    const newItem = await Item.create(itemData, { parent: this.actor });
    newItem.sheet.render(true);
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
        window: { title: `Modificadores para: Rollagem de atributo ${dataset.label}` },
        content: `
        <!--h4 style="font-family: 'Scurlock', sans-serif; color: #eddba9;">
            Modificadores da rolagem</h4-->
            Complicações / Recursos 
            <div style="display: flex; align-items: center; gap: 5px;">
                <button onclick="document.getElementById('complica').value = Number(document.getElementById('complica').value) - Number(1)" style="width: 10px; text-align: center;" type="button" class="decrement">-</button>
                <input style="text-align: center" id="complica" name="mod" type="number" value="0" min="-10" max="10"  autofocus readonly>
                <button style="width: 10px; text-align: center;" onclick="document.getElementById('complica').value = Number(document.getElementById('complica').value) + Number(1)" type="button" class="increment">+</button>
            </div>
        `,
        ok: {
          label: "Rollar",
          callback: (event, button, dialog) => button.form.elements.mod.valueAsNumber || 0
        },
        render: (event, dialog) => {
          console.log("Dialog rendered", dialog.element);
          const input = dialog.element.querySelector("#complica");
          dialog.element.querySelector(".decrement")?.addEventListener("click", () => {
            input.value = Math.max(Number(input.min), Number(input.value) - 1);
          });
          dialog.element.querySelector(".increment")?.addEventListener("click", () => {
            input.value = Math.min(Number(input.max), Number(input.value) + 1);
          });
        }
      });
    } catch (e) {
      console.log("User did not roll.");
      console.log(e)
      return;
    }
    if (mod != null && mod != undefined) {
    this._onRoll(event, mod);
    }

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
      if (dataset.rollType == 'select-ammo') {
        const itemId = element.closest('.item').dataset.itemId;
        const equipped_items = this.actor.items.filter((i) => i.type == "weapon" && i.system.equipped);
        const item = this.actor.items.get(itemId);
        if (equipped_items.length > 1 && !item.system.equipped && item.type == "weapon") {
          ui.notifications.warn(await game.i18n.localize("PUNKAPOCALYPTIC.Messages.SelectWeaponLimitExceeded"));
          return;
        }
        if (item) {
          return item.selectAmmo();
        }
      } else if (dataset.rollType == 'damage') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.rollDamage();
      } if (dataset.rollType == 'attack') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) {
          return item.roll(mod);
        } else if (itemId == 'hand') {
          const handItemName = await game.i18n.localize(CONFIG.PUNKAPOCALYPTIC.defaultItems["hand"].name);
          let handItem = this.actor.items.find(i => i.name == handItemName);
          if (!handItem) {
            ui.notifications.info(await game.i18n.localize("PUNKAPOCALYPTIC.Messages.HandItemAdded"));
            let tmpItem = foundry.utils.duplicate(CONFIG.PUNKAPOCALYPTIC.defaultItems["hand"]);
            delete tmpItem._id;
            delete tmpItem.id;
            tmpItem.name = handItemName;
            tmpItem.system.description = await game.i18n.localize(tmpItem.system.description);
            handItem = await Item.create(tmpItem, { parent: this.actor });
          }

          return handItem.roll(mod);
        }
      } else if (dataset.rollType == 'ability') {
        this.actor.rollAbility(dataset.abilityId, mod);

      } else {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) {
          item.toMessage();

        }
      }
    }
  }

  async _onDropItemCreate(itemData, event) {
    if (super._onDropItemCreate) {
      await super._onDropItemCreate(itemData, event);
    }
    if (itemData.type == "background") {
      const new_value = this.actor.system.abilities[itemData.system.ability.id].value + itemData.system.ability.bonus;
      const new_path = `system.abilities.${itemData.system.ability.id}.value`;
      await this.actor.update({ [new_path]: Number(new_value) });
      const initialItemIds = itemData.system.itemIds || [];
      for (const newItemId of initialItemIds) {
        const newItem = await fromUuid(newItemId);
        if (newItem) {
          if (newItem.system?.missions) {
            const missions = utils.getMissions(newItem.system.missions);
            if (!missions.includes(this.actor.system.missions)) {
              continue;
            }
          }
          await this.actor.createEmbeddedDocuments("Item", [newItem]);
        }
      }
      await this.resourcesFromBackground(itemData)
    } else if (itemData.type == "path") {
      if (itemData.system.level) {
        const initialItemIds = itemData.system.itemIds || [];
        for (const newItemId of initialItemIds) {
          const newItem = await fromUuid(newItemId);
          if (newItem) {
            // mission 1
            if (this.actor.system.missions) {
              const missions = utils.getMissions(newItem.system.missions)
              if (!missions.includes(this.actor.system.missions)) {
                continue;
              }
            }
            await this.actor.createEmbeddedDocuments("Item", [newItem]);
          }
        }


      }

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
    } else {
      console.log("No resources to update.");
    }
  }

}
