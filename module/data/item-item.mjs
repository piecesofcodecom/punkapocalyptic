import PunkapocalypticItemBase from "./base-item.mjs";

export default class PunkapocalypticItem extends PunkapocalypticItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.quantity = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 });
    schema.weight = new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0 });

    // Break down roll formula into three independent fields
    // schema.roll = new fields.SchemaField({
    //   diceNum: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
    //   diceSize: new fields.NumberField({ ...requiredInteger, initial: 6, min: 4 }), // d20
    //   diceBonus: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }) //+@str.mod+ceil(@lvl / 2)
    // })

    schema.formula = new fields.StringField({ blank: true });

    return schema;
  }

  prepareDerivedData() {
    // Build the formula dynamically using string interpolation
    //const roll = this.roll;

    //this.formula = `${roll.diceNum}${roll.diceSize}${roll.diceBonus}`
  }
}