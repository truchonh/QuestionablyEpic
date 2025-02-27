import { runCastSequence, allRamps, allRampsHealing } from "General/Modules/Player/DiscPriest/DiscPriestRamps";
import { buildRamp } from "General/Modules/Player/DiscPriest/DiscRampGen";


export const getDiscPriestSpecEffect = (effectName, player, contentType) => {
  let bonus_stats = {};

  // Tier Sets
  if (effectName === "DPriest T28-2") {
    // Discipline Sepulcher tier set 2pc
    // This set has multiple issues. It stacks to two but both are consumed at the same time, it doesn't make Power Word: Shield free which means it's
    // bad during Rapture and the overall mana savings are rather dubious at best. 
    const procSpellsPerMin = 14; // TODO: Add log pull.
    const percProcsConsumed = 0.66; 
    const manaPerProc = 1750;
    const procChance = 0.15;
    
    bonus_stats.mana = procSpellsPerMin * percProcsConsumed * manaPerProc * procChance / 60
  }
  else if (effectName === "DPriest T28-4") {
    // Discipline Sepulcher tier set 4pc

  }

  else if (effectName === "Clarity of Mind") {
    bonus_stats.hps = player.getRampID('clarityOfMind', contentType);
    //bonus_stats.hps = (contentType === "Raid" ? 1000 : 0);

  } 
  else if (effectName === "Shadow Word: Manipulation") {
    bonus_stats.hps = player.getRampID('shadowWordManip', contentType);
    //bonus_stats.hps = (contentType === "Raid" ? 1000 : 0);

  }
  else if (effectName === "Crystalline Reflection") {
    // Crystalline Reflection
    // - Reflection damage doesn't proc atonement.
    // - Scales with: Intellect, Crit, Vers
    const shieldCPM = 10.5;
    const expectedOverhealing = 0.6;
    const reflectionSP = 0.42;

    bonus_stats.hps = reflectionSP * shieldCPM * (1 - expectedOverhealing) * player.getInt() * player.getStatMultiplier("CRITVERS") / 60;
    // Do Math
  } else if (effectName === "Kiss of Death") {
    // Do Math
  } else if (effectName === "The Penitent One") {
    bonus_stats.hps = player.getRampID('penitentOne', contentType);
  } else if (effectName === "Cauterizing Shadows") {
    // Cauterizing Shadows
    // - Scales with: Intellect, Crit, Vers
    const data = {
      ppm: 3, // This simulates a standard single target encounter.
      sp: 0.75,
      targets: 3,
      expectedOverhealing: 0.55,
    }

    bonus_stats.hps = data.ppm * data.sp * data.targets * (1 - data.expectedOverhealing) * player.getInt() * player.getStatMultiplier("CRITVERS") / 60;

  } else if (effectName === "Measured Contemplation") {
      // This is awful for all raiding scenarios. 
      const oneShadowmend = 3.2 * player.getInt() * player.getStatMultiplier("CRITVERS");
      const expectedOverhealing = 0.1;
      const effectiveppm = 1.6; // It is reasonably rare that we ever go 15 seconds between Shadowmend csats to begin with.

      bonus_stats.hps = oneShadowmend * effectiveppm * 0.5 / 60 * (1 - expectedOverhealing);


  } else if (effectName === "Twins of the Sun Priestess") {
  } else if (effectName === "Vault of Heavens") {
  } else {
    bonus_stats.HPS = 0;
    bonus_stats.HPS = 0;
  }

  return bonus_stats;
};
