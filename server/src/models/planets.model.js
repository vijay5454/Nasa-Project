const fs = require('fs');
const path = require('path');
const planets = require('./planets.mongo');
const {parse} = require('csv-parse');

//Don't edit too much part so that won't get confused.


function isHabitablePlanet(planet){
    return planet['koi_disposition'] === 'CONFIRMED' && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.1
    && planet['koi_prad'] < 1.6;
}

function loadPlanetsData(){
    return new Promise((resolve, reject)=>{
        fs.createReadStream(path .join(__dirname, '..','..','data','kepler_data1.csv'))
            .pipe(parse({
                comment: '#',
                columns: true,
            }))
            .on('data', (data)=>{
                if(isHabitablePlanet(data)){
                    // habitablePlanets.push(data);
                    //TODO: Replace below code with upsert expression. insert + update = upsert
                    // planets.create({
                    //     keplerName: data.kepler_name,
                    // });
                    savePlanets(data);
                }
            })
            .on('error', (err)=>{
                console.log(err);
                reject(err);
            })
            .on('end', async ()=>{
                // console.log(habitablePlanets.map((planet)=>{
                //     return planet['kepler_name'];
                // }))
                // habitablePlanets.map((planet)=>{
                //     console.log(planet['kepler_name']);
                // }) 
                const countPlanets = (await getAllPlanets()).length;       
                console.log(`${countPlanets} habitual planets found!`);
                console.log('Done!');
                resolve();
            });
    });
}

async function getAllPlanets(){
    return await planets.find({}, {
        '_id': 0, '__v': 0,
    });
}
async function savePlanets(planet){
    try{
        await planets.updateOne({
            kepler_name: planet.kepler_name,
        }, {
            kepler_name: planet.kepler_name,
        }, {
            upsert: true,
        })
    }
    catch(err){
        console.error(`Could not save the planet ${err}`);
    }
}
module.exports = {
    loadPlanetsData,
    getAllPlanets,
}