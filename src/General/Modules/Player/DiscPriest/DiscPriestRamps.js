// 
import { applyDiminishingReturns } from "General/Engine/ItemUtilities";
import { DISCSPELLS } from "./DiscSpellDB";
import { buildRamp } from "./DiscRampGen";
import { reportError } from "General/SystemTools/ErrorLogging/ErrorReporting";

// Any settings included in this object are immutable during any given runtime. Think of them as hard-locked settings.
const discSettings = {
    chaosBrand: true,
    critMult: 2
}


// This is a very simple function that just condenses our ramp sequence down to make it more human readable in reports. 
const rampShortener = (seq) => {
    let shortRamp = [];
    let lastValue = "";
    let lastCount = 1;

    for (var i = 0; i < seq.length; i++) {
        const currentValue = seq[i];
        if (currentValue === lastValue) {
            lastCount += 1;
        }
        else {
            if (lastValue !== "") {
                if (lastCount === 1) shortRamp.push(lastValue);
                else shortRamp.push(lastValue + " x" + lastCount);
            }
            
            lastCount = 1;
        }
        lastValue = currentValue;
    }
    shortRamp.push(lastValue + " x" + lastCount);
    return shortRamp
}

const addBreakdowns = (obj, newObj, miniRamp) => {
    for (const [key, value] of Object.entries(newObj)) {
        if (key in obj) {
            obj[key] = Math.round(value + newObj[key]);
        }
        else {
            obj[key] = Math.round(newObj[key])
        }
    }

    for (const [key, value] of Object.entries(miniRamp)) {
        if (key in obj) {
            obj[key] = Math.round(value + newObj[key] * 2);
        }
        else {
            obj[key] = Math.round(newObj[key] * 2)
        }
    }

    return obj;
}


export const allRampsHealing = (boonSeq, fiendSeq, stats, settings = {}, conduits, reporting = false) => {
    const rampResult = allRamps(boonSeq, fiendSeq, stats, settings, conduits, reporting);

    if (rampResult.totalHealing > 0) return rampResult.totalHealing;
    else {
        reportError("", "DiscRamp", "Total Healing is 0", rampResult.totalHealing || 0)
        return 0;
    }
}

// This function automatically casts a full set of ramps. It's easier than having functions call ramps individually and then sum them.
export const allRamps = (boonSeq, fiendSeq, stats, settings = {}, conduits, reporting) => {

    let rampResult = {totalHealing: 0, ramps: [], rampSettings: settings}
    const miniSeq = buildRamp('Mini', 6, settings["Neural Synapse Enhancer"] || false, stats.haste, settings.playstyle || "", [])
    const miniRamp = runCastSequence(miniSeq, stats, settings, conduits);
    const boonRamp = runCastSequence(boonSeq, stats, settings, conduits);
    const fiendRamp = runCastSequence(fiendSeq, stats, settings, conduits);

    rampResult.totalHealing = boonRamp.totalHealing + fiendRamp.totalHealing + miniRamp.totalHealing * 2;

    if (reporting) {
        rampResult.ramps.push({"tag": "Primary Ramp", "prerampConditions": ["Power of the Dark Side", "Active DoT"], "sequence": rampShortener(boonSeq), "totalHealing": Math.round(boonRamp.totalHealing)});
        rampResult.ramps.push({"tag": "Fiend Ramp", "prerampConditions": ["Power of the Dark Side", "Active DoT"], "sequence": rampShortener(fiendSeq), "totalHealing": Math.round(fiendRamp.totalHealing)});
        rampResult.ramps.push({"tag": "Mini Ramp", "prerampConditions": ["Power of the Dark Side", "Active DoT"], "sequence": rampShortener(miniSeq), "totalHealing": Math.round(miniRamp.totalHealing)});
        rampResult.stats = stats;

        rampResult.damageBreakdown = addBreakdowns(boonRamp.damageDone, fiendRamp.damageDone, miniRamp.damageDone);
        rampResult.healingBreakdown = addBreakdowns(boonRamp.healingDone, fiendRamp.healingDone, miniRamp.healingDone);
        rampResult.manaSpent = boonRamp.manaSpent + fiendRamp.manaSpent + miniRamp.manaSpent * 2;
        //rampResult.conduits = conduits;
        
     
        /*
        console.log("== Set Ramp Information == ")
        console.log("Total Healing: " + Math.round(rampResult.totalHealing));
        console.log("Legendaries used: Clarity of Mind");
        console.log("Conduits used: " + JSON.stringify(conduits));
        console.log("On use Trinkets used: " + " Instructor's Divine Bell (213 ilvl, ~20% expected overhealing)")
        console.log("Post-DR passive stat breakdown: " + JSON.stringify(stats));
        rampResult.ramps.forEach(ramp => {
            console.log("Ramp Name: " + ramp.tag + " (" + Math.round(ramp.totalHealing) + " healing)");
            console.log("Pre-ramp conditions: " + "[Power of the Dark Side, Purge the Wicked, Pelagos]");
            console.log(rampShortener(ramp.sequence));
            
    })*/}


    //console.log(JSON.stringify(rampResult));

    return rampResult; //boonRamp + fiendRamp + miniRamp * 2;
}

