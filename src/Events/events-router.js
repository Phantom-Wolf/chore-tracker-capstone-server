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
	// takes in date_created date and a recurrence specific

	// translates the recurrence specific into its proper number
	if (dayOfWeekText == "Sunday") {
		dayOfWeekNumerical = 0;
	} else if (dayOfWeekText == "Monday") {
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
	}

	date = new Date(date.getTime());
	// sets output date to the next occurance of the given reccurence specific weekday
	date.setDate(date.getDate() + ((dayOfWeekNumerical + 7 - date.getDay()) % 7));
	return date;
}

function setWeekly(date, followingWeekText) {
	// takes in date_created date and a recurrence specific

	// translates the corresponding recurrence specific into a number
	if (followingWeekText == "Week 1") {
		followingWeekNumerical = 0;
	} else if (followingWeekText == "Week 2") {
		followingWeekNumerical = 7;
	} else if (followingWeekText == "Week 3") {
		followingWeekNumerical = 14;
	} else if (followingWeekText == "Week 4") {
		followingWeekNumerical = 21;
	} else if (followingWeekText == "Week 5") {
		followingWeekNumerical = 28;
	}
	// set date created to same month but at first of month
	date = new Date(date.getFullYear(), date.getMonth(), 1);

	// add followingWeekText number to the day of the month
	date.setDate(date.getDate() + followingWeekNumerical);

	// if the updated date is earlier than the current date, change the month forward by 1
	if (date < new Date(new Date().toDateString())) {
		date = new Date(date.getFullYear(), date.getMonth() + 1, date.getDate());

		return date;
	} else {
		return date;
	}
}

function setMonthly(date, followingMonthText) {
	// takes in date_created date and a recurrence specific

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

	// this is subtracting date_created month by recurrence specific month
	let timeInterval = currentMonth - followingMonthNumerical;

	// if timeInterval is less than zero, that means the current recurrence specific month is after
	// the current month so the output will remain in the same year
	if (timeInterval < 0) {
		outputMonth = followingMonthNumerical;
	}

	// if timeInterval is equal to zero, that means the current recurrence specific month is the same
	//  as the current month so the output will be pushed into the same month but next year
	else if (timeInterval == 0) {
		outputYear = currentYear + 1;
		outputMonth = currentMonth;
	}

	// if timeInterval is greater than zero, that means the current recurrence specific month is before
	// the current month so the output will be pushed into the next year
	else {
		outputMonth = followingMonthNumerical;
		// if output month is going into the next year, update year as well
		outputYear = currentYear + 1;
	}

	// output value will be output year, month and first day of the month
	let dateOutput = new Date(outputYear, outputMonth, 1);
	return dateOutput;
}

