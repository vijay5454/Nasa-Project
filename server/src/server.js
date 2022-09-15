const http = require('http');
require('dotenv').config(); //it will apply to all subsequent imports from src code.
const {loadPlanetsData} = require('./models/planets.model');
const {mongoConnect} = require('./services/mongo');
const {loadLaunchData} = require('./models/launches.model');
const app = require('./app');


const PORT = process.env.PORT || 8000
const server = http.createServer(app);

async function startServer(){
    await mongoConnect();
    await loadPlanetsData();
    await loadLaunchData();
    server.listen(PORT, ()=>{
        console.log(`Listening on port ${PORT}...`);
    })    
}

startServer();



