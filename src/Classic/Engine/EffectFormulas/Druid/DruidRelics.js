
export const getDruidRelic = (effectName, player) => {
    // These are going to be moved to a proper file soon.
    let bonus_stats = {};

    //console.log(player);

    if (effectName === undefined) {
        /* ---------------------------------------------------------------------------------------------- */
        /*                                         Error Handling                                         */
        /* ---------------------------------------------------------------------------------------------- */
        console.log("no relic found");
        return bonus_stats;

    } else if ( 
    /* ---------------------------------------------------------------------------------------------- */
    /*                                      Communal Idol of Life                                     */
    /* ---------------------------------------------------------------------------------------------- */
    
        // NOTE: This is intentionally not implemented in QE Live, since it does not work at all in-game. 
        effectName === "Communal Idol of Life" // Periodic Rejuv healing increased by 15.
        ) {
        bonus_stats.bonushealing = 0; // Do not chance unless Idol is fixed.
    }
    else if ( 
        /* ---------------------------------------------------------------------------------------------- */
        /*                                      Idol of Budding Life                                      */
        /* ---------------------------------------------------------------------------------------------- */
        effectName === "Idol of Budding Life" // Rejuv Mana Cost -36
      ) {
          const manaReduction = 36;
          bonus_stats.mp5 = (player.getSpellCPM(774, "Raid") * manaReduction / 12);
      }
    else if ( 
        /* ---------------------------------------------------------------------------------------------- */
        /*                               Idol of the Crescent Goddess                                     */
        /* ---------------------------------------------------------------------------------------------- */
        effectName === "Idol of the Crescent Goddess" // Regrowth mana cost -65
        ) {
            const manaReduction = 65;
            bonus_stats.mp5 = (player.getSpellCPM(26980, "Raid") + player.getSpellCPM(8936, "Raid")) * manaReduction / 12;
        }
    else if ( 
        /* ---------------------------------------------------------------------------------------------- */
        /*                               Idol of the Raven Goddess                                        */
        /* ---------------------------------------------------------------------------------------------- */
        effectName === "Idol of the Raven Goddess" // Increases Tree +Healing Aura by 44.
        ) {
            const effect = {}

            bonus_stats.bonushealing = 0;
        }
    else if ( 
        /* ---------------------------------------------------------------------------------------------- */
        /*                                      Idol of the Avian Heart                                   */
        /* ---------------------------------------------------------------------------------------------- */
        effectName === "Idol of the Avian Heart" // Healing Touch Healing +136 
        ) {
            const effect = {}

            bonus_stats.bonushealing = 0;
        }
    else if ( 
        /* ---------------------------------------------------------------------------------------------- */
        /*                                    Idol of the Emerald Queen                                   */
        /* ---------------------------------------------------------------------------------------------- */
        effectName === "Idol of the Emerald Queen" // Lifebloom Periodic healing +88
        ) {
            const expectedOverhealing = 0.2
            const ticksPerMin = player.getSpellCPM(33763, "Raid") * 7;

            bonus_stats.hps = 88 * 0.2943 * ticksPerMin * (1 - expectedOverhealing) / 60;
        }
    else if ( 
        /* ---------------------------------------------------------------------------------------------- */
        /*                                  Harold's Rejuvenating Broach                                  */
        /* ---------------------------------------------------------------------------------------------- */
        effectName === "Harold's Rejuvenating Broach" // Rejuv Healing +86
        ) {
            const castsPerMin = player.getSpellCPM(774, "Raid");

            bonus_stats.hps = castsPerMin * 86 / 60;
        }

    else if ( 
        /* ---------------------------------------------------------------------------------------------- */
        /*                                      Idol of Longevity                                     */
        /* ---------------------------------------------------------------------------------------------- */
        effectName === "Idol of Longevity" // Healing Touch restores 25 mana.
        ) {
            const effect = {}
    
            bonus_stats.bonushealing = 0;
        }

    return bonus_stats;
  
}