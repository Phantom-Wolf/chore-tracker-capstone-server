// imports

const express = require("express");
const xss = require("xss");
const EventsService = require("./events-service");
const TasksService = require("../Tasks/tasks-service");
const path = require("path");
const { requireAuth } = require("../middleware/jwt-auth");

// middleware

const eventsRouter = express.Router();
const jsonParser = express.json();

// function
function setWeekday(date, dayOfWeekText) {
	if (dayOfWeekText == "Monday") {
		dayOfWeekNumerical = 1;
	} else if (dayOfWeekText == "Tuesday") {
		dayOfWeekNumerical = 2;
	} else if (dayOfWeekText == "Wednesday") {
		dayOfWeekNumerical = 3;
	} else if (dayOfWeekText == "Thursday") {
		dayOfWeekNumerical = 4;
	} else if (dayOfWeekText == "Friday") {
		dayOfWeekNumerical = 5;
	} else if (dayOfWeekText == "Saturday") {
		dayOfWeekNumerical = 6;
	} else if (dayOfWeekText == "Sunday") {
		dayOfWeekNumerical = 7;
	}

	date = new Date(date.getTime());
	date.setDate(date.getDate() + ((dayOfWeekNumerical + 7 - date.getDay()) % 7));
	return date;
}

function setWeekly(date, followingWeekText) {
	if (followingWeekText == "Week 1") {
		followingWeekNumerical = 7;
	} else if (followingWeekText == "Week 2") {
		followingWeekNumerical = 14;
	} else if (followingWeekText == "Week 3") {
		followingWeekNumerical = 21;
	} else if (followingWeekText == "Week 4") {
		followingWeekNumerical = 28;
	} else if (followingWeekText == "Week 5") {
		followingWeekNumerical = 35;
	}

	date = new Date(date.getTime());
	date.setDate(date.getDate() + followingWeekNumerical);
	return date;
}

