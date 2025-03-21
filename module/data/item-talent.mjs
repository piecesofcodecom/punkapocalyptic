import PunkapocalypticItemBase from "./base-item.mjs";

export default class PunkapocalypticItemTalent extends PunkapocalypticItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    //const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();
    schema.lvl4 = new fields.BooleanField({ required: true, initial: false });

    return schema;
  }

}