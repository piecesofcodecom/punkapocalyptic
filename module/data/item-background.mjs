import PunkapocalypticItemBase from "./base-item.mjs";


export default class PunkapocalypticBackgroundItem extends PunkapocalypticItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.ability = new fields.SchemaField({
      bonus: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
      id: new fields.StringField({ blank: true, initial: "" })
    });
    schema.languages = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });

    schema.resources = new fields.SchemaField(Object.keys(CONFIG.PUNKAPOCALYPTIC.resources).reduce((obj, resource) => {
      obj[resource] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      });
      return obj;
    }, {}));

    schema.itemIds = new fields.ArrayField(new fields.DocumentUUIDField({ blank: false, trim: true }), { initial: [] });

    return schema;
  }

  prepareDerivedData() {
  }
}