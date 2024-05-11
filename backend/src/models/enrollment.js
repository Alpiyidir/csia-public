module.exports = (conn, DataTypes) => {
    return conn.define(
        "enrollment",
        
        {
            id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
            grade: {
                type: DataTypes.INTEGER,
            },
        },
        { timestamps: false }
    );
};
