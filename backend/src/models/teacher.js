module.exports = (conn, DataTypes) => {
    return conn.define(
        "teacher",
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
