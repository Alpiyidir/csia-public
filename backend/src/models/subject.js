module.exports = (conn, DataTypes) => {
	return conn.define(
		"subject",
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			subject: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
		},
		{ timestamps: false }
	);
};
