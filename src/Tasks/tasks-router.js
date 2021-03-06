// imports

const express = require("express");
const xss = require("xss");
const TasksService = require("./tasks-service");
const path = require("path");
const { requireAuth } = require("../middleware/jwt-auth");

// middleware

const tasksRouter = express.Router();
const jsonParser = express.json();

const serializeTask = (task) => ({
	id: task.id,
	event_id: task.event_id,
	date_of_task: task.date_of_task,
	date_of_completion: task.date_of_completion,
	task_status: task.task_status,
	task_completion_date: task.task_completion_date,
});

// body

tasksRouter
	.route("/:task_id")
	.all((req, res, next) => {
		const knexInstance = req.app.get("db");
		TasksService.getById(knexInstance, req.params.task_id)
			.then((task) => {
				if (!task) {
					return res.status(404).json({
						error: {
							message: `task doesn't exist`,
						},
					});
				}
				res.task = task;
				next();
			})
			.catch(next);
	})
	.patch(jsonParser, (req, res, next) => {
		const { event_id, date_of_task, task_status, task_completion_date } = req.body;
		const taskToUpdate = { event_id, date_of_task, task_status, task_completion_date };

		const numberOfValues = Object.values(taskToUpdate).filter(Boolean).length;
		if (numberOfValues === 0) {
			return res.status(400).json({
				error: {
					message: `'Request body is missing values'`,
				},
			});
		}

		TasksService.updateTask(req.app.get("db"), req.params.task_id, taskToUpdate)
			.then((numRowsAffected) => {
				res.status(204).end();
			})
			.catch(next);
	});

tasksRouter.route("/tasker/:event_id").get((req, res, next) => {
	const knexInstance = req.app.get("db");
	TasksService.getAllTasks(knexInstance, req.params.event_id)
		.then((tasks) => {
			res.json(tasks.map(serializeTask));
		})

		.catch(next);
});

module.exports = tasksRouter;
