module.exports = (sequelize, DataTypes) => {
    const users = sequelize.define('users', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        pw: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, { timestamps: false });

    const trims = sequelize.define('trims', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,            
        },
        manufactuerer : {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name : {
            type: DataTypes.STRING,
            allowNull: false,
        },
        front_width: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        front_aspect: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        front_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        front_wheel: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        rear_width: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        rear_aspect: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        rear_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        rear_wheel: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, { timestamps: false })

    

    const user_trim = sequelize.define('user_trim', {

    }, { timestamps: false })

    users.belongsToMany(trims, {through: user_trim})
    trims.belongsToMany(users, {through: user_trim})

    return { users, trims, user_trim }
}