# Pokémon Battle Arena

https://www.pokemon-battle-arena.com/

A browser-based Pokémon battle game. 

## Tech Stack
* [Nuro](https://github.com/jegan321/nuro) for the front-end
* Node.js and Express for the back-end
* PostgreSQL for the database
* TypeScript on both FE and BE

## To Run
1. Make sure you have PostgreSQL installed
2. Create a database called `pmba`
3. Create a file called `.env` in the root of this project with your database config:
```
DATABASE_URL=postgresql://<USER>:<PASSWORD>@localhost:5432/pmba
DATABASE_USE_SSL=false
```
4. Build and start the app
```bash
npm install
npm start
```

## Credit
All sprites come from [Pokémon Showdown!](https://pokemonshowdown.com/)
