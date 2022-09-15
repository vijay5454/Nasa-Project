const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');
const axios = require('axios');

const launches = new Map();
const DEFAULT_NUMBER = 100;
const SPACEX_URL = 'https://api.spacexdata.com/v4/launches/query';

async function saveLaunch(launch){
    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber
    }, launch, {
        upsert: true
    })
}

async function findLaunch(filter){
    return await launchesDatabase.findOne(filter);
}

async function populateLaunches(){
    console.log('Downloading Data...');
    const response = await axios.post(SPACEX_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name : 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        customers: 1
                    }
                }
            ]
        }
    });
    if(response.status !== 200){
        throw new Error('Problem in downloading SpaceX Data');
    }
    const launchDocs = response.data.docs;
    for (const launch of launchDocs){
        const payLoads = launch.payloads;
        const customers = payLoads.flatMap((payload)=>{
            return payload['customers'];
        });
        const filteredLaunch = {
            flightNumber: launch['flight_number'],
            mission: launch['name'],
            rocket: launch['rocket']['name'],
            launchDate: launch['date_local'],
            upcoming: launch['upcoming'],
            success: launch['success'],
            customers
        };
        console.log(`${filteredLaunch.flightNumber} ${filteredLaunch.mission}`);
        await saveLaunch(filteredLaunch);
    }
}

//minimize api load
async function loadLaunchData(){
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat',
    });
    if(firstLaunch){
        console.log('Launch Data already Loaded!');
    }
    else{
        await populateLaunches();
    }
}
async function getLatestFlightNumber(){
    //for Auto-Increment
    const latestLaunch = await launchesDatabase.findOne().sort('-flightNumber');
    if(!latestLaunch){
        return DEFAULT_NUMBER
    }
    return latestLaunch.flightNumber;
}

async function scheduleNewLaunch(launch){
    //for Referential Integrity
    const planet = await planets.findOne({
        kepler_name: launch.target
    });
    if(!planet){
        throw new Error('Matching Planet doesn\'t found.');
    }
    const latestFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(launch, {
        upcoming: true,
        success: true,
        customers: ['Vijay', 'NASA'],
        flightNumber: latestFlightNumber,
    });
    await saveLaunch(newLaunch);
}
async function getAllLaunches(skip, limit){
    return await launchesDatabase.find({}, {
        '_id': 0, '__v': 0
    }).sort({
        flightNumber: 1,
    }).skip(skip).limit(limit);
}

async function existsLaunchWithId(launchId){
    return await findLaunch({
        flightNumber: launchId,
    });
}

async function abortLaunchById(launchId){
    const aborted = await launchesDatabase.updateOne({
        flightNumber: launchId,
    }, {
        upcoming: false,
        success: false,
    });
    return aborted.modifiedCount === 1;
}

module.exports ={
    loadLaunchData,
    scheduleNewLaunch,
    getAllLaunches,
    existsLaunchWithId,
    abortLaunchById,
}