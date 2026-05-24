require('dotenv').config();
const  request = require('supertest');
const app = require('../../app');
const { mongoConnect,mongoDisconnect } = require('../../services/mongo');

describe('Launches API',() =>{  
    beforeAll(async () =>{
        await mongoConnect();
    });

describe('test GET /launches',() =>{
    test('it should respond with 200 success',async () =>{
        const response = await request(app).get('/v1/launches');
        expect(response.status).toBe(200);
    });
})

describe('test POST /launches',() =>{
    const completeLaunchData = {
        mission: 'USS Enterprise',
        rocket: 'NCC 1701-D',
        target: 'Kepler-62 f',
        launchDate: 'January 4, 2028',
    };

    test('it should respond with 201 created',async () =>{
        const response = await request(app).post('/v1/launches').send(completeLaunchData);
        expect(response.status).toBe(201);
    });

    test('it should catch missing required properties',async () =>{
        const response = await request(app).post('/v1/launches').send(
            {
                mission: 'USS Enterprise',
                rocket: 'NCC 1701-D',
                target: 'Kepler-62 f'
            }
        );
        expect(response.status).toBe(400);
    });

    test('it should catch invalid dates',async () =>{
        const response = await request(app).post('/v1/launches').send({
            mission: 'USS Enterprise',
            rocket: 'NCC 1701-D',
            target: 'Kepler-62 f',
            launchDate: 'invalid date',
        });
        expect(response.status).toBe(400);
    });

})

describe('test DELETE /launches/:id',() =>{
    test('it should respond with 200 success',async () =>{
        const response = await request(app).delete('/v1/launches/100');
        expect(response.status).toBe(200);
    }); 
})

afterAll(async () =>{
    await mongoDisconnect();
});

})