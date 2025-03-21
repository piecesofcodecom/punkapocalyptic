import PunkapocalypticActorBase from "./base-actor.mjs";

export default class PunkapocalypticCharacter extends PunkapocalypticActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    // schema.attributes = new fields.SchemaField({
    //   level: new fields.SchemaField({
    //     value: new fields.NumberField({ ...requiredInteger, initial: 1 })
    //   }),
    // });

    // Iterate over ability names and create a new SchemaField for each.
    schema.abilities = new fields.SchemaField(Object.keys(CONFIG.PUNKAPOCALYPTIC.abilities).reduce((obj, ability) => {
      obj[ability] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      });
      return obj;
    }, {}));

    schema.resources = new fields.SchemaField(Object.keys(CONFIG.PUNKAPOCALYPTIC.resources).reduce((obj, resource) => {
      obj[resource] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      });
      return obj;
    }, {}));

    schema.mojo = new fields.SchemaField({
      base: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      current: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 0 })
    });

    schema.otherAttributes = new fields.SchemaField(Object.keys(CONFIG.PUNKAPOCALYPTIC.otherAttributes).reduce((obj, resource) => {
      obj[resource] = new fields.SchemaField({
        base: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        current: new fields.NumberField({ ...requiredInteger, initial: 0 }),
        bonus: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      });
      return obj;
    }, {}));

    schema.biography = new fields.StringField({ required: true, blank: true }); // equivalent to passing ({initial: ""}) for StringFields

    schema.paths = new fields.SchemaField({
      novice: new fields.StringField({ required: true, blank: true }),
      expert: new fields.StringField({ required: true, blank: true }),
      master: new fields.StringField({ required: true, blank: true })
    });
    
    schema.missions = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    
    // OtherAttributes
    //schema.reach = new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 });
    //schema.mutations = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    // schema.grit = new fields.SchemaField({
    //   value: new fields.NumberField({ ...requiredInteger, initial: 3, min: 3 }),
    //   current: new fields.NumberField({ ...requiredInteger, initial: 0 }),
    //   mod: new fields.NumberField({ ...requiredInteger, initial: 0 })
    // });

    return schema;
  }

  prepareDerivedData() {
    // Loop through ability scores, and add their modifiers to our sheet output.
    for (const key in this.abilities) {
      // Calculate the modifier using d20 rules.
      this.abilities[key].mod = Math.floor((this.abilities[key].value - 10));
      // Handle ability label localization.
      this.abilities[key].label = game.i18n.localize(CONFIG.PUNKAPOCALYPTIC.abilities[key]) ?? key;
    }

    for (const key in this.resources) {
      // Handle ability label localization.
      this.resources[key].label = game.i18n.localize(CONFIG.PUNKAPOCALYPTIC.resources[key]) ?? key;
    }

    //STEP 3: Other Stuff. Book page 15
    this.defense.base = Math.floor((this.abilities.feet.value + this.abilities.eyes.value) / 2);
    this.health.value = this.abilities.meat.value;
    this.health.max = this.health.value + this.health.mod;
    
    const grit = 3 + this.abilities.guts.mod;
    if (grit > 0) {
      this.otherAttributes.grit.base = 3 + this.abilities.guts.mod;
    } else {
      this.otherAttributes.grit.base = 1;
    }
    
    if (this.abilities.brains.mod > 0) {
      this.otherAttributes.education.base = this.abilities.brains.mod;
    } else {
      this.otherAttributes.education.base = 0;

    }
    const speed = Math.floor(this.abilities.feet.value / 2);
    if (speed < 1) {
      this.speed.base = 1;
    } else {
      this.speed.base = speed;
    }
  }

  getRollData() {
    const data = {};

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.abilities) {
      for (let [k,v] of Object.entries(this.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    //data.lvl = this.attributes.level.value;

    return data
  }
}