function setMonthly(date, followingMonthText) {
	// get current month and year

	let currentMonth = date.getMonth();
	let currentYear = date.getFullYear();

	// set output month and year details

	let outputMonth = currentMonth;
	let outputYear = currentYear;

	// calculate month numerical value for each of the following months

	if (followingMonthText == "January") {
		followingMonthNumerical = 0;
	} else if (followingMonthText == "February") {
		followingMonthNumerical = 1;
	} else if (followingMonthText == "March") {
		followingMonthNumerical = 2;
	} else if (followingMonthText == "April") {
		followingMonthNumerical = 3;
	} else if (followingMonthText == "May") {
		followingMonthNumerical = 4;
	} else if (followingMonthText == "June") {
		followingMonthNumerical = 5;
	} else if (followingMonthText == "July") {
		followingMonthNumerical = 6;
	} else if (followingMonthText == "August") {
		followingMonthNumerical = 7;
	} else if (followingMonthText == "September") {
		followingMonthNumerical = 8;
	} else if (followingMonthText == "October") {
		followingMonthNumerical = 9;
	} else if (followingMonthText == "November") {
		followingMonthNumerical = 10;
	} else if (followingMonthText == "December") {
		followingMonthNumerical = 11;
	}

	// calculate output month based on followingMonthNumerical

	let timeInterval = currentMonth - followingMonthNumerical;
	console.log(
		"timeinterval",
		timeInterval,
		"currentmonth",
		currentMonth,
		"followingNumerical",
		followingMonthNumerical
	);
	if (timeInterval < 0) {
		// console.log("current year");
		outputMonth = 12 - (currentMonth + parseInt(timeInterval));
		console.log("*****current year*****", outputMonth, outputYear);
	} else if (timeInterval == 0) {
		// console.log("current year");

		outputYear = currentYear + 1;
		outputMonth = currentMonth;

		console.log("*****current month*****", outputMonth, outputYear);
	} else {
		// console.log("next year");
		outputMonth = 12 - (currentMonth + parseInt(timeInterval));
		// if output month is going into the next year, update year as well

		outputYear = currentYear + 1;

		console.log("*****next year*****", outputMonth, outputYear);
	}

	// output value will be output year, month and first day of the month

	let dateOutput = new Date(outputYear, outputMonth, 1);
	return dateOutput;
}

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
	.all(requireAuth)
	.get((req, res, next) => {
		const knexInstance = req.app.get("db");

		let user_id = req.user.id;

		EventsService.getAllEvents(knexInstance, user_id)
			.then((events) => {
				res.json(events.map(serializeEvent));
			})
			.catch(next);
	})
	.post(requireAuth, jsonParser, (req, res, next) => {
		// console.log(req.body);
		const { title, notes, recurrence, recurrence_specifics, date_created, date_ended } = req.body;
		const newEvent = {
			title,
			notes,
			recurrence,
			recurrence_specifics,
			date_created,
			date_ended,
		};
		// console.log("newEvent", newEvent);

		for (const [key, value] of Object.entries(newEvent))
			if (value == null)
				return res.status(400).json({
					error: {
						message: `Missing '${key}' in request body`,
					},
				});

		newEvent.user_id = req.user.id;

		console.log(newEvent.user_id);

		EventsService.insertEvent(req.app.get("db"), newEvent)
			.then((event) => {
				console.log("event", event);
				let recurrenceSpecificsSanitized1 = event.recurrence_specifics.replace("[", "");
				let recurrenceSpecificsSanitized2 = recurrenceSpecificsSanitized1.replace("]", "");
				let recurrenceSpecificsSanitized = recurrenceSpecificsSanitized2.replace(/"/g, "");
				let recurrenceSpecificsSanitizedArray = recurrenceSpecificsSanitized.split(",");

				// ********************weekday reccurence********************

				if (event.recurrence == 1) {
					console.log("weekday", recurrenceSpecificsSanitizedArray);

					for (let i = 0; i < recurrenceSpecificsSanitizedArray.length; i++) {
						// take the weekday recurrence value

						console.log(`weekday for loop ${i}`, recurrenceSpecificsSanitizedArray[i]);

						// calculate next date of task based on recurrence value above

						let weekdayForDB = setWeekday(event.date_created, recurrenceSpecificsSanitizedArray[i]);
						console.log("weekdayForDB", weekdayForDB);

						//add new event to DB

						TasksService.insertTask(req.app.get("db"), {
							event_id: event.id,
							date_of_task: weekdayForDB,
							task_status: false,
							task_completion_date: null,
						})
							.then((task) => {
								// res.status(201).json(task);
								// console.log("task", task);
							})
							.catch(next);
					}
				}

				// ********************weekly reccurence********************
				else if (event.recurrence == 2) {
					console.log("weekly", recurrenceSpecificsSanitizedArray);

					// create a for loop for recurrenceSpecificsSanitizedArray

					for (let i = 0; i < recurrenceSpecificsSanitizedArray.length; i++) {
						// take the weekday recurrence value

						console.log(`weekly for loop ${i}`, recurrenceSpecificsSanitizedArray[i]);

						// calculate next date of task based on recurrence value above

						let weeklyForDB = setWeekly(event.date_created, recurrenceSpecificsSanitizedArray[i]);
						console.log("weeklyForDB", weeklyForDB);

						//add new event to DB

						TasksService.insertTask(req.app.get("db"), {
							event_id: event.id,
							date_of_task: weeklyForDB,
							task_status: false,
							task_completion_date: null,
						})
							.then((task) => {
								// res.status(201).json(task);
								// console.log("task", task);
							})
							.catch(next);
					}
				}

				// ********************monthly reccurence********************
				else {
					console.log("monthly", recurrenceSpecificsSanitizedArray);

					// create a for loop for recurrenceSpecificsSanitizedArray

					for (let i = 0; i < recurrenceSpecificsSanitizedArray.length; i++) {
						// take the weekday recurrence value

						console.log(`monthly for loop ${i}`, recurrenceSpecificsSanitizedArray[i]);

						// calculate next date of task based on recurrence value above

						let monthlyForDB = setMonthly(event.date_created, recurrenceSpecificsSanitizedArray[i]);
						console.log("monthlyForDB", monthlyForDB);

						//add new event to DB

						TasksService.insertTask(req.app.get("db"), {
							event_id: event.id,
							date_of_task: monthlyForDB,
							task_status: false,
							task_completion_date: null,
						})
							.then((task) => {
								// res.status(201).json(task);
								// console.log("task", task);
							})
							.catch(next);
					}
				}

				// let newTask = {
				// 	event_id: event.id,
				// 	date_of_task: event.date_created,
				// 	task_status: false,
				// 	task_completion_date: null,
				// };
				// console.log("newTask", newTask);

				// TasksService.insertTask(req.app.get("db"), newTask)
				// 	.then((task) => {
				// 		res.status(201).json(task);
				// 		console.log("task", task);
				// 	})
				// 	.catch(next);

				res
					.status(201)
					.location(path.posix.join(req.originalUrl, `/${event.id}`))
					.json(serializeEvent(event));
			})
			.catch(next);
	});

eventsRouter
	.route("/:event_id")
	.all(requireAuth)
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

// let cycleStartDate = newEvent.date_created
// let cycleEndDate;

// if (newEvent.date_created == null) {
// 	cycleEndDate = cycleStartDate.setFullYear(cycleStartDate.getFullYear() + 1)
// } else {
// 	cycleEndDate = newEvent.date_ended
// }

// while(cycleStartDate < cycleEndDate) {
// 	// run task service for loop
// 	//then
// 	cycleStartDate = cycleStartDate.setDate(cycleStartDate.getDate() + 7)
// }
