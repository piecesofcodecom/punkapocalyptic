import PunkapocalypticItemBase from "./base-item.mjs";

export default class PunkapocalypticItem extends PunkapocalypticItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.quantity = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 });
    schema.weight = new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 });

    schema.health = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      mod: new fields.NumberField({ ...requiredInteger, initial: 0 })
    });

    schema.formula = new fields.StringField({ blank: true });

    return schema;
  }

  prepareDerivedData() {
    // Build the formula dynamically using string interpolation
    //const roll = this.roll;

    //this.formula = `${roll.diceNum}${roll.diceSize}${roll.diceBonus}`
  }
}