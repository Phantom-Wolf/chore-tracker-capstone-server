// imports

const app = require('../src/app');

// test

describe('App', () => {
	it('GET / response with 200 containing "Hello, boilerplate"', () => {
		return supertest(app)
			.get('/')
			.expect(200, 'Hello, boilerplate!');
	});
});
