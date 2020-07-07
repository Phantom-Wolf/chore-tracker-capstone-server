// imports

const express = require("express");
const xss = require("xss");
const EventsService = require("./events-service");
const path = require("path");

// middleware

const eventsRouter = express.Router();
const jsonParser = express.json();

const serializeEvent = (event) => ({
	id: event.id,
	event_id: event.event_id,
	title: xss(event.title),
	notes: xss(event.notes),
	recurrence: event.recurrence,
	recurrence_specifics: event.recurrence_specifics,
	date_created: event.date_created,
	date_ended: event.date_ended,
});

// body

eventsRouter
	.route("/")
	.get((req, res, next) => {
		const knexInstance = req.app.get("db");
		EventsService.getAllEvents(knexInstance)
			.then((events) => {
				res.json(events.map(serializeEvent));
			})
			.catch(next);
	})
	.post(jsonParser, (req, res, next) => {
		console.log(req.body);
		const {
			user_id,
			title,
			notes,
			recurrence,
			recurrence_specifics,
			date_created,
			date_ended,
		} = req.body;
		const newEvent = {
			user_id,
			title,
			notes,
			recurrence,
			recurrence_specifics,
			date_created,
			date_ended,
		};
		console.log("newEvent", newEvent);

		for (const [key, value] of Object.entries(newEvent))
			if (value == null)
				return res.status(400).json({
					error: {
						message: `Missing '${key}' in request body`,
					},
				});

		EventsService.insertEvent(req.app.get("db"), newEvent)
			.then((event) => {
				// TasksService.insertTask(req.app.get("db"), newTask)
				// .then((task) => {
				// 	res
				// 		.status(201)
				// 		.json(serializeEvent(event));
				// })
				// .catch(next);
				res
					.status(201)
					.location(path.posix.join(req.originalUrl, `/${event.id}`))
					.json(serializeEvent(event));
			})
			.catch(next);
	});

eventsRouter
	.route("/:event_id")
	.all((req, res, next) => {
		const knexInstance = req.app.get("db");
		EventsService.getById(knexInstance, req.params.event_id)
			.then((event) => {
				if (!event) {
					return res.status(404).json({
						error: {
							message: `event doesn't exist`,
						},
					});
				}
				res.event = event;
				next();
			})
			.catch(next);
	})
	.get((req, res, next) => {
		res.json(serializeEvent(res.event));
	})
	.delete((req, res, next) => {
		EventsService.deleteEvent(req.app.get("db"), req.params.event_id)
			.then(() => {
				res.status(204).end();
			})
			.catch(next);
	})
	.patch(jsonParser, (req, res, next) => {
		const {
			user_id,
			title,
			notes,
			recurrence,
			recurrence_specifics,
			date_created,
			date_ended,
		} = req.body;
		const eventToUpdate = {
			user_id,
			title,
			notes,
			recurrence,
			recurrence_specifics,
			date_created,
			date_ended,
		};

		const numberOfValues = Object.values(eventToUpdate).filter(Boolean).length;
		if (numberOfValues === 0) {
			return res.status(400).json({
				error: {
					message: `'Request body is missing values'`,
				},
			});
		}

		EventsService.updateEvent(req.app.get("db"), req.params.user_id, eventToUpdate)
			.then((numRowsAffected) => {
				res.status(204).end();
			})
			.catch(next);
	});

module.exports = eventsRouter;
