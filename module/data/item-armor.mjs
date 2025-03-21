import PunkapocalypticItemBase from "./base-item.mjs";

export default class PunkapocalypticItemArmor extends PunkapocalypticItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    
    const schema = super.defineSchema();
    schema.defense = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.isBonus = new fields.BooleanField({ initial: false });
    schema.traits = new fields.StringField({ initial: "", trim: true });
    schema.equipped = new fields.BooleanField({ initial: false });
    return schema;
  }

  prepareDerivedData() {
    // Build the formula dynamically using string interpolation
  }
}