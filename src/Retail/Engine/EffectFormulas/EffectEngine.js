import { getGenericEffect, getDominationGemEffect } from "./Generic/GenericEffectFormulas";
import { getDruidSpecEffect } from "./Druid/DruidSpecEffects";
import { getDiscPriestSpecEffect } from "./Priest/DiscPriestSpecEffects";
import { getHolyPriestSpecEffect } from "./Priest/HolyPriestSpecEffects";
import { getMonkSpecEffect } from "./Monk/MonkSpecEffects";
import { getShamanSpecEffect } from "./Shaman/ShamanSpecEffects";
import { getPaladinSpecEffect } from "./Paladin/PaladinSpecEffects";
import { getGenericLegendary } from "./Generic/GenericLegendaryFormulas";
import { getTrinketEffect} from "./Generic/TrinketEffectFormulas";
import { getTrinketEffectClassic} from "Classic/Engine/EffectFormulas/Generic/TrinketEffectFormulasBC"
import { getGenericEffectBC} from "Classic/Engine/EffectFormulas/Generic/GenericEffectBC"

import { getPriestConduit } from "./Priest/PriestConduitFormulas";
import { getPaladinConduit } from "./Paladin/PaladinConduitFormulas";
import { getShamanConduit } from "./Shaman/ShamanConduitFormulas";
import { getMonkConduit } from "./Monk/MonkConduitFormulas";
import { getDruidConduit } from "./Druid/DruidConduitFormulas";
import { getPaladinCovAbility } from "./Paladin/PaladinMiscFormulas";
import SPEC from "../../../General/Engine/SPECS";
import { getShamanCovAbility } from "./Shaman/ShamanCovenantFormulas";

import { getDruidTierSet } from "Classic/Engine/EffectFormulas/Druid/DruidTierSets";
import { getShamanTierSet } from "Classic/Engine/EffectFormulas/Shaman/ShamanTierSets";
import { getPaladinTierSet } from "Classic/Engine/EffectFormulas/Paladin/PaladinTierSets";
import { getPriestTierSet } from "Classic/Engine/EffectFormulas/Priest/PriestTierSets";

import { getDruidRelic } from "Classic/Engine/EffectFormulas/Druid/DruidRelics";
import { getShamanRelic } from "Classic/Engine/EffectFormulas/Shaman/ShamanRelics";
import { getPaladinRelic } from "Classic/Engine/EffectFormulas/Paladin/PaladinRelics";

import { getGenericSet } from "Classic/Engine/EffectFormulas/Generic/GenericSets";

