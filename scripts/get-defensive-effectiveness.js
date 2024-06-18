import https from 'https'
import { effectivenessMappings } from '../build/model/type.js'

async function main() {
    const mappings = {}
    const types = Object.keys(effectivenessMappings)
    for (const type of types) {
        const url = `https://pokeapi.co/api/v2/type/${type.toLowerCase()}/`
        const data = await getData(url)
        const mapping = {}
        mapping.effective = data.double_damage_from.map(el => el.name.toUpperCase())
        mapping.notEffective = data.half_damage_from.map(el => el.name.toUpperCase())
        mapping.noEffect = data.no_damage_from.map(el => el.name.toUpperCase())
        mappings[type] = mapping
    }

    console.log(mappings)
}

function getData(url) {
    return new Promise(resolve => {
        https.get(url, function(res){
            var body = '';
        
            res.on('data', function(chunk){
                body += chunk;
            });
        
            res.on('end', function(){
                var json = JSON.parse(body);
                resolve(json.damage_relations)
            });
        }).on('error', function(e){
              console.log("Got an error: ", e);
        })
    }) 
}

main()
