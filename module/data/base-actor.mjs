import PunkapocalypticDataModel from "./base-model.mjs";

export default class PunkapocalypticActorBase extends PunkapocalypticDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const floatNumber = { required: true, nullable: false, integer: false };
    const schema = {};

    schema.health = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      mod: new fields.NumberField({ ...requiredInteger, initial: 0 })
    });
    schema.defense = new fields.SchemaField({
      base: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      current: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      mod: new fields.NumberField({ ...requiredInteger, initial: 0 })
    });
    schema.biography = new fields.StringField({ required: true, blank: true });
    schema.speed = new fields.SchemaField({
      base: new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 }),
      current: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
      mod: new fields.NumberField({ ...requiredInteger, initial: 0 })
    });
    schema.size = new fields.NumberField({ ...floatNumber, initial: 1, min: 0 });

    // TODO implement devired statuses (education, defense, grit, speed)
    return schema;
  }

  prepareDerivedData() {
    
    
  }

}