// Effect is a small "dictionary" with two key : value pairs.
// The EffectEngine is basically a routing device. It will take your effect and effect type and grab the right formula from the right place.
// This allows each spec to work on spec-specific calculations without a need to interact with the other specs.
export function getEffectValue(effect, player, castModel, contentType, itemLevel = 0, userSettings, gameType = "Retail", setStats = {}) {
  let bonus_stats = {};
  let effectName = effect.name;
  let effectType = effect.type;
  console.log("Plss");
  // ----- Retail Effect -----
  // Can either be a Spec Legendary, Trinket, or a special item effect like those found back in Crucible of Storms or the legendary BFA cloak.
  if (gameType === "Retail") {
    if (effectType === "unity") {
      effectType = 'spec legendary'
      effectName = getUnityEffect(player);
    }
    if (effect.type === "special") {
      // A special effect is one that appears on an item slot where an effect isn't usually expected.
      // This includes stuff like Drape of Shame that adds a crit bonus to a cape slot.
      // Does NOT include trinkets, legendaries, set bonuses etc.
      bonus_stats = getGenericEffect(effectName, player, contentType, itemLevel, effect);
    } 
    else if (effect.type === "domination gem") {
      // Domination gems don't work in patch 9.2 content and no longer need to be calculated.
      return {}

      //const effectRank = effect.rank;
      //bonus_stats = getDominationGemEffect(effectName, player, contentType, effectRank);
    }
    // == Class specific effects ==
    // These can be single-slot effects like Legendaries, or entire set bonuses.
    // For tier sets, 2pc and 4c should be calculated separately, but the 4pc can include the 2pc in it's valuation if 
    // there's synergy.
    else if (effectType === "set bonus" || effectType === "spec legendary") {
      switch (player.spec) {
        case "Discipline Priest":
          bonus_stats = getDiscPriestSpecEffect(effectName, player, contentType);
          break;
        case "Restoration Druid":
          bonus_stats = getDruidSpecEffect(effectName, player, contentType);
          break;
        case "Holy Priest":
          bonus_stats = getHolyPriestSpecEffect(effectName, player, contentType);
          break;
        case "Holy Paladin":
          bonus_stats = getPaladinSpecEffect(effectName, player, contentType);
          break;
        case "Mistweaver Monk":
          bonus_stats = getMonkSpecEffect(effectName, player, contentType);
          break;
        case "Restoration Shaman":
          bonus_stats = getShamanSpecEffect(effectName, player, contentType);
          break;
        default:
          break;
      }
    } 
    else if (effectType === "generic legendary") {
      // Generic legendaries are items wearable by all specs.
      // These have very limited support currently since they're not very strong.
      bonus_stats = getGenericLegendary(effectName, player, castModel, contentType, userSettings);
    } 
    else if (effectType === "trinket") {
      bonus_stats = getTrinketEffect(effectName, player, castModel, contentType, itemLevel, userSettings, setStats);
      //testTrinkets(player, contentType); //TODO: Remove
    }
  }
  // -------------------------------------------

  // ----- Burning Crusade & Wrath of the Lich King Effect Formulas -----
  // Includes "Tier Set" bonuses, trinkets, and special effects on items that aren't just pure stats. 
  else if (gameType === "Classic" || gameType === "BurningCrusade") {
    if (effectType === "set bonus" && ('class' in effect && effect.class !== -1)) {
      switch (player.spec) {
        case "Holy Priest Classic":
          bonus_stats = getPriestTierSet(effectName, player);
          break;
        case "Restoration Druid Classic":
          bonus_stats = getDruidTierSet(effectName, player);
          break;
        case "Holy Paladin Classic":
          bonus_stats = getPaladinTierSet(effectName, player);
          break;
        case "Restoration Shaman Classic":
          bonus_stats = getShamanTierSet(effectName, player);
          break;
        default:
          break;
        // Call error
      }
    } 
    else if (effectType === "set bonus") {
      // Generic bonuses like Tailoring etc.
      bonus_stats = getGenericSet(effectName, player, setStats);
    }
    else if (effectType === "trinket") {
      bonus_stats = getTrinketEffectClassic(effectName, player, userSettings);
    }
    else if (effectType === "relic") {
      switch (player.spec) {
        case "Restoration Shaman Classic":
          bonus_stats = getShamanRelic(effectName, player, userSettings);
          break;
        case "Restoration Druid Classic":
          bonus_stats = getDruidRelic(effectName, player, userSettings);
          break;
        case "Holy Paladin Classic":
          bonus_stats = getPaladinRelic(effectName, player, userSettings);
          break;
      }

    }
    if (effect.type === "special") {
      bonus_stats = getGenericEffectBC(effectName, player, contentType);
    } 
  }
  //console.log("ITEM EFFECT" + JSON.stringify(effect) + ". " + ". Result: " + JSON.stringify(bonus_stats));
  return bonus_stats;
}

function getConduitRank(itemLevel, enhanced = false) {
  let ranks = {
    145: 1,
    158: 2,
    171: 3,
    184: 4,
    200: 5,
    213: 6,
    226: 7,
    239: 8,
    252: 9,
    265: 10,
    278: 11
  };

  if (enhanced) return ranks[itemLevel] + 2
  else return ranks[itemLevel];
}

