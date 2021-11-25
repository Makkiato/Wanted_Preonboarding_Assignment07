const sequelize = require('sequelize');
const config = require('../config.json');
const models = require('./models');
const query = require('./query')

let connector = undefined;

const initDB = () => {
    console.log('initDB')
    return new Promise(async (resolve, reject) => {
        let db = new sequelize(
            config.db.db_name,
            config.db.user,
            config.db.pw,
            {
                host: config.db.host,
                port: config.db.port,
                dialect: 'mariadb',
                logging: process.env.NODE_ENV == 'development',
            }
        )


        let model = models(db, sequelize.DataTypes)

        Object.entries(model).forEach(([key, value]) => {
            if (value.associate) {
                value.associate(model)
            }
        })

        try {
            await db.sync()
            db.predefinedQuery = query(db)
            connector = db
            resolve(connector)
        } catch (err) {
            console.log(err)
            reject(err)
        }
    })
}

const getConnector = async () => {

    if (connector) {
        return connector
    } else {
        return await initDB()
    }
}



module.exports.getConnector = getConnector