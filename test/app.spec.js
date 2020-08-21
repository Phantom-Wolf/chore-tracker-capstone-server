// imports

const app = require('../src/app');

// test

describe('App', () => {
	it('GET / response with 200 containing "Hello, onTrack"', () => {
		return supertest(app)
			.get('/')
			.expect(200, 'Hello, onTrack!');
	});
});