/**  Extend all active atonements by @extension seconds. This is triggered by Evanglism / Spirit Shell. */
const extendActiveAtonements = (atoneApp, timer, extension) => {
    atoneApp.forEach((application, i, array) => {
        if (application >= timer) {
            array[i] = application + extension;
        };
    });
}

// Removes a stack of a buff, and removes the buff entirely if it's down to 0 or doesn't have a stack mechanic.
const removeBuffStack = (buffs, buffName) => {
    const buff = buffs.filter(buff => buff.name === buffName)[0]
    const buffStacks = buff.stacks || 0;

    if (buffStacks === 1) {
        // Remove the buff
        buffs = buffs.filter(buff => buff.name !== buffName);
    }
    else if (buffStacks >= 1) {
        // The player has more than 1 stack of the buff. Remove one and leave the buff.
        const activeBuff = buffs.filter(buff => buff.name === buffName)[0];
        activeBuff.stacks = activeBuff.stacks - 1;
    }
    else {
        // The player doesn't have the buff at all.
        // This is not necessarily an error.
    }
    return buffs;
}

/** A spells damage multiplier. It's base damage is directly multiplied by anything the function returns.
 * @schism 25% damage buff to primary target if Schism debuff is active.
 * @sins A 3-12% damage buff depending on number of active atonements.
 * @chaosbrand A 5% damage buff if we have Chaos Brand enabled in Disc Settings.
 * @AscendedEruption A special buff for the Ascended Eruption spell only. The multiplier is equal to 3% (4 with conduit) x the number of Boon stacks accrued.
 */
const getDamMult = (state, buffs, activeAtones, t, spellName, boonStacks, conduits) => {
    const sins = {0: 1.12, 1: 1.12, 2: 1.1, 3: 1.08, 4: 1.07, 5: 1.06, 6: 1.05, 7: 1.05, 8: 1.04, 9: 1.04, 10: 1.03}
    const schism = buffs.filter(function (buff) {return buff.name === "Schism"}).length > 0 ? 1.25 : 1; 
    let mult = (activeAtones > 10 ? 1.03 : sins[activeAtones]) * schism
    if (discSettings.chaosBrand) mult = mult * 1.05;
    if (spellName === "PenanceTick") {
        if (checkBuffActive(buffs, "Power of the Dark Side")) {
            const potdsMult = buffs.filter(function (buff) {return buff.name === "Power of the Dark Side"})[0].value;
            mult = mult * potdsMult;
            state.activeBuffs = removeBuffStack(state.activeBuffs, "Power of the Dark Side")
        }
    }
    if (spellName === "Ascended Eruption") {
        if (conduits['Courageous Ascension']) mult = mult * (1 + boonStacks * 0.04);
        else mult = mult * (1 + boonStacks * 0.03);
    }
    return mult; 
}

/** A healing spells healing multiplier. It's base healing is directly multiplied by whatever the function returns.
 * @powerwordshield Gets a 200% buff if Rapture is active (modified by Exaltation if taken)
 * @ascendedEruption The healing portion also gets a buff based on number of boon stacks on expiry.
 */
const getHealingMult = (buffs, t, spellName, boonStacks, conduits) => {
    if (spellName === "Power Word: Shield" && checkBuffActive(buffs, "Rapture")) {
        if (conduits['Exaltation']) return 1 + 2 * 1.135;
        else return 3;
    }
    else if (spellName === "Ascended Eruption") {
        if (conduits['Courageous Ascension']) return 1 + boonStacks * 0.04;
        else return 1 + boonStacks * 0.03;
    }
    else return 1;
}

