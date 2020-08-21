// imports

require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const usersRouter = require("./Users/users-router");
const eventsRouter = require("./Events/events-router");
const tasksRouter = require("./Tasks/tasks-router");
const authRouter = require("./auth/auth-router");

const app = express();

// middleware

const morganOption = NODE_ENV === "production" ? "tiny" : "common";
app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());

// body

app.get("/", (req, res) => {
	res.send("Hello, onTrack!");
});

app.use("/api/users", usersRouter);
app.use("/api/events", eventsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/auth", authRouter);

// error handling

app.use(function errorHandler(error, req, res, next) {
	let response;
	if (NODE_ENV === "production") {
		response = { error: { message: "server error" } };
	} else {
		response = { message: error.message, error };
	}
	res.status(500).json(response);
});

module.exports = app;
