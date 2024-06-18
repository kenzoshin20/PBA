import { AbilityDefinition } from "./ability-definition"
import { Pokemon } from "./pokemon"

export type Type = 'FIRE' | 'WATER' | 'GRASS' | 'ELECTRIC' | 'GROUND' | 
  'BUG' | 'POISON' | 'FIGHTING' | 'ROCK' | 'NORMAL' | 'FLYING' | 'ICE' | 
  'GHOST' | 'PSYCHIC' | 'DRAGON' | 'STEEL' | 'DARK' | 'FAIRY'

const effectivenessMappings: Record<Type, EffectivenessMapping> = {
  NORMAL: {
    hasNoEffectOn: ['GHOST'],
    weaknesses: ['ROCK', 'STEEL'],
    strengths: [],
  },
  FIRE: {
    hasNoEffectOn: [],
    weaknesses: ['FIRE', 'WATER', 'ROCK', 'DRAGON'],
    strengths: ['GRASS', 'ICE', 'BUG', 'STEEL'],
  },
  WATER: {
    hasNoEffectOn: [],
    weaknesses: ['WATER', 'GRASS', 'DRAGON'],
    strengths: ['FIRE', 'GROUND', 'ROCK'],
  },
  ELECTRIC: {
    hasNoEffectOn: ['GROUND'],
    weaknesses: ['ELECTRIC', 'GRASS', 'DRAGON'],
    strengths: ['WATER', 'FLYING'],
  },
  GRASS: {
    hasNoEffectOn: [],
    weaknesses: ['FIRE', 'GRASS', 'POISON', 'FLYING', 'BUG', 'DRAGON', 'STEEL'],
    strengths: ['WATER', 'GROUND', 'ROCK'],
  },
  ICE: {
    hasNoEffectOn: [],
    weaknesses: ['FIRE', 'WATER', 'ICE', 'STEEL'],
    strengths: ['GRASS', 'GROUND', 'FLYING', 'DRAGON'],
  },
  FIGHTING: {
    hasNoEffectOn: ['GHOST'],
    weaknesses: ['POISON', 'FLYING', 'PSYCHIC', 'BUG', 'FAIRY'],
    strengths: ['NORMAL', 'ICE', 'ROCK', 'DARK', 'STEEL'],
  },
  POISON: {
    hasNoEffectOn: ['STEEL'],
    weaknesses: ['POISON', 'GROUND', 'ROCK', 'GHOST'],
    strengths: ['GRASS', 'FAIRY'],
  },
  GROUND: {
    hasNoEffectOn: ['FLYING'],
    weaknesses: ['GRASS', 'BUG'],
    strengths: ['FIRE', 'ELECTRIC', 'POISON', 'ROCK', 'STEEL'],
  },
  FLYING: {
    hasNoEffectOn: [],
    weaknesses: ['ELECTRIC', 'ROCK', 'STEEL'],
    strengths: ['GRASS', 'FIGHTING', 'BUG'],
  },
  PSYCHIC: {
    hasNoEffectOn: ['DARK'],
    weaknesses: ['PSYCHIC', 'STEEL'],
    strengths: ['FIGHTING', 'POISON'],
  },
  BUG: {
    hasNoEffectOn: [],
    weaknesses: [
      'FIRE',
      'FIGHTING',
      'POISON',
      'FLYING',
      'GHOST',
      'STEEL',
      'FAIRY',
    ],
    strengths: ['GRASS', 'PSYCHIC', 'DARK'],
  },
  ROCK: {
    hasNoEffectOn: [],
    weaknesses: ['FIGHTING', 'GROUND', 'STEEL'],
    strengths: ['FIRE', 'ICE', 'FLYING', 'BUG'],
  },
  GHOST: {
    hasNoEffectOn: ['NORMAL'],
    weaknesses: ['DARK'],
    strengths: ['PSYCHIC', 'GHOST'],
  },
  DRAGON: {
    hasNoEffectOn: ['FAIRY'],
    weaknesses: ['STEEL'],
    strengths: ['DRAGON'],
  },
  DARK: {
    hasNoEffectOn: [],
    weaknesses: ['FIGHTING', 'DARK', 'FAIRY'],
    strengths: ['PSYCHIC', 'GHOST'],
  },
  STEEL: {
    hasNoEffectOn: [],
    weaknesses: ['FIRE', 'WATER', 'ELECTRIC', 'STEEL'],
    strengths: ['ICE', 'ROCK', 'FAIRY'],
  },
  FAIRY: {
    hasNoEffectOn: [],
    weaknesses: ['FIRE', 'POISON', 'STEEL'],
    strengths: ['FIGHTING', 'DRAGON', 'DARK'],
  }
}