/** Check if a specific buff is active. Buffs are removed when they expire so this is active buffs only.
 * @param buffs An array of buff objects.
 * @param buffName The name of the buff we're searching for.
 */
const checkBuffActive = (buffs, buffName) => {
    return buffs.filter(function (buff) {return buff.name === buffName}).length > 0;
}

/**
 * The number of atonements currently active. These are stored separately from regular buffs for speed and to separate them from buffs on the active player.
 * @param atoneApp An array storing our atonement expiry times.
 * @param timer The current time
 * @returns Number of active atonements.
 */
const getActiveAtone = (atoneApp, timer) => {
    let count = 0;
    atoneApp.forEach(application => {
        if (application >= timer) {
            count++;
        };
    });
    return count;
}


/**
 * Returns a spells stat multiplier based on which stats it scales with.
 * @param {*} statArray A characters current stats including any active buffs.
 * @param {*} stats The secondary stats a spell scales with. Pulled from it's SpellDB entry.
 * @returns An effective multiplier. For a spell that scales with both crit and vers this would just be crit x vers.
 */
const getStatMult = (currentStats, stats) => {
    let mult = 1;
    
    const critChance = 0.05 + currentStats['crit'] / 35 / 100;
    if (stats.includes("vers")) mult *= (1 + currentStats['versatility'] / 40 / 100);
    if (stats.includes("crit")) mult *= (discSettings.critMult * critChance + (1 - critChance)); // TODO: Re-enable
    if (stats.includes("mastery")) mult *= (1.108 + currentStats['mastery'] / 25.9259 / 100);
    return mult;
}

/**
 * Get our players active stats. This is made up of our base stats + any buffs. 
 * Diminishing returns is not in play in this function.
 * @param {} statArray Our active stats.
 * @param {*} buffs Our active buffs.
 * @returns 
 */
const getCurrentStats = (statArray, buffs) => {
    const statBuffs = buffs.filter(function (buff) {return buff.buffType === "stats"});
    statBuffs.forEach(buff => {
        statArray[buff.stat] = (statArray[buff.stat] || 0) + buff.value;
    });

    statArray = applyDiminishingReturns(statArray);

    // Check for percentage stat increases which are applied post-DR.
    // Examples include Power Infusion and the crit portion of Shadow Word: Manipulation.
    const multBuffs = buffs.filter(function (buff) {return buff.buffType === "statsMult"});
    multBuffs.forEach(buff => {
        // Multiplicative Haste buffs need some extra code as they are increased by the amount of haste you already have.
        if (buff.stat === "haste") statArray["haste"] = (((statArray[buff.stat] / 32 / 100 + 1) * buff.value)-1) * 32 * 100;
        else statArray[buff.stat] = (statArray[buff.stat] || 0) + buff.value;
    });

    return statArray;
}

// Returns the players current haste percentage. 
const getHaste = (stats) => {
    return 1 + stats.haste / 32 / 100;
}

// Current atonement transfer rate.
// Diminishing returns are taken care of in the getCurrentStats function and so the number passed 
// to this function can be considered post-DR.
const getAtoneTrans = (mastery) => {
    const atonementBaseTransfer = 0.5;
    return atonementBaseTransfer * (1.108 + mastery / 25.9259 / 100);
}

const getSqrt = (targets) => {
    return Math.sqrt(targets);
}

/**
 * Get a spells raw damage or healing. This is made up of it's coefficient, our intellect, and any secondary stats it scales with.
 * We'll take care of multipliers like Schism and Sins in another function.
 * @param {object} spell The spell being cast. Spell data is pulled from DiscSpellDB. 
 * @param {object} currentStats A players current stats, including any buffs.
 * @returns The raw damage or healing of the spell.
 */
export const getSpellRaw = (spell, currentStats) => {
    return spell.coeff * currentStats.intellect * getStatMult(currentStats, spell.secondaries); // Multiply our spell coefficient by int and secondaries.
}

// This function is for time reporting. It just rounds the number to something easier to read. It's not a factor in any results.
const getTime = (t) => {
    return Math.round(t*1000)/1000
}