export function getConduitFormula(effectID, player, contentType, itemLevel = 145, enhanced = false) {

  let conduitRank = getConduitRank(itemLevel, enhanced);
  let bonus_stats = {};
  
  if (effectID === 357902) {
    // % intellect increase when healed by another player. 15s duration, 30s cooldown.
    const percentInc = 0.02 + conduitRank * 0.002;
    const uptime = contentType == "Raid" ? 0.45 : 0;
    const intGain = percentInc * player.getInt() * uptime;
    bonus_stats.HPS = intGain / player.getInt() * (player.getHPS(contentType) * 0.75); // Remove this 0.75 modifier when the cast models update.
  }
  else if (effectID === 357888) {
    // Small heal based on your max health whenever you take damage. 10s cooldown.
    const percHealing = (0.25 + conduitRank * 0.025) / 100 * 10;
    const ppm = 60 / 10 * 0.85; // Condensed Anima Sphere notably does not proc off a significant number of abilities.
    const expectedOverhealing = 0.27;
    bonus_stats.HPS = percHealing * ppm * (1 - expectedOverhealing) * player.getHealth(contentType) / 60;
  }
  else {
    switch (player.spec) {
      case SPEC.DISCPRIEST:
      case SPEC.HOLYPRIEST:
        bonus_stats = getPriestConduit(effectID, player, contentType, conduitRank);
        break;
      case SPEC.RESTODRUID:
        bonus_stats = getDruidConduit(effectID, player, contentType, conduitRank);
        break;
      case SPEC.RESTOSHAMAN:
        bonus_stats = getShamanConduit(effectID, player, contentType, conduitRank);
        break;
      case SPEC.HOLYPALADIN:
        bonus_stats = getPaladinConduit(effectID, player, contentType, conduitRank);
        break;
      case SPEC.MISTWEAVERMONK:
        bonus_stats = getMonkConduit(effectID, player, contentType, conduitRank);
        break;
    }
  }

  return bonus_stats;
}

export function getCovAbility(soulbindName, player, contentType) {
  let bonus_stats = {};

  switch (player.spec) {
    case SPEC.DISCPRIEST:
    case SPEC.HOLYPRIEST:
      break;
    case SPEC.HOLYPALADIN:
      bonus_stats = getPaladinCovAbility(soulbindName, player, contentType);
      break;
    case SPEC.RESTOSHAMAN:
      return getShamanCovAbility(soulbindName, player, contentType);
  }

  return bonus_stats;
}


export function getUnityEffect(player) {
  // Returns an effect name for a players given covenant so that Unity calls the correct formula.
  if (player.getSpec() === "Restoration Druid") {
    // -- Resto Druid Covenant Legendaries -- 
    switch (player.getCovenant()) {
      case "necrolord":
        return "Locust Swarm"
      case "night_fae":
        return "Celestial Spirits"
      case "venthyr":
        return "Sinful Hysteria"
      case "kyrian":
        return "Kindred Affinity"
    }
  }
  else if (player.getSpec() === "Holy Paladin") {
    switch (player.getCovenant()) {
      case "necrolord":
        return "Duty-Bound Gavel"
      case "night_fae":
        return "Seasons of Plenty"
      case "venthyr":
        return "Radiant Embers"
      case "kyrian":
        return "Divine Resonance"
    }
  }
  else if (player.getSpec() === "Holy Priest" || player.getSpec() === "Discipline Priest") {
    switch (player.getCovenant()) {
      case "necrolord":
        return "Pallid Command"
      case "night_fae":
        return "Bwonsamdi's Pact"
      case "venthyr":
        return "Shadow Word: Manipulation"
      case "kyrian":
        return "Sphere's Harmony"
    }
  }
  else if (player.getSpec() === "Mistweaver Monk") {
    switch (player.getCovenant()) {
      case "necrolord":
        return "Bountiful Brew"
      case "night_fae":
        return "Faeline Harmony"
      case "venthyr":
        return "Sinister Teachings"
      case "kyrian":
        return "Call to Arms"
    }
  }
  else if (player.getSpec() === "Restoration Shaman") {
    switch (player.getCovenant()) {
      case "necrolord":
        return "Splintered Elements"
      case "night_fae":
        return "Seeds of Rampant Growth"
      case "venthyr":
        return "Elemental Conduit"
      case "kyrian":
        return "Raging Vesper Vortex"
    }
  }
}