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
            console.log(Object.keys(db))
            console.log(db.models.users)
            db.predefinedQuery = query(db)
            //console.log('showMetadata : ', await db.predefinedQuery.showMetadata())
            //console.log('insertUser : ', await db.predefinedQuery.insertUser("test","test"))
            //console.log('validateUser : ', await db.predefinedQuery.validateUser("test","test"))
            //console.log('insertTrim : ', await db.predefinedQuery.insertTrim("123/45A67","987/65B43"))
            //console.log('insertTrim : ', await db.predefinedQuery.showAllTrim())
            //console.log('insertUserTrim : ', await db.predefinedQuery.insertUserTrim("test", 2))
            //console.log('showUserTrim : ', await db.predefinedQuery.showUserTrim("test"))
            connector = db
            resolve(connector)
        } catch (err) {
            reject(err)
        }
    })
}

const getConnector = () => {
    return new Promise(async (resolve, reject) => {
        if (connector) {
            resolve(connector)
        } else {
            try {
                resolve (await initDB())
            } catch (err) {
                reject(err)
            }
        }

    })
}



module.exports.getConnector = getConnector