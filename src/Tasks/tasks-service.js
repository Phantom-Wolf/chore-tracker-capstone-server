const TasksService = {
	insertTask(knex, newTask) {
		return knex
			.insert(newTask)
			.into("tasks")
			.returning("*")
			.then((rows) => {
				return rows[0];
			});
	},
	getAllTasks(knex) {
		return knex.select("*").from("tasks");
	},
	getById(knex, id) {
		return knex.from("tasks").select("*").where("id", id).first();
	},
	deleteTask(knex, id) {
		return knex.from("tasks").where({ id }).delete();
	},
	updateTask(knex, id, newTaskFields) {
		return knex.from("tasks").where({ id }).update(newTaskFields);
	},
};
module.exports = TasksService;
