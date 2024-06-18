import {speciesList} from '../build/data/pokemon-data.js'

console.log('Species count: ', speciesList.length)

const typeCounts = {}

speciesList.forEach(s => {
  for (const type of s.types) {
    if (!typeCounts[type]) {
      typeCounts[type] = 0
    }
    typeCounts[type] += 1
  }
})

const entries = Object.entries(typeCounts)
entries.sort((a, b) => {
  return b[1] - a[1]
})
for (const entry of entries) {
  const type = entry[0]
  const count = entry[1]
  const paddedType = type.padStart(10, ' ')
  console.log(`${paddedType}: ${count}`);
}