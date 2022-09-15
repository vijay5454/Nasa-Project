
const app = require('../../app');
const request = require('supertest');
const {mongoConnect, mongoDisconnect} = require('../../services/mongo');

describe('Launch API', ()=>{
    beforeAll(async ()=>{
        await mongoConnect();
    });
    afterAll(async ()=>{
        await mongoDisconnect();
    });
    describe('Test GET/launches', ()=>{
        test('It should respond with 200 success', async()=>{
            const response = await request(app)
            .get('/v1/launches')
            .expect(200);
        });
    });
    describe('Test POST/launches', ()=>{
        const completeLaunchData = {
            mission: 'Vj\'s mission',
            target: 'Kepler-62 f',
            rocket: 'Vj\'s Rocket',
            launchDate: 'November 6, 1998'
        };
        const launchDataWithoutDate = {
            mission: 'Vj\'s mission',
            target: 'Kepler-62 f',
            rocket: 'Vj\'s Rocket'
        };
        const launchDataInvalidDate = {
            mission: 'Vj\'s mission',
            target: 'Kepler-62 f',
            rocket: 'Vj\'s Rocket',
            launchDate: 'Hello'
        };
        test('It should respond with 200 success', async()=>{
            const response = await request(app)
            .post('/v1/launches')
            .send(completeLaunchData)
            .expect('Content-Type', /json/)
            .expect(201);
    
            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
            expect(responseDate).toBe(requestDate);
            expect(response.body).toMatchObject(launchDataWithoutDate);
        });
        test('It should check missing required properties', async()=>{
            const response = await request(app)
            .post('/v1/launches')
            .send(launchDataWithoutDate)
            .expect('Content-Type', /json/)
            .expect(400);
    
            expect(response.body).toStrictEqual({
                error: "Missing Property Please Check",
            });
    
        });
        test('It should check invalid Dates', async()=>{
            const response = await request(app)
            .post('/v1/launches')
            .send(launchDataInvalidDate)
            .expect('Content-Type', /json/)
            .expect(400);
    
            expect(response.body).toStrictEqual({
                error: "Invalid Launch Date",
            });
    
        });
    });    
});

