

export function getItemSet(id, pieces, spec) {
    let effects = [];
    let temp = itemSets.filter(function (set) {
      return set.id === parseInt(id) && set.class === spec;
    });
    if (temp.length > 0) {
      for (const [bonus, effectid] of Object.entries(temp[0].setBonuses)) {
        //console.log("Getting bonuss" + bonus + ". ID: " + effectid + ". Pieces: " + pieces);
        if (pieces >= bonus) effects.push({type: 'set bonus', name: effectid, class: temp[0].class});
      }
      return effects;
    }
    else return "";
  }

export const itemSets = [
    {
      /* ---------------------------------------------------------------------------------------------- */
      /*                                 Grand Upwelling (Monk T28)                                     */
      /* ---------------------------------------------------------------------------------------------- */
      // 
      id: 1504,
      class: "Mistweaver Monk",
      setBonuses: {
        2: "Mistweaver T28-2", // +5% Essence Font Healing, +2s HoT duration
        4: "Mistweaver T28-4"  // TFT creates a rune that adds flat healing to all healing events while inside. Lasts 10s.
      },
    },
    {
        /* ---------------------------------------------------------------------------------------------- */
        /*                                    Fixed Stars (Druid T28)                                     */
        /* ---------------------------------------------------------------------------------------------- */
        // 
        id: 1502,
        class: "Restoration Druid",
        setBonuses: {
          2: "Druid T28-2", // 
          4: "Druid T28-4"  // 
        },
      },
      {
        /* ---------------------------------------------------------------------------------------------- */
        /*                           Luminous Chevalier (Paladin T28)                                     */
        /* ---------------------------------------------------------------------------------------------- */
        // 
        id: 1498,
        class: "Holy Paladin",
        setBonuses: {
          2: "Paladin T28-2", // 
          4: "Paladin T28-4"  // 
        },
      },
      {
        /* ---------------------------------------------------------------------------------------------- */
        /*                                     Empyrean (Priest T28)                                      */
        /* ---------------------------------------------------------------------------------------------- */
        // 
        id: 1505,
        class: "Holy Priest",
        setBonuses: {
          2: "HPriest T28-2", // 
          4: "HPriest T28-4"  // 
        },
      },
      {
        id: 1505,
        class: "Discipline Priest",
        setBonuses: {
          2: "DPriest T28-2", // 
          4: "DPriest T28-4"  // 
        },
      },
      {
        /* ---------------------------------------------------------------------------------------------- */
        /*                            Theurgic Starspeaker (Shaman T28)                                   */
        /* ---------------------------------------------------------------------------------------------- */
        // 
        id: 1499,
        class: "Restoration Shaman",
        setBonuses: {
          2: "Shaman T28-2", // 
          4: "Shaman T28-4"  // 
        },
      },


]