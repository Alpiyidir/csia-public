module.exports = (conn, DataTypes) => {
    return conn.define(
        "student",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
        },
        { timestamps: false }
    );
};
