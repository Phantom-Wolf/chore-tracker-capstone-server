const EventsService = {
	insertUser(knex, newEvent) {
		return knex
			.insert(newEvent)
			.into("events")
			.returning("*")
			.then((rows) => {
				return rows[0];
			});
	},
	getAllEvents(knex) {
		return knex.select("*").from("events");
	},
	getById(knex, id) {
		return knex.from("events").select("*").where("id", id).first();
	},
	deleteEvents(knex, id) {
		return knex.from("events").where({ id }).delete();
	},
	updateEvents(knex, id, newEventFields) {
		return knex.from("events").where({ id }).update(newEventFields);
	},
};
EventsService;