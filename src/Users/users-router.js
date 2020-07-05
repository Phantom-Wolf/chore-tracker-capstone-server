// imports

const express = require("express");
const xss = require("xss");
const UsersService = require("./users-service");
const path = require("path");

// middleware

const usersRouter = express.Router();
const jsonParser = express.json();

const serializeUser = (user) => ({
	id: user.id,
	user_email: xss(user.user_email),
	user_password: xss(user.user_password),
});

// body

usersRouter
	.route("/")
	.get((req, res, next) => {
		const knexInstance = req.app.get("db");
		UsersService.getAllUsers(knexInstance)
			.then((users) => {
				res.json(users.map(serializeUser));
			})
			.catch(next);
	})
	.post(jsonParser, (req, res, next) => {
		const { user_email, user_password } = req.body;
		const newUser = {
			user_email,
			user_password,
		};

		for (const [key, value] of Object.entries(newUser))
			if (value == null)
				return res.status(400).json({
					error: {
						message: `Missing '${key}' in request body`,
					},
				});

		UsersService.insertUser(req.app.get("db"), newUser)
			.then((user) => {
				res
					.status(201)
					.location(path.posix.join(req.originalUrl, `/${user.id}`))
					.json(serializeUser(user));
			})
			.catch(next);
	});

	usersRouter.route("/:user_id")
	.all((req, res, next) => {
		const knexInstance = req.app.get("db");
		UsersService.getById(knexInstance, req.params.user_id)
			.then((user) => {
				if (!user) {
					return res.status(404).json({
						error: {
							message: `user doesn't exist`,
						},
					});
				}
				res.user = user;
				next();
			})
			.catch(next);
	})
	.get((req, res, next) => {
		res.json(serializeUser(res.user));
	})
	.delete((req, res, next) => {
		UsersService.deleteUser(req.app.get("db"), req.params.user_id)
			.then(() => {
				res.status(204).end();
			})
			.catch(next);
	})
	.patch(jsonParser, (req, res, next) => {
		const { user_email, user_password } = req.body;
		const userToUpdate = { user_email, user_password };

		const numberOfValues = Object.values(userToUpdate).filter(Boolean).length;
		if (numberOfValues === 0) {
			return res.status(400).json({
				error: {
					message: `Request body must contain 'user_email' or 'user_password'`,
				},
			});
		}

		UsersService.updateUser(req.app.get("db"), req.params.user_id, userToUpdate)
			.then((numRowsAffected) => {
				res.status(204).end();
			})
			.catch(next);
	});

module.exports = usersRouter;
