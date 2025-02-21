import PunkapocalypticItemBase from "./base-item.mjs";

export default class PunkapocalypticWeapon extends PunkapocalypticItemBase {
    static defineSchema() {
        const fields = foundry.data.fields;
        const schema = super.defineSchema();
        const requiredInteger = { required: true, nullable: false, integer: true };
        
        schema.ability = new fields.StringField({ initial: "" });
        schema.roll = new fields.SchemaField({
            ability: new fields.StringField({ initial: "" }),
            bonus: new fields.NumberField({ ...requiredInteger, initial: 0, min: -10 })
        })

        //schema.formula = new fields.StringField({ blank: true })
        schema.damage = new fields.SchemaField({
            diceNum: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
            diceSize: new fields.NumberField({ ...requiredInteger, initial: 6, min: 4 }), // d20
            diceBonus: new fields.NumberField({ ...requiredInteger, initial: 0, min: -10 }) //+@str.mod+ceil(@lvl / 2)
        })
        return schema;
    }
    prepareDerivedData() {
        // Build the formula dynamically using string interpolation
        const damage = this.damage;
        //console.warn(`${roll.diceNum}d${roll.diceSize}+${roll.diceBonus}`)
        const bonus = damage.diceBonus >= 0 ? "+"+damage.diceBonus : damage.diceBonus
        this.damage_formula = damage.diceNum + "d" + damage.diceSize + String(bonus)
      }
}