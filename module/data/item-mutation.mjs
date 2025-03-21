import PunkapocalypticItemBase from "./base-item.mjs";

export default class PunkapocalypticItemMutation extends PunkapocalypticItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
    schema.subtype = new fields.StringField({ blank: true, initial: "" });
    schema.mojo = new fields.NumberField({ initial: 0})
    return schema;
  }

  prepareDerivedData() {
    // Build the formula dynamically using string interpolation
  }
}