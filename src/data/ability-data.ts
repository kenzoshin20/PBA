import { AbilityDefinition } from "../model/ability-definition"

export type AbilityName = keyof typeof abilities

export const abilities: Record<string, AbilityDefinition> = {
  'Imposter': {
    name: 'Imposter',
    desc: 'Transforms itself into the Pokémon it is facing.',
    transformIntoTarget: true
  },
  'Compound Eyes': {
    name: 'Compound Eyes',
    desc: `Increases the Pokémon's accuracy by 30%.`,
    increaseUserAccuracy: {
      percent: .3
    }
  },
  'Victory Star': {
    name: 'Victory Star',
    desc: `Increases the Pokémon's accuracy by 10%.`,
    increaseUserAccuracy: {
      percent: .1
    }
  },
  'Skill Link': {
    name: 'Skill Link',
    desc: 'Maximizes the number of times multistrike moves hit.',
    multiHitMax: true
  },
  'Inner Focus': {
    name: 'Inner Focus',
    desc: 'Prevents the Pokémon from flinching.',
    preventFlinching: true
  },
  'Sturdy': {
    name: 'Sturdy',
    desc: 'Cannot be knocked out with one hit.',
    preventOHKO: true
  },
  'Levitate': {
    name: 'Levitate',
    desc: 'Lets the Pokémon avoid GROUND attacks and spikes.',
    raised: true
  },
  'Static': {
    name: 'Static',
    desc: 'Contact with the Pokémon may paraylze the attacker.',
    receivingContactInflictsStatus: { status: 'PARALYZED' }
  },
  'Flame Body': {
    name: 'Flame Body',
    desc: 'Contact with the Pokémon may burn the attacker.',
    receivingContactInflictsStatus: { status: 'BURNED' }
  },
  'Poison Point': {
    name: 'Poison Point',
    desc: 'Contact with the Pokémon may poison the attacker.',
    receivingContactInflictsStatus: { status: 'POISONED' }
  },
  'Rock Head': {
    name: 'Rock Head',
    desc: 'Protects the Pokémon from recoil damage',
    preventRecoil: true
  },
  'Immunity': {
    name: 'Immunity',
    desc: 'Prevents the Pokémon from being poisoned.',
    preventStatus: { statuses: ['POISONED', 'BADLY POISONED'] }
  },
  'Insomnia': {
    name: 'Insomnia',
    desc: 'Prevents the Pokémon from falling asleep.',
    preventStatus: { statuses: ['ASLEEP'] }
  },
  'Limber': {
    name: 'Limber',
    desc: 'Prevents the Pokémon from being paralyzed.',
    preventStatus: { statuses: ['PARALYZED'] }
  },
  'Shell Armor': {
    name: 'Shell Armor',
    desc: 'Prevents the Pokémon from receiving a critical hit.',
    preventRecievingCrit: true
  },
  'Battle Armor': {
    name: 'Battle Armor',
    desc: 'Prevents the Pokémon from receiving a critical hit.',
    preventRecievingCrit: true
  },
  'Technician': {
    name: 'Technician',
    desc: 'Increases the power of moves that are usually 60 or less by 50%.',
    boostLowPowerMoves: true
  },
  'Filter': {
    name: 'Filter',
    desc: 'Reduces the damage taken from super-effective attacks by 25%.',
    reduceDamageFromReceivingSuperEffective: true
  },
  'Magic Guard': {
    name: 'Magic Guard',
    desc: 'Protects the Pokémon from indirect damage, such as poison or spikes.',
    preventIndirectDamage: true
  },
  'Flash Fire': {
    name: 'Flash Fire',
    desc: `When hit by a FIRE move, doesn't take damage but instead raises the power of the bearer's FIRE moves by 50%.`,
    buffFromAttackType: { type: 'FIRE' }
  },
  'Water Absorb': {
    name: 'Water Absorb',
    desc: `Heals 1⁄4 of its maximum HP when hit by a WATER attack.`,
    healFromAttackType: { type: 'WATER' }
  },
  'Volt Absorb': {
    name: 'Volt Absorb',
    desc: `Heals 1⁄4 of its maximum HP when hit by an ELECTRIC attack.`,
    healFromAttackType: { type: 'ELECTRIC' }
  },
  'Natural Cure': {
    name: 'Natural Cure',
    desc: `Heals status problems upon switching out.`,
    removeStatusOnSwitch: true
  },
  'Regenerator': {
    name: 'Regenerator',
    desc: `Restores 1/3 of its maximum HP upon switching out.`,
    healOnSwitch: true
  },
  'Intimidate': {
    name: 'Intimidate',
    desc: `Lower's the opponent's attack when the ability-bearer switches in.`,
    lowerEnemyStatOnSwitchIn: { stat: 'attack' }
  },
  'Torrent': {
    name: 'Torrent',
    desc: `Increases the power of WATER type moves by 50% when the ability-bearer's HP falls below 1/3 of its max.`,
    pinchBoostForType: { type: 'WATER' }
  },
  'Blaze': {
    name: 'Blaze',
    desc: `Increases the power of FIRE type moves by 50% when the ability-bearer's HP falls below 1/3 of its max.`,
    pinchBoostForType: { type: 'FIRE' }
  },
  'Overgrow': {
    name: 'Overgrow',
    desc: `Increases the power of GRASS type moves by 50% when the ability-bearer's HP falls below 1/3 of its max.`,
    pinchBoostForType: { type: 'GRASS' }
  },
  'Swarm': {
    name: 'Swarm',
    desc: `Increases the power of BUG type moves by 50% when the ability-bearer's HP falls below 1/3 of its max.`,
    pinchBoostForType: { type: 'BUG' }
  },
  'Keen Eye': {
    name: 'Keen Eye',
    desc: `Prevents the Pokémon from losing accuracy.`,
    preventLoweringStats: { stats: ['accuracy'] }
  },
  'Hyper Cutter': {
    name: 'Hyper Cutter',
    desc: `Prevents the Pokémon from losing attack.`,
    preventLoweringStats: { stats: ['attack'] }
  },
  'Pressure': {
    name: 'Pressure',
    desc: `Enemy attacks use 2 PP instead of 1.`,
    enemyUsesExtraPP: true
  },
  'Guts': {
    name: 'Guts',
    desc: `Raises attack by 50% when inflicted by a status condition.`,
    boostAttackWhenHavingStatus: true
  },
  'Marvel Scale': {
    name: 'Marvel Scale',
    desc: `Raises defense by 50% when inflicted by a status condition.`,
    boostDefenseWhenHavingStatus: true
  },
  'Synchronize': {
    name: 'Synchronize',
    desc: `If the opponent burns, paralyzes or poisons the ability-bearer, the opponent receives the status condition too.`,
    syncStatus: true
  },
  'Arena Trap': {
    name: 'Arena Trap',
    desc: `Prevents the opponent from switching out. Doesn't work on FLYING types.`,
    preventNonRaisedEnemySwitching: true
  },
  'Shadow Tag': {
    name: 'Shadow Tag',
    desc: `Prevents the opponent from switching out. Doesn't work on GHOST types.`,
    preventNonGhostEnemySwitching: true
  },
  'Early Bird': {
    name: 'Early Bird',
    desc: `Awakens early from sleep.`,
    wakeUpEarly: true
  },
  'Huge Power': {
    name: 'Huge Power',
    desc: `This Pokémon's Attack is doubled.`,
    doubleAttack: true
  },
  'Prankster': {
    name: 'Prankster',
    desc: `Increases the priority of status moves by 1.`,
    increasePriorityOfStatusMoves: true
  },
  'Rough Skin': {
    name: 'Rough Skin',
    desc: `Contact with the Pokémon inflicts damage equal to 1⁄8 of the attacker's max HP.`,
    receivingContactDoesDamage: { percent: 1/8 }
  },
  'Iron Barbs': {
    name: 'Iron Barbs',
    desc: `Contact with the Pokémon inflicts damage equal to 1⁄8 of the attacker's max HP.`,
    receivingContactDoesDamage: { percent: 1/8 }
  },
  'Shed Skin': {
    name: 'Shed Skin',
    desc: `1/3 chance to heal status problems at the end of each turn.`,
    chanceToRemoveUserStatusAtEndOfTurn: true
  },
  'Truant': {
    name: 'Truant',
    desc: `Can’t attack on consecutive turns.`,
    truant: true
  },
  'Weak Armor': {
    name: 'Weak Armor',
    desc: `Being hit by physical attacks lowers Defense but sharply raises Speed.`,
    weakArmor: true
  },
  'Multiscale': {
    name: 'Multiscale',
    desc: `Reduces damage by half when the Pokémon's HP is full.`,
    reduceDamageWhenHpIsFull: true
  },
  'Iron Fist': {
    name: 'Iron Fist',
    desc: `Increases the power of punching moves by 20%.`,
    boostPunches: true
  },
  'Wonder Guard': {
    name: 'Wonder Guard',
    desc: `Prevents damage from attacks unless they are super effective (FIRE, FLYING, ROCK, GHOST and DARK).`,
    wonderGuard: true
  },
  'Poison Touch': {
    name: 'Poison Touch',
    desc: `When this Pokémon hits with a move that makes contact, 30% to poison the target.`,
    attackingWithContactInflictsStatus: { status: 'POISONED' }
  },
  'Sheer Force': {
    name: 'Sheer Force',
    desc: `Increases the power of moves that have beneficial secondary effects by 30%, but removes those effects.`,
    sheerForce: true
  },
  'Soundproof': {
    name: 'Soundproof',
    desc: `Immune to sound-based moves such as Hyper Voice, Boomburst, Roar, Snore and Bug Buzz.`,
    soundProof: true
  },
  'Mummy': {
    name: 'Mummy',
    desc: `Contact with this Pokémon changes the attacker's ability to Mummy.`,
    receivingContactGivesAbility: true
  },
  'Stance Change': {
    name: 'Stance Change',
    desc: `Transforms into Blade Form before attacking and transforms into Shield Form before using King's Shield.`,
    stanceChange: true
  },
  'Bad Dreams': {
    name: 'Bad Dreams',
    desc: `Damages sleeping enemies at the end of the turn.`,
    damageSleepingEnemy: true
  },
  'Sand Force': {
    name: 'Sand Force',
    desc: `Raises the power of GROUND, ROCK and STEEL type moves by 30% during a sandstorm.`,
    sandForce: true
  },
  'Clear Body': {
    name: 'Clear Body',
    desc: `Prevents other Pokémon from lowering its stats.`,
    preventLoweringStats: {
      stats: 'ANY'
    }
  },
  'Download': {
    name: 'Download',
    desc: `Raises attack or special attack based on enemy's defenses.`,
    raiseAttackOrSpecialAttackOnSwitchIn: true
  },
  'Ice Body': {
    name: 'Ice Body',
    desc: `Recovers 1/16 of its maximum HP during hail at the end of each turn.`,
    healDuringWeather: 'HAIL'
  },
  'Rain Dish': {
    name: 'Rain Dish',
    desc: `Recovers 1/16 of its maximum HP during rain at the end of each turn.`,
    healDuringWeather: 'RAIN'
  },
  'Chlorophyll': {
    name: 'Chlorophyll',
    desc: `Doubles speed during harsh sunlight.`,
    doubleSpeedDuringWeather: 'HARSH_SUNLIGHT'
  },
  'Sand Rush': {
    name: 'Sand Rush',
    desc: `Doubles speed during a sandstorm.`,
    doubleSpeedDuringWeather: 'SANDSTORM'
  },
  'Swift Swim': {
    name: 'Swift Swim',
    desc: `Doubles speed during the rain.`,
    doubleSpeedDuringWeather: 'RAIN'
  },
  'Snow Cloak': {
    name: 'Snow Cloak',
    desc: `Raises evasion by 20% during a hail storm.`,
    raiseEvasionDuringWeather: 'HAIL'
  },
  'Snow Warning': {
    name: 'Snow Warning',
    desc: `Creates a hail storm when the Pokémon enters battle that lasts 5 turns.`,
    applyWeatherOnSwitchIn: 'HAIL'
  },
  'Drizzle': {
    name: 'Drizzle',
    desc: `Creates a rain shower when the Pokémon enters battle that lasts 5 turns.`,
    applyWeatherOnSwitchIn: 'RAIN'
  },
  'Drought': {
    name: 'Drought',
    desc: `Creates harsh sunlight when the Pokémon enters battle that lasts 5 turns.`,
    applyWeatherOnSwitchIn: 'HARSH_SUNLIGHT'
  },
  'Sand Stream': {
    name: 'Sand Stream',
    desc: `Creates a sandstorm when the Pokémon enters battle that lasts 5 turns.`,
    applyWeatherOnSwitchIn: 'SANDSTORM'
  },
  'Serene Grace': {
    name: 'Serene Grace',
    desc: `Doubles the chance of secondary effects from occurring (stat changes, status changes, flinching).`,
    doubleChanceOfSecondaryEffects: true
  },
  'Speed Boost': {
    name: 'Speed Boost',
    desc: `Raises speed at the end of each turn.`,
    speedBoost: true
  },
  'Thick Fat': {
    name: 'Thick Fat',
    desc: `Reduces damage from FIRE and ICE type moves by 50%.`,
    thickFat: true
  },
  'Pixilate': {
    name: 'Pixilate',
    desc: `Causes all NORMAL moves used by the Pokémon to become FIARY type, and increase in power by 20%.`,
    pixilate: true
  },
  'Air Lock': {
    name: 'Air Lock',
    desc: `Suppresses effects brought on by weather, including move power increases, end-of-turn damage and abilities.`,
    suppressWeather: true
  },
} as const
