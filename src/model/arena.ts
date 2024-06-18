import { buildPokemon } from "../data/pokemon-data.js"
import { Random } from "../util/random.js"
import { Pokemon } from "./pokemon.js"

export interface ArenaTrainer {
    name: string
    avatar: string
    team: Pokemon[]
    leads?: number[]
    rank: 1 | 2 | 3
}

export const arenaTrainers: ArenaTrainer[] = [
    {
        name: 'Aaron',
        avatar: 'aaron',
        rank: 2,
        team: [
            buildPokemon('LUXRAY'),
            buildPokemon('ESCAVALIER'),
            buildPokemon('SHEDINJA'),
            buildPokemon('BLAZIKEN'),
            buildPokemon('SPIRITOMB'),
            buildPokemon('TOXICROAK'),
        ]
    },
    {
        // Grass Rain team
        name: 'Erika',
        avatar: 'erika',
        rank: 2,
        leads: [1],
        team: [
            buildPokemon('VENUSAUR'),
            buildPokemon('KYOGRE'),
            buildPokemon('SCEPTILE'),
            buildPokemon('SEISMITOAD'),
            buildPokemon('TORTERRA'),
            buildPokemon('LUDICOLO'),
        ]
    },
    {
        // Grass Sun team
        name: 'Office Worker Will',
        avatar: 'officeworker',
        rank: 2,
        leads: [0],
        team: [
            buildPokemon('Groudon'),
            buildPokemon('VICTREEBEL'),
            buildPokemon('EXEGGUTOR'),
            buildPokemon('TORKOAL'),
            buildPokemon('BLASTOISE'),
            buildPokemon('NIDOQUEEN'),
        ]
    },
    {
        name: 'Wattson',
        avatar: 'wattson',
        rank: 2,
        leads: [0],
        team: [
            buildPokemon('ABOMASNOW'),
            buildPokemon('TANGROWTH'),
            buildPokemon('MAMOSWINE'),
            buildPokemon('GLACEON'),
            buildPokemon('TOXICROAK'),
            buildPokemon('HIPPOWDON'),
        ]
    },
    {
        name: 'Lusamine',
        avatar: 'lusamine',
        rank: 3,
        team: [
            buildPokemon('RAYQUAZA'),
            buildPokemon('MAWILE'),
            buildPokemon('Deoxys'),
            buildPokemon('LUXRAY'),
            buildPokemon('SPIRITOMB'),
            buildPokemon('FROSLASS'),
        ]
    },
    {
        name: 'Battle Girl Kate',
        avatar: 'battlegirl',
        rank: 1,
        team: [
            buildPokemon('HITMONLEE'),
            buildPokemon('HITMONTOP'),
            buildPokemon('KANGASKHAN'),
            buildPokemon('MR. MIME'),
            buildPokemon('JOLTEON'),
            buildPokemon('SCEPTILE'),
        ]
    },
    {
        name: 'Flannery',
        avatar: 'flannery',
        rank: 2,
        leads: [0, 1],
        team: [
            buildPokemon('GROUDON'),
            buildPokemon('TORKOAL'),
            buildPokemon('DRAGONITE'),
            buildPokemon('MOLTRES'),
            buildPokemon('SABLEYE'),
            buildPokemon('RHYDON'),
        ]
    },
    {
        name: 'Skyla',
        avatar: 'skyla',
        rank: 2,
        team: [
            buildPokemon('SUICUNE'),
            buildPokemon('HO-OH'),
            buildPokemon('SHIFTRY'),
            buildPokemon('BLAZIKEN'),
            buildPokemon('GARDEVOIR'),
            buildPokemon('TORTERRA'),
        ]
    },
    {
        name: 'Nurse Annie',
        avatar: 'nurse',
        rank: 1,
        team: [
            buildPokemon('CHANSEY'),
            buildPokemon('BLISSEY'),
            buildPokemon('MELOETTA'),
            buildPokemon('UMBREON'),
            buildPokemon('SYLVEON'),
            buildPokemon('DONPHAN'),
        ]
    },
    {
        name: 'Ryuki',
        avatar: 'ryuki',
        rank: 3,
        team: [
            buildPokemon('INFERNAPE'),
            buildPokemon('GENESECT'),
            buildPokemon('GIRATINA'),
            buildPokemon('AEGISLASH'),
            buildPokemon('EXCADRILL'),
            buildPokemon('GIGALITH'),
        ]
    },
    {
        name: 'Alder',
        avatar: 'alder',
        leads: [3, 4],
        rank: 1,
        team: [
            buildPokemon('CHARIZARD'),
            buildPokemon('WEAVILE'),
            buildPokemon('HEATRAN'),
            buildPokemon('GLISCOR'),
            buildPokemon('STOUTLAND'),
            buildPokemon('CONKELDURR'),
        ]
    },
    {
        name: 'Chuck',
        avatar: 'chuck',
        rank: 1,
        team: [
            buildPokemon('ENTEI'),
            buildPokemon('MACHAMP'),
            buildPokemon('RAPIDASH'),
            buildPokemon('TENTACRUEL'),
            buildPokemon('GOLEM'),
            buildPokemon('SHARPEDO'),
        ]
    },
    {
        name: 'Scientist Laura',
        avatar: 'scientistf',
        rank: 2,
        team: [
            buildPokemon('Lugia'),
            buildPokemon('REGISTEEL'),
            buildPokemon('ROTOM'),
            buildPokemon('PORYGON-Z'),
            buildPokemon('GLACEON'),
            buildPokemon('TOGEKISS'),
        ]
    },
    {
        name: 'Bugsy',
        avatar: 'bugsy',
        leads: [0, 1],
        rank: 1,
        team: [
            buildPokemon('Shuckle'),
            buildPokemon('Galvantula'),
            buildPokemon('Butterfree'),
            buildPokemon('Flygon'),
            buildPokemon('ELECTRODE'),
            buildPokemon('CLOYSTER'),
        ]
    },
    {
        name: 'Fisherman Johnny',
        avatar: 'fisherman',
        rank: 1,
        leads: [0],
        team: [
            buildPokemon('PELIPPER'),
            buildPokemon('STARMIE'),
            buildPokemon('SEISMITOAD'),
            buildPokemon('DRAGONITE'),
            buildPokemon('EXEGGUTOR'),
            buildPokemon('forretress'),
        ]
    },
    {
        name: 'Boarder Jason',
        avatar: 'boarder',
        rank: 2,
        leads: [0, 1],
        team: [
            buildPokemon('ABOMASNOW'),
            buildPokemon('VANILLUXE'),
            buildPokemon('MAMOSWINE'),
            buildPokemon('FROSLASS'),
            buildPokemon('CHANDELURE'),
            buildPokemon('CELEBI'),
        ]
    },
    {
        name: 'Li',
        avatar: 'li',
        rank: 2,
        team: [
            buildPokemon('LUCARIO'),
            buildPokemon('TOXICROAK'),
            buildPokemon('COFAGRIGUS'),
            buildPokemon('FERROTHORN'),
            buildPokemon('SKARMORY'),
            buildPokemon('BRONZONG'),
        ]
    },
    {
        name: 'Juggler Craig',
        avatar: 'juggler',
        rank: 1,
        team: [
            buildPokemon('FORRETRESS'),
            buildPokemon('WEEZING'),
            buildPokemon('BLISSEY'),
            buildPokemon('DONPHAN'),
            buildPokemon('GENGAR'),
            buildPokemon('WHIMSICOTT'),
        ]
    },
    {
        name: 'Saturn',
        avatar: 'saturn',
        rank: 2,
        team: [
            buildPokemon('MEWTWO'),
            buildPokemon('TYPHLOSION'),
            buildPokemon('SABLEYE'),
            buildPokemon('ZEKROM'),
            buildPokemon('EELEKTROSS'),
            buildPokemon('DRUDDIGON'),
        ]
    },
    {
        name: 'Colress',
        avatar: 'colress',
        rank: 2,
        team: [
            buildPokemon('MILOTIC'),
            buildPokemon('JIRACHI'),
            buildPokemon('SHIFTRY'),
            buildPokemon('CLAYDOL'),
            buildPokemon('REGIROCK'),
            buildPokemon('REGICE'),
        ]
    },
    {
        name: 'Benga',
        avatar: 'benga',
        rank: 1,
        team: [
            buildPokemon('SALAMENCE'),
            buildPokemon('WEEZING'),
            buildPokemon('PINSIR'),
            buildPokemon('RATICATE'),
            buildPokemon('GYARADOS'),
            buildPokemon('GARCHOMP'),
        ]
    },
    {
        name: 'Zinzolin',
        avatar: 'zinzolin',
        rank: 3,
        team: [
            buildPokemon('ARCEUS'),
            buildPokemon('HEATRAN'),
            buildPokemon('CRESSELIA'),
            buildPokemon('GIRATINA'),
            buildPokemon('DARKRAI'),
            buildPokemon('REUNICLUS'),
        ]
    },
    {
        name: 'Crasher Wake',
        avatar: 'crasherwake',
        rank: 2,
        team: [
            buildPokemon('BLAZIKEN'),
            buildPokemon('ARTICUNO'),
            buildPokemon('GOLEM'),
            buildPokemon('MIENSHAO'),
            buildPokemon('THUNDURUS'),
            buildPokemon('BRELOOM'),
        ]
    },
    {
        name: 'Olivia',
        avatar: 'olivia',
        rank: 2,
        leads: [0],
        team: [
            buildPokemon('GARCHOMP'),
            buildPokemon('STEELIX'),
            buildPokemon('DIALGA'),
            buildPokemon('CLOYSTER'),
            buildPokemon('RHYDON'),
            buildPokemon('PIKACHU'),
        ]
    },
    {
        name: 'Yellow',
        avatar: 'yellow',
        rank: 1,
        leads: [3],
        team: [
            buildPokemon('MEWTWO'),
            buildPokemon('DRAGONITE'),
            buildPokemon('ARTICUNO'),
            buildPokemon('AERODACTYL'),
            buildPokemon('DITTO'),
            buildPokemon('PIKACHU'),
        ]
    },
    {
        name: 'Hoopster Arnie',
        avatar: 'hoopster',
        rank: 1,
        leads: [1, 5],
        team: [
            buildPokemon('CONKELDURR'),
            buildPokemon('COFAGRIGUS'),
            buildPokemon('SEISMITOAD'),
            buildPokemon('WOBBUFFET'),
            buildPokemon('GENGAR'),
            buildPokemon('SHUCKLE'),
        ]
    },
    {
        name: 'Steven',
        avatar: 'steven',
        rank: 3,
        team: [
            buildPokemon('KYUREM'),
            buildPokemon('STEELIX'),
            buildPokemon('SCIZOR'),
            buildPokemon('PALKIA'),
            buildPokemon('CRESSELIA'),
            buildPokemon('SERPERIOR'),
        ]
    },
    {
        name: 'Beauty Leslie',
        avatar: 'beauty-gen7',
        rank: 1,
        team: [
            buildPokemon('PERSIAN'),
            buildPokemon('CLEFABLE'),
            buildPokemon('HYPNO'),
            buildPokemon('CLOYSTER'),
            buildPokemon('DEWGONG'),
            buildPokemon('RAPIDASH'),
        ]
    },
    {
        name: 'N',
        avatar: 'n',
        rank: 3,
        team: [
            buildPokemon('TORNADUS'),
            buildPokemon('ARCEUS'),
            buildPokemon('RAYQUAZA'),
            buildPokemon('HAXORUS'),
            buildPokemon('REGICE'),
            buildPokemon('VICTINI'),
        ]
    },
    {
        name: 'Burglar Simon',
        avatar: 'burglar',
        rank: 3,
        leads: [2],
        team: [
            buildPokemon('Zekrom'),
            buildPokemon('Darkrai'),
            buildPokemon('TYRANITAR'),
            buildPokemon('NINETALES'),
            buildPokemon('CHANDELURE'),
            buildPokemon('PROBOPASS'),
        ]
    },
    {
        name: 'Rocket Grunt Betty',
        avatar: 'rocketgruntf',
        rank: 1,
        leads: [3],
        team: [
            buildPokemon('MOLTRES'),
            buildPokemon('ZAPDOS'),
            buildPokemon('MEW'),
            buildPokemon('SHUCKLE'),
            buildPokemon('MACHAMP'),
            buildPokemon('GENGAR'),
        ]
    },
    {
        name: 'Wikstrom',
        avatar: 'wikstrom',
        rank: 3,
        team: [
            buildPokemon('Kyurem'),
            buildPokemon('DIALGA'),
            buildPokemon('AEGISLASH'),
            buildPokemon('Reshiram'),
            buildPokemon('AZUMARILL'),
            buildPokemon('SUDOWOODO'),
        ]
    },
    {
        name: 'Roxie',
        avatar: 'roxie',
        rank: 3,
        leads: [1],
        team: [
            buildPokemon('DEOXYS'),
            buildPokemon('AERODACTYL'),
            buildPokemon('ZAPDOS'),
            buildPokemon('CROBAT'),
            buildPokemon('RAIKOU'),
            buildPokemon('SNORLAX'),
        ]
    },
    {
        name: 'Backpacker Jordan',
        avatar: 'backpacker',
        rank: 2,
        team: [
            buildPokemon('HARIYAMA'),
            buildPokemon('SLAKING'),
            buildPokemon('REGISTEEL'),
            buildPokemon('SALAMENCE'),
            buildPokemon('MILOTIC'),
            buildPokemon('CLAYDOL'),
        ]
    },
    {
        name: 'Nate',
        avatar: 'nate',
        rank: 2,
        team: [
            buildPokemon('ARCANINE'),
            buildPokemon('SHAYMIN'),
            buildPokemon('POLIWRATH'),
            buildPokemon('SCIZOR'),
            buildPokemon('HITMONCHAN'),
            buildPokemon('KINGLER'),
        ]
    },
    {
        // Defensive
        name: 'Olympia',
        avatar: 'olympia',
        rank: 3,
        leads: [0, 2],
        team: [
            buildPokemon('Lugia'),
            buildPokemon('Ho-oh'),
            buildPokemon('Venusaur'),
            buildPokemon('Spiritomb'),
            buildPokemon('Blissey'),
            buildPokemon('Cresselia'),
        ]
    },
    {
        // Sun/Sand team
        name: 'Blaine',
        avatar: 'blaine',
        rank: 2,
        leads: [0, 3],
        team: [
            buildPokemon('Torkoal'),
            buildPokemon('Ninetales'),
            buildPokemon('Gigalith'),
            buildPokemon('Hippowdon'),
            buildPokemon('Tyranitar'),
            buildPokemon('Ferrothorn'),
        ]
    },
    {
        // Toxic Spikes team
        name: 'Biker Gus',
        avatar: 'biker',
        rank: 2,
        leads: [0, 1, 2],
        team: [
            buildPokemon('Garbodor'),
            buildPokemon('Tentacruel'),
            buildPokemon('Cofagrigus'),
            buildPokemon('Ferrothorn'),
            buildPokemon('Blissey'),
            buildPokemon('Heatran'),
        ]
    },
    {
        name: 'Whitney',
        avatar: 'whitney',
        rank: 3,
        leads: [1, 2, 3],
        team: [
            buildPokemon('ARCEUS'),
            buildPokemon('METAGROSS'),
            buildPokemon('AERODACTYL'),
            buildPokemon('GARCHOMP'),
            buildPokemon('Suicune'),
            buildPokemon('CHANDELURE'),
        ]
    },
    {
        // Spikes team
        name: 'Kimono Girl Hanako',
        avatar: 'kimonogirl',
        rank: 2,
        leads: [0, 1, 2],
        team: [
            buildPokemon('Skarmory'),
            buildPokemon('Klefki'),
            buildPokemon('Froslass'),
            buildPokemon('Dragonite'),
            buildPokemon('Hariyama'),
            buildPokemon('Arbok'),
        ]
    },
    {
        name: 'Rood',
        avatar: 'rood',
        rank: 3,
        team: [
            buildPokemon('RESHIRAM'),
            buildPokemon('TORNADUS'),
            buildPokemon('HYDREIGON'),
            buildPokemon('DUSKNOIR'),
            buildPokemon('AEGISLASH'),
            buildPokemon('GENESECT'),
        ]
    },
    {
        name: 'Fire Breather Brendon',
        avatar: 'firebreather',
        rank: 3,
        leads: [1, 2],
        team: [
            buildPokemon('HEATRAN'),
            buildPokemon('Arceus'),
            buildPokemon('TORKOAL'),
            buildPokemon('SLAKING'),
            buildPokemon('NIDOKING'),
            buildPokemon('DARMANITAN'),
        ]
    },
    {
        name: 'Siebold',
        avatar: 'siebold',
        rank: 3,
        leads: [0, 1],
        team: [
            buildPokemon('SUICUNE'),
            buildPokemon('Kyogre'),
            buildPokemon('SEISMITOAD'),
            buildPokemon('LUGIA'),
            buildPokemon('LUDICOLO'),
            buildPokemon('DRAGONITE'),
        ]
    },
    {
        name: 'Plasma Grunt Wes',
        avatar: 'plasmagrunt',
        rank: 3,
        team: [
            buildPokemon('ZEKROM'),
            buildPokemon('KLEFKI'),
            buildPokemon('GENESECT'),
            buildPokemon('THUNDURUS'),
            buildPokemon('FERROTHORN'),
            buildPokemon('REUNICLUS'),
        ]
    },
    {
        // Anti-Darkrai team
        name: 'Grimsley',
        avatar: 'grimsley',
        rank: 3,
        team: [
            buildPokemon('DARKRAI'),
            buildPokemon('Rayquaza'),
            buildPokemon('ZAPDOS'),
            buildPokemon('Kyogre'),
            buildPokemon('KANGASKHAN'),
            buildPokemon('SNORLAX'),
        ]
    },
    {
        name: 'Medium Edith',
        avatar: 'medium',
        rank: 3,
        team: [
            buildPokemon('DARKRAI'),
            buildPokemon('PALKIA'),
            buildPokemon('TOGEKISS'),
            buildPokemon('GIRATINA'),
            buildPokemon('GARDEVOIR'),
            buildPokemon('Spiritomb'),
        ]
    },
    {
        name: 'Riley',
        avatar: 'riley',
        rank: 3,
        team: [
            buildPokemon('PALKIA'),
            buildPokemon('VENUSAUR'),
            buildPokemon('TOGEKISS'),
            buildPokemon('RAYQUAZA'),
            buildPokemon('SHARPEDO'),
            buildPokemon('HARIYAMA'),
        ]
    },
    {
        name: 'Lennette',
        avatar: 'parasollady',
        rank: 3,
        leads: [1, 2],
        team: [
            buildPokemon('BLISSEY'),
            buildPokemon('METAGROSS'),
            buildPokemon('Tyranitar'),
            buildPokemon('DRAGONITE'),
            buildPokemon('TANGROWTH'),
            buildPokemon('LUGIA'),
        ]
    },
]

export function getRandomArenaTrainer(previousNames: string[] = [], leagueLevel: number = 0, isAdmin: boolean = false): ArenaTrainer {
    let options: ArenaTrainer[] = []
    // Start with rank 1 only
    options = options.concat(...arenaTrainers.filter(t => t.rank === 1))
    if (leagueLevel > 10 || isAdmin) {
        // Add rank 2
        options = options.concat(...arenaTrainers.filter(t => t.rank === 2))
    }
    if (leagueLevel > 20 || isAdmin) {
        // Add rank 3
        options = options.concat(...arenaTrainers.filter(t => t.rank === 3))
    }
    if (leagueLevel > 30 || isAdmin) {
        // Make rank 2 more common
        options = options.concat(...arenaTrainers.filter(t => t.rank === 2))

        // Make rank 3 more common
        options = options.concat(...arenaTrainers.filter(t => t.rank === 3))
    }
    if (leagueLevel > 35 || isAdmin) {
        // Make rank 3 more common
        options = options.concat(...arenaTrainers.filter(t => t.rank === 3))
    }
    options = options.filter(t => !previousNames.includes(t.name))
    return new Random().randomPick(options)
}