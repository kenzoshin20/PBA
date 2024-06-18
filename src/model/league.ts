import { moves } from "../data/move-data.js";
import { buildPokemon } from "../data/pokemon-data.js";
import { buildMove } from "./move.js";
import { Pokemon } from "./pokemon.js";

export interface LeagueTrainer {
    name: string
    avatar: string
    team: Pokemon[]
    leads?: number[]
    rewards: number[]
}

// Builds a league team member
function _(speciesName: string, level: number, options?: { moves?: string[]}): Pokemon {
    const pokemon = buildPokemon(speciesName)
    pokemon.level = level
    const levelModifier = level - 50

    pokemon.hp += levelModifier
    pokemon.startingHP += levelModifier

    pokemon.attack += levelModifier
    pokemon.startingAttack += levelModifier

    pokemon.defense += levelModifier
    pokemon.startingDefense += levelModifier

    pokemon.specialAttack += levelModifier
    pokemon.startingSpecialAttack += levelModifier

    pokemon.specialDefense += levelModifier
    pokemon.startingSpecialDefense += levelModifier

    pokemon.speed += levelModifier
    pokemon.startingSpeed += levelModifier

    const oldSpecies = pokemon.species
    const newSpecies = {
        ...oldSpecies,
        hp: oldSpecies.hp + levelModifier,
        attack: oldSpecies.attack + levelModifier,
        defense: oldSpecies.defense + levelModifier,
        specialAttack: oldSpecies.specialAttack + levelModifier,
        specialDefense: oldSpecies.specialDefense + levelModifier,
        speed: oldSpecies.speed + levelModifier,
        level: level
    }
    pokemon.species = newSpecies

    if (options?.moves?.length) {
        pokemon.moves = []
        pokemon.startingMoves = []
        for (const moveName of options.moves) {
            const moveDef = moves[moveName]
            const move = buildMove(moveDef)
            pokemon.moves.push(move)
            pokemon.startingMoves.push(move)
        }
    }

    return pokemon
}

