const UsersService = {
	insertUser(knex, newUser) {
		return knex
			.insert(newUser)
			.into("chore_user")
			.returning("*")
			.then((rows) => {
				return rows[0];
			});
	},
	getAllUsers(knex) {
		return knex.select("*").from("chore_user");
	},
	getById(knex, id) {
		return knex.from("chore_user").select("*").where("id", id).first();
	},
	deleteUser(knex, id) {
		return knex.from("chore_user").where({ id }).delete();
	},
	updateUser(knex, id, newUserFields) {
		return knex.from("chore_user").where({ id }).update(newUserFields);
	},
};
UsersService;
