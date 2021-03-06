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
	deleteEvents(knex, id) {
		return knex.from("events").where({ id }).delete();
	},
};
module.exports = EventsService;
