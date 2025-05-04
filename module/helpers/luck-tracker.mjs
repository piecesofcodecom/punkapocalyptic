export function createLuckTracker() {
  const tokenEffectsTracker = new TokenEffectsTracker();
  //Hooks.on('controlToken', (token, controlled) => {
  tokenEffectsTracker.render(true);
  //});
}

export class TokenEffectsTracker extends Application {

  constructor(data = {}, options = {}) {
    super(data, options);
    game.settings.register("punkapocalyptic", "groupLuck", {
      name: "Group Luck",
      hint: "Stores the group's luck for the mission.",
      scope: "world",
      config: true,
      type: Number,
      default: 0,  // Default value (can be anything)
      onChange: value => {
        console.log(`Group Luck updated to: ${value}`);
      }
    });
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "systems/punkapocalyptic/templates/sidebar/luck-tracker.hbs",
      classes: ["dc20rpg", "tokenEffects"],
      popOut: false,
      dragDrop: [
        { dragSelector: ".help-dice[data-key]", dropSelector: null },
      ],
    });
  }

  async getData() {
    let currentLuck = game.settings.get("punkapocalyptic", "groupLuck");
    let data = {};
    if (game.user.isGM) {
      data.luck = {
        value: currentLuck
      };
    } else {
      data.luck = {
        value: "?"
      };
    }
    data.isGM = game.user.isGM;
    return data;
  }

  _prepareHelpDice(actor) {
    

  }

  _prepareHeldAction(actor) {
    
  }

  async _prepareTemporaryEffects(actor) {
    
  }



  _mergeStackableConditions(effects) {

  }

  async _statusObjects(statuses, effectName) {

  }

  activateListeners(html) {
    super.activateListeners(html);
    //html.find('.toggle-effect').click(ev => this._onToggleEffect(datasetOf(ev).effectId, datasetOf(ev).actorId, datasetOf(ev).tokenId, datasetOf(ev).turnOn));
    html.find('.roll-groupLuck').click(ev => this._onrollGroupLuck());
    html.find('.group-luck-input').change(async (ev) => {
      let newValue = Math.max(0, parseInt(ev.target.value) || 0); // Ensure at least 1
      await game.settings.set("punkapocalyptic", "groupLuck", newValue);
      console.log(`Updated Group Luck to: ${newValue}`);
  });
    // html.find('.toggle-item').click(ev => this._onToggleItem(datasetOf(ev).itemId, datasetOf(ev).actorId, datasetOf(ev).tokenId));
    // html.find('.editable').mousedown(ev => ev.which === 2 ? this._onEditable(datasetOf(ev).effectId, datasetOf(ev).actorId, datasetOf(ev).tokenId) : ()=>{});
    // html.find('.held-action').click(ev => this._onHeldAction(datasetOf(ev).actorId, datasetOf(ev).tokenId));
    // html.find('.help-dice').contextmenu(ev => this._onHelpActionRemoval(datasetOf(ev).key , datasetOf(ev).actorId, datasetOf(ev).tokenId));
  }

  async _onrollGroupLuck() {
    if (!game.user.isGM) {
      ui.notifications.warn("Only the GM can roll for group luck.");
      return false;
  }
  
  // Create a dialog to ask the GM how many d6 to roll
  new Dialog({
      title: await game.i18n.localize("PUNKAPOCALYPTIC.Dialogs.FortuneRoll.title"),
      content: `
          <p>${await game.i18n.localize("PUNKAPOCALYPTIC.Dialogs.FortuneRoll.description")}</p>
          <form>
              <div class="form-group">
                  <!--label>Número de d6:</label-->
                  <input type="number" id="numDice" name="numDice" value="1" min="1" style="width: 50px;">
              </div>
          </form>
      `,
      buttons: {
          roll: {
              label: "Roll",
              callback: async (html) => {
                  let numDice = Math.max(1, parseInt(html.find("#numDice").val()) || 1); // Ensure at least 1
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
                  this.render();
              }
          },
          cancel: {
              label: "Cancel"
          }
      },
      default: "roll"
  }).render(true);
  
  }

  _onEditable(effectId, actorId, tokenId) {
    const owner = getActorFromIds(actorId, tokenId);
    if (owner) editEffectOn(effectId, owner);
  }

  _onToggleEffect(effectId, actorId, tokenId, turnOn) {
    const owner = getActorFromIds(actorId, tokenId);
    if (owner) toggleEffectOn(effectId, owner, turnOn === "true");
    this.render();
  }

  _onToggleItem(itemId, actorId, tokenId) {
    const owner = getActorFromIds(actorId, tokenId);
    if (owner) {
      const item = getItemFromActor(itemId, owner);
      if (item) changeActivableProperty("system.toggle.toggledOn", item);
    }
    this.render();
  }

  _onRemoveEffect(effectId, actorId, tokenId) {
    const owner = getActorFromIds(actorId, tokenId);
    if (owner) deleteEffectFrom(effectId, owner);
    this.render();
  }

  _onHeldAction(actorId, tokenId) {
    const owner = getActorFromIds(actorId, tokenId);
    if (owner) triggerHeldAction(owner);
    this.render();
  }

  async _onHelpActionRemoval(key, actorId, tokenId) {
    const owner = getActorFromIds(actorId, tokenId);
    if (owner) {
      const confirmed = await getSimplePopup("confirm", { header: "Do you want to remove that Help Dice?" });
      if (confirmed) clearHelpDice(owner, key);
    }
    this.render();
  }

  _onDragStart(event) {
    super._onDragStart(event);
    const dataset = event.currentTarget.dataset;
    const key = dataset.key;

    const actorId = dataset.actorId;
    const tokenId = dataset.tokenId;
    const helpDice = this.helpDice[key];
    if (helpDice) {
      const dto = {
        key: key,
        formula: helpDice.formula,
        type: "help",
        actorId: actorId,
        tokenId: tokenId,
      }
      event.dataTransfer.setData("text/plain", JSON.stringify(dto));
    }
  }

  _canDragDrop(selector) {
    return true;
  }

  _canDragStart(selector) {
    return true;
  }
}