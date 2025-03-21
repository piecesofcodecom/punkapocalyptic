import PunkapocalypticItemBase from "./base-item.mjs";

export default class PunkapocalypticItemWeapon extends PunkapocalypticItemBase {
    static defineSchema() {
        const fields = foundry.data.fields;
        const schema = super.defineSchema();
        const requiredInteger = { required: true, nullable: false, integer: true };
        
        schema.ability = new fields.StringField({ initial: "" });
        schema.roll = new fields.SchemaField({
            ability: new fields.StringField({ initial: "" }),
            bonus: new fields.NumberField({ ...requiredInteger, initial: 0, min: -10 })
        })

        schema.equipped = new fields.BooleanField({ initial: false });
        //schema.formula = new fields.StringField({ blank: true })
        schema.damage = new fields.SchemaField({
            diceNum: new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 }),
            diceSize: new fields.NumberField({ ...requiredInteger, initial: 6, min: 4 }), // d20
            diceBonus: new fields.NumberField({ ...requiredInteger, initial: 0, min: -10 }), //+@str.mod+ceil(@lvl / 2)
            formula: new fields.StringField({ blank: true })
        });
        schema.radius = new fields.SchemaField({
            diceNum: new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 }),
            diceSize: new fields.NumberField({ ...requiredInteger, initial: 20, min: 4 }), // d20
            diceBonus: new fields.NumberField({ ...requiredInteger, initial: 0, min: -10 }), //+@str.mod+ceil(@lvl / 2)
            formula: new fields.StringField({ blank: true })
        })
        schema.category = new fields.StringField({ initial: "" });
        schema.range = new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 });
        schema.traits = new fields.StringField({ initial: "", trim: true });
        return schema;
    }
    prepareDerivedData() {
        // Build the formula dynamically using string interpolation
        
        if (this.damage.diceBonus == 0) {
            this.damage.formula = this.damage.diceNum + "d" + this.damage.diceSize;
        } else {
            this.damage.formula = this.damage.diceNum + "d" + this.damage.diceSize + (this.damage.diceBonus >= 0 ? "+"+this.damage.diceBonus : this.damage.diceBonus);
        }
        if (this.category == "melee") {
            this.range = 1;
        }
        if (this.radius.diceBonus == 0) {
            this.radius.formula = this.radius.diceNum + "d" + this.radius.diceSize;
        } else {
            this.radius.formula = this.radius.diceNum + "d" + this.radius.diceSize + (this.radius.diceBonus >= 0 ? "+"+this.radius.diceBonus : this.radius.diceBonus);
        }
      }
}