import { MoveDefinition } from "../model/move-definition";

export type MoveName = keyof typeof moves

export const moves: Record<string, MoveDefinition> = {
  'Hail': {
    name: 'Hail',
    startingPP: 10,
    type: 'ICE',
    category: 'STATUS',
    effects: {
      ignoreAccuracyAndEvasion: true,
      applyWeather: 'HAIL',
    },
    description: `Changes weather to hail for 5 turns (damages non-ICE types at the end of each turn).`,
  },
  'Rain Dance': {
    name: 'Rain Dance',
    startingPP: 5,
    type: 'WATER',
    category: 'STATUS',
    effects: {
      ignoreAccuracyAndEvasion: true,
      applyWeather: 'RAIN',
    },
    description: `Changes weather to rain for 5 turns (increases the damage of WATER moves by 50% and decreases the damage of FIRE moves by 50%).`,
  },
  'Sandstorm': {
    name: 'Sandstorm',
    startingPP: 10,
    type: 'ROCK',
    category: 'STATUS',
    effects: {
      ignoreAccuracyAndEvasion: true,
      applyWeather: 'SANDSTORM',
    },
    description: `Changes weather to sandstorm for 5 turns (damages Pokemon that are not GROUND, ROCK or STEEL type at the end of each turn).`,
  },
  'Sunny Day': {
    name: 'Sunny Day',
    startingPP: 10,
    type: 'FIRE',
    category: 'STATUS',
    effects: {
      ignoreAccuracyAndEvasion: true,
      applyWeather: 'HARSH_SUNLIGHT',
    },
    description: `Changes weather to harsh sunlight for 5 turns (increases the damage of FIRE moves by 50% and decreases the damage of WATER moves by 50%).`,
  },
  'Dark Void': {
    name: 'Dark Void',
    type: 'DARK',
    category: 'STATUS',
    startingPP: 10,
    accuracy: .8,
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [
          { type: 'ASLEEP', chance: 1 }
        ]
      }
    },
  },
  'Electroweb': {
    name: 'Electroweb',
    power: 55,
    startingPP: 15,
    accuracy: .95,
    type: 'ELECTRIC',
    category: 'SPECIAL',
    effects: {
      modifyStages: {modifiers:[
        {chance: 1, stageStat: 'speed', stages: -1, userOrTarget: 'TARGET'},
      ]}
    },
  },
  'Storm Throw': {
    name: 'Storm Throw',
    power: 60,
    startingPP: 10,
    type: 'FIGHTING',
    category: 'PHYSICAL',
    effects: {
      increaseCritical: {percent: 1}
    },
    description: `Always results in a critical hit.`,
  },
  'Frost Breath': {
    name: 'Frost Breath',
    power: 60,
    accuracy: .9,
    startingPP: 10,
    type: 'ICE',
    category: 'SPECIAL',
    effects: {
      increaseCritical: {percent: 1}
    },
    description: `Always results in a critical hit.`,
  },
  'Zippy Zap': { // Pikachu only move
    name: 'Zippy Zap',
    power: 50,
    startingPP: 15,
    type: 'ELECTRIC',
    category: 'SPECIAL',
    priority: 2,
    effects: {
      increaseCritical: {percent: 1}
    },
    description: `Always results in a critical hit.`,
  },
  'Spite': {
    name: 'Spite',
    startingPP: 10,
    type: 'GHOST',
    category: 'STATUS',
    effects: {
      targetLastMoveLosesPP: true
    },
    description: `Cuts 5 PP from the target's last move.`,
    soundEffect: 'attack_psychic_special.mp3'
  },
  'Flail': {
    name: 'Flail',
    startingPP: 15,
    type: 'NORMAL',
    category: 'PHYSICAL',
    effects: {
      powerHigherWhenHpLower: true
    },
    description: `Becomes more powerful the less HP the user has.`,
  },
  'Reversal': {
    name: 'Reversal',
    startingPP: 15,
    type: 'FIGHTING',
    category: 'PHYSICAL',
    effects: {
      powerHigherWhenHpLower: true
    },
    description: `Becomes more powerful the less HP the user has.`,
  },
  'Eruption': {
    name: 'Eruption',
    power: 150,
    startingPP: 5,
    type: 'FIRE',
    category: 'SPECIAL',
    effects: {
      powerMultipliedByHpPercent: true
    },
    description: `The higher the user’s HP, the more powerful this attack becomes.`,
    soundEffect: 'attack_fire_long.mp3',
  },
  'Water Spout': {
    name: 'Water Spout',
    power: 150,
    startingPP: 5,
    type: 'WATER',
    category: 'SPECIAL',
    effects: {
      powerMultipliedByHpPercent: true
    },
    description: `The higher the user’s HP, the more powerful this attack becomes.`,
    soundEffect: 'attack_water_long.mp3',
  },
  'Reflect': {
    name: 'Reflect',
    startingPP: 20,
    type: 'PSYCHIC',
    category: 'STATUS',
    effects: {
      reflect: true
    },
    description: `Weakens physical attacks for five turns.`,
    soundEffect: 'status_reflect.mp3'
  },
  'Light Screen': {
    name: 'Light Screen',
    startingPP: 30,
    type: 'PSYCHIC',
    category: 'STATUS',
    effects: {
      lightScreen: true
    },
    description: `Weakens special attacks for five turns.`,
    soundEffect: 'status_reflect.mp3'
  },
  'Psystrike': {
    name: 'Psystrike',
    startingPP: 10,
    type: 'PSYCHIC',
    power: 100,
    category: 'SPECIAL',
    effects: {
      useDefenseForDamageCalc: true
    },
    description: `Inflicts damage based on the target's Defense instead of Special Defense.`,
    soundEffect: 'attack_ghost.mp3'
  },
  'Psyshock': {
    name: 'Psyshock',
    startingPP: 10,
    type: 'PSYCHIC',
    power: 100,
    category: 'SPECIAL',
    effects: {
      useDefenseForDamageCalc: true
    },
    description: `Inflicts damage based on the target's Defense instead of Special Defense.`,
    soundEffect: 'attack_electric.mp3'
  },
  'Dazzling Gleam': {
    name: 'Dazzling Gleam',
    startingPP: 10,
    type: 'FAIRY',
    power: 80,
    category: 'SPECIAL',
  },
  'Coil': {
    name: 'Coil',
    startingPP: 20,
    type: 'POISON',
    category: 'STATUS',
    effects: {
      ignoreAccuracyAndEvasion: true,
      modifyStages: {modifiers:[
        {chance: 1, stageStat: 'attack', stages: 1, userOrTarget: 'USER'},
        {chance: 1, stageStat: 'defense', stages: 1, userOrTarget: 'USER'},
        {chance: 1, stageStat: 'accuracy', stages: 1, userOrTarget: 'USER'},
      ]}
    },
    description: `Raises user's attack, defense and accuracy.`,
    soundEffect: 'status_buff.mp3'
  },
  'Transform': {
    name: 'Transform',
    startingPP: 10,
    type: 'NORMAL',
    category: 'STATUS',
    effects: {
      transformIntoTarget: true,
      ignoreAccuracyAndEvasion: true
    },
    description: `User takes on the form and attacks of the target.`,
    // Don't put sound effect on the move because it comes from transform.ts code
    // soundEffect: 'status_transform.mp3'
  },
  'Conversion 2': {
    name: 'Conversion 2',
    startingPP: 30,
    type: 'NORMAL',
    category: 'STATUS',
    effects: {
      replaceUserTypesBasedOnTargetLastMove: true,
      ignoreAccuracyAndEvasion: true,
    },
    description: `Changes the user's type to be resistant to the last move used by the target.`,
    soundEffect: 'status_transform.mp3'
  },
  'Focus Blast': {
    name: 'Focus Blast',
    startingPP: 5,
    type: 'FIGHTING',
    power: 120,
    category: 'SPECIAL',
    accuracy: .7,
    effects: {
      modifyStages: {modifiers:[
        {userOrTarget: 'TARGET', stageStat: 'specialDefense', stages: -1, chance: .1},
      ]}
    },
    soundEffect: 'attack_blast.mp3'
  },
  // 'Splash': {
  //   name: 'Splash',
  //   startingPP: 10,
  //   type: 'WATER',
  //   power: null,
  //   category: 'STATUS',
  //   priority: 0,
  //   accuracy: 1,
  //   effects: {
  //     doNothing: true
  //   },
  //   description: `Doesn't do ANYTHING.`
  // },
  'Roar': {
    name: 'Roar',
    startingPP: 20,
    type: 'NORMAL',
    category: 'STATUS',
    priority: -6,
    effects: {
      ignoreAccuracyAndEvasion: true,
      forceTargetSwitch: true
    },
    description: `The target switches out and is replaced with another random Pokemon.`,
    soundEffect: `status_roar.mp3`,
    soundBased: true,
  },
  'Whirlwind': {
    name: 'Whirlwind',
    startingPP: 20,
    type: 'NORMAL',
    category: 'STATUS',
    priority: -6,
    effects: {
      ignoreAccuracyAndEvasion: true,
      forceTargetSwitch: true
    },
    description: `The target switches out and is replaced with another random Pokemon.`,
    soundEffect: `attack_howling_wind.mp3`
  },
  'Dragon Tail': {
    name: 'Dragon Tail',
    power: 60,
    accuracy: .9,
    startingPP: 10,
    type: 'DRAGON',
    category: 'PHYSICAL',
    priority: -6,
    effects: {
      forceTargetSwitch: true
    },
    description: `The target switches out and is replaced with another random Pokemon.`,
  },
  'Circle Throw': {
    name: 'Circle Throw',
    power: 60,
    accuracy: .9,
    startingPP: 10,
    type: 'FIGHTING',
    category: 'PHYSICAL',
    priority: -6,
    effects: {
      forceTargetSwitch: true
    },
    description: `The target switches out and is replaced with another random Pokemon.`,
  },
  'Power Gem': {
    name: 'Power Gem',
    startingPP: 10,
    type: 'ROCK',
    power: 80,
    category: 'SPECIAL',
    priority: 0,
    accuracy: 1,
  },
  'Blizzard': {
    name: 'Blizzard',
    startingPP: 5,
    type: 'ICE',
    power: 110,
    category: 'SPECIAL',
    accuracy: .85,
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [{ type: 'FROZEN', chance: .1 }]
      }
    }
  },
  'Counter': {
    name: 'Counter',
    startingPP: 20,
    type: 'FIGHTING',
    category: 'PHYSICAL',
    priority: -5,
    effects: {
      doubleDamageTaken: {
        categoryRestriction: 'PHYSICAL'
      }
    }
  },
  'Mirror Coat': {
    name: 'Mirror Coat',
    startingPP: 20,
    type: 'PSYCHIC',
    category: 'SPECIAL',
    priority: -5,
    effects: {
      doubleDamageTaken: {
        categoryRestriction: 'SPECIAL'
      }
    }
  },
  'Payback': {
    name: 'Payback',
    startingPP: 10,
    type: 'DARK',
    power: 50,
    category: 'PHYSICAL',
    effects: {
      doublePowerIfDamagedFirst: true
    }
  },
  'Revenge': {
    name: 'Revenge',
    startingPP: 10,
    type: 'FIGHTING',
    power: 60,
    category: 'PHYSICAL',
    priority: -4,
    effects: {
      doublePowerIfDamagedFirst: true
    }
  },
  'Bolt Strike': {
    name: 'Bolt Strike',
    startingPP: 5,
    type: 'ELECTRIC',
    power: 130,
    accuracy: .85,
    category: 'PHYSICAL',
    effects: {
      applyNonVolatileStatusConditions: {conditions: [{type: 'PARALYZED', chance:.2}]}
    }
  },
  'Avalanche': {
    name: 'Avalanche',
    startingPP: 10,
    type: 'ICE',
    power: 60,
    category: 'PHYSICAL',
    priority: -4,
    effects: {
      doublePowerIfDamagedFirst: true
    },
    soundEffect: 'attack_ice_crash.mp3'
  },
  'Metronome': {
    name: 'Metronome',
    startingPP: 10,
    type: 'NORMAL',
    category: 'STATUS',
    soundEffect: 'status_metronome.mp3',
    effects: {
      randomMove: {
        moveNames: [
          'Ice Punch',
          'Sludge Bomb',
          'Smokescreen',
          'Body Slam',
          'Leaf Storm',
          'Will-O-Wisp',
          'Thunder Wave',
          'Thunder',
          'Toxic',
          'Fire Blast',
          'Heat Wave',
          'Magma Storm',
          'Waterfall',
          'Muddy Water',
          'Strange Steam',
          'Diamond Storm',
          'Icicle Crash',
          'Moonblast',
          'Discharge',
          'Play Rough',
          'Ice Beam',
          'Leech Life',
          'Poison Jab',
          'Superpower',
          'Petal Blizzard',
          'Hurricane',
          'Psychic',
          'Earth Power',
          'Stone Edge',
          'Shadow Ball',
          'Dark Pulse',
          'Hammer Arm',
          'Sing',
          'Searing Shot',
          'V-create',
        ]
      }
    }
  },
  'Icy Wind': {
    name: 'Icy Wind',
    startingPP: 15,
    type: 'ICE',
    power: 55,
    category: 'SPECIAL',
    effects: {
      modifyStages: {modifiers:[
        {userOrTarget: 'TARGET', stageStat: 'speed', stages: -1, chance: 1},
      ]}
    }
  },
  'Draco Meteor': {
    name: 'Draco Meteor',
    startingPP: 5,
    type: 'DRAGON',
    power: 130,
    category: 'SPECIAL',
    accuracy: .9,
    effects: {
      modifyStages: {modifiers:[
        {userOrTarget: 'USER', stageStat: 'specialAttack', stages: -2, chance: 1},
      ]}
    },
    soundEffect: 'attack_flamethrower.mp3'
  },
  'Leaf Storm': {
    name: 'Leaf Storm',
    startingPP: 5,
    type: 'GRASS',
    power: 130,
    category: 'SPECIAL',
    accuracy: .9,
    effects: {
      modifyStages: {modifiers:[
        {userOrTarget: 'USER', stageStat: 'specialAttack', stages: -2, chance: 1},
      ]}
    },
    soundEffect: 'attack_grass_long.mp3'
  },
  'Psycho Boost': {
    name: 'Psycho Boost',
    startingPP: 5,
    type: 'PSYCHIC',
    power: 140,
    category: 'SPECIAL',
    accuracy: .9,
    effects: {
      modifyStages: {modifiers:[
        {userOrTarget: 'USER', stageStat: 'specialAttack', stages: -2, chance: 1},
      ]}
    },
    soundEffect: 'attack_blast.mp3'
  },
  'Overheat': {
    name: 'Overheat',
    startingPP: 5,
    type: 'FIRE',
    power: 130,
    category: 'SPECIAL',
    accuracy: .9,
    effects: {
      modifyStages: {modifiers:[
        {userOrTarget: 'USER', stageStat: 'specialAttack', stages: -2, chance: 1},
      ]}
    },
    soundEffect: 'attack_fire_long.mp3'
  },
  'Play Rough': {
    name: 'Play Rough',
    startingPP: 10,
    type: 'FAIRY',
    power: 90,
    category: 'PHYSICAL',
    accuracy: .9,
    effects: {
      modifyStages: {modifiers:[
        {userOrTarget: 'TARGET', stageStat: 'attack', stages: -1, chance: .1},
      ]}
    },
    soundEffect: 'attack_slap.mp3'
  },
  'Lunge': {
    name: 'Lunge',
    startingPP: 15,
    type: 'BUG',
    power: 80,
    category: 'PHYSICAL',
    effects: {
      modifyStages: {modifiers:[
        {userOrTarget: 'TARGET', stageStat: 'attack', stages: -1, chance: 1},
      ]}
    }
  },
  'Meteor Mash': {
    name: 'Meteor Mash',
    startingPP: 10,
    type: 'STEEL',
    power: 90,
    category: 'PHYSICAL',
    accuracy: .9,
    effects: {
      modifyStages: {modifiers:[
        {userOrTarget: 'USER', stageStat: 'attack', stages: 1, chance: .2},
      ]}
    },
    soundEffect: 'attack_blast.mp3'
  },
  'Surf': {
    name: 'Surf',
    startingPP: 15,
    type: 'WATER',
    power: 90,
    category: 'SPECIAL',
    accuracy: 1,
    soundEffect: 'attack_water_long.mp3'
  },
  'Mirror Move': {
    name: 'Mirror Move',
    startingPP: 20,
    type: 'FLYING',
    category: 'STATUS',
    soundEffect: 'status_mirror_move.mp3',
    effects: {
      copyTargetLastMove: true
    }
  },
  'Copycat': {
    name: 'Copycat',
    startingPP: 20,
    type: 'NORMAL',
    category: 'STATUS',
    soundEffect: 'status_copycat.mp3',
    effects: {
      copyTargetLastMove: true
    }
  },
  'Wrap': {
    name: 'Wrap',
    startingPP: 20,
    type: 'NORMAL',
    power: 15,
    category: 'PHYSICAL',
    priority: 0,
    accuracy: 1,
    effects: {
      applyBind: true
    }
  },
  'Amnesia': {
    name: 'Amnesia',
    startingPP: 20,
    type: 'PSYCHIC',
    category: 'STATUS',
    effects: {
      ignoreAccuracyAndEvasion: true,
      modifyStages: {modifiers:[
        {userOrTarget: 'USER', stageStat: 'specialDefense', stages: 2, chance: 1},
      ]}
    }
  },
  'Diamond Storm': {
    name: 'Diamond Storm',
    startingPP: 5,
    type: 'ROCK',
    power: 100,
    category: 'PHYSICAL',
    accuracy: .95,
    soundEffect: 'attack_generic_long.mp3',
    effects: {
      modifyStages: {modifiers:[
        {userOrTarget: 'USER', stageStat: 'defense', stages: 2, chance: .5},
      ]}
    },
    makesContact: false
  },
  'Iron Tail': {
    name: 'Iron Tail',
    startingPP: 15,
    type: 'STEEL',
    power: 100,
    category: 'PHYSICAL',
    accuracy: .75,
    effects: {
      modifyStages: {modifiers:[
        {userOrTarget: 'TARGET', stageStat: 'defense', stages: -1, chance: .3},
      ]}
    }
  },
  'Fire Spin': {
    name: 'Fire Spin',
    startingPP: 15,
    type: 'FIRE',
    power: 35,
    category: 'SPECIAL',
    effects: {
      applyBind: true
    },
    soundEffect: 'attack_fire_long.mp3'
  },
  'Dragon Pulse': {
    name: 'Dragon Pulse',
    startingPP: 10,
    type: 'DRAGON',
    power: 85,
    category: 'SPECIAL',
    soundEffect: `attack_dragon_pulse.mp3`
  },
  'Magma Storm': {
    name: 'Magma Storm',
    startingPP: 5,
    type: 'FIRE',
    power: 120,
    category: 'SPECIAL',
    accuracy: .75,
    effects: {
      applyBind: true
    },
    soundEffect: 'attack_fire_long.mp3'
  },
  'Whirlpool': {
    name: 'Whirlpool',
    startingPP: 15,
    type: 'WATER',
    power: 35,
    category: 'SPECIAL',
    effects: {
      applyBind: true
    },
    soundEffect: 'attack_water_long.mp3'
  },
  'Earth Power': {
    name: 'Earth Power',
    startingPP: 10,
    type: 'GROUND',
    power: 80,
    category: 'SPECIAL',
    effects: {
      modifyStages: {modifiers:[
        {userOrTarget: 'TARGET', stageStat: 'specialDefense', stages: -1, chance: .2},
      ]}
    },
    soundEffect: 'attack_ground_long.mp3'
  },
  'Sludge Bomb': {
    name: 'Sludge Bomb',
    startingPP: 10,
    type: 'POISON',
    power: 90,
    category: 'SPECIAL',
    effects: {
      applyNonVolatileStatusConditions: {conditions: [{type: 'POISONED', chance:.3}]}
    }
  },
  'Sludge Wave': {
    name: 'Sludge Wave',
    startingPP: 10,
    type: 'POISON',
    power: 95,
    category: 'SPECIAL',
    effects: {
      applyNonVolatileStatusConditions: {conditions: [{type: 'POISONED', chance:.1}]}
    }
  },
  'Poison Jab': {
    name: 'Poison Jab',
    startingPP: 20,
    type: 'POISON',
    power: 80,
    category: 'PHYSICAL',
    effects: {
      applyNonVolatileStatusConditions: {conditions: [{type: 'POISONED', chance:.3}]}
    }
  },
  'Gunk Shot': {
    name: 'Gunk Shot',
    startingPP: 5,
    type: 'POISON',
    power: 120,
    category: 'PHYSICAL',
    accuracy: .8,
    effects: {
      applyNonVolatileStatusConditions: {conditions: [{type: 'POISONED', chance:.3}]}
    },
    makesContact: false
  },
  'Last Resort': {
    name: 'Last Resort',
    startingPP: 5,
    type: 'NORMAL',
    power: 140,
    category: 'PHYSICAL',
    effects: {
      lastResort: true
    }
  },
  'Shadow Ball': {
    name: 'Shadow Ball',
    startingPP: 15,
    type: 'GHOST',
    power: 80,
    category: 'SPECIAL',
    effects: {
      modifyStages: {modifiers:[
        {userOrTarget: 'TARGET', stageStat: 'specialDefense', stages: -1, chance: .2},
      ]}
    }
  },
  'Body Slam': {
    name: 'Body Slam',
    startingPP: 15,
    type: 'NORMAL',
    power: 80,
    category: 'PHYSICAL',
    effects: {
      applyNonVolatileStatusConditions: {conditions: [{type: 'PARALYZED', chance:.3}]}
    },
    soundEffect: 'attack_generic_long.mp3'
  },
  'Superpower': {
    name: 'Superpower',
    startingPP: 5,
    type: 'FIGHTING',
    power: 120,
    category: 'PHYSICAL',
    effects: {
      modifyStages: {modifiers:[
        {userOrTarget: 'USER', stageStat: 'attack', stages: -1, chance: 1},
        {userOrTarget: 'USER', stageStat: 'defense', stages: -1, chance: 1},
      ]}
    },
    soundEffect: 'attack_generic_long.mp3'
  },
  'Close Combat': {
    name: 'Close Combat',
    startingPP: 5,
    type: 'FIGHTING',
    power: 120,
    category: 'PHYSICAL',
    effects: {
      modifyStages: {modifiers:[
        {userOrTarget: 'USER', stageStat: 'defense', stages: -1, chance: 1},
        {userOrTarget: 'USER', stageStat: 'specialDefense', stages: -1, chance: 1},
      ]}
    },
    soundEffect: 'attack_generic_long.mp3'
  },
  'V-create': {
    name: 'V-create',
    startingPP: 5,
    type: 'FIRE',
    power: 180,
    category: 'PHYSICAL',
    effects: {
      modifyStages: {modifiers:[
        {userOrTarget: 'USER', stageStat: 'defense', stages: -1, chance: 1},
        {userOrTarget: 'USER', stageStat: 'specialDefense', stages: -1, chance: 1},
        {userOrTarget: 'USER', stageStat: 'speed', stages: -1, chance: 1},
      ]}
    },
    description: `Lower's user's defense, special defense and speed by one stage.`,
    soundEffect: 'attack_ground_long.mp3'
  },
  'Cross Chop': {
    name: 'Cross Chop',
    startingPP: 5,
    type: 'FIGHTING',
    power: 85,
    category: 'PHYSICAL',
    effects: {
      increaseCritical: {percent: 1/8}
    }
  },
  'Poison Fang': {
    name: 'Poison Fang',
    startingPP: 15,
    type: 'POISON',
    power: 50,
    category: 'PHYSICAL',
    priority: 0,
    accuracy: 1,
    effects: {
      applyNonVolatileStatusConditions: {conditions: [{type: 'BADLY POISONED', chance:.5}]}
    },
    soundEffect: 'attack_generic.mp3',
  },
  'Iron Head': {
    name: 'Iron Head',
    startingPP: 15,
    type: 'STEEL',
    power: 80,
    category: 'PHYSICAL',
    priority: 0,
    accuracy: 1,
    effects: {
      flinchTarget: {chance:.3}
    }
  },
  'Icicle Crash': {
    name: 'Icicle Crash',
    startingPP: 10,
    type: 'ICE',
    power: 85,
    category: 'PHYSICAL',
    accuracy: .9,
    effects: {
      flinchTarget: {chance:.3}
    },
    soundEffect: 'attack_ice_crash.mp3',
    makesContact: false
  },
  'Zen Headbutt': {
    name: 'Zen Headbutt',
    startingPP: 15,
    type: 'PSYCHIC',
    power: 80,
    category: 'PHYSICAL',
    accuracy: .9,
    effects: {
      flinchTarget: {chance:.2}
    }
  },
  'Waterfall': {
    name: 'Waterfall',
    startingPP: 15,
    type: 'WATER',
    power: 80,
    category: 'PHYSICAL',
    effects: {
      flinchTarget: {chance:.2}
    },
    soundEffect: 'attack_water_long_crash.mp3'
  },
  'Rock Slide': {
    name: 'Rock Slide',
    startingPP: 10,
    type: 'ROCK',
    power: 75,
    category: 'PHYSICAL',
    accuracy: .9,
    effects: {
      flinchTarget: {chance:.3}
    }
  },
  'Dragon Rush': {
    name: 'Dragon Rush',
    startingPP: 10,
    type: 'DRAGON',
    power: 80,
    category: 'PHYSICAL',
    accuracy: .9,
    effects: {
      flinchTarget: {chance:.2}
    }
  },
  'Strange Steam': {
    name: 'Strange Steam',
    startingPP: 10,
    type: 'FAIRY',
    power: 90,
    category: 'SPECIAL',
    accuracy: .95,
    effects: {
      applyConfusion: {chance:.2}
    }
  },
  'Hurricane': {
    name: 'Hurricane',
    startingPP: 10,
    type: 'FLYING',
    power: 110,
    category: 'SPECIAL',
    accuracy: .7,
    stormRelated: true,
    effects: {
      applyConfusion: {chance:.5}
    },
    soundEffect: 'attack_howling_wind.mp3'
  },
  'Petal Blizzard': {
    name: 'Petal Blizzard',
    startingPP: 15,
    type: 'GRASS',
    power: 90,
    category: 'PHYSICAL',
    accuracy: 1,
    makesContact: false
  },
  'Dragon Claw': {
    name: 'Dragon Claw',
    startingPP: 10,
    type: 'DRAGON',
    power: 80,
    category: 'PHYSICAL',
    accuracy: 1
  },
  'Foul Play': {
    name: 'Foul Play',
    startingPP: 15,
    type: 'DARK',
    power: 95,
    category: 'PHYSICAL',
    effects: {
      useTargetAttack: true
    },
    description: `Uses the target's Attack stat instead of the user's in damage calculation.`,
    soundEffect: 'attack_slash_special.mp3',
  },
  'Brine': {
    name: 'Brine',
    power: 65,
    startingPP: 10,
    type: 'WATER',
    category: 'SPECIAL',
    description: `Power doubles if opponent's HP is less than 50%.`,
    soundEffect: 'attack_water_long.mp3'
  },
  'Brick Break': {
    name: 'Brick Break',
    startingPP: 15,
    type: 'FIGHTING',
    power: 75,
    category: 'PHYSICAL',
    priority: 0,
    accuracy: 1,
    effects: { breakScreens: true },
    description: `Breaks barriers such as Light Screen and Reflect before attacking.`,
    soundEffect: 'attack_double_punch.mp3'
  },
  'Sticky Web': {
    name: 'Sticky Web',
    startingPP: 20,
    type: 'BUG',
    category: 'STATUS',
    effects: {
      setStickyWeb: true,
      ignoreAccuracyAndEvasion: true,
    },
    description: `Weaves a sticky net around the opposing team, which lowers their speed upon switching in.`,
    soundEffect: 'status_entry_hazard.mp3'
  },
  'Stealth Rock': {
    name: 'Stealth Rock',
    startingPP: 20,
    type: 'ROCK',
    category: 'STATUS',
    effects: {
      setStealthRock: true,
      ignoreAccuracyAndEvasion: true,
    },
    description: `Lays a trap of levitating stones around the opposing team, which damages them upon switching in.`,
    soundEffect: 'status_stealth_rock.mp3'
  },
  'Spikes': {
    name: 'Spikes',
    startingPP: 20,
    type: 'GROUND',
    category: 'STATUS',
    effects: {
      setSpikes: true,
      ignoreAccuracyAndEvasion: true,
    },
    description: `Lays a trap of spikes at the opposing team’s feet, which damages them upon switching in.`,
    soundEffect: 'status_entry_hazard.mp3'
  },
  'Toxic Spikes': {
    name: 'Toxic Spikes',
    startingPP: 20,
    type: 'POISON',
    category: 'STATUS',
    effects: {
      setToxicSpikes: true,
      ignoreAccuracyAndEvasion: true,
    },
    description: `Lays a trap of poison spikes at the opposing team’s feet, which poisons them upon switching in.`,
    soundEffect: 'status_entry_hazard.mp3'
  },
  // 'Struggle Bug': {
  //   name: 'Struggle Bug',
  //   startingPP: 8,
  //   type: 'BUG',
  //   power: 50,
  //   category: 'SPECIAL',
  //   priority: 0,
  //   accuracy: 1,
  //   effects: {
  //     modifyStages: { modifiers: [{ userOrTarget: 'TARGET', stageStat: 'specialAttack', stages: -1, chance: 1 }] }
  //   }
  // },
  'Psychic': {
    name: 'Psychic',
    startingPP: 10,
    type: 'PSYCHIC',
    power: 90,
    category: 'SPECIAL',
    effects: {
      modifyStages: { modifiers: [{ userOrTarget: 'TARGET', stageStat: 'specialDefense', stages: -1, chance: .1 }] }
    },
    soundEffect: 'attack_ripple.mp3'
  },
  'Crunch': {
    name: 'Crunch',
    startingPP: 15,
    type: 'DARK',
    power: 80,
    category: 'PHYSICAL',
    effects: {
      modifyStages: { modifiers: [{ userOrTarget: 'TARGET', stageStat: 'defense', stages: -1, chance: .2 }] }
    },
    soundEffect: 'attack_generic.mp3'
  },
  'Bug Buzz': {
    name: 'Bug Buzz',
    startingPP: 10,
    type: 'BUG',
    power: 90,
    category: 'SPECIAL',
    effects: {
      modifyStages: { modifiers: [{ userOrTarget: 'TARGET', stageStat: 'specialDefense', stages: -1, chance: .1 }] }
    },
    soundEffect: 'attack_ripple.mp3',
    soundBased: true,
  },
  'Breaking Swipe': {
    name: 'Breaking Swipe',
    startingPP: 15,
    type: 'DRAGON',
    power: 60,
    category: 'PHYSICAL',
    effects: {
      modifyStages: { modifiers: [{ userOrTarget: 'TARGET', stageStat: 'attack', stages: -1, chance: 1 }] }
    },
    soundEffect: 'attack_generic.mp3'
  },
  'Energy Ball': {
    name: 'Energy Ball',
    startingPP: 10,
    type: 'GRASS',
    power: 90,
    category: 'SPECIAL',
    effects: {
      modifyStages: { modifiers: [{ userOrTarget: 'TARGET', stageStat: 'specialDefense', stages: -1, chance: .1 }] }
    },
    soundEffect: 'attack_ripple.mp3'
  },
  'Moonblast': {
    name: 'Moonblast',
    startingPP: 10,
    type: 'FAIRY',
    power: 95,
    category: 'SPECIAL',
    effects: {
      modifyStages: { modifiers: [{ userOrTarget: 'TARGET', stageStat: 'specialDefense', stages: -1, chance: .25 }] }
    }
  },
  'Fire Fang': {
    name: 'Fire Fang',
    startingPP: 15,
    type: 'FIRE',
    power: 65,
    category: 'PHYSICAL',
    accuracy: .95,
    effects: {
      applyNonVolatileStatusConditions: { conditions: [{chance: .1, type: 'BURNED'}]},
      flinchTarget: { chance: .1 }
    },
    soundEffect: 'attack_generic.mp3',
  },
  'Ice Fang': {
    name: 'Ice Fang',
    startingPP: 15,
    type: 'ICE',
    power: 65,
    category: 'PHYSICAL',
    accuracy: .95,
    effects: {
      applyNonVolatileStatusConditions: { conditions: [{chance: .1, type: 'FROZEN'}]},
      flinchTarget: { chance: .1 }
    },
    soundEffect: 'attack_generic.mp3'
  },
  'Thunder Fang': {
    name: 'Thunder Fang',
    startingPP: 15,
    type: 'ELECTRIC',
    power: 65,
    category: 'PHYSICAL',
    accuracy: .95,
    effects: {
      applyNonVolatileStatusConditions: { conditions: [{chance: .1, type: 'PARALYZED'}]},
      flinchTarget: { chance: .1 }
    },
    soundEffect: 'attack_generic.mp3',
  },
  'Dragon Breath': {
    name: 'Dragon Breath',
    startingPP: 10,
    type: 'DRAGON',
    power: 60,
    category: 'SPECIAL',
    priority: 0,
    accuracy: 1,
    effects: {
      applyNonVolatileStatusConditions: { conditions: [{chance: .3, type: 'PARALYZED'}]},
    },
    soundEffect: 'attack_generic_long.mp3'
  },
  'Struggle': {
    name: 'Struggle',
    startingPP: 1,
    type: 'NORMAL',
    power: 50,
    category: 'PHYSICAL',
    effects: {
      ignoreAccuracyAndEvasion: true,
      recoilBasedOnUserHP: {
        percent: 1/4,
        showRecoilText: true
      }
    },
    description: `Only usable when all PP are gone. Also hurts the user.`
  },
  'Belly Drum': {
    name: 'Belly Drum',
    startingPP: 10,
    type: 'NORMAL',
    category: 'STATUS',
    effects: {
      ignoreAccuracyAndEvasion: true,
      recoilBasedOnUserHP: {
        percent: 1/2,
        showRecoilText: false
      },
      maximizeAttack: true
    },
    soundEffect: 'status_belly_drum.mp3',
    description: `User loses 50% of its max HP, but Attack raises to maximum.`
  },
  'Gyro Ball': {
    name: 'Gyro Ball',
    startingPP: 5,
    type: 'STEEL',
    category: 'PHYSICAL',
    accuracy: 1,
    soundEffect: 'attack_ground_long.mp3',
    effects: { powerHigherWhenSpeedLower: true },
    description: `The slower the user compared to the target, the greater the move’s power.`
  },
  'Brutal Swing': {
    name: 'Brutal Swing',
    startingPP: 15,
    type: 'DARK',
    power: 70,
    category: 'PHYSICAL',
    accuracy: 1,
    soundEffect: 'attack_slash.mp3'
  },
  // 'Seed Bomb': {
  //   name: 'Seed Bomb',
  //   startingPP: 10,
  //   type: 'GRASS',
  //   power: 80,
  //   category: 'PHYSICAL',
  //   priority: 0,
  //   accuracy: 1,
  //   makesContact: false
  // },
  'Quick Attack': {
    name: 'Quick Attack',
    startingPP: 30,
    type: 'NORMAL',
    power: 40,
    category: 'PHYSICAL',
    priority: 1,
    accuracy: 1,
    description: `Attacks with increased priority.`
  },
  'Sucker Punch': {
    name: 'Sucker Punch',
    startingPP: 5,
    type: 'DARK',
    power: 70,
    category: 'PHYSICAL',
    priority: 1,
    effects: {
      ignoreAccuracyAndEvasion: true,
      suckerPunch: true,
    },
    description: `Attacks first but fails if target is not preparing an attack.`
  },
  'Shadow Sneak': {
    name: 'Shadow Sneak',
    startingPP: 30,
    type: 'GHOST',
    power: 40,
    category: 'PHYSICAL',
    priority: 1,
    accuracy: 1,
    description: `Attacks with increased priority.`
  },
  'Extreme Speed': {
    name: 'Extreme Speed',
    startingPP: 5,
    type: 'NORMAL',
    power: 80,
    category: 'PHYSICAL',
    priority: 2,
    accuracy: 1,
    description: `Always attacks first.`,
    soundEffect: 'attack_slash_special.mp3'
  },
  'Ice Shard': {
    name: 'Ice Shard',
    startingPP: 30,
    type: 'ICE',
    power: 40,
    category: 'PHYSICAL',
    priority: 1,
    soundEffect: 'attack_slash.mp3'
  },
  'Aqua Tail': {
    name: 'Aqua Tail',
    startingPP: 10,
    type: 'WATER',
    power: 90,
    category: 'PHYSICAL',
    accuracy: .9
  },
  'Aqua Jet': {
    name: 'Aqua Jet',
    startingPP: 20,
    type: 'WATER',
    power: 40,
    category: 'PHYSICAL',
    priority: 1,
    accuracy: 1,
    description: `Attacks with increased priority.`,
    soundEffect: 'attack_generic.mp3'
  },
  'Mud Shot': {
    name: 'Mud Shot',
    startingPP: 15,
    type: 'GROUND',
    power: 55,
    category: 'SPECIAL',
    accuracy: .95,
    effects: {
      modifyStages: {
        modifiers: [
          {userOrTarget: 'TARGET', stageStat: 'speed', stages: -1 ,chance: 1},
        ]
      }
    }
  },
  'Hammer Arm': {
    name: 'Hammer Arm',
    startingPP: 10,
    type: 'FIGHTING',
    power: 100,
    category: 'PHYSICAL',
    effects: {
      modifyStages: {
        modifiers: [
          {userOrTarget: 'USER', stageStat: 'speed', stages: -1 ,chance: 1},
        ]
      }
    }
  },
  'Flame Charge': {
    name: 'Flame Charge',
    startingPP: 15,
    type: 'FIRE',
    power: 60,
    category: 'PHYSICAL',
    effects: {
      modifyStages: {
        modifiers: [
          {userOrTarget: 'USER', stageStat: 'speed', stages: 1 ,chance: 1},
        ]
      }
    }
  },
  'Shell Smash': {
    name: 'Shell Smash',
    startingPP: 15,
    type: 'NORMAL',
    category: 'STATUS',
    soundEffect: 'status_shell_smash.mp3',
    description: `Lowers user's defense and special defense but raises user's attack, special attack and speed.`,
    effects: {
      modifyStages: {
        modifiers: [
          {userOrTarget: 'USER', stageStat: 'defense', stages: -1, chance: 1},
          {userOrTarget: 'USER', stageStat: 'specialDefense', stages: -1, chance: 1},
          {userOrTarget: 'USER', stageStat: 'attack', stages: 2, chance: 1},
          {userOrTarget: 'USER', stageStat: 'specialAttack', stages: 2, chance: 1},
          {userOrTarget: 'USER', stageStat: 'speed', stages: 2 ,chance: 1},
        ]
      }
    }
  },
  // 'Power Whip': {
  //   name: 'Power Whip',
  //   startingPP: 8,
  //   type: 'GRASS',
  //   power: 120,
  //   category: 'PHYSICAL',
  //   priority: 0,
  //   accuracy: .85
  // },
  'Megahorn': {
    name: 'Megahorn',
    startingPP: 10,
    type: 'BUG',
    power: 120,
    category: 'PHYSICAL',
    accuracy: .85
  },
  'Drill Peck': {
    name: 'Drill Peck',
    startingPP: 10,
    type: 'FLYING',
    power: 80,
    category: 'PHYSICAL',
    accuracy: 1
  },
  'Thunder Punch': {
    name: 'Thunder Punch',
    startingPP: 15,
    type: 'ELECTRIC',
    power: 75,
    category: 'PHYSICAL',
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [{
          type: 'PARALYZED',
          chance: .1
        }]
      }
    },
    soundEffect: 'attack_generic.mp3'
  },
  'Ice Punch': {
    name: 'Ice Punch',
    startingPP: 15,
    type: 'ICE',
    power: 75,
    category: 'PHYSICAL',
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [{
          type: 'FROZEN',
          chance: .1
        }]
      }
    },
    soundEffect: 'attack_generic.mp3',
  },
  'Fire Punch': {
    name: 'Fire Punch',
    startingPP: 15,
    type: 'FIRE',
    power: 75,
    category: 'PHYSICAL',
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [{
          type: 'BURNED',
          chance: .1
        }]
      }
    }
  },
  'Lava Plume': {
    name: 'Lava Plume',
    startingPP: 15,
    type: 'FIRE',
    power: 80,
    category: 'SPECIAL',
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [{
          type: 'BURNED',
          chance: .4
        }]
      }
    }
  },
  'Tri Attack': {
    name: 'Tri Attack',
    startingPP: 10,
    type: 'NORMAL',
    power: 80,
    category: 'SPECIAL',
    description: '20% chance of burning, paralyzing or freezing',
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [
          { type: 'FROZEN', chance: .2 },
          { type: 'PARALYZED', chance: .2 },
          { type: 'BURNED', chance: .2 },
        ]
      }
    },
    soundEffect: 'attack_beam.mp3'
  },
  'Flame Wheel': {
    name: 'Flame Wheel',
    startingPP: 15,
    type: 'FIRE',
    power: 70,
    category: 'PHYSICAL',
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [{
          type: 'BURNED',
          chance: .2
        }]
      }
    },
    soundEffect: 'attack_generic_long.mp3'
  },
  'Sacred Fire': {
    name: 'Sacred Fire',
    startingPP: 5,
    type: 'FIRE',
    power: 100,
    accuracy: .95,
    category: 'SPECIAL',
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [{
          type: 'BURNED',
          chance: .5
        }]
      }
    },
    soundEffect: 'attack_fire_long.mp3'
  },
  'Sacred Sword': {
    name: 'Sacred Sword',
    startingPP: 15,
    type: 'FIGHTING',
    power: 90,
    category: 'PHYSICAL',
    effects: {
      ignoreAccuracyAndEvasion: true
    },
    soundEffect: 'attack_sacred_sword.mp3'
  },
  'Flamethrower': {
    name: 'Flamethrower',
    startingPP: 15,
    type: 'FIRE',
    power: 90,
    category: 'SPECIAL',
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [{
          type: 'BURNED',
          chance: .1
        }]
      }
    },
    soundEffect: 'attack_flamethrower.mp3'
  },
  'Searing Shot': {
    name: 'Searing Shot',
    startingPP: 5,
    type: 'FIRE',
    power: 100,
    category: 'SPECIAL',
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [{
          type: 'BURNED',
          chance: .3
        }]
      }
    }
  },
  'Burn Up': {
    name: 'Burn Up',
    startingPP: 5,
    type: 'FIRE',
    power: 130,
    category: 'SPECIAL',
    effects: {
      ignoreAccuracyAndEvasion: true,
      removeUserType: { type: 'FIRE' }
    },
    soundEffect: 'attack_fire_long.mp3'
  },
  'Scorching Sands': {
    name: 'Scorching Sands',
    startingPP: 10,
    type: 'GROUND',
    power: 70,
    category: 'SPECIAL',
    priority: 0,
    accuracy: 1,
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [{
          type: 'BURNED',
          chance: .3
        }]
      }
    },
    soundEffect: 'attack_sand.mp3'
  },
  'Scald': {
    name: 'Scald',
    startingPP: 15,
    type: 'WATER',
    power: 80,
    category: 'SPECIAL',
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [{
          type: 'BURNED',
          chance: .4
        }]
      }
    },
    soundEffect: 'attack_generic_long.mp3'
  },
  // 'Night Shade': {
  //   name: 'Night Shade',
  //   startingPP: 10,
  //   type: 'GHOST',
  //   power: null,
  //   category: 'SPECIAL',
  //   priority: 0,
  //   accuracy: 1,
  //   effects: {
  //     constantDamage: {
  //       damage: 100
  //     }
  //   }
  // },
  'Dark Pulse': {
    name: 'Dark Pulse',
    startingPP: 15,
    type: 'DARK',
    power: 80,
    category: 'SPECIAL',
    effects: {
      flinchTarget: { chance: .2 }
    },
    soundEffect: 'attack_beam.mp3'
  },
  'Fire Blast': {
    name: 'Fire Blast',
    startingPP: 5,
    type: 'FIRE',
    power: 110,
    category: 'SPECIAL',
    accuracy: .85,
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [{
          type: 'BURNED',
          chance: .1
        }]
      }
    }
  },
  'Heat Wave': {
    name: 'Heat Wave',
    startingPP: 10,
    type: 'FIRE',
    power: 95,
    category: 'SPECIAL',
    accuracy: .9,
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [{
          type: 'BURNED',
          chance: .1
        }]
      }
    }
  },
  'Hydro Pump': {
    name: 'Hydro Pump',
    startingPP: 5,
    type: 'WATER',
    power: 110,
    category: 'SPECIAL',
    accuracy: .9,
    soundEffect: 'attack_water_long_crash.mp3'
  },
  'Flash Cannon': {
    name: 'Flash Cannon',
    startingPP: 10,
    type: 'STEEL',
    power: 80,
    category: 'SPECIAL',
    effects: {
      modifyStages: {modifiers: [{userOrTarget: 'TARGET', stageStat: 'speed', stages: -1, chance: .1}]}
    }
  },
  'Kinesis': {
    name: 'Kinesis',
    startingPP: 15,
    type: 'PSYCHIC',
    category: 'STATUS',
    soundEffect: 'status_debuff.mp3',
    effects: {
      modifyStages: {
        modifiers: [{
          userOrTarget: 'TARGET',
          stageStat: 'accuracy',
          stages: -1,
          chance: 1
        }]
      }
    }
  },
  'Smokescreen': {
    name: 'Smokescreen',
    startingPP: 20,
    type: 'NORMAL',
    category: 'STATUS',
    effects: {
      modifyStages: {
        modifiers: [{
          userOrTarget: 'TARGET',
          stageStat: 'accuracy',
          stages: -1,
          chance: 1
        }]
      }
    }
  },
  // 'Sand Attack': {
  //   name: 'Sand Attack',
  //   startingPP: 10,
  //   type: 'GROUND',
  //   power: null,
  //   category: 'STATUS',
  //   priority: 0,
  //   accuracy: 1,
  //   effects: {
  //     modifyStages: {
  //       modifiers: [{
  //         userOrTarget: 'TARGET',
  //         stageStat: 'accuracy',
  //         stages: -1,
  //         chance: 1
  //       }]
  //     }
  //   }
  // },
  'Rock Polish': {
    name: 'Rock Polish',
    startingPP: 20,
    type: 'ROCK',
    category: 'STATUS',
    effects: {
      ignoreAccuracyAndEvasion: true,
      modifyStages: {
        modifiers: [{
          userOrTarget: 'USER',
          stageStat: 'speed',
          stages: 2,
          chance: 1
        }]
      }
    }
  },
  'Super Fang': {
    name: 'Super Fang',
    startingPP: 10,
    type: 'NORMAL',
    category: 'PHYSICAL',
    effects: {
      halfRemainingHP: true
    },
    soundEffect: 'attack_jolt.mp3'
  },
  // 'Scary Face': {
  //   name: 'Scary Face',
  //   startingPP: 10,
  //   type: 'NORMAL',
  //   power: null,
  //   category: 'STATUS',
  //   priority: 0,
  //   accuracy: 1,
  //   effects: {
  //     modifyStages: {
  //       modifiers: [{
  //         userOrTarget: 'TARGET',
  //         stageStat: 'speed',
  //         stages: -2,
  //         chance: 1
  //       }]
  //     }
  //   }
  // },
  'Mud-Slap': {
    name: 'Mud-Slap',
    startingPP: 10,
    type: 'GROUND',
    power: 20,
    category: 'SPECIAL',
    effects: {
      modifyStages: {
        modifiers: [{
          userOrTarget: 'TARGET',
          stageStat: 'accuracy',
          stages: -1,
          chance: 1
        }]
      }
    },
    soundEffect: 'attack_slap.mp3'
  },
  'Muddy Water': {
    name: 'Muddy Water',
    startingPP: 10,
    type: 'WATER',
    power: 90,
    category: 'SPECIAL',
    accuracy: .85,
    effects: {
      modifyStages: {
        modifiers: [{
          userOrTarget: 'TARGET',
          stageStat: 'accuracy',
          stages: -1,
          chance: .3
        }]
      }
    }
  },
  // 'String Shot': {
  //   name: 'String Shot',
  //   startingPP: 10,
  //   type: 'BUG',
  //   power: null,
  //   category: 'STATUS',
  //   priority: 0,
  //   accuracy: 1,
  //   effects: {
  //     modifyStages: {
  //       modifiers: [{
  //         userOrTarget: 'TARGET',
  //         stageStat: 'speed',
  //         stages: -2,
  //         chance: 1
  //       }]
  //     }
  //   }
  // },
  'Bullet Seed': {
    name: 'Bullet Seed',
    startingPP: 30,
    type: 'GRASS',
    power: 25,
    category: 'PHYSICAL',
    effects: {
      multipleHits: {
        additionalHits: [
          {
            chance: 3/8
          },
          {
            chance: 3/8
          },
          {
            chance: 1/8
          },
          {
            chance: 1/8
          },
        ]
      }
    },
    soundEffect: 'attack_scratch.mp3'
  },
  'Fury Swipes': {
    name: 'Fury Swipes',
    startingPP: 15,
    type: 'NORMAL',
    power: 18,
    category: 'PHYSICAL',
    accuracy: .9,
    effects: {
      multipleHits: {
        additionalHits: [
          {
            chance: 3/8
          },
          {
            chance: 3/8
          },
          {
            chance: 1/8
          },
          {
            chance: 1/8
          },
        ]
      }
    },
    soundEffect: 'attack_scratch.mp3'
  },
  'Icicle Spear': {
    name: 'Icicle Spear',
    startingPP: 10,
    type: 'ICE',
    power: 30,
    category: 'PHYSICAL',
    effects: {
      multipleHits: {
        additionalHits: [
          {
            chance: 3/8
          },
          {
            chance: 3/8
          },
          {
            chance: 1/8
          },
          {
            chance: 1/8
          },
        ]
      }
    },
    soundEffect: 'attack_scratch.mp3',
    makesContact: false
  },
  'Bone Rush': {
    name: 'Bone Rush',
    startingPP: 5,
    type: 'GROUND',
    power: 10,
    category: 'PHYSICAL',
    accuracy: .9,
    effects: {
      multipleHits: {
        additionalHits: [
          {
            chance: 3/8
          },
          {
            chance: 3/8
          },
          {
            chance: 1/8
          },
          {
            chance: 1/8
          },
        ]
      }
    },
    soundEffect: 'attack_scratch.mp3'
  },
  'Scale Shot': {
    name: 'Scale Shot',
    startingPP: 20,
    type: 'DRAGON',
    power: 25,
    category: 'PHYSICAL',
    accuracy: .9,
    effects: {
      multipleHits: {
        additionalHits: [
          {
            chance: 3/8
          },
          {
            chance: 3/8
          },
          {
            chance: 1/8
          },
          {
            chance: 1/8
          },
        ]
      }
    },
    soundEffect: 'attack_scratch.mp3'
  },
  'Will-O-Wisp': {
    name: 'Will-O-Wisp',
    startingPP: 15,
    type: 'FIRE',
    category: 'STATUS',
    accuracy: .85,
    // soundEffect: 'status_burned.mp3',
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [{
          type: 'BURNED',
          chance: 1
        }]
      }
    }
  },
  'Thunder Wave': {
    name: 'Thunder Wave',
    startingPP: 20,
    type: 'ELECTRIC',
    category: 'STATUS',
    accuracy: .9,
    // soundEffect: 'status_paralyzed.mp3',
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [{
          type: 'PARALYZED',
          chance: 1
        }]
      }
    }
  },
  'Glare': {
    name: 'Glare',
    startingPP: 30,
    type: 'NORMAL',
    category: 'STATUS',
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [{
          type: 'PARALYZED',
          chance: 1
        }]
      }
    }
  },
  'Bite': {
    name: 'Bite',
    startingPP: 15,
    type: 'DARK',
    power: 60,
    category: 'PHYSICAL',
    effects: {
      flinchTarget: {
        chance: .3
      }
    }
  },
  // 'Astonish': {
  //   name: 'Astonish',
  //   startingPP: 10,
  //   type: 'GHOST',
  //   power: 30,
  //   category: 'PHYSICAL',
  //   priority: 0,
  //   accuracy: 1,
  //   effects: {
  //     flinchTarget: {
  //       chance: .3
  //     }
  //   }
  // },
  // 'Headbutt': {
  //   name: 'Headbutt',
  //   startingPP: 10,
  //   type: 'NORMAL',
  //   power: 70,
  //   category: 'PHYSICAL',
  //   priority: 0,
  //   accuracy: 1,
  //   effects: {
  //     flinchTarget: {
  //       chance: .3
  //     }
  //   }
  // },
  'Protect': {
    name: 'Protect',
    startingPP: 10,
    type: 'NORMAL',
    category: 'STATUS',
    priority: 4,
    soundEffect: 'status_protect.mp3',
    effects: {
      protectUser: true,
      ignoreAccuracyAndEvasion: true
    }
  },
  'King\'s Shield': {
    name: 'King\'s Shield',
    startingPP: 10,
    type: 'STEEL',
    category: 'STATUS',
    priority: 4,
    soundEffect: 'status_protect.mp3',
    effects: {
      kingsShield: true,
      ignoreAccuracyAndEvasion: true
    },
    description: `Blocks direct attacks. If the attack makes contact, lowers the opponent's Attack by 2 stages.`
  },
  'Dual Wingbeat': {
    name: 'Dual Wingbeat',
    startingPP: 15,
    type: 'FLYING',
    power: 40,
    category: 'PHYSICAL',
    accuracy: .9,
    effects: {
      multipleHits: {
        additionalHits: [
          {
            chance: 1
          }
        ]
      }
    },
    soundEffect: 'attack_slap.mp3'
  },
  'Bonemerang': {
    name: 'Bonemerang',
    startingPP: 10,
    type: 'GROUND',
    power: 50,
    category: 'PHYSICAL',
    effects: {
      multipleHits: {
        additionalHits: [
          {
            chance: 1
          }
        ]
      }
    },
    soundEffect: 'attack_scratch.mp3'
  },
  // 'Dual Chop': {
  //   name: 'Dual Chop',
  //   startingPP: 10,
  //   type: 'DRAGON',
  //   power: 40,
  //   category: 'PHYSICAL',
  //   priority: 0,
  //   accuracy: .9,
  //   effects: {
  //     multipleHits: {
  //       additionalHits: [
  //         {
  //           chance: 1
  //         }
  //       ]
  //     }
  //   }
  // },
  // 'Take Down': {
  //   name: 'Take Down',
  //   startingPP: 10,
  //   type: 'NORMAL',
  //   power: 90,
  //   category: 'PHYSICAL',
  //   priority: 0,
  //   accuracy: 1,
  //   effects: {
  //     recoil: {
  //       percent: 1/4
  //     }
  //   },
  //   description: `User receives 1/4 of the damage inflicted in recoil.`
  // },
  'Flare Blitz': {
    name: 'Flare Blitz',
    startingPP: 15,
    type: 'FIRE',
    power: 120,
    category: 'PHYSICAL',
    effects: {
      recoil: {
        percent: 1/3
      },
      applyNonVolatileStatusConditions: {
        conditions: [{
          type: 'BURNED',
          chance: .1
        }]
      }
    },
    description: `User receives 1/3 of the damage in recoil and 10% chance to burn`,
    soundEffect: 'attack_generic_long.mp3',
  },
  'Double-Edge': {
    name: 'Double-Edge',
    startingPP: 15,
    type: 'NORMAL',
    power: 120,
    category: 'PHYSICAL',
    effects: {
      recoil: {
        percent: 1/3
      }
    },
    description: `User receives 1/3 of the damage inflicted in recoil.`
  },
  'Wild Charge': {
    name: 'Wild Charge',
    startingPP: 15,
    type: 'ELECTRIC',
    power: 90,
    category: 'PHYSICAL',
    effects: {
      recoil: {
        percent: 1/4
      }
    },
    description: `User receives 1/4 of the damage inflicted in recoil.`
  },
  'Head Smash': {
    name: 'Head Smash',
    startingPP: 5,
    type: 'ROCK',
    power: 150,
    category: 'PHYSICAL',
    accuracy: .8,
    effects: {
      recoil: {
        percent: 1/2
      }
    },
    description: `User receives 1/2 of the damage inflicted in recoil.`
  },
  'Wood Hammer': {
    name: 'Wood Hammer',
    startingPP: 15,
    type: 'GRASS',
    power: 120,
    category: 'PHYSICAL',
    effects: {
      recoil: {
        percent: 1/3
      }
    },
    description: `User receives 1/3 of the damage inflicted in recoil.`,
    soundEffect: 'attack_rock.mp3',
  },
  'Explosion': {
    name: 'Explosion',
    startingPP: 5,
    type: 'NORMAL',
    power: 250,
    category: 'PHYSICAL',
    effects: {
      selfDestruct: true,
    },
    description: `Causes the user to faint.`,
    soundEffect: 'attack_explosion.mp3',
    makesContact: false
  },
  'Hyper Fang': {
    name: 'Hyper Fang',
    startingPP: 15,
    type: 'NORMAL',
    power: 80,
    category: 'PHYSICAL',
    effects: {
      flinchTarget: { chance: .1 }
    }
  },
  'Rest': {
    name: 'Rest',
    startingPP: 10,
    type: 'PSYCHIC',
    category: 'STATUS',
    effects: {
      ignoreAccuracyAndEvasion: true,
      rest: true
    },
    description: `The user sleeps for 2 turns, restoring HP and status.`,
    soundEffect: 'status_heal.mp3',
  },
  'Snore': {
    name: 'Snore',
    startingPP: 15,
    type: 'NORMAL',
    category: 'SPECIAL',
    power: 50,
    effects: {
      failIfUserDoesntHaveStatus: {statuses: ['ASLEEP']},
      flinchTarget: {chance: .3}
    },
    description: `Only usable while asleep. 30% chance to cause target to flinch.`,
    soundEffect: 'attack_snore.mp3',
    soundBased: true,
  },
  'Memento': {
    name: 'Memento',
    startingPP: 10,
    type: 'DARK',
    category: 'STATUS',
    effects: {
      modifyStages: {
        modifiers: [
          {chance: 1, stageStat: 'attack', stages: -2, userOrTarget: 'TARGET'},
          {chance: 1, stageStat: 'specialAttack', stages: -2, userOrTarget: 'TARGET'},
        ]
      },
      recoilBasedOnUserHP: {
        percent: 1,
        showRecoilText: false
      }
    },
    description: `Lowers target's Attack and Special Attack by 2 stages. The user faints.`,
    soundEffect: 'status_curse.mp3',
  },
  // 'Stomp': {
  //   name: 'Stomp',
  //   startingPP: 10,
  //   type: 'NORMAL',
  //   power: 65,
  //   category: 'PHYSICAL',
  //   priority: 0,
  //   accuracy: 1,
  //   effects: {
  //     flinchTarget: { chance: .3 }
  //   }
  // },
  'Air Slash': {
    name: 'Air Slash',
    startingPP: 15,
    type: 'FLYING',
    power: 75,
    category: 'SPECIAL',
    accuracy: .9,
    effects: {
      flinchTarget: { chance: .3 }
    },
    soundEffect: 'attack_slash.mp3'
  },
  // 'Drill Run': {
  //   name: 'Drill Run',
  //   startingPP: 8,
  //   type: 'GROUND',
  //   power: 80,
  //   category: 'PHYSICAL',
  //   priority: 0,
  //   accuracy: .95,
  //   effects: {
  //     increaseCritical: {
  //       percent: 1/8
  //     }
  //   }
  // },
  'Shadow Claw': {
    name: 'Shadow Claw',
    startingPP: 15,
    type: 'GHOST',
    power: 70,
    category: 'PHYSICAL',
    effects: {
      increaseCritical: {
        percent: 1/8
      }
    },
    soundEffect: 'attack_slash.mp3'
  },
  'Crabhammer': {
    name: 'Crabhammer',
    startingPP: 10,
    type: 'WATER',
    power: 100,
    category: 'PHYSICAL',
    priority: 0,
    accuracy: .9,
    effects: {
      increaseCritical: {
        percent: 1/8
      }
    },
    soundEffect: 'attack_generic.mp3'
  },
  'Slash': {
    name: 'Slash',
    startingPP: 20,
    type: 'NORMAL',
    power: 70,
    category: 'PHYSICAL',
    effects: {
      increaseCritical: {
        percent: 1/8
      }
    },
    soundEffect: 'attack_slash.mp3'
  },
  'Leaf Blade': {
    name: 'Leaf Blade',
    startingPP: 15,
    type: 'GRASS',
    power: 90,
    category: 'PHYSICAL',
    effects: {
      increaseCritical: {
        percent: 1/8
      }
    },
    soundEffect: 'attack_slash.mp3'
  },
  'Stone Edge': {
    name: 'Stone Edge',
    startingPP: 5,
    type: 'ROCK',
    power: 100,
    category: 'PHYSICAL',
    accuracy: .8,
    effects: {
      increaseCritical: {
        percent: 1/8
      }
    },
    soundEffect: 'attack_slash.mp3',
    makesContact: false
  },
  'Night Slash': {
    name: 'Night Slash',
    startingPP: 15,
    type: 'DARK',
    power: 75,
    category: 'PHYSICAL',
    effects: {
      increaseCritical: {
        percent: 1/8
      }
    },
    soundEffect: 'attack_slash_special.mp3'
  },
  'Razor Shell': {
    name: 'Razor Shell',
    startingPP: 10,
    type: 'WATER',
    power: 75,
    category: 'PHYSICAL',
    accuracy: .95,
    effects: {modifyStages: {modifiers: [{userOrTarget: 'TARGET', stageStat: 'defense', stages: -1, chance: .5}]}},
    soundEffect: 'attack_slash.mp3'
  },
  'Aerial Ace': {
    name: 'Aerial Ace',
    startingPP: 20,
    type: 'FLYING',
    power: 60,
    category: 'SPECIAL',
    effects: {
      ignoreAccuracyAndEvasion: true
    }
  },
  'Swift': {
    name: 'Swift',
    startingPP: 20,
    type: 'NORMAL',
    power: 60,
    category: 'SPECIAL',
    effects: {
      ignoreAccuracyAndEvasion: true
    }
  },
  'Shadow Punch': {
    name: 'Shadow Punch',
    startingPP: 20,
    type: 'GHOST',
    power: 60,
    category: 'PHYSICAL',
    priority: 0,
    effects: {
      ignoreAccuracyAndEvasion: true
    }
  },
  // 'Magical Leaf': {
  //   name: 'Magical Leaf',
  //   startingPP: 10,
  //   type: 'GRASS',
  //   power: 60,
  //   category: 'SPECIAL',
  //   priority: 0,
  //   accuracy: 1,
  //   effects: {
  //     ignoreAccuracyAndEvasion: true
  //   }
  // },
  // 'Vital Throw': {
  //   name: 'Vital Throw',
  //   startingPP: 10,
  //   type: 'FIGHTING',
  //   power: 70,
  //   category: 'PHYSICAL',
  //   priority: -1,
  //   accuracy: 1,
  //   effects: {
  //     ignoreAccuracyAndEvasion: true
  //   }
  // },
  'Sonic Boom': {
    name: 'Sonic Boom',
    startingPP: 20,
    type: 'NORMAL',
    category: 'SPECIAL',
    effects: {
      constantDamage: {
        damage: 100
      }
    }
  },
  'Roost': {
    name: 'Roost',
    startingPP: 10,
    type: 'FLYING',
    category: 'STATUS',
    soundEffect: 'status_heal.mp3',
    effects: {
      healUser: {
        percent: 1/2
      },
      ignoreAccuracyAndEvasion: true,
      roost: true
    },
    description: `Restores 50% of the user's max HP. Loses FLYING type this turn`
  },
  'Recover': {
    name: 'Recover',
    startingPP: 10,
    type: 'NORMAL',
    category: 'STATUS',
    soundEffect: 'status_heal.mp3',
    effects: {
      healUser: {
        percent: 1/2
      },
      ignoreAccuracyAndEvasion: true
    }
  },
  'Giga Drain': {
    name: 'Giga Drain',
    startingPP: 10,
    type: 'GRASS',
    power: 75,
    category: 'SPECIAL',
    effects: {
      drain: {
        percent: 1/2
      }
    },
    soundEffect: 'attack_ripple.mp3'
  },
  'Leech Seed': {
    name: 'Leech Seed',
    startingPP: 10,
    type: 'GRASS',
    category: 'STATUS',
    soundEffect: 'status_leech_seed.mp3',
    effects: {
      setLeechSeed: true
    },
    description: `Plants a seed that drains health every turn`
  },
  'Leech Life': {
    name: 'Leech Life',
    startingPP: 10,
    type: 'BUG',
    power: 80,
    category: 'PHYSICAL',
    effects: {
      drain: {
        percent: 1/2
      }
    }
  },
  // 'Draining Kiss': {
  //   name: 'Draining Kiss',
  //   startingPP: 10,
  //   type: 'FAIRY',
  //   power: 60,
  //   category: 'SPECIAL',
  //   priority: 0,
  //   accuracy: 1,
  //   effects: {
  //     drain: {
  //       percent: .75
  //     }
  //   }
  // },
  'Ice Beam': {
    name: 'Ice Beam',
    startingPP: 10,
    type: 'ICE',
    power: 90,
    category: 'SPECIAL',
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [{
          type: 'FROZEN',
          chance: .1
        }]
      }
    },
    soundEffect: 'attack_beam.mp3'
  },
  'Sing': {
    name: 'Sing',
    startingPP: 15,
    type: 'NORMAL',
    category: 'STATUS',
    // soundEffect: 'status_asleep.mp3',
    accuracy: .55,
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [{
          type: 'ASLEEP',
          chance: 1
        }]
      }
    }
  },
  'Hypnosis': {
    name: 'Hypnosis',
    startingPP: 20,
    type: 'PSYCHIC',
    category: 'STATUS',
    // soundEffect: 'status_asleep.mp3',
    accuracy: .6,
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [{
          type: 'ASLEEP',
          chance: 1
        }]
      }
    }
  },
  'Toxic': {
    name: 'Toxic',
    startingPP: 10,
    type: 'POISON',
    category: 'STATUS',
    // soundEffect: 'status_poisoned.mp3',
    accuracy: .9,
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [{
          type: 'BADLY POISONED',
          chance: 1
        }]
      }
    }
  },
  'Confuse Ray': {
    name: 'Confuse Ray',
    startingPP: 10,
    type: 'GHOST',
    category: 'STATUS',
    soundEffect: 'status_confuse_ray.mp3',
    priority: 0,
    accuracy: 1,
    effects: {
      applyConfusion: {
        chance: 1
      }
    }
  },
  // 'Growth': {
  //   name: 'Growth',
  //   startingPP: 10,
  //   type: 'NORMAL',
  //   power: null,
  //   category: 'STATUS',
  //   priority: 0,
  //   accuracy: 1,
  //   effects: {
  //     modifyStages: {
  //       modifiers: [
  //         {
  //         stageStat: 'attack',
  //         chance: 1,
  //         stages: 1,
  //         userOrTarget: "USER"
  //       },
  //       {
  //         stageStat: 'specialAttack',
  //         chance: 1,
  //         stages: 1,
  //         userOrTarget: "USER"
  //       },
  //       ]
  //     }
  //   }
  // },
  'Sleep Powder': {
    name: 'Sleep Powder',
    startingPP: 15,
    type: 'GRASS',
    category: 'STATUS',
    priority: 0,
    accuracy: .75,
    // soundEffect: 'status_asleep.mp3',
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [{
          type: 'ASLEEP',
          chance: 1
        }]
      }
    }
  },
  'Synthesis': {
    name: 'Synthesis',
    startingPP: 5,
    type: 'GRASS',
    category: 'STATUS',
    effects: {
      healUser: {
        percent: 1/2,
        modifiedByWeather: true
      },
      ignoreAccuracyAndEvasion: true
    },
    description: `Recovers 1/2 health during clear skies, 2/3 in harsh sunlight and 1/8 in other weather.`
  },
  'Rapid Spin': {
    name: 'Rapid Spin',
    startingPP: 40,
    type: 'NORMAL',
    power: 50,
    category: 'PHYSICAL',
    effects: {
      modifyStages: {
        modifiers: [{userOrTarget: 'USER', stageStat: 'speed', stages: 1, chance: 1}]
      },
      removeUserBindAndEntryHazards: true
    },
    description: `Raises user's speed by 1 stage and removes entry hazards.`,
    soundEffect: 'attack_rapid_spin.mp3'
  },
  'Steel Wing': {
    name: 'Steel Wing',
    startingPP: 25,
    type: 'STEEL',
    power: 70,
    accuracy: .9,
    category: 'PHYSICAL',
    effects: {
      modifyStages: {
        modifiers: [{userOrTarget: 'USER', stageStat: 'defense', stages: 1, chance: .1}]
      },
    },
    soundEffect: 'attack_slash_special.mp3'
  },
  'Water Pulse': {
    name: 'Water Pulse',
    startingPP: 20,
    type: 'WATER',
    power: 60,
    category: 'SPECIAL',
    priority: 0,
    accuracy: 1,
    effects: {
      applyConfusion: {
        chance: .2
      }
    }
  },
  'Iron Defense': {
    name: 'Iron Defense',
    startingPP: 15,
    type: 'STEEL',
    category: 'STATUS',
    soundEffect: 'status_buff.mp3',
    effects: {
      modifyStages: {
        modifiers: [{
          stageStat: 'defense',
          chance: 1,
          stages: 2,
          userOrTarget: 'USER'
        }]
      }
    }
  },
  'Nasty Plot': {
    name: 'Nasty Plot',
    startingPP: 20,
    type: 'DARK',
    category: 'STATUS',
    soundEffect: 'status_buff.mp3',
    effects: {
      modifyStages: {
        modifiers: [{
          stageStat: 'specialAttack',
          chance: 1,
          stages: 2,
          userOrTarget: 'USER'
        }]
      }
    }
  },
  'Acid Armor': {
    name: 'Acid Armor',
    startingPP: 20,
    type: 'POISON',
    category: 'STATUS',
    soundEffect: 'status_buff.mp3',
    effects: {
      modifyStages: {
        modifiers: [{
          stageStat: 'defense',
          chance: 1,
          stages: 2,
          userOrTarget: 'USER'
        }]
      }
    }
  },
  'Thunder': {
    name: 'Thunder',
    startingPP: 10,
    type: 'ELECTRIC',
    power: 110,
    category: 'SPECIAL',
    accuracy: .7,
    stormRelated: true,
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [{
          type: 'PARALYZED',
          chance: .3
        }]
      }
    },
    soundEffect: 'attack_electric_long.mp3'
  },
  'Thunderbolt': {
    name: 'Thunderbolt',
    startingPP: 15,
    type: 'ELECTRIC',
    power: 90,
    category: 'SPECIAL',
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [{
          type: 'PARALYZED',
          chance: .1
        }]
      }
    },
    soundEffect: 'attack_electric_long.mp3'
  },
  'Nuzzle': {
    name: 'Nuzzle',
    startingPP: 20,
    type: 'ELECTRIC',
    power: 20,
    category: 'PHYSICAL',
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [{
          type: 'PARALYZED',
          chance: 1
        }]
      }
    }
  },
  'Discharge': {
    name: 'Discharge',
    startingPP: 15,
    type: 'ELECTRIC',
    power: 80,
    category: 'SPECIAL',
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [{
          type: 'PARALYZED',
          chance: .3
        }]
      }
    }
  },
  'Double Team': {
    name: 'Double Team',
    startingPP: 15,
    type: 'NORMAL',
    category: 'STATUS',
    soundEffect: 'status_buff.mp3',
    effects: {
      modifyStages: {
        modifiers: [{
          stageStat: 'evasion',
          userOrTarget: 'USER',
          stages: 1,
          chance: 1
        }]
      }
    }
  },
  'Minimize': {
    name: 'Minimize',
    startingPP: 10,
    type: 'NORMAL',
    category: 'STATUS',
    soundEffect: 'status_buff.mp3',
    effects: {
      modifyStages: {
        modifiers: [{
          stageStat: 'evasion',
          userOrTarget: 'USER',
          stages: 2,
          chance: 1
        }]
      },
      ignoreAccuracyAndEvasion: true
    }
  },
  'Smart Strike': {
    name: 'Smart Strike',
    startingPP: 10,
    type: 'STEEL',
    power: 70,
    category: 'PHYSICAL',
    effects: {
      ignoreAccuracyAndEvasion: true
    }
  },
  'Soft-Boiled': {
    name: 'Soft-Boiled',
    startingPP: 10,
    type: 'NORMAL',
    category: 'STATUS',
    soundEffect: 'status_heal.mp3',
    effects: {
      healUser: {
        percent: 1/2
      },
      ignoreAccuracyAndEvasion: true
    }
  },
  'Charm': {
    name: 'Charm',
    startingPP: 20,
    type: 'FAIRY',
    category: 'STATUS',
    soundEffect: 'status_debuff.mp3',
    effects: {
      modifyStages: {
        modifiers: [{
          userOrTarget: 'TARGET',
          stageStat: 'attack',
          stages: -2,
          chance: 1,
        }]
      }
    }
  },
  'Bulldoze': {
    name: 'Bulldoze',
    startingPP: 20,
    type: 'GROUND',
    power: 60,
    category: 'PHYSICAL',
    effects: {
      modifyStages: {
        modifiers: [{
          userOrTarget: 'TARGET',
          stageStat: 'speed',
          stages: -1,
          chance: 1,
        }]
      }
    },
    soundEffect: 'attack_sand.mp3',
    makesContact: false
  },
  'Low Kick': {
    name: 'Low Kick',
    startingPP: 20,
    type: 'FIGHTING',
    category: 'PHYSICAL',
    effects: {
      powerBasedOnTargetSize: {
        powers: {
          small: 20,
          medium: 60,
          large: 100,
          xlarge: 120
        }
      }
    },
    description: 'Inflicts more damage to heavier targets',
    soundEffect: 'attack_generic.mp3'
  },
  'Grass Knot': {
    name: 'Grass Knot',
    startingPP: 20,
    type: 'GRASS',
    category: 'SPECIAL',
    effects: {
      powerBasedOnTargetSize: {
        powers: {
          small: 20,
          medium: 60,
          large: 100,
          xlarge: 120
        }
      }
    },
    description: 'Inflicts more damage to heavier targets'
  },
  'Seismic Toss': {
    name: 'Seismic Toss',
    startingPP: 20,
    type: 'FIGHTING',
    category: 'PHYSICAL',
    effects: {
      constantDamage: {
        damage: 100
      }
    },
    soundEffect: 'attack_generic.mp3'
  },
  // 'Detect': {
  //   name: 'Detect',
  //   startingPP: 10,
  //   type: 'FIGHTING',
  //   power: null,
  //   category: 'STATUS',
  //   priority: 5,
  //   accuracy: 1,
  //   effects: {
  //     protectUser: true
  //   }
  // },
  'Mach Punch': {
    name: 'Mach Punch',
    startingPP: 30,
    type: 'FIGHTING',
    power: 40,
    category: 'PHYSICAL',
    priority: 1,
    accuracy: 1,
    description: `Attacks with increased priority.`
  },
  'Bullet Punch': {
    name: 'Bullet Punch',
    startingPP: 30,
    type: 'STEEL',
    power: 40,
    category: 'PHYSICAL',
    priority: 1,
    accuracy: 1,
    description: `Attacks with increased priority.`
  },
  'Power-Up Punch': {
    name: 'Power-Up Punch',
    startingPP: 20,
    type: 'FIGHTING',
    power: 40,
    category: 'PHYSICAL',
    effects: {
      modifyStages: {
        modifiers: [{userOrTarget: 'USER', stageStat: 'attack', stages: 1, chance: 1}]
      }
    }
  },
  'Mystical Fire': {
    name: 'Mystical Fire',
    startingPP: 10,
    type: 'FIRE',
    power: 75,
    category: 'SPECIAL',
    effects: {
      modifyStages: {
        modifiers: [{userOrTarget: 'TARGET', stageStat: 'specialAttack', stages: -1, chance: 1}]
      }
    }
  },
  // 'Bulk Up': {
  //   name: 'Bulk Up',
  //   startingPP: 10,
  //   type: 'FIGHTING',
  //   power: null,
  //   category: 'STATUS',
  //   priority: 0,
  //   accuracy: 1,
  //   effects: {
  //     modifyStages: {
  //       modifiers: [
  //         {userOrTarget: 'USER', stageStat: 'attack', stages: 1, chance: 1},
  //         {userOrTarget: 'USER', stageStat: 'defense', stages: 1, chance: 1},
  //       ]
  //     }
  //   }
  // },
  'Drain Punch': {
    name: 'Drain Punch',
    startingPP: 10,
    type: 'FIGHTING',
    power: 60,
    category: 'PHYSICAL',
    effects: {
      drain: {
        percent: 1/2
      }
    }
  },
  // 'Mega Punch': {
  //   name: 'Mega Punch',
  //   startingPP: 10,
  //   type: 'NORMAL',
  //   power: 70,
  //   category: 'PHYSICAL',
  //   priority: 0,
  //   accuracy: .9
  // },
  'Rock Blast': {
    name: 'Rock Blast',
    startingPP: 10,
    type: 'ROCK',
    power: 25,
    category: 'PHYSICAL',
    priority: 0,
    accuracy: .9,
    effects: {
      multipleHits: {
        additionalHits: [
          {
            chance: 3/8
          },
          {
            chance: 3/8
          },
          {
            chance: 1/8
          },
          {
            chance: 1/8
          },
        ]
      }
    },
    soundEffect: 'attack_generic.mp3',
    makesContact: false
  },
  // 'Defense Curl': {
  //   name: 'Defense Curl',
  //   startingPP: 10,
  //   type: 'NORMAL',
  //   power: null,
  //   category: 'STATUS',
  //   priority: 0,
  //   accuracy: 1,
  //   effects: {
  //     modifyStages: {
  //       modifiers: [{
  //         userOrTarget: 'USER',
  //         stageStat: 'defense',
  //         stages: 1,
  //         chance: 1,
  //       }]
  //     }
  //   }
  // },
  // 'Lick': {
  //   name: 'Lick',
  //   startingPP: 10,
  //   type: 'GHOST',
  //   power: 30,
  //   category: 'PHYSICAL',
  //   priority: 0,
  //   accuracy: 1,
  //   effects: {
  //     applyNonVolatileStatusConditions: {
  //       conditions: [{
  //         type: 'PARALYZED',
  //         chance: .3
  //       }]
  //     }
  //   }
  // },
  // 'Smog': {
  //   name: 'Smog',
  //   startingPP: 10,
  //   type: 'POISON',
  //   power: 30,
  //   category: 'SPECIAL',
  //   priority: 0,
  //   accuracy: 1,
  //   effects: {
  //     applyNonVolatileStatusConditions: {
  //       conditions: [{
  //         type: 'POISONED',
  //         chance: .4
  //       }]
  //     }
  //   }
  // },
  'Hex': {
    name: 'Hex',
    startingPP: 10,
    type: 'GHOST',
    power: 65,
    category: 'SPECIAL',
    effects: {
      doublePowerIfTargetHasStatus: { statuses: 'ANY' }
    }
  },
  'Dream Eater': {
    name: 'Dream Eater',
    startingPP: 15,
    type: 'PSYCHIC',
    power: 100,
    category: 'SPECIAL',
    effects: {
      drain: {percent: .5},
      failIfTargetDoesntHaveStatus: { statuses: ['ASLEEP'] }
    }
  },
  'Venoshock': {
    name: 'Venoshock',
    startingPP: 10,
    type: 'POISON',
    power: 65,
    category: 'SPECIAL',
    priority: 0,
    accuracy: 1,
    effects: {
      doublePowerIfTargetHasStatus: { statuses: ['POISONED', 'BADLY POISONED'] }
    }
  },
  'Blaze Kick': {
    name: 'Blaze Kick',
    startingPP: 10,
    type: 'FIRE',
    power: 85,
    category: 'PHYSICAL',
    priority: 0,
    accuracy: .9,
    effects: {
      applyNonVolatileStatusConditions: {
        conditions: [{type: 'BURNED', chance: .1}]
      },
      increaseCritical: { percent: 1/8 }
    }
  },
  'Low Sweep': {
    name: 'Low Sweep',
    startingPP: 20,
    type: 'FIGHTING',
    power: 65,
    category: 'PHYSICAL',
    priority: 0,
    accuracy: 1,
    effects: {
      modifyStages: {
        modifiers: [{ userOrTarget: 'TARGET', stageStat: 'speed', stages: -1, chance: 1}]
      }
    },
    soundEffect: 'attack_generic.mp3'
  },
  'Earthquake': {
    name: 'Earthquake',
    startingPP: 10,
    type: 'GROUND',
    power: 100,
    category: 'PHYSICAL',
    accuracy: 1,
    soundEffect: 'attack_ground_long.mp3',
    makesContact: false
  },
  'X-Scissor': {
    name: 'X-Scissor',
    startingPP: 15,
    type: 'BUG',
    power: 80,
    category: 'PHYSICAL',
    accuracy: 1,
    soundEffect: 'attack_slash_special.mp3'
  },
  'Boomburst': {
    name: 'Boomburst',
    startingPP: 10,
    type: 'NORMAL',
    power: 140,
    category: 'SPECIAL',
    soundEffect: 'attack_ground_long.mp3',
    soundBased: true,
  },
  'Hyper Voice': {
    name: 'Hyper Voice',
    startingPP: 10,
    type: 'NORMAL',
    power: 90,
    category: 'SPECIAL',
    // TOOD: different sound effect?
    soundEffect: 'attack_ground_long.mp3',
    soundBased: true,
  },
  'Guillotine': {
    name: 'Guillotine',
    startingPP: 5,
    type: 'NORMAL',
    category: 'PHYSICAL',
    accuracy: .3,
    effects: {
      oneHitKnockout: true
    },
    description: `One hit knockout. Fails if the target's level is higher than the user.`,
    soundEffect: 'attack_guillotine.mp3'
  },
  'Horn Drill': {
    name: 'Horn Drill',
    startingPP: 5,
    type: 'NORMAL',
    category: 'PHYSICAL',
    accuracy: .3,
    effects: {
      oneHitKnockout: true
    },
    description: `One hit knockout. Fails if the target's level is higher than the user.`,
  },
  'Fissure': {
    name: 'Fissure',
    startingPP: 5,
    type: 'GROUND',
    category: 'PHYSICAL',
    accuracy: .3,
    effects: {
      oneHitKnockout: true
    },
    description: `One hit knockout. Fails if the target's level is higher than the user.`,
    soundEffect: 'attack_ground_long.mp3'
  },
  'Sheer Cold': {
    name: 'Sheer Cold',
    startingPP: 5,
    type: 'ICE',
    category: 'SPECIAL',
    accuracy: .3,
    effects: {
      oneHitKnockout: true,
      noEffectOnType: { type: 'ICE' }
    },
    description: `One hit knockout (except ICE types). Fails if the target's level is higher than the user.`,
    soundEffect: 'attack_ice_shards.mp3'
  },
  'Calm Mind': {
    name: 'Calm Mind',
    startingPP: 20,
    type: 'PSYCHIC',
    category: 'STATUS', 
    soundEffect: 'status_buff.mp3',
    effects: {
       modifyStages: {
         modifiers: [
           {userOrTarget: 'USER', stageStat: 'specialAttack', stages: 1, chance: 1},
           {userOrTarget: 'USER', stageStat: 'specialDefense', stages: 1, chance: 1}
         ]
       }
    }
  },
  'Dragon Dance': {
    name: 'Dragon Dance',
    startingPP: 20,
    type: 'DRAGON',
    category: 'STATUS', 
    soundEffect: 'status_buff.mp3',
    effects: {
       modifyStages: {
         modifiers: [
           {userOrTarget: 'USER', stageStat: 'attack', stages: 1, chance: 1},
           {userOrTarget: 'USER', stageStat: 'speed', stages: 1, chance: 1}
         ]
       }
    }
  },
  'Swords Dance': {
    name: 'Swords Dance',
    startingPP: 20,
    type: 'NORMAL',
    category: 'STATUS',
    soundEffect: 'status_swords_dance.mp3',
    effects: {
      modifyStages: {
        modifiers: [{
          userOrTarget: 'USER',
          stageStat: 'attack',
          stages: 2,
          chance: 1,
        }]
      }
    }
  },
}