/**
 * This function handles all of our effects that might change our spell database before the ramps begin.
 * It includes conduits, legendaries, and some trinket effects.
 * 
 * @param {*} discSpells Our spell database
 * @param {*} settings Settings including legendaries, trinkets, soulbinds and anything that falls out of any other category.
 * @param {*} conduits The conduits run in the current set.
 * @returns An updated spell database with any of the above changes made.
 */
const applyLoadoutEffects = (discSpells, settings, conduits, state) => {

    // ==== Default Loadout ====
    // While Top Gear can automatically include everything at once, individual modules like Trinket Analysis require a baseline loadout
    // since if we compare trinkets like Bell against an empty loadout it would be very undervalued. This gives a fair appraisal when
    // we don't have full information about a character.
    // As always, Top Gear is able to provide a more complete picture. 
    if (settings['DefaultLoadout']) {
        if (settings.playstyle === "Kyrian Evangelism") {
            settings['Clarity of Mind'] = true;
            settings['Pelagos'] = true;
            conduits['Shining Radiance'] = 252;
            conduits['Rabid Shadows'] = 252;
            conduits['Courageous Ascension'] = 252;
            settings['4T28'] = true;
        }
        else if (settings.playstyle === "Venthyr Evangelism") {
            settings['Penitent One'] = true;
            settings['Shadow Word: Manipulation'] = true;
            settings['Theotar'] = true;
            conduits['Shining Radiance'] = 252;
            conduits['Rabid Shadows'] = 252;
            conduits['Swift Penitence'] = 252;
            settings['4T28'] = true;
        }
    }

    // ==== Legendaries ====
    // Note: Some legendaries do not need to be added to a ramp and can be compared with an easy formula instead like Cauterizing Shadows.
    // Unity Note: Unity is automatically converted to the legendary it represents and should not have an entry here.

    // -- Clarity of Mind --
    // Clarity of Mind adds 6 seconds to the Atonement granted by Power Word: Shield during Rapture. 
    // It's a straightfoward addition.
    if (settings['Clarity of Mind']) discSpells['Rapture'][0].atonement = 21;

    // -- Shadow Word: Manipulation --
    // SWM has two effects. 
    // -> First, it buffs the healing / absorb portion of the spell by 10%.
    // -> Secondly, it adds a large crit buff when the absorb is used. This can technically vary from 0->50% but we'll use an average of 45%.
    if (settings['Shadow Word: Manipulation']) {
        discSpells['Mindgames'][1].coeff *= 1.1; 

        discSpells['Mindgames'].push({
        type: "buff",
        castTime: 0,
        cost: 0,
        cooldown: 0,
        buffType: 'statsMult',
        stat: 'crit',
        value: 45 * 35, // This is equal to 45% crit, though the stats are applied post DR. 
        buffDuration: 10,
    })
    }; 

    // -- Penitent One --
    // Power Word: Radiance has a chance to make your next Penance free, and fire 3 extra bolts.
    // This is a close estimate, and could be made more accurate by tracking the buff and adding ticks instead of power.
    if (settings['Penitent One']) {
        // Penitent One is a bit odd in that it is technically a percentage chance rather than a guarantee.
        // We could roll for the probability on Radiance cast but this is problematic because a weaker set could beat a stronger one
        // based on stronger rolls during Top Gear.
        // To get around this, we'll add the ticks always, but lower their strength according to the percentage chance to proc.
        // On a double radiance then we have an 84% chance to get a proc so we'll multiply our 3 extra Penance ticks by that number.

        // To recap:
        // Penance without proc: 3 ticks at 100% strength.
        // Penance with proc: 6 ticks at 100% strength.
        // Including probability: Penance with proc is 6 ticks at 92% strength (3 + 3 * 0.84)
        discSpells['Power Word: Radiance'].push({
            name: "Penitent One",
            type: "buff",
            buffType: "special",
            value: 6,
            buffDuration: 20,
            castTime: 0,
            stacks: 1,
            canStack: false, 
        });

    }

    if (settings['Drape of Shame']) discSettings.critMult = 2.05;
    // ==== Soulbinds ====
    // Don't include Conduits here just any relevant soulbind nodes themselves.
    // This section can be expanded with more nodes, particularly those from other covenants.
    // Examples: Combat Meditation, Pointed Courage
    // --- Combat Meditation ---
    // Mastery buff on Casting Boon. Pre-DR stat buff.
    if (settings['Pelagos']) discSpells['Boon of the Ascended'].push({
        type: "buff",
        castTime: 0,
        cost: 0,
        cooldown: 0,
        buffType: 'stats',
        stat: 'mastery',
        value: 315,
        buffDuration: 30,
    });

    // --- Pointed Courage --- 
    // Post-DR crit stat buff that's active at basically all times.
    // TODO: Convert to Post DR stats.
    if (settings['Kleia']) state.activeBuffs.push({name: "Kleia", expiration: 999, buffType: "stats", value: 330, stat: 'crit'})

    // ==== Tier & Other Effects ====
    // Remember that anything that isn't wired into a ramp can just be calculated normally (like Genesis Lathe for example).
    if (settings['4T28']) {
        // If player has 4T28, then hook Power of the Dark Side into Power Word Radiance.
        discSpells['Power Word: Radiance'].push({
            name: "Power of the Dark Side",
            type: "buff",
            buffType: "special",
            value: 1.95,
            buffDuration: 20,
            castTime: 0,
            stacks: 1,
            canStack: true,
        });

    }
    else {
        // If player doesn't have 4T28, then we might still opt to start them with a PotDS proc on major ramps since the chance of it being active is extremely high.
        // This is unnecessary with 4pc since we'll always have a PotDS proc during our sequences due to Radiance always coming before Penance.
        if (settings['Power of the Dark Side']) state.activeBuffs.push({name: "Power of the Dark Side", expiration: 999, buffType: "special", value: 1.5, stacks: 1, canStack: true})
    }
    
    // ==== Trinkets ====
    // These settings change the stat value prescribed to a given trinket. We call these when adding trinkets so that we can grab their value at a specific item level.
    // When adding a trinket to this section, make sure it has an entry in DiscSpellDB first prescribing the buff duration, cooldown and type of stat.
    //if (settings["Instructor's Divine Bell"]) discSpells["Instructor's Divine Bell"][0].value = settings["Instructor's Divine Bell"];
    if (settings["Instructor's Divine Bell (new)"]) discSpells["Instructor's Divine Bell (new)"][0].value = settings["Instructor's Divine Bell (new)"];
    if (settings["Flame of Battle"]) discSpells["Flame of Battle"][0].value = settings["Flame of Battle"];
    if (settings['Shadowed Orb']) discSpells['Shadowed Orb'][0].value = settings['Shadowed Orb'];
    if (settings['Soulletting Ruby']) discSpells['Soulletting Ruby'][0].value = settings['Soulletting Ruby'];
    if (settings['Neural Synapse Enhancer']) discSpells['Neural Synapse Enhancer'][0].value = settings['Neural Synapse Enhancer'];
    //

    // ==== Conduits ====
    // These are all scaled based on Conduit rank.
    // You can add whichever conduits you like here, though if it doesn't change your ramp then you might be better calculating it in the conduit formulas file instead.
    // Examples of would be Condensed Anima Sphere.
    if (conduits['Courageous Ascension']) discSpells['Ascended Blast'][0].coeff *= 1.45; // Blast +40%, Eruption +1% per stack (to 4%)
    if (conduits['Shining Radiance']) discSpells['Power Word: Radiance'][0].coeff *= 1.64; // +64% radiance healing
    if (conduits['Rabid Shadows']) discSpells['Shadowfiend'][0].tickRate = discSpells['Shadowfiend'][0].tickRate / 1.342; // Fiends faster tick rate.
    if (conduits['Exaltation']) {
        discSpells['Rapture'][1].buffDuration = 9;
        discSpells['Rapture'][0].coeff = 1.65 * (1 + 2 * 1.135);
    }
    //

    return discSpells;
}

