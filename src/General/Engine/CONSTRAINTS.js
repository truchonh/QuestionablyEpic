
// This is a set of constraints used throughout the app to guarantee the users don't mistakenly enter data that will give them
// "technically correct but not what they were looking for" type results. A 400 item level trinket might be calculated correctly,
// but isn't giving them information they can actually use. 
export const CONSTRAINTS = {
    Retail: {
        maxItemLevel: 420,
        minItemLevel: 90,
        maxSecondaryWeight: 1.3,
        minSecondaryWeight: 0,
        maxTertiaryWeight: 2,
        minTertiaryWeight: 0,
        minRenown: 1,
        maxRenown: 80
    },
    Classic: {


    },
    Shared: {
        topGearMaxItems: 32, // The maximum number of items selectable by the player. Combinatorial explosion requires we keep this reasonable. 
        topGearDifferentials: 8, // Number of competitive alternatives to show.
    }

}

// This will return the value itself if it is between min and max, and a boundary otherwise. 
// Example: 30, 10, 60 returns 30. 0, 10, 60 returns 10 and so forth. 
export function setBounds(value, min, max) {
    return Math.max(min, Math.min(value, max))
}