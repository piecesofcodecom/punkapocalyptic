/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/punkapocalyptic/templates/actor/parts/actor-features.hbs',
    'systems/punkapocalyptic/templates/actor/parts/actor-inventory.hbs',
    'systems/punkapocalyptic/templates/actor/parts/actor-benefits.hbs',    
    'systems/punkapocalyptic/templates/actor/parts/actor-mutations.hbs',
    'systems/punkapocalyptic/templates/actor/parts/actor-background.hbs',
    'systems/punkapocalyptic/templates/actor/parts/actor-coisas.hbs',
    'systems/punkapocalyptic/templates/actor/parts/actor-caminhos.hbs',
    'systems/punkapocalyptic/templates/actor/parts/actor-effects.hbs',
    'systems/punkapocalyptic/templates/actor/parts/actor-weapons.hbs',
    'systems/punkapocalyptic/templates/actor/parts/actor-special-activities.hbs',
    'systems/punkapocalyptic/templates/actor/parts/actor-category-item.hbs',
    
    // NPC partials
    'systems/punkapocalyptic/templates/actor/parts/npc-other.hbs',
    'systems/punkapocalyptic/templates/actor/parts/npc-traits.hbs',
    // Item partials
    'systems/punkapocalyptic/templates/item/parts/item-effects.hbs',
    'systems/punkapocalyptic/templates/item/parts/item-talents.hbs',
  ]);
};

