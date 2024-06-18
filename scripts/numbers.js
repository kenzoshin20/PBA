import {speciesList} from '../build/data/pokemon-data.js'


const sorted = [...speciesList].sort((a,b)=> a.pokedexNumber - b.pokedexNumber)
sorted.forEach(s => {
    console.log(s.pokedexNumber + ', ' + '// ' + s.name)
})