import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';


let Meter = function Meter($elm, config) {

  // DOM
  let $needle, $value;

  // Others

  let steps = (config.valueMax - config.valueMin) / config.valueStep,
    angleStep = (config.angleMax - config.angleMin) / steps;

  let margin = 10; // in %
  let angle = 0; // in degrees

  let value2angle = function (value) {
    let angle = ((value / (config.valueMax - config.valueMin)) * (config.angleMax - config.angleMin) + config.angleMin);

    return angle;
  };

  this.setValue = function (v) {
    $needle.style.transform = "translate3d(-50%, 0, 0) rotate(" + Math.round(value2angle(v)) + "deg)";
    $value.innerHTML = config.needleFormat(v);
  };

  let switchLabel = function (e) {
    e.target.closest(".meter").classList.toggle('meter--big-label');
  };

  let makeElement = function (parent, className, innerHtml, style) {

    let e = document.createElement('div');
    e.className = className;

    if (innerHtml) {
      e.innerHTML = innerHtml;
    }

    if (style) {
      for (var prop in style) {
        e.style[prop] = style[prop];
      }
    }

    parent.appendChild(e);

    return e;
  };

  // Label unit
  makeElement($elm, "label label-unit", config.valueUnit);

  for (let n = 0; n < steps + 1; n++) {
    let value = config.valueMin + n * config.valueStep;
    angle = config.angleMin + n * angleStep;

    // Graduation numbers

    // Red zone
    let redzoneClass = "";
    if (value > config.valueRed) {
      redzoneClass = " redzone";
    }

    makeElement($elm, "grad grad--" + n + redzoneClass, config.labelFormat(value), {
      left: (50 - (50 - margin) * Math.sin(angle * (Math.PI / 180))) + "%",
      top: (50 + (50 - margin) * Math.cos(angle * (Math.PI / 180))) + "%"
    });

    // Tick
    makeElement($elm, "grad-tick grad-tick--" + n + redzoneClass, "", {
      left: (50 - 50 * Math.sin(angle * (Math.PI / 180))) + "%",
      top: (50 + 50 * Math.cos(angle * (Math.PI / 180))) + "%",
      transform: "translate3d(-50%, 0, 0) rotate(" + (angle + 180) + "deg)"
    });

    // Half ticks
    angle += angleStep / 2;

    if (angle < config.angleMax) {
      makeElement($elm, "grad-tick grad-tick--half grad-tick--" + n + redzoneClass, "", {
        left: (50 - 50 * Math.sin(angle * (Math.PI / 180))) + "%",
        top: (50 + 50 * Math.cos(angle * (Math.PI / 180))) + "%",
        transform: "translate3d(-50%, 0, 0) rotate(" + (angle + 180) + "deg)"
      });
    }

    // Quarter ticks
    angle += angleStep / 4;

    if (angle < config.angleMax) {
      makeElement($elm, "grad-tick grad-tick--quarter grad-tick--" + n + redzoneClass, "", {
        left: (50 - 50 * Math.sin(angle * (Math.PI / 180))) + "%",
        top: (50 + 50 * Math.cos(angle * (Math.PI / 180))) + "%",
        transform: "translate3d(-50%, 0, 0) rotate(" + (angle + 180) + "deg)"
      });
    }

    angle -= angleStep / 2;

    if (angle < config.angleMax) {
      makeElement($elm, "grad-tick grad-tick--quarter grad-tick--" + n + redzoneClass, "", {
        left: (50 - 50 * Math.sin(angle * (Math.PI / 180))) + "%",
        top: (50 + 50 * Math.cos(angle * (Math.PI / 180))) + "%",
        transform: "translate3d(-50%, 0, 0) rotate(" + (angle + 180) + "deg)"
      });
    }
  }

  // NEEDLE

  angle = value2angle(config.value);

  $needle = makeElement($elm, "needle", "", {
    transform: "translate3d(-50%, 0, 0) rotate(" + angle + "deg)"
  });

  let $axle = makeElement($elm, "needle-axle").addEventListener("click", switchLabel);
  makeElement($elm, "label label-value", "<div>" + config.labelFormat(config.value) + "</div>" + "<span>" + config.labelUnit + "</span>").addEventListener("click", switchLabel);

  $value = $elm.querySelector(".label-value div");
};

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class PunkapocalypticVehicleSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    const options = super.defaultOptions
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['punkapocalyptic', 'sheet', 'vehicle'],
      width: 855,
      height: 760,
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
    await this._prepareItems(context);
    this._prepareCharacterData(context);
    this._prepareDashboardData(context)

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
      context.actor.system.abilities[ability] = context.actor.system.abilities[ability];
      context.actor.system.abilities[ability].tooltip = game.i18n.localize(`PUNKAPOCALYPTIC.Ability.${ability.capitalize()}.Tooltip`);
      context.actor.system.abilities[ability].img = CONFIG.PUNKAPOCALYPTIC.abilityImages[ability];
    }

    for (const statistic in context.actor.system.otherStatistics) {
      context.actor.system.otherStatistics[statistic] = context.actor.system.otherStatistics[statistic];
      context.actor.system.otherStatistics[statistic].tooltip = game.i18n.localize(`PUNKAPOCALYPTIC.Vehicle.${statistic.capitalize()}.Tooltip`);
      context.actor.system.otherStatistics[statistic].label = game.i18n.localize(`PUNKAPOCALYPTIC.Vehicle.${statistic.capitalize()}.long`);
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

    const accelerationOptions = [];
    for (const key in CONFIG.PUNKAPOCALYPTIC.vehicleAccelerationValue) {
      const reference = CONFIG.PUNKAPOCALYPTIC.vehicleAccelerationValue[key];
      accelerationOptions.push({
        id: key,
        label: game.i18n.localize(CONFIG.PUNKAPOCALYPTIC.vehicleAcceleration[reference])
      });
    }
    context.accelerationOptions = accelerationOptions;

    context.actor.system.speed["label"] = game.i18n.localize(CONFIG.PUNKAPOCALYPTIC.commonAttributes["speed"]);
    context.actor.system.speed["img"] = CONFIG.PUNKAPOCALYPTIC.commonAttributeImages["speed"];



    delete context.actor.system.abilities.education;

    return context
  }

  _prepareDashboardData(context) {
    context.speed_dashboard = context.actor.system.speed.current < 9 ? CONFIG.PUNKAPOCALYPTIC.speedNeedle[context.actor.system.speed.current] : CONFIG.PUNKAPOCALYPTIC.speedNeedle[9];
    const totalfuel = context.actor.system.otherStatistics.fuel.value;
    context.fuel_dashboard = 32 + (context.actor.system.otherStatistics.fuel.current * 298 / totalfuel);

    return context;
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {object} context The context object to mutate
   */
  async _prepareItems(context) {
    // Initialize containers.
    const occupants = [];
    const parts = [];
    const vehicleUpgrades = [];
    const vehicleAccessories = [];

    for (let i of this.actor.system.occupants) {
      const actor = await fromUuid(i.uuid);
      if (actor) {
        occupants.push({ uuid: i.uuid, driver: i.driver, name: actor.name, img: actor.img });
      } else {
        this.actor.update({ "system.occupants": this.actor.system.occupants.filter(o => o.uuid != i.uuid) });
      }
    }

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      // Append to gear.
      if (i.type === "vehiclePart") {
        parts.push(i);
      } else if (i.type === "vehicleUpgrade") {
        vehicleUpgrades.push(i);
      } else if (i.type === "vehicleAccessory") {
        vehicleAccessories.push(i);
      }
    }



    // Assign and return



    context.parts = parts;
    context.vehicleUpgrades = vehicleUpgrades;
    context.vehicleAccessories = vehicleAccessories;
    const effects = Array.from(context.effects);
    context.showeffects = effects.filter(i => !i.disabled);
    context.occupants = occupants;
    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);



    // Render the item sheet for viewing/editing prior to the editable check.
    html.on('click', '.item-edit', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });
    html.on('click', '.item-damage', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      if (item.system.health.value > 0)
        item.update({ "system.health.value": item.system.health.value - 1 });
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
      console.log()
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
    html.on('click', '.item-delete', async (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      if (item) {
        item.delete();
      } else {
        if (!game.user.isGM) {
          ui.notifications.warn("Apenas o GM pode desembarcar personagens de veículos");
          return;
        }
        const actoruuid = li.data('itemId');
        if (actoruuid) {
          const actor = this.actor.system.occupants.find(o => o.uuid == actoruuid);
          if (actor.dirver) {
            await this.actor.update({ "system.driver": false });
          }
          await this.actor.update({ "system.occupants": this.actor.system.occupants.filter(o => o.uuid != actoruuid) });
          await this.actor.update({ "system.otherStatistics.occupants.current": this.actor.system.otherStatistics.occupants.current - 1 });
        }

        const permissionLevel = CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE;
        const actor = await fromUuid(actoruuid);
        if (actor.type == "character") {
          const ownerEntry = Array.from(Object.entries(actor.ownership));
          let user = {};
          for (const test of ownerEntry) {
            const tempuser = game.users.get(test[0]);
            if (tempuser) {
              if (!tempuser.isGM) {
                user = tempuser;
              }
            }
          }
          if (user) {
            if (game.user.isGM) {
              await this.actor.update({
                [`ownership.${user.id}`]: permissionLevel
              });
            }
          }
        }

      }
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
        window: { title: `Modificadores para: Rollagem de atributo ${dataset.label}` },
        content: `
        

        <!--h4 style="font-family: 'Scurlock', sans-serif; color: #eddba9;">
            Modificadores da rolagem</h4-->
            Complicações / Recursos 
            <div style="display: flex; align-items: center; gap: 5px;">
                <button onClick="document.getElementById('complica').value = Number(document.getElementById('complica').value) - Number(1)" style="width: 10px; text-align: center;" type="button" class="decrement">-</button>
                <input style="text-align: center" id="complica" name="mod" type="number" value="0" min="-10"  autofocus readonly>
                <button style="width: 10px; text-align: center;" onClick="document.getElementById('complica').value = Number(document.getElementById('complica').value) + Number(1)" type="button" class="increment">+</button>
            </div>
        `,
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
      switch (dataset.rollType) {
        case 'select-driver':
          const current_driver = this.actor.system.occupants.find(o => o.driver);
          if (current_driver && current_driver.uuid != dataset.itemId) {
            ui.notifications.warn("Veículo já tem motorista");
            return;
          }
          const occupant = this.actor.system.occupants.find(o => o.uuid == dataset.itemId);
          if (occupant) {
            occupant.driver = !occupant.driver;
            await this.actor.update({ "system.occupants": this.actor.system.occupants });
            await this.actor.update({ "system.driver": occupant.driver });
            if (occupant.driver) {

              const permissionLevel = CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
              const actor = await fromUuid(occupant.uuid);
              if (actor.type == "character") {
                // find user
                const ownerEntry = Array.from(Object.entries(actor.ownership));
                let user = {};
                for (const test of ownerEntry) {
                  const tempuser = game.users.get(test[0]);
                  if (tempuser) {
                    if (!tempuser.isGM) {
                      user = tempuser;
                    }
                  }

                }
                if (user) {

                  if (game.user.isGM) {
                    await this.actor.update({
                      [`ownership.${user.id}`]: permissionLevel
                    });
                  }

                }
              }

              // Emit socket to server-side

            } else {
              const permissionLevel = CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER;
              const actor = await fromUuid(occupant.uuid);
              // find user
              if (actor.type == "character") {
                const ownerEntry = Array.from(Object.entries(actor.ownership));
                let user = {};
                for (const test of ownerEntry) {
                  const tempuser = game.users.get(test[0]);
                  if (tempuser) {
                    if (!tempuser.isGM) {
                      user = tempuser;
                    }
                  }
                }
                if (user) {
                  if (game.user.isGM) {
                    await this.actor.update({
                      [`ownership.${user.id}`]: permissionLevel
                    });
                  }
                }
              }
            }


          }
          break;
        case 'ability':
          const ability = dataset.abilityId;
          this.actor.rollAbility(ability, this.actor.system.otherStatistics.handling.value + mod);
      }
    }
  }

  async _onDrop(event) {
    event.preventDefault();
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch (err) {
      console.error("Error parsing drop data:", err);
      return;
    }
    if (data.type === "Item") {
      const item = await fromUuid(data.uuid);
      this._onDropItemCreate(item, event);
    } else {
      if (this.actor.system.otherStatistics.occupants.current == this.actor.system.otherStatistics.occupants.value) {
        ui.notifications.warn("Veículo cheio");
        return;
      } else {
        if (!game.user.isGM) {
          ui.notifications.warn("Apeas o GM pode embarcar personagens em veículos");
          return;
        }
        const isOnboarded = this.actor.system.occupants.find(o => o.uuid == data.uuid);
        if (isOnboarded) {
          ui.notifications.warn("Personagem já está a bordo");
          return;
        }
        const new_value = this.actor.system.occupants.length + 1;
        await this.actor.update({ "system.otherStatistics.occupants.current": new_value });
        //const item = await fromUuid(data.id);
        const occupants = this.actor.system.occupants;
        occupants.push({ uuid: data.uuid, driver: false });
        await this.actor.update({ "system.occupants": occupants });
        //await this.actor.createEmbeddedDocuments("Item", [item]);

        const permissionLevel = CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER;
        const actor = await fromUuid(data.uuid);
        // find user
        if (actor.type == "character") {
          const ownerEntry = Array.from(Object.entries(actor.ownership));
          let user = {};
          for (const test of ownerEntry) {
            const tempuser = game.users.get(test[0]);
            if (tempuser) {
              if (!tempuser.isGM) {
                user = tempuser;
              }
            }
          }
          if (user) {
            await this.actor.update({
              [`ownership.${user.id}`]: permissionLevel
            });
          }
        }
      }
    }
  }

  async _onDropItemCreate(itemData, event) {
    if (!CONFIG.PUNKAPOCALYPTIC.VehicleSupportedItems.includes(itemData.type)) {
      ui.notifications.warn("Tipo de item não suportado por veículos");
      return;
    }
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
            const missions = newItem.system.missions.split(',')                    // Split by comma
              .map(num => num.trim())        // Trim spaces
              .map(num => Number(num))       // Convert to Number
              .filter(num => !isNaN(num));   // Remove invalid numbers
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
              const missions = newItem.system.missions.split(',')                    // Split by comma
                .map(num => num.trim())        // Trim spaces
                .map(num => Number(num))       // Convert to Number
                .filter(num => !isNaN(num));   // Remove invalid numbers
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
      console.log("Updated actor resources:", updatedResources);
    } else {
      console.log("No resources to update.");
    }
  }

}
