import PunkapocalypticItemBase from "./base-item.mjs";


export default class PunkapocalypticPathItem extends PunkapocalypticItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    //const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();
    schema.level = new fields.StringField({ initial: "", blank: true});
    schema.itemIds = new fields.ArrayField(new fields.DocumentUUIDField({ blank: false, trim: true }), { initial: [] });

    return schema;
  }

  prepareDerivedData() {
  }
}