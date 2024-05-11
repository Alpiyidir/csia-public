module.exports = (conn, DataTypes) => {
	return conn.define(
		"quiz",
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			title: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			description: {
				type: DataTypes.STRING,
			},
			maxGrade: {
				type: DataTypes.INTEGER,
			},
			timestamp: {
				type: DataTypes.BIGINT,
			},
		},
		{ timestamps: false }
	);
};
