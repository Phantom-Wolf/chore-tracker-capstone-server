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
	getAllTasks(knex, event_id) {
		return knex.select("*").from("tasks").where("event_id", event_id);
	},
	getById(knex, id) {
		return knex.from("tasks").select("*").where("id", id).first();
	},
	updateTask(knex, id, newTaskFields) {
		return knex.from("tasks").where({ id }).update(newTaskFields);
	},
};
module.exports = TasksService;
