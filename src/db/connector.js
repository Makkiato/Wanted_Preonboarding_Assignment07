const sequelize = require('sequelize');
const config = require('../config.json');
const models = require('./models');
const query = require('./query')

const initDB = new Promise(async (resolve, reject) => {
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
        db.customQuery = query(db)
        //console.log('showMetadata : ', await db.customQuery.showMetadata())
        //console.log('insertUser : ', await db.customQuery.insertUser("test","test"))
        //console.log('validateUser : ', await db.customQuery.validateUser("test","test"))
        //console.log('validateUser : ', await db.customQuery.insertTrim("123/45A67","987/65B43"))
        
        resolve(db)
    } catch (err) {
        reject(err)
    }
})



module.exports.initDB = initDB