interface EffectivenessMapping {
  hasNoEffectOn: Type[];
  weaknesses: Type[];
  strengths: Type[];
}

export const NO_EFFECT = 0
export const NOT_VERY_EFFECTIVE = 0.5
export const NORMALLY_EFFECTIVE = 1
export const SUPER_EFFECTIVE = 2
export const EXTREMELY_EFFECTIVE = 4

export function getTypeEffectiveness(
  moveType: Type,
  defendingTypes: Type[]
): number {
  if (defendingTypes.length === 0) {
    throw new Error('defendingTypes.length === 0')
  } else if (defendingTypes.length === 1) {
    return getSingleTypeEffectiveness(moveType, defendingTypes[0])
  } else {
    const firstEffectiveness = getSingleTypeEffectiveness(moveType, defendingTypes[0])
    const secondEffectiveness = getSingleTypeEffectiveness(moveType, defendingTypes[1])
    return firstEffectiveness * secondEffectiveness
  }
}

export function getSingleTypeEffectiveness(
  moveType: Type,
  defendingType: Type
): number {
  let moveTypeMapping = effectivenessMappings[moveType]
  if (moveTypeMapping.hasNoEffectOn.includes(defendingType)) {
    return NO_EFFECT
  } else if (moveTypeMapping.weaknesses.includes(defendingType)) {
    return NOT_VERY_EFFECTIVE
  } else if (moveTypeMapping.strengths.includes(defendingType)) {
    return SUPER_EFFECTIVE
  } else {
    return NORMALLY_EFFECTIVE
  }
}

export function getEffectivenessMapping(moveType: Type): EffectivenessMapping {
  return effectivenessMappings[moveType]
}

export function getPokemonEffectiveness(attackingPokemon: Pokemon, defendingPokemon: Pokemon) {
  let effectiveness = getTypeEffectiveness(attackingPokemon.types[0], defendingPokemon.types)
  if (attackingPokemon.types.length > 1) {
    effectiveness *= getTypeEffectiveness(attackingPokemon.types[1], defendingPokemon.types)
  }
  return effectiveness
}

export type DefensiveEffectiveness = {
  effective: Type[],
  notEffective: Type[],
  noEffect: Type[],
}