const serializeEvent = (event) => ({
	id: event.id,
	user_id: event.user_id,
	title: xss(event.title),
	notes: xss(event.notes),
	recurrence: event.recurrence,
	recurrence_specifics: JSON.parse(event.recurrence_specifics),
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
		const { title, notes, recurrence, recurrence_specifics, date_created } = req.body;

		// translate request body into a newEvent object
		const newEvent = {
			title,
			notes,
			recurrence,
			recurrence_specifics,
			date_created,
		};

		// if the given values in newEvent are null(missing), return error message
		// validation
		for (const [key, value] of Object.entries(newEvent))
			if (value == null)
				return res.status(400).json({
					error: {
						message: `Missing '${key}' in request body`,
					},
				});

		// date created is excluded from validation since it is allowed to be null, it is added here.
		if (req.body.date_ended == null) {
			newEvent.date_ended = null;
		} else {
			newEvent.date_ended = new Date(req.body.date_ended);
		}

		// add user id from header to newEvent object
		newEvent.user_id = req.user.id;

		// add Event object into database
		EventsService.insertEvent(req.app.get("db"), newEvent)
			.then((event) => {
				// takes the submitted event's reccurence specifics and turn it from a string back into an array
				let recurrenceSpecificsSanitizedArray = JSON.parse(event.recurrence_specifics);

				// currentDate & createDate will be the date the event was created
				let currentDate = event.date_created;
				let createDate = event.date_created;

				// take end_date of req body and add it to new event. if null, create end_date for 31 dec of following year
				let endDate;
				if (event.date_ended == null) {
					let replaceDate = new Date();
					endDate = new Date(replaceDate.getFullYear() + 1, 11, 31);
				} else {
					endDate = event.date_ended;
				}

				// the following code is setting up reccurence based on selected recurrence from the event body

				// ********************weekday reccurence********************
				if (event.recurrence == 1) {
					// recursive function to repeat "for loop" until  current date meets the end date
					function scheduleWeekdayAll(start, current, end) {
						// the for loop should take the recurrence specifics and cycle through each specific and schdule it into the future once
						for (let i = 0; i < recurrenceSpecificsSanitizedArray.length; i++) {
							// calculate next date of task based on recurrence value above
							let weekdayForDB = setWeekday(start, recurrenceSpecificsSanitizedArray[i]);

							// set the returned value from weekdayForDB as the new date_of_task
							let payload = {
								event_id: event.id,
								date_of_task: weekdayForDB,
								task_status: false,
								task_completion_date: null,
							};

							//add new event to DB
							TasksService.insertTask(req.app.get("db"), payload).catch(next);
						}

						// once the "for loop" runs through its one set of cycles, change the "start" & "current" for the next loop run
						let nextCurrent = new Date(
							current.getFullYear(),
							current.getMonth(),
							current.getDate() + 7
						);
						let nextStart = nextCurrent;

						// if the updated "current" date is less than the original "end" date, call the function again but with the new "start" & "current" values
						// this creates a defacto while loop that runs until the "current" date meets the "end" date
						if (new Date(nextCurrent) < new Date(end)) {
							scheduleWeekdayAll(new Date(nextStart), new Date(nextCurrent), new Date(end));
						}
					}

					scheduleWeekdayAll(createDate, currentDate, endDate);
				}

				// ********************weekly reccurence********************
				else if (event.recurrence == 2) {
					// recursive function to repeat "for loop" until  current date meets the end date
					function scheduleWeekAll(start, current, end) {
						// the for loop should take the recurrence specifics and cycle through each specific and schdule it into the future once
						for (let i = 0; i < recurrenceSpecificsSanitizedArray.length; i++) {
							// calculate next date of task based on recurrence value above
							let weeklyForDB = setWeekly(start, recurrenceSpecificsSanitizedArray[i]);

							// set the returned value from weeklyForDB as the new date_of_task
							let payload = {
								event_id: event.id,
								date_of_task: weeklyForDB,
								task_status: false,
								task_completion_date: null,
							};

							//add new event to DB
							TasksService.insertTask(req.app.get("db"), payload).catch(next);
						}

						// once the "for loop" runs through its one set of cycles, change the "start" & "current" for the next loop run
						let nextCurrent = new Date(
							current.getFullYear(),
							current.getMonth() + 1,
							current.getDate()
						);
						let nextStart = nextCurrent;

						// if the updated "current" date is less than the original "end" date, call the function again but with the new "start" & "current" values
						// this creates a defacto while loop that runs until the "current" date meets the "end" date
						if (new Date(nextCurrent) < new Date(end)) {
							scheduleWeekAll(new Date(nextStart), new Date(nextCurrent), new Date(end));
						}
					}

					scheduleWeekAll(createDate, currentDate, endDate);
				}

				// ********************monthly reccurence********************
				else {
					// recursive function to repeat "for loop" until  current date meets the end date
					function scheduleMonthAll(start, current, end) {
						// recursive function to repeat "for loop" until  current date meets the end date
						for (let i = 0; i < recurrenceSpecificsSanitizedArray.length; i++) {
							// calculate next date of task based on recurrence value above
							let monthlyForDB = setMonthly(start, recurrenceSpecificsSanitizedArray[i]);

							// set the returned value from monthlyForDB as the new date_of_task
							let payload = {
								event_id: event.id,
								date_of_task: monthlyForDB,
								task_status: false,
								task_completion_date: null,
							};

							//add new event to DB
							TasksService.insertTask(req.app.get("db"), payload).catch(next);
						}

						// once the "for loop" runs through its one set of cycles, change the "start" & "current" for the next loop run
						let nextCurrent = new Date(
							current.getFullYear() + 1,
							current.getMonth(),
							current.getDate()
						);
						let nextStart = nextCurrent;

						// if the updated "current" date is less than the original "end" date, call the function again but with the new "start" & "current" values
						// this creates a defacto while loop that runs until the "current" date meets the "end" date
						if (new Date(nextCurrent) < new Date(end)) {
							scheduleMonthAll(new Date(nextStart), new Date(nextCurrent), new Date(end));
						}
					}
					scheduleMonthAll(createDate, currentDate, endDate);
				}

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
		EventsService.deleteEvents(req.app.get("db"), req.params.event_id)
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

		//

		const numberOfValues = Object.values(eventToUpdate).filter(Boolean).length;
		if (numberOfValues === 0) {
			return res.status(400).json({
				error: {
					message: `'Request body is missing values'`,
				},
			});
		}

		// EventsService.updateEvent(req.app.get("db"), req.params.event_id, eventToUpdate)
		// 	.then((numRowsAffected) => {
		// 		res.status(204).end();
		// 	})
		// 	.catch(next);
	});

module.exports = eventsRouter;