export const leagueTrainers: LeagueTrainer[] = [
    {
        name: 'Youngster Nick',
        avatar: 'youngster',
        leads: [0],
        team: [
            _('Arcanine', 40),
            _('Typhlosion', 46),
            _('Raticate', 30, {
                moves: ['Bite']
            }),
            _('Pinsir', 32, {
                moves: ['X-Scissor']
            }),
        ],
        rewards: [
            157, // TYPHLOSION
            330, // FLYGON
        ]
    },
    {
        name: 'Lady Florence',
        avatar: 'lady',
        team: [
            _('Flareon', 38),
            _('Vaporeon', 40),
            _('Espeon', 43),
            _('Umbreon', 43),
        ],
        rewards: [
            196, // ESPEON
            197, // UMBREON
        ]
    },
    {
        name: 'Brock',
        avatar: 'brock',
        leads: [1],
        team: [
            _('Steelix', 62),
            _('Onix', 46),
            _('Golem', 36),
            _('Ludicolo', 34, {
                moves: ['Giga Drain', 'Hydro Pump']
            }),
        ],
        rewards: [
            208, // STEELIX
            272, // LUDICOLO
            508, // STOUTLAND
            212, // SCIZOR
        ]
    },
    {
        // Leads with entry hazards setters
        // Has Butterfree and Exploud for phazing
        name: 'Bugcatcher Wade',
        avatar: 'bugcatcher',
        leads: [1, 2],
        team: [
            _('Butterfree', 35, {
                moves: ['Whirlwind', 'Confuse Ray', 'Sleep Powder', 'Air Slash']
            }),
            _('Galvantula', 43),
            _('Shuckle', 45),
            _('EXPLOUD', 40, {
                moves: ['Roar', 'Boomburst']
            }),
        ],
        rewards: [
            596, // GALVANTULA
            213, // SHUCKLE
            295, // EXPLOUD
            241, // MILTANK
        ]
    },
    {
        name: 'Psychic Martha',
        avatar: 'psychicf',
        team: [
            _('Hypno', 46),
            _('Mr. Mime', 43),
            _('Claydol', 40),
            _('GARDEVOIR', 51),
        ],
        rewards: [
            282, // GARDEVOIR
            344, // CLAYDOL
            227, // SKARMORY
            442, // SPIRITOMB
        ]
    },
    {
        name: 'Pokemaniac Kaleb',
        avatar: 'pokemaniac',
        leads: [0],
        team: [
            _('Clefable', 60, {
                moves: ['Metronome']
            }),
            _('Gengar', 53, {
                moves: ['Metronome']
            }),
            _('Mew', 57, {
                moves: ['Metronome']
            }),
            _('Snorlax', 45, {
                moves: ['Metronome']
            }),
        ],
        rewards: [
            78, // RAPIDASH
            471, // GLACEON
            242, // BLISSEY
            184, // AZUMARILL
        ]
    },
    {
        name: 'Misty',
        avatar: 'misty',
        leads: [3],
        team: [
            _('Starmie', 62),
            _('Togekiss', 57, {
                moves: ['Fire Blast', 'Air Slash', 'Tri Attack']
            }),
            _('Gyarados', 54, {
                moves: ['Hurricane', 'Thunder', 'Earthquake']
            }),
            _('PELIPPER', 43, {
                moves: ['Hurricane', 'Water Pulse', 'Roost']
            }),
        ],
        rewards: [
            468, // TOGEKISS
            279, // PELIPPER
            73, // TENTACRUEL
            537, // SEISMITOAD
        ]
    },
    {
        // Toxic spikes team
        name: 'Koga',
        avatar: 'koga',
        leads: [0, 1],
        team: [
            _('TOXICROAK', 67, {
                moves: ['Toxic Spikes', 'Protect', 'Brick Break', 'Smokescreen']
            }),
            _('WEEZING', 66, {
                moves: ['Toxic Spikes', 'Protect', 'Heat Wave', 'Smokescreen']
            }),
            _('Flygon', 65, {
                moves: ['Dragon Tail', 'Protect', 'Earthquake', 'Bug Buzz']
            }),
            _('SCRAFTY', 55, {
                moves: ['Payback', 'Protect', 'Brick Break', 'Circle Throw']
            }),
        ],
        rewards: [
            454, // TOXICROAK
            560, // SCRAFTY
            609, // CHANDELURE
            62, // POLIWRATH
        ]
    },
    {
        name: 'Wulfric',
        avatar: 'wulfric',
        leads: [0],
        team: [
            _('Abomasnow', 56),
            _('Cloyster', 50),
            _('Mamoswine', 56),
            _('VANILLUXE', 40),
        ],
        rewards: [
            460, // ABOMASNOW
            584, // VANILLUXE
            476, // PROBOPASS
            214, // HERACROSS
        ]
    },
    {
        name: 'Morty',
        avatar: 'morty',
        team: [
            _('Dusknoir', 58),
            _('Froslass', 47),
            _('MAWILE', 53),
            _('Sableye', 60),
        ],
        rewards: [
            477, // DUSKNOIR
            478, // FROSLASS
            303, // MAWILE
            302, // SABLEYE
        ]
    },
    {
        name: 'Valerie',
        avatar: 'valerie',
        team: [
            _('KLEFKI', 55),
            _('MIENSHAO', 56),
            _('CELEBI', 62),
            _('WHIMSICOTT', 51),
        ],
        rewards: [
            707, // KLEFKI
            620, // MIENSHAO
            547, // WHIMSICOTT
            251, // CELEBI
        ]
    },
    {
        name: 'Supernerd James',
        avatar: 'supernerd',
        leads: [0, 3],
        team: [
            _('REGISTEEL', 67),
            _('DEOXYS', 67),
            _('ROTOM', 56),
            _('SANDSLASH', 45),
        ],
        rewards: [
            379, // REGISTEEL
            28, // SANDSLASH
            479, // ROTOM
            297, // HARIYAMA
        ]
    },
    {
        name: 'Sabrina',
        avatar: 'sabrina',
        team: [
            _('ALAKAZAM', 76),
            _('ESPEON', 52),
            _('GARDEVOIR', 60),
            _('ABSOL', 60),
        ],
        rewards: [
            359, // ABSOL
            474, // PORYGON-Z
            319, // SHARPEDO
            169, // CROBAT
        ]
    },
    {
        name: 'Linebacker Gus',
        avatar: 'linebacker',
        team: [
            _('CONKELDURR', 54),
            _('Snorlax', 65),
            _('DARMANITAN', 49),
            _('SEISMITOAD', 46),
        ],
        rewards: [
            534, // CONKELDURR
            555, // DARMANITAN
            470, // LEAFEON
            323, // TORKOAL
        ]
    },
    {
        name: 'Clair',
        avatar: 'clair',
        team: [
            _('SALAMENCE', 70),
            _('GYARADOS', 57),
            _('STEELIX', 60),
            _('REGICE', 65),
        ],
        rewards: [
            373, // SALAMENCE
            378, // REGICE
            87, // DEWGONG
            237, // HITMONTOP
        ]
    },
    {
        name: 'Xerosic',
        avatar: 'xerosic',
        leads: [2, 3],
        team: [
            _('HO-OH', 68),
            _('DONPHAN', 42),
            _('SKARMORY', 57),
            _('BRELOOM', 58),
        ],
        rewards: [
            250, // HO-OH
            232, // DONPHAN
            286, // BRELOOM
            472, // GLISCOR
        ]
    },
    {
        name: 'Ace Trainer Blake',
        avatar: 'acetrainer-gen4',
        team: [
            _('HYDREIGON', 63),
            _('AEGISLASH', 60),
            _('DUGTRIO', 60),
            _('PINSIR', 57),
        ],
        rewards: [
            681, // AEGISLASH
            635, // HYDREIGON
            492, // SHAYMIN
            437, // BRONZONG
        ]
    },
    {
        name: 'Lenora',
        avatar: 'lenora',
        team: [
            _('STOUTLAND', 62),
            _('GRANBULL', 56),
            _('SLOWKING', 64),
            _('FORRETRESS', 56),
        ],
        rewards: [
            205, // FORRETRESS
            199, // SLOWKING
            210, // GRANBULL
            569, // GARBODOR
        ]
    },
    {
        name: 'Giovanni',
        avatar: 'giovanni',
        leads: [0, 1],
        team: [
            _('Persian', 51),
            _('TYRANITAR', 70),
            _('GARCHOMP', 60),
            _('DEOXYS', 73),
        ],
        rewards: [
            386, // DEOXYS
            248, // TYRANITAR
            612, // HAXORUS
            621, // DRUDDIGON
        ]
    },
    {
        name: 'Blackbelt Kenji',
        avatar: 'blackbelt',
        team: [
            _('HITMONLEE', 65),
            _('Wobbuffet', 67),
            _('RHYDON', 50),
            _('KABUTOPS', 50),
        ],
        rewards: [
            202, // WOBBUFFET
            473, // MAMOSWINE
        ]
    },
    {
        name: 'Winona',
        avatar: 'winona',
        leads: [0, 1, 2],
        team: [
            _('Moltres', 55, {
                moves: ['Will-O-Wisp', 'Mystical Fire', 'Protect', 'Roost']
            }),
            _('Zapdos', 55, {
                moves: ['Roost', 'Thunder', 'Light Screen', 'Rain Dance']
            }),
            _('Articuno', 55, {
                moves: ['Hail', 'Blizzard', 'Light Screen', 'Roost']
            }),
            _('Lugia', 72),
        ],
        rewards: [
            249, // LUGIA
        ]
    },
    {
        name: 'Bruno',
        avatar: 'bruno-gen3',
        team: [
            _('Machamp', 70),
            _('Landorus', 55),
            _('Regirock', 56),
            _('Haxorus', 52),
        ],
        rewards: [
            377, // REGIROCK
            645, // LANDORUS
            185, // SUDOWOODO
            589, // ESCAVALIER
        ]
    },
    {
        name: 'Evelyn',
        avatar: 'evelyn',
        team: [
            _('Entei', 62),
            _('Suicune', 63),
            _('Raikou', 61),
            _('JIRACHI', 65),
        ],
        rewards: [
            244, // ENTEI
            245, // SUICUNE
            243, // RAIKOU
            385, // JIRACHI
        ]
    },
    {
        name: 'Scientist Igor',
        avatar: 'scientist',
        team: [
            _('ABOMASNOW', 56),
            _('Hippowdon', 62),
            _('PELIPPER', 56),
            _('TORKOAL', 55),
        ],
        rewards: [
            450, // HIPPOWDON
            530, // EXCADRILL
        ]
    },
    {
        name: 'Artist Pierre',
        avatar: 'artist',
        leads: [0],
        team: [
            _('Ditto', 51),
            _('Ditto', 80),
            _('Ditto', 70),
            _('Ditto', 40),
        ],
        rewards: [
            642, // THUNDURUS
            376, // METAGROSS
        ]
    },
    {
        name: 'Ethan',
        avatar: 'ethan',
        team: [
            _('FERALIGATR', 62),
            _('BLAZIKEN', 67),
            _('GARDEVOIR', 57),
            _('METAGROSS', 58),
        ],
        rewards: [
            160, // FERALIGATR
            257, // BLAZIKEN
        ]
    },
    {
        name: 'Guitarist Mara',
        avatar: 'guitarist',
        team: [
            _('Exploud', 65, {
                moves: ['Hyper Voice', 'Boomburst']
            }),
            _('SEISMITOAD', 64, {
                moves: ['Earthquake', 'Boomburst', 'Toxic', 'Rest']
            }),
            _('FLYGON', 60, {
                moves: ['Bug Buzz', 'Boomburst']
            }),
            _('MELOETTA', 65, {
                moves: ['Hyper Voice', 'Thunderbolt']
            }),
        ],
        rewards: [
            648, // MELOETTA
            579, // REUNICLUS
        ]
    },
    {
        name: 'Lance',
        avatar: 'lance',
        leads: [2, 3],
        team: [
            _('Dragonite', 75, {
                moves: ['Fire Blast', 'Extreme Speed', 'Dragon Rush', 'Dragon Tail']
            }),
            _('Groudon', 63),
            _('Milotic', 60, {
                moves: ['Dragon Tail', 'Aqua Tail', 'Water Pulse', 'Light Screen']
            }),
            _('Flygon', 58),
        ],
        rewards: [
            383, // GROUDON
            275, // SHIFTRY
            350, // MILOTIC
            485, // HEATRAN
        ]
    },
    {
        name: 'Bellelba',
        avatar: 'bellelba',
        team: [
            _('DIALGA', 63),
            _('SERPERIOR', 55),
            _('TORNADUS', 64),
            _('KANGASKHAN', 52),
        ],
        rewards: [
            483, // DIALGA
            465, // TANGROWTH
            497, // SERPERIOR
            641, // TORNADUS
        ]
    },
    {
        name: 'Norman',
        avatar: 'norman',
        leads: [3],
        team: [
            _('Slaking', 70),
            _('TOGEKISS', 55),
            _('HAXORUS', 60),
            _('COFAGRIGUS', 69),
        ],
        rewards: [
            289, // SLAKING
            563, // COFAGRIGUS
            461, // WEAVILE
            598, // FERROTHORN
        ]
    },
    {
        // Spikes/rocks and phazers and Shedinja to force switches
        name: 'Shadow',
        avatar: 'shadowtriad',
        leads: [1, 2],
        team: [
            _('BISHARP', 70, {
                moves: ['Stealth Rock', 'Night Slash', 'Iron Head']
            }),
            _('LUCARIO', 68, {
                moves: ['Spikes', 'Circle Throw', 'Bullet Punch', 'Close Combat']
            }),
            _('Sandslash', 66, {
                moves: ['Spikes', 'Stealth Rock', 'Slash', 'Poison Jab']
            }),
            _('SHEDINJA', 55),
        ],
        rewards: [
            625, // BISHARP
            292, // SHEDINJA
        ]
    },
    {
        name: 'Volkner',
        avatar: 'volkner',
        leads: [1],
        team: [
            _('Zapdos', 60, {
                moves: ['Thunder', 'Hurricane', 'Rain Dance']
            }),
            _('KYOGRE', 67, {
                moves: ['Thunder', 'Water Pulse']
            }),
            _('EELEKTROSS', 56, {
                moves: ['Thunder', 'Aqua Tail']
            }),
            _('LUXRAY', 43),
        ],
        rewards: [
            382, // KYOGRE
            405, // LUXRAY
            604, // EELEKTROSS
        ]
    },
    {
        name: 'Cyrus',
        avatar: 'cyrus',
        team: [
            _('Palkia', 65),
            _('Reshiram', 68),
            _('WEAVILE', 45),
            _('Bronzong', 49),
        ],
        rewards: [
            484, // PALKIA
            643, // RESHIRAM
            448, // LUCARIO
            526, // GIGALITH
        ]
    },
    {
        name: 'Cynthia',
        avatar: 'cynthia',
        team: [
            _('ZEKROM', 68),
            _('GARCHOMP', 67),
            _('SYLVEON', 57),
            _('VICTINI', 63),
        ],
        rewards: [
            445, // GARCHOMP
            494, // VICTINI
            700, // SYLVEON
            644, // ZEKROM
        ]
    },
    {
        name: 'Gary',
        avatar: 'blue',
        team: [
            _('Blastoise', 73),
            _('INFERNAPE', 65),
            _('TORTERRA', 58),
            _('GENESECT', 70),
        ],
        rewards: [
            392, // INFERNAPE
            389, // TORTERRA
            649, // GENESECT
            254, // SCEPTILE
        ]
    },
    {
        name: 'Team Rocket',
        avatar: 'teamrocket',
        team: [
            _('Arbok', 51),
            _('WOBBUFFET', 48),
            _('Golem', 44, {
                moves: ['Explosion']
            }),
            _('CROBAT', 46),
            _('Weezing', 52),
            _('VICTREEBEL', 48),
            _('GARBODOR', 40),
            _('Electrode', 43, {
                moves: ['Explosion']
            }),
        ],
        rewards: [
            488, // CRESSELIA
        ]
    },
    {
        name: 'AZ',
        avatar: 'az',
        team: [
            _('GIRATINA', 72),
            _('DARKRAI', 70),
            _('NIDOKING', 52),
            _('METAGROSS', 61),
        ],
        rewards: [
            489, // GIRATINA
            491, // DARKRAI
        ]
    },
    {
        name: 'Zinnia',
        avatar: 'zinnia',
        leads: [3], // Stealth Rock lead
        team: [
            _('Rayquaza', 77),
            _('SALAMENCE', 70),
            _('NIDOQUEEN', 60),
            _('GIGALITH', 50, {
                moves: ['Stealth Rock', 'Rock Blast', 'Earthquake', 'Iron Head']
            }),
        ],
        rewards: [
            384, // RAYQUAZA
        ]
    },
    {
        name: 'Ghetsis',
        avatar: 'ghetsis',
        leads: [2, 3],
        team: [
            _('KYUREM', 82),
            _('HEATRAN', 67),
            _('GLISCOR', 61),
            _('DUSKNOIR', 65),
        ],
        rewards: [
            646, // KYUREM
        ]
    },
    {
        name: 'Ash',
        avatar: 'ash',
        leads: [1, 2],
        team: [
            _('Pikachu', 90),
            _('Charizard', 63),
            _('Sceptile', 54),
            _('ARCEUS', 75),
        ],
        rewards: [
            493, // ARCEUS
        ]
    },
]