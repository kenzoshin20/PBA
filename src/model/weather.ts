import { Pokemon } from "./pokemon"

export type Weather = 'CLEAR_SKIES' | 'HARSH_SUNLIGHT' | 
    'RAIN' | 'SANDSTORM' | 'HAIL'

export const DEFAULT_WEATHER: Weather = 'CLEAR_SKIES'

export const weatherDescriptions: Record<Weather, string> = {
    'CLEAR_SKIES': 'Clear Skies',
    'HARSH_SUNLIGHT': 'Harsh Sunlight',
    'RAIN': 'Rain',
    'SANDSTORM': 'Sandstorm',
    'HAIL': 'Hail'
}

export function isWeatherSuppressed(pokemon1: Pokemon, pokemon2: Pokemon): boolean {
    return pokemon1.ability?.suppressWeather === true || pokemon2.ability?.suppressWeather === true
}