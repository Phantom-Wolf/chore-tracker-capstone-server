require("dotenv").config();
const knex = require("knex");
const app = require("../src/app");
const { TEST_DATABASE_URL } = require("../src/config");
const jwt = require("jsonwebtoken");
const AuthService = require("../src/auth/auth-service");

describe("Tasks Endpoints", function () {
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

	const testEvents = [
		{
			id: 1,
			user_id: 1,
			title: "test 1",
			notes: "notes 1",
			recurrence: 1,
			recurrence_specifics: ["Tuesday"],
			date_created: "2020-08-21T01:00:24.900Z",
			date_ended: null,
		},
		{
			id: 2,
			user_id: 2,
			title: "test 2",
			notes: "notes 2",
			recurrence: 1,
			recurrence_specifics: ["Tuesday"],
			date_created: "2020-08-21T01:00:24.900Z",
			date_ended: null,
		},
		{
			id: 3,
			user_id: 3,
			title: "test 3",
			notes: "notes 3",
			recurrence: 1,
			recurrence_specifics: ["Tuesday"],
			date_created: "2020-08-21T01:00:24.900Z",
			date_ended: null,
		},
	];

	const testTask = [
		{
			id: 1,
			event_id: 1,
			date_of_task: "2020-08-25T05:00:00.000Z",
			task_status: false,
			task_completion_date: null,
		},
	];

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

	describe.only("GET all tasks", () => {
		context(`Given no tasks`, () => {
			beforeEach("insert events", () => {
				return db.into("users").insert(testUsers);
			});

			it(`responds with 200 and an empty task list`, () => {
				const eventId = 123456;
				return supertest(app).get(`/api/tasks/tasker/${eventId}`).expect(200, []);
			});
		});

		context("Given there are tasks in the database", () => {
			beforeEach("insert tasks", () => {
				return db
					.into("users")
					.insert(testUsers)
					.then(() => {
						return db.into("events").insert(testEvents);
					})
					.then(() => {
						return db.into("tasks").insert(testTask);
					});
			});

			it("responds with 200 and all of the tasks", () => {
				const eventId = 1;
				return supertest(app).get(`/api/tasks/tasker/${eventId}`).expect(200, testTask);
			});
		});
	});
});
