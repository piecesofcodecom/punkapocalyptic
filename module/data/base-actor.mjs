import PunkapocalypticDataModel from "./base-model.mjs";

export default class PunkapocalypticActorBase extends PunkapocalypticDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    schema.health = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      current: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      mod: new fields.NumberField({ ...requiredInteger, initial: 0 })
    });
    schema.defense = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      current: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      mod: new fields.NumberField({ ...requiredInteger, initial: 0 })
    });

    schema.speed = new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 });
    

    return schema;
  }

}