export const runHeal = (state, spell, spellName, specialMult = 1) => {

    // Pre-heal processing
    const currentStats = state.currentStats;

    const healingMult = getHealingMult(state.activeBuffs, state.t, spellName, state.boonOfTheAscended, state.conduits); 
    const targetMult = ('tags' in spell && spell.tags.includes('sqrt')) ? getSqrt(spell.targets) : spell.targets;
    const healingVal = getSpellRaw(spell, currentStats) * (1 - spell.overheal) * healingMult * targetMult;
    
    state.healingDone[spellName] = (state.healingDone[spellName] || 0) + healingVal;

}

export const runDamage = (state, spell, spellName, atonementApp) => {

    const activeAtonements = getActiveAtone(atonementApp, state.t); // Get number of active atonements.
    const damMultiplier = getDamMult(state, state.activeBuffs, activeAtonements, state.t, spellName, state.boonOfTheAscended, state.conduits); // Get our damage multiplier (Schism, Sins etc);
    const damageVal = getSpellRaw(spell, state.currentStats) * damMultiplier;
    const atonementHealing = activeAtonements * damageVal * getAtoneTrans(state.currentStats.mastery) * (1 - spell.atoneOverheal)

    // This is stat tracking, the atonement healing will be returned as part of our result.
    state.damageDone[spellName] = (state.damageDone[spellName] || 0) + damageVal; // This is just for stat tracking.
    state.healingDone['atonement'] = (state.healingDone['atonement'] || 0) + atonementHealing;

    //if (state.reporting) console.log(getTime(state.t) + " " + spellName + ": " + damageVal + ". Buffs: " + JSON.stringify(state.activeBuffs) + " to " + activeAtonements);
}

