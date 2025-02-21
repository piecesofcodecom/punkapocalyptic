import PunkapocalypticItemBase from "./base-item.mjs";

export default class PunkapocalypticTrait extends PunkapocalypticItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
    return schema;
  }

  prepareDerivedData() {
    // Build the formula dynamically using string interpolation
  }
}