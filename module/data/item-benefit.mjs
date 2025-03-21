import PunkapocalypticItemBase from "./base-item.mjs";

export default class PunkapocalypticItemBenefit extends PunkapocalypticItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();
    schema.missions = new fields.StringField({ blank: true, initial: "" });
    return schema;
  }
}