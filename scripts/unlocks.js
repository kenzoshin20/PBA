import { speciesList } from '../build/data/pokemon-data.js'
import { leagueTrainers } from '../build/model/league.js'
import { defaultUnlockedPokemon } from '../build/data/default-pokemon-data.js'

let dexNumbers = speciesList.map(s => s.pokedexNumber).filter(n => !defaultUnlockedPokemon.includes(n))
leagueTrainers.forEach(trainer => {
    trainer.rewards.forEach(reward => {
        if (defaultUnlockedPokemon.includes(reward)) {
            return
        }
        if (dexNumbers.includes(reward)) {
            dexNumbers = dexNumbers.filter(n => n !== reward)
        } else {
            throw new Error("Reward not found! " + reward)
        }
    })
})

if (dexNumbers.length > 0) {
    console.log('!!!!!!!!!!!')
    console.log('!!!!!!!!!!!')
    console.log('!!!!!!!!!!!')
    console.log('!!!!!!!!!!!')
    console.log(dexNumbers.length + ' left')
    dexNumbers.forEach(n => console.log(n))
    console.log('!!!!!!!!!!!')
    console.log('!!!!!!!!!!!')
    console.log('!!!!!!!!!!!')
    console.log('!!!!!!!!!!!')
} else {
    console.log('Unlocks check passed')
}

// Default export for verify.js
export default {}