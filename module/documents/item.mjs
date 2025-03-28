/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class PunkapocalypticItem extends Item {
  async _preCreate(data, options, userId) {
    const itemType = data.type || "default";
    const img = data.img || "icons/svg/item-bag.svg";
    if (img == 'icons/svg/item-bag.svg') {
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
  async roll(mod = 0) {
    const item = this;
    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `<img src="${item.img}" alt="Icon" class="message-icon"> <p>[${game.i18n.localize(CONFIG.PUNKAPOCALYPTIC.items[item.type])}] ${item.name}</p>`;

    // If there's no roll data, send a chat message.
    if (!this.system.roll.ability) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? '',
      });
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      // let formula = " 1d20";
      // const final_mod = this.actor.system.abilities[this.system.roll.ability].mod + mod;
      // if (final_mod > 0) {
      //   formula += "+" + final_mod;
      // }
      // const roll = new Roll(formula, this.actor);


      let text = `<button class="roll-damage" data-item-id="${item._id}" data-actor-id="${this.actor.id}">${game.i18n.localize('PUNKAPOCALYPTIC.SheetLabels.RollDamage')}</button><br />`;
      const targets = Array.from(game.user.targets);

      if (item.system.category == "explosive") {
        text += `<button class="roll-range" data-item-id="${item._id}" data-actor-id="${this.actor.id}">${game.i18n.localize('PUNKAPOCALYPTIC.SheetLabels.RollRange')}</button><br />`;
      }

      const weapon_traits = item.system.traits
        .split(",")
        .map(trait => trait.replace(/\(.*?\)/g, '').trim().toLowerCase());
      let traits_message = "";
      for (const key in CONFIG.PUNKAPOCALYPTIC.weaponTraits) {
        const trait_tranlated = game.i18n.localize(CONFIG.PUNKAPOCALYPTIC.weaponTraits[key]).toLowerCase();
        if (weapon_traits.includes(trait_tranlated)) {
          const label = game.i18n.localize(CONFIG.PUNKAPOCALYPTIC.weaponTraits[key]);
          const description = game.i18n.localize(CONFIG.PUNKAPOCALYPTIC.weaponTraitDescriptions[key]);
          if (traits_message.length == 0) {
            traits_message = "<p>";
          }
          traits_message += ` <span class="trait-tag" style="border: 1px solid black;background: #ddd;margin: 2px;padding: 2px;" data-tooltip="${description}">${label}</span>`
        }
      }
      if (traits_message.length > 0) {
        traits_message += "</p>";
      }
      const title = game.i18n.format('PUNKAPOCALYPTIC.ChatMessage.AttackMessage', {weapon: item.name});
      const label = `
       <img src="${item.img}" alt="Icon" class="message-icon">
      <p style="font-family: 'Poison Hope', sans-serif; text-shadow: 2px 2px 5px gray;">${title}</p>
      <p>${item.system.description}</p>
      ${traits_message}
      ${text}
      <br />
      `;
      this.actor.rollAbility(this.system.roll.ability, mod, label)
    }
  }

  async selectAmmo() {
    const item = this;
    await this.update({ "system.equipped": !item.system.equipped });
  }

  getDamage() {
    let formula = "";
    if (this.system?.damage) {
      formula = this.system.damage.diceNum + "d" + this.system.damage.diceSize;
      if (this.system.damage.diceBonus) {
        formula += "+" + this.system.damage.diceBonus;
      }
    }
    return formula;
  }

  async rollDamage() {
    const item = this;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');

    // If there's no roll data, send a chat message.
    if (this.system?.damage) {
      // Retrieve roll data.
      const title = game.i18n.format('PUNKAPOCALYPTIC.ChatMessage.TitleDamageRoll', {weapon: item.name});
      const rollData = this.getRollData();
      //const damage_formula = item.system.damage.diceNum + "d" + item.system.damage.diceSize + "+" + item.system.damage.diceBonus
      const label = `<img src="${item.img}" alt="Icon" class="message-icon">
      <p style="font-family: 'Poison Hope', sans-serif; text-shadow: 2px 2px 5px gray;">${title}</p>`;
      // Invoke the roll and submit it to chat.
      const roll = new Roll(item.system.damage.formula, rollData.actor);
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });
      return roll;
    }
  }

  messageHeader(img, name, ability="") {
    //const item = this;
    if (ability == "") {
      return `<img src="${img}" alt="Icon" class="message-icon"><p style="font-family: 'Poison Hope', sans-serif;">${name}</p>`;
    } else {
      return `<img src="${img}" alt="Icon" class="message-icon"> <p style="font-family: 'Poison Hope', sans-serif;">[${game.i18n.localize(CONFIG.PUNKAPOCALYPTIC.abilities[ability])}] ${name}</p>`;

    }
  }

  async toMessage() {
    const item = this;
    //console.warn("toMessage is deprecated. Use roll() instead.");
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    let traits_message = "";
    if (item.system?.traits) {
      const weapon_traits = item.system.traits
        .split(",")
        .map(trait => trait.replace(/\(.*?\)/g, '').trim().toLowerCase());
    

      for (const key in CONFIG.PUNKAPOCALYPTIC.weaponTraits) {
        const trait_tranlated = game.i18n.localize(CONFIG.PUNKAPOCALYPTIC.weaponTraits[key]).toLowerCase();
        if (weapon_traits.includes(trait_tranlated)) {
          const label = game.i18n.localize(CONFIG.PUNKAPOCALYPTIC.weaponTraits[key]);
          const description = game.i18n.localize(CONFIG.PUNKAPOCALYPTIC.weaponTraitDescriptions[key]);
          if (traits_message.length == 0) {
            traits_message = "<p>";
          }
          traits_message += ` <span class="trait-tag" style="border: 1px solid black;background: #ddd;margin: 2px;padding: 2px;" data-tooltip="${description}">${label}</span>`
        }
      }
    }
    if (traits_message.length > 0) {
      traits_message += "</p>";
    }
    const label = `
      ${this.messageHeader(item.img, item.name)}
      <p>${item.system.description}</p>
      ${traits_message}
      <br />
      `;
    ChatMessage.create({
      user: game.user.id,
      speaker: speaker,
      content: label,
    });
  }

  async rollRange() {
    if (this.system?.radius) {
      const item = this;
      const speaker = ChatMessage.getSpeaker({ actor: this.actor });
      const rollMode = game.settings.get('core', 'rollMode');
      const label = `<img src="${item.img}" alt="Icon" class="message-icon"> <p>[${game.i18n.localize("PUNKAPOCALYPTIC.SheetLabels.Range")}] ${item.name}</p>`;

      const roll = new Roll(item.system.radius.formula, this.actor);
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });
      return roll;
    }
    return null;
  }
}
