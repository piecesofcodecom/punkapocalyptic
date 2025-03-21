import PunkapocalypticActorBase from "./base-actor.mjs";

export default class Punkapocalypticvehicle extends PunkapocalypticActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();
   
    //npc_hability["velocidade"] = 'PUNKAPOCALYPTIC.Other.Velocidade.long';
    schema.abilities = new fields.SchemaField(Object.keys(CONFIG.PUNKAPOCALYPTIC.abilities).reduce((obj, ability) => {
      obj[ability] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      });
      return obj;
    }, {}));

    schema.otherStatistics = new fields.SchemaField(Object.keys(CONFIG.PUNKAPOCALYPTIC.vehicleStatistics).reduce((obj, ability) => {
      obj[ability] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      });
      return obj;
    }, {}));

    schema.parts = new fields.ArrayField(new fields.SchemaField({
      label: new fields.StringField({ required: true, blank: true }),
      health: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
    }))
    
    return schema
  }

  prepareDerivedData() {
    //this.xp = this.cr * this.cr * 100;
    this.health.max = this.health.value + this.health.mod;
    for (const key in this.abilities) {
      // Calculate the modifier using d20 rules.
      this.abilities[key].mod = Math.floor((this.abilities[key].value - 10));
      // Handle ability label localization.
      this.abilities[key].label = game.i18n.localize(CONFIG.PUNKAPOCALYPTIC.abilities[key]) ?? key;
    }
  }
}