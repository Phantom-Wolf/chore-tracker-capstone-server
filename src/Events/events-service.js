const EventsService = {
	insertEvent(knex, newEvent) {
		return knex
			.insert(newEvent)
			.into("events")
			.returning("*")
			.then((rows) => {
				return rows[0];
			});
	},
	getAllEvents(knex, id) {
		return knex.from("events").select("*").where("user_id", id);
	},
	getById(knex, id) {
		return knex.from("events").select("*").where("id", id).first();
	},
	deleteTasks(knex, id) {
		return knex.from("tasks").select("*").where("event_id", id).delete();
	},
	deleteEvents(knex, id) {
		return knex.from("events").where({ id }).delete();
	},
	updateEvent(knex, id, newEventFields) {
		return knex.from("events").where({ id }).update(newEventFields);
	},
};
module.exports = EventsService;