const defensiveEffectivenessMappings: Record<Type, DefensiveEffectiveness> = {
  NORMAL: {
    effective: [ 'FIGHTING' ],
    notEffective: [],
    noEffect: [ 'GHOST' ]
  },
  FIRE: {
    effective: [ 'GROUND', 'ROCK', 'WATER' ],
    notEffective: [ 'BUG', 'STEEL', 'FIRE', 'GRASS', 'ICE', 'FAIRY' ],
    noEffect: []
  },
  WATER: {
    effective: [ 'GRASS', 'ELECTRIC' ],
    notEffective: [ 'STEEL', 'FIRE', 'WATER', 'ICE' ],
    noEffect: []
  },
  ELECTRIC: {
    effective: [ 'GROUND' ],
    notEffective: [ 'FLYING', 'STEEL', 'ELECTRIC' ],
    noEffect: []
  },
  GRASS: {
    effective: [ 'FLYING', 'POISON', 'BUG', 'FIRE', 'ICE' ],
    notEffective: [ 'GROUND', 'WATER', 'GRASS', 'ELECTRIC' ],
    noEffect: []
  },
  ICE: {
    effective: [ 'FIGHTING', 'ROCK', 'STEEL', 'FIRE' ],
    notEffective: [ 'ICE' ],
    noEffect: []
  },
  FIGHTING: {
    effective: [ 'FLYING', 'PSYCHIC', 'FAIRY' ],
    notEffective: [ 'ROCK', 'BUG', 'DARK' ],
    noEffect: []
  },
  POISON: {
    effective: [ 'GROUND', 'PSYCHIC' ],
    notEffective: [ 'FIGHTING', 'POISON', 'BUG', 'GRASS', 'FAIRY' ],
    noEffect: []
  },
  GROUND: {
    effective: [ 'WATER', 'GRASS', 'ICE' ],
    notEffective: [ 'POISON', 'ROCK' ],
    noEffect: [ 'ELECTRIC' ]
  },
  FLYING: {
    effective: [ 'ROCK', 'ELECTRIC', 'ICE' ],
    notEffective: [ 'FIGHTING', 'BUG', 'GRASS' ],
    noEffect: [ 'GROUND' ]
  },
  PSYCHIC: {
    effective: [ 'BUG', 'GHOST', 'DARK' ],
    notEffective: [ 'FIGHTING', 'PSYCHIC' ],
    noEffect: []
  },
  BUG: {
    effective: [ 'FLYING', 'ROCK', 'FIRE' ],
    notEffective: [ 'FIGHTING', 'GROUND', 'GRASS' ],
    noEffect: []
  },
  ROCK: {
    effective: [ 'FIGHTING', 'GROUND', 'STEEL', 'WATER', 'GRASS' ],
    notEffective: [ 'NORMAL', 'FLYING', 'POISON', 'FIRE' ],
    noEffect: []
  },
  GHOST: {
    effective: [ 'GHOST', 'DARK' ],
    notEffective: [ 'POISON', 'BUG' ],
    noEffect: [ 'NORMAL', 'FIGHTING' ]
  },
  DRAGON: {
    effective: [ 'ICE', 'DRAGON', 'FAIRY' ],
    notEffective: [ 'FIRE', 'WATER', 'GRASS', 'ELECTRIC' ],
    noEffect: []
  },
  DARK: {
    effective: [ 'FIGHTING', 'BUG', 'FAIRY' ],
    notEffective: [ 'GHOST', 'DARK' ],
    noEffect: [ 'PSYCHIC' ]
  },
  STEEL: {
    effective: [ 'FIGHTING', 'GROUND', 'FIRE' ],
    notEffective: [
      'NORMAL',  'FLYING',
      'ROCK',    'BUG',
      'STEEL',   'GRASS',
      'PSYCHIC', 'ICE',
      'DRAGON',  'FAIRY'
    ],
    noEffect: [ 'POISON' ]
  },
  FAIRY: {
    effective: [ 'POISON', 'STEEL' ],
    notEffective: [ 'FIGHTING', 'BUG', 'DARK' ],
    noEffect: [ 'DRAGON' ]
  }
}

export function getDefensiveEffectivenessForTypes(types: Type[], ability?: AbilityDefinition): DefensiveEffectiveness {
  let first = {
    effective: [...defensiveEffectivenessMappings[types[0]].effective],
    notEffective: [...defensiveEffectivenessMappings[types[0]].notEffective],
    noEffect: [...defensiveEffectivenessMappings[types[0]].noEffect],
  }
  if (types.length > 1) {
    let second = defensiveEffectivenessMappings[types[1]]
    second.effective.forEach(t => {
      if (first.notEffective.includes(t)) {
        first.notEffective = first.notEffective.filter(ft => ft !== t)
      } else if (!first.effective.includes(t) && !first.noEffect.includes(t)) {
        first.effective.push(t)
      }
    })
    second.notEffective.forEach(t => {
      if (first.effective.includes(t)) {
        first.effective = first.effective.filter(ft => ft !== t)
      } else if (!first.notEffective.includes(t) && !first.noEffect.includes(t)) {
        first.notEffective.push(t)
      }
    })
    second.noEffect.forEach(t => {
      noEffect(first, t)
    })
  }
  if (ability?.raised) {
    noEffect(first, 'GROUND')
  }
  if (ability?.buffFromAttackType) {
    noEffect(first, ability.buffFromAttackType.type)
  }
  if (ability?.healFromAttackType) {
    noEffect(first, ability.healFromAttackType.type)
  }
  if (ability?.wonderGuard) {
    [
      'NORMAL', 'WATER', 'ELECTRIC', 'GRASS', 'ICE', 'FIGHTING', 'POISON', 'GROUND', 
      'PSYCHIC', 'BUG', 'DRAGON', 'STEEL', 'FAIRY'
    ].forEach(t => noEffect(first, t as Type))
  }
  return first
}

function noEffect(mapping: DefensiveEffectiveness, type: Type) {
  if (!mapping.noEffect.includes(type)) {
    mapping.noEffect.push(type)
  }
  if (mapping.effective.includes(type)) {
    mapping.effective = mapping.effective.filter(ft => ft !== type)
  }
  if (mapping.notEffective.includes(type)) {
    mapping.notEffective = mapping.notEffective.filter(ft => ft !== type)
  }
}