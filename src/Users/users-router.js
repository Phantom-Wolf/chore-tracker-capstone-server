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

		const passwordError = UsersService.validatePassword(user_password);

		if (passwordError) return res.status(400).json({ error: passwordError });

		UsersService.hasUserWithUserEmail(req.app.get("db"), user_email)
			.then((hasUserWithUserEmail) => {
				if (hasUserWithUserEmail)
					return res.status(400).json({ error: `User Email already taken` });

				return UsersService.hashPassword(user_password).then((hashedPassword) => {
					const newUser = {
						user_email,
						user_password: hashedPassword,
					};

					return UsersService.insertUser(req.app.get("db"), newUser).then((user) => {
						res
							.status(201)
							.location(path.posix.join(req.originalUrl, `/${user.id}`))
							.json(UsersService.serializeUser(user));
					});
				});
			})
			.catch(next);
	});

module.exports = usersRouter;
