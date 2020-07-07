const UsersService = {
	insertUser(knex, newUser) {
		return knex
			.insert(newUser)
			.into("users")
			.returning("*")
			.then((rows) => {
				return rows[0];
			});
	},
	getAllUsers(knex) {
		return knex.select("*").from("users");
	},
	getById(knex, id) {
		return knex.from("users").select("*").where("id", id).first();
	},
	deleteUser(knex, id) {
		return knex.from("users").where({ id }).delete();
	},
	updateUser(knex, id, newUserFields) {
		return knex.from("users").where({ id }).update(newUserFields);
	},
};
module.exports = UsersService;
