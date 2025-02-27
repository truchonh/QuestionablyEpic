export const druidDefaultSpellData = (contentType) => {
  let spellList = {};
  if (contentType === "Raid") {
    spellList = {
      774: { cpm: 21, avgcast: 7440, hps: 2520, overhealing: 0.26 }, // Rejuv
      48438: { cpm: 2.86, avgcast: 34640, hps: 2202, overhealing: 0.22 }, // Wild Growth
      157982: { cpm: 1.3, avgcast: 32974, hps: 853, overhealing: 0.36 }, // Tranquility
      8936: { cpm: 3.8, avgcast: 10814, hps: 815, overhealing: 0.18, hits: 12 }, // Regrowth
      81269: { cpm: 1.44, avgcast: 23772, hps: 698, overhealing: 0.19 }, // Efflorescence
      207386: { cpm: 0, avgcast: 0, hps: 565, overhealing: 0.24 }, // Spring Blossoms
      33763: { cpm: 1.5, avgcast: 2989, hps: 238, overhealing: 0.42 }, // Lifebloom
      145109: { cpm: 0, avgcast: 0, hps: 147, overhealing: 0.17 }, // Yseras Gift
    };
  } else if (contentType === "Dungeon") {
    spellList = {
      774: { cpm: 6.6, avgcast: 6520, hps: 740, overhealing: 0.29 }, // Rejuv
      48438: { cpm: 2.71, avgcast: 28940, hps: 1507, overhealing: 0.38 }, // Wild Growth
      8936: { cpm: 7.4, avgcast: 10814, hps: 1740, overhealing: 0.17, hits: 19 }, // Regrowth
      81269: { cpm: 1.41, avgcast: 19772, hps: 490, overhealing: 0.31 }, // Efflorescence
      33763: { cpm: 2.1, avgcast: 3421, hps: 238, overhealing: 0.24 }, // Lifebloom
      145109: { cpm: 0, avgcast: 0, hps: 147, overhealing: 0.17 }, // Yseras Gift
    };
  } else {
    console.error("Unknown Content Type");
  }

  return spellList;
};

export const druidDefaultStatWeights = (contentType) => {
  let statWeights = {};

  statWeights.Raid = {
    intellect: 1,
    haste: 0.67,
    crit: 0.59,
    mastery: 0.64,
    versatility: 0.58,
    leech: 0.81,
    defaults: true,
  };
  statWeights.Dungeon = {
    intellect: 1,
    haste: 0.65,
    crit: 0.62,
    mastery: 0.45,
    versatility: 0.62,
    leech: 0.38,
    defaults: true,
  };

  return statWeights[contentType];
};

export const druidDefaultSpecialQueries = (contentType) => {
  let specialQueries = {};
  if (contentType === "Raid") {
    specialQueries = {
      ConvokeChannelHPS: 480,
      OneManaHealing: 16.2,
      CastsPerMinute: 32, // ONLY tracks spells with a mana cost.
      cooldownMult: {
        oneMinute: 1.4, // 1.7 once 4pc,
        ninetySeconds: 1.12,
        twoMinutes: 1.4,
        twoMinutesOrb: 1.1,
        threeMinutes: 1.2,
      },
      HoldYourGroundUptime: 0.8
    };
  } else if (contentType === "Dungeon") {
    specialQueries = {
      ConvokeChannelHPS: 460,
      OneManaHealing: 1.2,
      CastsPerMinute: 30,
      cooldownMult: {
        oneMinute: 1.2,
        ninetySeconds: 1,
        twoMinutes: 1.35,
        twoMinutesOrb: 0.85, // There is no practical way to use Orb to it's maximum potential in dungeons.
        threeMinutes: 1,
      },
      HoldYourGroundUptime: 0.8
    };
  } else {
    console.error("Unknown Content Type");
  }

  return specialQueries;
};
