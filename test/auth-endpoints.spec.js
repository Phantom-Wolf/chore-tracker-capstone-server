require("dotenv").config();
const knex = require("knex");
const app = require("../src/app");
const { TEST_DATABASE_URL } = require("../src/config");
const jwt = require("jsonwebtoken");
const AuthService = require("../src/auth/auth-service");

describe("Auth Endpoints", function () {
	let db;

	const testUsers = [
		{
			id: 1,
			user_email: "test1@outlook.com",
			user_password: "Password1!",
		},
		{
			id: 2,
			user_email: "test2@outlook.com",
			user_password: "Password1!",
		},
		{
			id: 3,
			user_email: "test3@outlook.com",
			user_password: "Password1!",
		},
	];
	const testUser = testUsers[0];

	before("make knex instance", () => {
		db = knex({
			client: "pg",
			connection: TEST_DATABASE_URL,
		});
		app.set("db", db);
	});

	before("cleanup", () => db.raw("TRUNCATE TABLE tasks, events, users RESTART IDENTITY CASCADE;"));

	afterEach("cleanup", () =>
		db.raw("TRUNCATE TABLE tasks, events, users RESTART IDENTITY CASCADE;")
	);

	after("disconnect from db", () => db.destroy());

	describe(`POST /api/auth/login`, () => {
		beforeEach("insert events", () => {
			return db.into("users").insert(testUsers);
		});

		const requiredFields = ["user_email", "user_password"];

		requiredFields.forEach((field) => {
			const loginAttemptBody = {
				user_email: testUser.user_email,
				user_password: testUser.user_password,
			};

			it(`responds with 400 required error when '${field}' is missing`, () => {
				delete loginAttemptBody[field];

				return supertest(app)
					.post("/api/auth/login")
					.send(loginAttemptBody)
					.expect(400, {
						error: `Missing '${field}' in request body`,
					});
			});

			it(`responds 400 'invalid user_email or password' when bad user_email`, () => {
				const userInvalidUser = { user_email: "user-not", user_password: "existy" };
				return supertest(app)
					.post("/api/auth/login")
					.send(userInvalidUser)
					.expect(400, { error: `Incorrect user_email or password` });
			});

			it(`responds 400 'invalid user_name or password' when bad password`, () => {
				const userInvalidPass = { user_email: testUser.user_email, user_password: "incorrect" };
				return supertest(app)
					.post("/api/auth/login")
					.send(userInvalidPass)
					.expect(400, { error: `Incorrect user_email or password` });
			});

			it(`responds 200 and JWT auth token using secret when valid credentials`, () => {
				const userValidCreds = {
					user_email: testUser.user_email,
					user_password: testUser.user_password,
				};
				const expectedToken = `Bearer ${AuthService.createJwt(testUsers[0].user_email, { id: testUsers[0].id })}`
				return supertest(app).post("/api/auth/login").send(userValidCreds).expect(200, {
					authToken: expectedToken,
				});
			});
		});
	});
});
