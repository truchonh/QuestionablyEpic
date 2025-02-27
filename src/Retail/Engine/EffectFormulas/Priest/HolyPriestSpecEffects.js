
export const getHolyPriestSpecEffect = (effectName, player, contentType) => {
  let result = 0.0;
  let bonus_stats = {};

  /*
    Holy Priest functionality coming soon.
  */
 
  // Tier Sets
  if (effectName === "HPriest T28-2") {
    // The Holy Priest 2pc averages to about ~160-180% more Serenity casts over a fight if procs are used primarily on Heal.
    // Using procs on Salv itself through Sanc can often be an even stronger choice, however the calculation becomes increasingly fuzzy.
    // It should be added to be comprehensive, but modelling it through Heal alone will still provide a sufficiently high value.

    // In reality there is also likely to be some wastage - procs used on Smites, serenity & sanc casts held for damage (or held incorrectly).
    // There might also be some Chastise casts for additional procs but this is rarely taken advantage of.
    const serenityBaseCPM = 1;
    const serenityAdjCPM = 2.8;

    bonus_stats.hps = getSpellHealing('serenity', player, contentType) * (serenityAdjCPM - serenityBaseCPM) / 60;
    
  }
  else if (effectName === "HPriest T28-4") {
    // Following on from the 2pc, we can expect ~3.8-4.2 DC procs per minute in most cases. More with good play, less if you're sitting on Holy words a lot.
    // We're going to use these on Heal too to be consistent though Sanc is more HPS when you have enough damaged allies nearby.
    const convPPM = 3.8;
    const convPercentage = 0.6; // The buffed spell is 60% stronger.

    bonus_stats.hps = getSpellHealing('heal', player, contentType) * convPPM * convPercentage / 60;
  }
  else if (effectName === "Flash Concentration") {
    // Flash Concentration is a significant change to our playstyle. The formula below doesn't even begin to capture how and why it is so strong. 
    // QE Live will have stronger tech to handle legendaries like this as we approach Dragonflight, similar to the tech that other specs already have access to.

    const healCPM = 12.1;
    const healCost = 1200;
    const healFiller = healCost * healCPM;
    const poHFiller = (healFiller / 2500) * getSpellHealing('prayerOfHealing', player, contentType)

    bonus_stats.hps = (healCPM * getSpellHealing('heal', player, contentType) - poHFiller) / 60; // TODO: Replace with non-placeholder value. Priority for next build.

  }
  else if (effectName === "Shadow Word: Manipulation") {
    // Shadow Word: Manipulation is often used to pump up our major cooldowns. In this case though we will treat it as bonus crit alone. This legendary would be included
    // in a Holy Priest spec revamp so that we could better analyze it. 
    const expectedCrit = 35;
    const duration = 10;

    bonus_stats.crit = expectedCrit * 35 * duration / 45; // This is still an advanced placeholder.
  }
  else if (effectName === "Bwonsamdi's Pact") {
    // Assumptions:
    // - Mask is always used on mana Faeries (though sometimes a better play is to use it on cooldown reduction to hit better hymn timings).
    // - Faeries proc roughly on cooldown.
    const faerieProcs = 20 / 0.75;
    const manaPerProc = 0.5 / 100 * 50000;

    bonus_stats.mana = faerieProcs * manaPerProc / 90; // 
  }

  return bonus_stats;
};

const getSpellHealing = (spellName, player, contentType) => {
  const spellCoeff = {heal: 2.95, serenity: 7, sanc: 0, prayerOfHealing: 0.875 * 5 * 0.8}


  let spellHealing = spellCoeff[spellName] * player.getStatMultiplier("NOHASTE") * 1.16 * 0.85; 
  // 1.16 is the current Holy Priest aura buff. 0.85 represents what is usually quite low overhealing though keep in mind our heals include a mastery portion
  // which overheals much more frequently.

  if (spellName === "heal") {
    // Add Trail of Light & other Heal specific stuff.
    spellHealing *= 1.15 // Flash Concentration
    spellHealing *= 1.35 // Trail of Light
  }
  return spellHealing;


}