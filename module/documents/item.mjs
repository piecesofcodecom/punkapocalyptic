/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class PunkapocalypticItem extends Item {
  async _preCreate(data, options, userId) {
    const itemType = data.type || "default";
    const img = data.img || "icons/svg/item-bag.svg";
    console.warn(data)
    if (img == 'icons/svg/item-bag.svg') {
      console.warn("MUDA")
      const defaultImg = CONFIG.PUNKAPOCALYPTIC.itemImages[itemType];
      data.img = defaultImg;
      await this.updateSource({ img: defaultImg });
    }
    
   
    await super._preCreate(data, options, userId);
  }
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
    
  }

  /**
   * Prepare a data object which defines the data schema used by dice roll commands against this Item
   * @override
   */
  getRollData() {
    // Starts off by populating the roll data with a shallow copy of `this.system`
    const rollData = { ...this.system };

    // Quit early if there's no parent actor
    if (!this.actor) return rollData;

    // If present, add the actor's roll data
    rollData.actor = this.actor.getRollData();

    return rollData;
  }

  /**
   * Convert the actor document to a plain object.
   *
   * The built in `toObject()` method will ignore derived data when using Data Models.
   * This additional method will instead use the spread operator to return a simplified
   * version of the data.
   *
   * @returns {object} Plain object either via deepClone or the spread operator.
   */
  toPlainObject() {
    const result = { ...this };

    // Simplify system data.
    result.system = this.system.toPlainObject();

    // Add effects.
    result.effects = this.effects?.size > 0 ? this.effects.contents : [];

    return result;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const item = this;
    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `<img src="${item.img}" alt="Icon" class="message-icon"> <p>[${game.i18n.localize(CONFIG.PUNKAPOCALYPTIC.items[item.type])}] ${item.name}</p>`;

    // If there's no roll data, send a chat message.
    if (!this.system.formula) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? '',
      });
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      // Retrieve roll data.
      const rollData = this.getRollData();

      // Invoke the roll and submit it to chat.
      const roll = new Roll(rollData.formula, rollData.actor);
      // If you need to store the value first, uncomment the next line.
      // const result = await roll.evaluate();
      const label = `<img src="${item.img}" alt="Icon" class="message-icon"> <p>[${game.i18n.localize(CONFIG.PUNKAPOCALYPTIC.abilities[item.system.roll.ability])}] ${item.name}</p>`
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });
      return roll;
    }
  }

  async rollDamage() {
    const item = this;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `<img src="${item.img}" alt="Icon" class="message-icon"> <p>[${game.i18n.localize(CONFIG.PUNKAPOCALYPTIC.abilities[item.system.roll.ability])}] ${item.name}</p>`

    // If there's no roll data, send a chat message.
    if (!this.system?.damage) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? '',
      });
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      // Retrieve roll data.
      const rollData = this.getRollData();
      //const damage_formula = item.system.damage.diceNum + "d" + item.system.damage.diceSize + "+" + item.system.damage.diceBonus

      // Invoke the roll and submit it to chat.
      const roll = new Roll(item.system.damage_formula, rollData.actor);
      // If you need to store the value first, uncomment the next line.
      // const result = await roll.evaluate();
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: `[${game.i18n.localize('PUNKAPOCALYPTIC.Other.Damage.long')}] ${item.name}`,
      });
      return roll;
    }
  }
}
