
import Player from "General/Modules/Player/Player";
import { processAllLines } from "Retail/Engine/SimCImport/SimCImportEngine.js"
import { applyDiminishingReturns, buildWepCombos } from "General/Engine/ItemUtilities"
import { runTopGear, evalDiscRamp } from "General/Modules/TopGear/Engine/TopGearEngine";
import ItemSet from "General/Modules/TopGear/ItemSet";

describe("Top Gear Venthyr tests", () => {
    let player;
    let itemSet;
    let setStats;
    let wepCombos;

    // Import SimC and do some basic setup.
    beforeEach(() => {
        player =  new Player("Mock", "Discipline Priest", 99, "NA", "Stonemaul", "Night Elf");
        player.setModelID(2, "Raid"); // Venthyr Evangelism
        var lines = venthyrDbl.split("\n");
        processAllLines(player, "Raid", "venthyr", lines, -1, -1)
        wepCombos = buildWepCombos(player, true);
        setStats = {
            intellect: 2200,
            haste: 950,
            crit: 600,
            mastery: 400,
            versatility: 300,
            leech: 0,
            hps: 0,
            dps: 0,
            mana: 0,
          };
      });

    test("Test 1, Venthyr legendary check", () => {
        itemSet = new ItemSet(0, [], 0, "Discipline Priest")
        itemSet.setLegendary = "Penitent One";
        itemSet.unity = true;
        const result = evalDiscRamp(itemSet, setStats, player.getActiveModel("Raid"), [], true)

        expect(result.rampSettings['Shadow Word: Manipulation']).toEqual(true);
        expect(result.rampSettings['Penitent One']).toEqual(true);
    })

    test("Test 2, Top Gear legendary check w/ reporting", () => {
        const result = runTopGear(player.activeItems, wepCombos, player, "Raid", player.getHPS("Raid"), "en", {}, player.getActiveModel("Raid"), true)
        const ramp = result.itemSet.report.ramp;

        expect(ramp.rampSettings['Shadow Word: Manipulation']).toEqual(true);
        expect(ramp.rampSettings['Penitent One']).toEqual(true);

    });

    test("Test 2, Top Gear Mind Games check", () => {
        const result = runTopGear(player.activeItems, wepCombos, player, "Raid", player.getHPS("Raid"), "en", {}, player.getActiveModel("Raid"), true)
        const ramp = result.itemSet.report.ramp;

        //console.log(ramp);

        ramp.ramps.forEach(rampData => {
            expect(rampData.sequence).toContain('Schism');
            expect(rampData.sequence).toContain('Mindgames');
            expect(rampData.sequence).not.toContain('Ascended Blast');
        })
        //expect(ramp.rampSettings['Shadow Word: Manipulation']).toEqual(true);
        //expect(ramp.rampSettings['Penitent One']).toEqual(true);

    });

})


const venthyrDbl = `
# Voulkpriest - Holy - 2022-04-13 20:41 - US/Stonemaul
# SimC Addon 9.2.0
# Requires SimulationCraft 920-01 or newer

priest="Voulkpriest"
level=60
race=human
region=us
server=stonemaul
role=attack
professions=alchemy=1/herbalism=41
talents=2312123
spec=holy

covenant=night_fae
# soulbind=niya:1,322721/114:9:1
soulbind=dreamweaver:2,319217/283:10:1/84:10:1/319213/67:10:1/66:10:1/319214/319191/116:10:1/352779/69:10:1/352786
# conduits_available=75:9/76:9/77:10/78:10/81:10/82:10/84:10/101:9/107:10/113:10/114:9/115:10/116:10/67:10/69:10/73:10/85:10/66:10/71:10/72:10/283:10
renown=80

head=,id=188880,bonus_id=7359/6652/7579/8151/7772/1498/6646
neck=,id=173146,gem_id=173128,bonus_id=7886/7881,drop_level=60,crafted_stats=32
shoulder=,id=186286,gem_id=187312,bonus_id=7187/41/1498/6646
back=,id=189791,bonus_id=7187/8132/8138/6652/1524/6646
chest=,id=188875,enchant_id=6230,bonus_id=7188/6652/8153/1492/6646
wrist=,id=189809,bonus_id=7188/6652/7579/8118/8138/1511/6646
hands=,id=188881,bonus_id=7189/6652/8154/1472/6646
waist=,id=173248,gem_id=173130,bonus_id=8126/7882/8156/6647/6648/1588/6935
legs=,id=188878,bonus_id=7188/6652/8155/1485/6646
feet=,id=173243,bonus_id=6976/7882/8156/6649/6650/1588
finger1=,id=186375,enchant_id=6166,bonus_id=7187/41/7574/1498/6646
finger2=,id=189839,enchant_id=6166,bonus_id=7188/42/7578/1511/6646
trinket1=,id=184842,bonus_id=6652/1472/5910/6646
trinket2=,id=186423,bonus_id=7187/6652/1498/6646
main_hand=,id=178829,enchant_id=6229,bonus_id=7359/6652/7826/1586/6646
`