import PunkapocalypticDataModel from "./base-model.mjs";

export default class PunkapocalypticItemBase extends PunkapocalypticDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    schema.description = new fields.StringField({ required: true, blank: true });
    schema.quantity = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 });
    schema.price = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });

    return schema;
  }

}