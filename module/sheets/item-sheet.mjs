import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class PunkapocalypticItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['punkapocalyptic', 'sheet', 'item'],
      width: 588,
      height: 358,
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
    console.warn( `${path}/item-${this.item.type}-sheet.hbs`)
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
      context.system.formula = itemData.system.damage.diceNum+"d"+itemData.system.damage.diceSize;
      if (Number(itemData.system.damage.diceBonus) > 0) {
        context.system.formula = context.system.formula + "+" + itemData.system.damage.diceBonus
      } else if(Number(itemData.system.damage.diceBonus) < 0) {
        context.system.formula = context.system.formula + String(itemData.system.damage.diceBonus);
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
    console.warn(context)

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
  }

  async editItem(event, item) {
    const dataset = event.currentTarget.dataset;
    console.log(dataset)
    let data = {};
    if (dataset.path == "system.formula" && item.type == "weapon") {
      try {
        data = await foundry.applications.api.DialogV2.prompt({
          window: { title: `Dano: ${item.name}` },
          content: `<label for="dice-number">Dados:</label>
    <input type="number" id="dice-number" name="diceNum" value="${item.system.damage.diceNum}" min="1" />
    <label for="dice-mod">Modificador:</label>
    <input type="number" id="dice-mod" name="diceBonus" value="${item.system.damage.diceBonus}" />`,
          ok: {
            label: "Salvar",
            callback: async (event, button, dialog) => {
              
              const diceNum = parseInt(button.form.elements.diceNum.value, 10);
              const diceBonus = parseInt(button.form.elements.diceBonus.value, 10);
              await this.item.update({
                "system.damage.diceNum": diceNum,
                "system.damage.diceBonus": diceBonus,
              });
              
            }
          }
        });
      } catch (e){
        return;
      }
    }
  }
}
