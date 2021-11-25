const sequelize = require('sequelize')
const Op = sequelize.Op
const config = require('../config.json')

module.exports = (db) => {
    const insertUser = (id, pw) => {
        return new Promise(async (resolve, reject) => {
            try {
                const newUser = await db.models.users.findCreateFind({
                    where: {
                        [Op.and]: [
                            { id: id }
                        ]
                    },
                    defaults: {
                        id: id,
                        pw: pw,
                    }

                })

                resolve({ type: 'insert', value: newUser[1] })
            } catch (err) {
                reject(err)
            }
        })
    }

    const validateUser = (id, pw) => {
        return new Promise(async (resolve, reject) => {
            try {
                const validated = await db.models.users.count({
                    where: {
                        [Op.and]: [
                            { id: id },
                            { pw: pw }
                        ]
                    }
                })

                resolve({ type: 'select', value: validated })
            } catch (err) {
                reject({ type: 'select', value: err })
            }
        })
    }

    const userExists = (id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const exists = await db.models.users.count({
                    where: {
                        id: {
                            [Op.eq]: id
                        }
                    }
                })

                resolve({ type: 'select', value: exists })
            } catch (err) {
                reject({ type: 'select', value: err })
            }
        })
    }

    const insertTrim = (id, manufacturer, name, front, rear) => {
        return new Promise(async (resolve, reject) => {
            const regexCheck = new RegExp(config.server.trimRegex)

            let regFront = regexCheck.exec(front)
            let regRear = regexCheck.exec(rear)

            if (!regFront || !regRear) {
                reject({ type: 'insert', value: "WRONG_FORMAT" })
            }

            try {
                const newTrim = await db.models.trims.findCreateFind({
                    where: {
                        [Op.and]: [
                            { id: id }
                        ]
                    },
                    defaults: {
                        id: id,                                        // 카닥 API에서 불러올때만 지정됨

                        manufacturer: manufacturer,
                        name: name,

                        front_prefix: regFront.groups.prefix,
                        front_width: regFront.groups.width,
                        front_aspect: regFront.groups.aspect,
                        front_type: regFront.groups.type,
                        front_wheel: regFront.groups.wheel,

                        rear_prefix: regFront.groups.prefix,
                        rear_width: regRear.groups.width,
                        rear_aspect: regRear.groups.aspect,
                        rear_type: regRear.groups.type,
                        rear_wheel: regRear.groups.wheel,
                    }
                })

                resolve({ type: 'insert', value: newTrim[1] })
            } catch (err) {
                reject({ type: 'insert', value: err })
            }
        })
    }

    const showAllTrim = (page, size) => {
        return new Promise(async (resolve, reject) => {
            try {
                const allTrim = await db.models.trims
                    .findAll({
                        attributes: [
                            'id',
                            'manufacturer',
                            'name',
                            [sequelize.fn(
                                'CONCAT',
                                sequelize.col('front_prefix'),
                                sequelize.col('front_width'),
                                '/',
                                sequelize.col('front_aspect'),
                                sequelize.col('front_type'),
                                sequelize.col('front_wheel'),
                            ), 'front'],
                            [sequelize.fn(
                                'CONCAT',
                                sequelize.col('rear_prefix'),
                                sequelize.col('rear_width'),
                                '/',
                                sequelize.col('rear_aspect'),
                                sequelize.col('rear_type'),
                                sequelize.col('rear_wheel'),
                            ), 'rear'],
                        ],
                        order: [['id', 'ASC']],
                        limit: size,
                        offset: (page - 1) * size,
                    })

                resolve({ type: 'select', value: allTrim.map(record => record.toJSON()) })
            } catch (err) {
                reject({ type: 'select', value: err })
            }
        })


    }

    const showTrim = (trim) => {
        return new Promise(async (resolve, reject) => {
            try {
                const targetTrim = await db.models.trims.findByPk(
                    trim,
                    {
                        attributes: [
                            'id',
                            'manufacturer',
                            'name',
                            [sequelize.fn('CONCAT',
                                sequelize.col('front_width'),
                                '/',
                                sequelize.col('front_aspect'),
                                sequelize.col('front_type'),
                                sequelize.col('front_wheel'),
                            ), 'front'],
                            [sequelize.fn('CONCAT',
                                sequelize.col('rear_width'),
                                '/',
                                sequelize.col('rear_aspect'),
                                sequelize.col('rear_type'),
                                sequelize.col('rear_wheel'),
                            ), 'rear'],
                        ],
                    }
                )

                resolve({ type: 'select', value: targetTrim })
            } catch (err) {
                reject({ type: 'insert', value: err })
            }
        })
    }

    const insertUserTrim = (user, trim) => {
        return new Promise(async (resolve, reject) => {
            try {
                const newUserTrim = await db.models.user_trim.create({
                    userId: user,
                    trimId: trim,
                })

                resolve({ type: 'insert', value: true })
            } catch (err) {
                reject({ type: 'insert', value: err })
            }
        })
    }

    const showUserTrim = (user, page = 1, size = 10) => {
        return new Promise(async (resolve, reject) => {
            try {
                const userTrim = await db.models.trims.findAll({
                    attributes: [
                        'id',
                        'manufacturer',
                        'name',
                        [sequelize.fn('CONCAT',
                            sequelize.col('front_width'),
                            '/',
                            sequelize.col('front_aspect'),
                            sequelize.col('front_type'),
                            sequelize.col('front_wheel'),
                        ), 'front'],
                        [sequelize.fn('CONCAT',
                            sequelize.col('rear_width'),
                            '/',
                            sequelize.col('rear_aspect'),
                            sequelize.col('rear_type'),
                            sequelize.col('rear_wheel'),
                        ), 'rear'],
                    ],
                    include: [
                        {
                            model: db.models.users,
                            attributes: [],
                            where: {
                                id: {
                                    [Op.eq]: user
                                }
                            },
                        }
                    ],
                    order: [['id', 'ASC']],
                    limit: size,
                    offset: (page - 1) * size,
                })

                resolve({ type: 'insert', value: userTrim.map(record => record.toJSON()) })
            } catch (err) {
                reject({ type: 'insert', value: err })
            }
        })

    }

    const showMetadata = () => {
        return new Promise(async (resolve, reject) => {
            try {
                let meta = await Promise.all([db.models.users.count({}), db.models.trims.count({})])

                resolve({ type: 'select', value: { users: meta[0], trims: meta[1] } })
            } catch (err) {
                reject({ type: 'select', value: false, reason: err })
            }
        })
    }
    return {
        insertUser,
        validateUser,
        userExists,
        insertTrim,
        showAllTrim,
        showTrim,
        insertUserTrim,
        showUserTrim,
        showMetadata
    }
}