/**
 * Run a full cast sequence. This is where most of the work happens. It runs through a short ramp cycle in order to compare the impact of different trinkets, soulbinds, stat loadouts,
 * talent configurations and more. Any effects missing can be easily included where necessary or desired.
 * @param {} sequence A sequence of spells representing a ramp. Note that in two ramp cycles like alternating Fiend / Boon this function will cover one of the two (and can be run a second
 * time for the other).
 * @param {*} stats A players base stats that are found on their gear. This doesn't include any effects which we'll apply in this function.
 * @param {*} settings Any special settings. We can include soulbinds, legendaries and more here. Trinkets should be included in the cast sequence itself and conduits are handled below.
 * @param {object} conduits Any conduits we want to include. The conduits object is made up of {ConduitName: ConduitLevel} pairs where the conduit level is an item level rather than a rank.
 * @returns The expected healing of the full ramp.
 */
export const runCastSequence = (sequence, stats, settings = {}, conduits) => {
    //console.log("Running cast sequence");
    let state = {t: 0, activeBuffs: [], healingDone: {}, damageDone: {}, conduits: conduits, manaSpent: 0, settings: settings, 
                    conduits: conduits, boonOfTheAscended: 0, reporting: true}
    // Boon of the Ascended holds our active Boon of the Ascended stacks. This should be refactored into our buffs array.

    let atonementApp = []; // We'll hold our atonement timers in here. We keep them seperate from buffs for speed purposes.

    let nextSpell = 0;
    //let boonOfTheAscended = 0; 
    const discSpells = applyLoadoutEffects(deepCopyFunction(DISCSPELLS), settings, conduits, state);
    const seq = [...sequence];
    const sequenceLength = 45; // The length of any given sequence. Note that each ramp is calculated separately and then summed so this only has to cover a single ramp.
    const reporting = false; // A flag to report our sequences to console. Used for testing. MOSTLY REPLACED AND NOT WELL MAINTAINED. 

    for (var t = 0; state.t < sequenceLength; state.t += 0.01) {

        // -- Special Handling: Boon of the Ascended --
        // Boon is a bit special in that it'll expire after it's duration ends which might not happen perfectly within ticks or spells.
        // Instead we'll check it's expiration, and queue a special spell if it expires.
        // TODO: With the new DoT / HoT tech this could be moved to a regular buff and the special handling moved to a function, or at least moved to the expiration section.
        let ascendedEruption = state.activeBuffs.filter(function (buff) {return buff.expiration < state.t && buff.name === "Boon of the Ascended"}).length > 0;

        // Check for any expired atonements. 
        atonementApp = atonementApp.filter(function (buff) {return buff > state.t});
        
        // ---- Heal over time and Damage over time effects ----
        // HoTs and DoTs are now all handled at once instead of purge / SWP and Fiend both having awkward time arrays like in a previous version.
        // When we add buffs, we'll also attach a spell to them. The spell should have coefficient information, secondary scaling and so on. 
        // When it's time for a HoT or DoT to tick (state.t > buff.nextTick) we'll run the attached spell.
        // Note that while we refer to DoTs and HoTs, this can be used to map any spell that's effect happens over a period of time. 
        // This includes stuff like Shadow Fiend which effectively *acts* like a DoT even though it is technically not one.
        // You can also call a function from the buff if you'd like to do something particularly special. You can define the function in the specs SpellDB.
        const healBuffs = state.activeBuffs.filter(function (buff) {return (buff.buffType === "heal" || buff.buffType === "damage" || buff.buffType === "function") && state.t >= buff.next})
        if (healBuffs.length > 0) {
            healBuffs.forEach((buff) => {
                let currentStats = {...stats};
                state.currentStats = getCurrentStats(currentStats, state.activeBuffs)

                if (buff.buffType === "heal") {
                    const spell = buff.attSpell;
                    runHeal(state, spell, buff.name)
                }
                else if (buff.buffType === "damage") {
                    const spell = buff.attSpell;

                    runDamage(state, spell, buff.name, atonementApp)
                }
                else if (buff.buffType === "function") {
                    const func = buff.attFunction;
                    func(state);
                } 
                buff.next = buff.next + (buff.tickRate / getHaste(state.currentStats));
            });  
        }

        // -- Partial Ticks --
        // When DoTs / HoTs expire, they usually have a partial tick. The size of this depends on how close you are to your next full tick.
        // If your Shadow Word: Pain ticks every 1.5 seconds and it expires 0.75s away from it's next tick then you will get a partial tick at 50% of the size of a full tick.
        // Note that some effects do not partially tick (like Fiend), so we'll use the canPartialTick flag to designate which do and don't. 
        const expiringHots = state.activeBuffs.filter(function (buff) {return (buff.buffType === "heal" || buff.buffType === "damage") && state.t >= buff.expiration && buff.canPartialTick})
        expiringHots.forEach(buff => {
            const tickRate = buff.tickRate / getHaste(state.currentStats)
            const partialTickPercentage = (buff.next - state.t) / tickRate;
            const spell = buff.attSpell;
            spell.coeff = spell.coeff * partialTickPercentage;
            
            if (buff.buffType === "damage") runDamage(state, spell, buff.name, atonementApp);
            else if (buff.buffType === "healing") runHeal(state, spell, buff.name)
        })

        // Remove any buffs that have expired. Note that we call this after we handle partial ticks. 
        state.activeBuffs = state.activeBuffs.filter(function (buff) {return buff.expiration > state.t});

        // This is a check of the current time stamp against the tick our GCD ends and we can begin our queued spell.
        // It'll also auto-cast Ascended Eruption if Boon expired.
        if ((state.t > nextSpell && seq.length > 0) || ascendedEruption)  {
            const spellName = ascendedEruption ? "Ascended Eruption" : seq.shift();
            const fullSpell = discSpells[spellName];

            // Update current stats for this combat tick.
            // Effectively base stats + any current stat buffs.
            let currentStats = {...stats};
            state.currentStats = getCurrentStats(currentStats, state.activeBuffs);

            // We'll iterate through the different effects the spell has.
            // Smite for example would just trigger damage (and resulting atonement healing), whereas something like Mind Blast would trigger two effects (damage,
            // and the absorb effect).
            state.manaSpent += fullSpell[0].cost;
            fullSpell.forEach(spell => {

                // The spell is an atonement applicator. Add atonement expiry time to our array.
                // The spell data will tell us whether to apply atonement at the start or end of the cast.
                if (spell.atonement) {
                    for (var i = 0; i < spell.targets; i++) {
                        let atoneDuration = spell.atonement;
                        if (settings['Clarity of Mind'] && (spellName === "Power Word: Shield") && checkBuffActive(state.activeBuffs, "Rapture")) atoneDuration += 6;
                        if (spell.atonementPos === "start") atonementApp.push(state.t + atoneDuration);
                        else if (spell.atonementPos === "end") atonementApp.push(state.t + spell.castTime + atoneDuration);

                    }
                }
        
                // The spell has a healing component. Add it's effective healing.
                // Power Word: Shield is included as a heal, since there is no functional difference for the purpose of this calculation.
                if (spell.type === 'heal') {
                    runHeal(state, spell, spellName)
                }
                
                // The spell has a damage component. Add it to our damage meter, and heal based on how many atonements are out.
                else if (spell.type === 'damage') {
                    runDamage(state, spell, spellName, atonementApp)
                }

                // The spell extends atonements already active. This is specific to Evanglism. 
                else if (spell.type === "atonementExtension") {
                    extendActiveAtonements(atonementApp, state.t, spell.extension);
                }

                // The spell adds a buff to our player.
                // We'll track what kind of buff, and when it expires.
                else if (spell.type === "buff") {
                    if (spell.buffType === "stats") {
                        state.activeBuffs.push({name: spellName, expiration: state.t + spell.buffDuration, buffType: "stats", value: spell.value, stat: spell.stat});
                    }
                    else if (spell.buffType === "statsMult") {
                        state.activeBuffs.push({name: spellName, expiration: state.t + spell.buffDuration, buffType: "statsMult", value: spell.value, stat: spell.stat});
                    }
                    else if (spell.buffType === "damage" || spell.buffType === "healing") {     
                        const newBuff = {name: spellName, buffType: spell.buffType, attSpell: spell,
                            tickRate: spell.tickRate, canPartialTick: spell.canPartialTick, next: state.t + (spell.tickRate / getHaste(state.currentStats))}

                        newBuff['expiration'] = spell.hastedDuration ? state.t + (spell.buffDuration / getHaste(currentStats)) : state.t + spell.buffDuration
                                
                        state.activeBuffs.push(newBuff)

                    }
                    else if (spell.buffType === "special") {
                        
                        // Check if buff already exists, if it does add a stack.
                        const buffStacks = state.activeBuffs.filter(function (buff) {return buff.name === spell.name}).length;

                        if (buffStacks === 0) state.activeBuffs.push({name: spell.name, expiration: state.t + spell.castTime + spell.buffDuration, buffType: "special", value: spell.value, stacks: spell.stacks, canStack: spell.canStack});
                        else {
                            const buff = state.activeBuffs.filter(buff => buff.name === spell.name)[0]
                            if (buff.canStack) buff.stacks += 1;
                        }
                    }     
                    else {
                        state.activeBuffs.push({name: spellName, expiration: state.t + spell.castTime + spell.buffDuration});
                    }
                }

                // These are special exceptions where we need to write something special that can't be as easily generalized.

                // TODO: Schism was written early in the app, but can just be converted to a regular buff effect for code cleanliness.
                else if (spellName === "Schism") {
                    // Add the Schism buff. 
                    state.activeBuffs.push({name: "Schism", expiration: state.t + spell.castTime + spell.buffDuration});
                }

                // Add boon stacks.
                // TODO: When spell-specific functions are added, these could both be converted to secondary spell effects. 
                else if (spellName === "Ascended Blast") {
                    state.boonOfTheAscended += 5 / 2;
                }
                else if (spellName === "Ascended Nova") {
                    state.boonOfTheAscended += 1 / 2;
                }

                // Penance will queue either 3 or 6 ticks depending on if we have a Penitent One proc or not. 
                // These ticks are queued at the front of our array and will take place immediately. 
                else if (spellName === "Penance") {
                    if (checkBuffActive(state.activeBuffs, "Penitent One")) {
                        discSpells['PenanceTick'][0].castTime = 2 / 6;
                        discSpells['PenanceTick'][0].coeff = 0.376 * 0.92;

                        for (var i = 0; i < 6; i++) {
                            seq.unshift("PenanceTick");
                        }
                        removeBuffStack(state.activeBuffs, "Penitent One"); 
                    }
                    else {
                        discSpells['PenanceTick'][0].castTime = 2 / 3;
                        discSpells['PenanceTick'][0].coeff = 0.376;
                        for (var i = 0; i < 3; i++) {
                            seq.unshift("PenanceTick");
                        }
                    }
                }
                
                // Grab the next timestamp we are able to cast our next spell. This is equal to whatever is higher of a spells cast time or the GCD.
                nextSpell += (spell.castTime / getHaste(currentStats));
            });   
        }
    }


    // Add up our healing values (including atonement) and return it.
    const sumValues = obj => Object.values(obj).reduce((a, b) => a + b);
    state.totalHealing = sumValues(state.healingDone);

    return state;

}

// This is a boilerplate function that'll let us clone our spell database to avoid making permanent changes.
// We need this to ensure we're always running a clean DB, free from any changes made on previous runs.
const deepCopyFunction = (inObject) => {
    let outObject, value, key;
  
    if (typeof inObject !== "object" || inObject === null) {
      return inObject; // Return the value if inObject is not an object
    }
  
    // Create an array or object to hold the values
    outObject = Array.isArray(inObject) ? [] : {};
  
    for (key in inObject) {
      value = inObject[key];
  
      // Recursively (deep) copy for nested objects, including arrays
      outObject[key] = deepCopyFunction(value);
    }
  
    return outObject;
  };

