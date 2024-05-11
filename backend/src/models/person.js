const crypto = require("crypto");

module.exports = (conn, DataTypes) => {
	return conn.define(
		"person",
		{
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				primaryKey: true,
				unique: true,
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false,
				set(value) {
					this.setDataValue(
						"password",
						crypto
							.createHash("sha256")
							.update(value, "utf8")
							.digest("hex")
					);
				},
			},
			firstName: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			lastName: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			refreshToken: {
				type: DataTypes.STRING(1000),
			}
		},
		{ timestamps: false }
	);
};
