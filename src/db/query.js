const sequelize = require('sequelize')
const Op = sequelize.Op

module.exports = (db) => {

    const insertUser = (id, pw) => {
        return new Promise(async (resolve, reject) => {
            try {
                const newUser = await db.models.users.create({
                    id: id,
                    pw: pw
                })

                resolve({ type: 'insert', value: true })
            } catch (err) {
                console.log(err)
                if (err.parent.code == 'ER_DUP_ENTRY') {
                    // 이미 존재하는 사용자입니다.
                    reject({ type: 'insert', value: false, reason: err.parent.code })
                }
            }
        })
    }

    const validateUser = (id, pw) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await db.models.users.count({
                    where: {
                        [Op.and]: [
                            { id: id },
                            { pw: pw }
                        ]
                    }
                })

                resolve({ type: 'select', value: result })
            } catch (err) {
                console.log(err)
                reject({ type: 'insert', value: err.parent.code })
            }
        })
    }

    const insertTrim = (front, rear) => {
        return new Promise(async (resolve, reject) => {
            const regexCheck = new RegExp(/(?<width>[0-9]+)+\/(?<aspect>[0-9]+)+(?<type>\w)(?<wheel>[0-9]+)+/)

            let regFront = regexCheck.exec(front)
            let regRear = regexCheck.exec(rear)

            if (!regFront || !regRear) {
                reject({ type: 'insert', value: "WRONG_FORMAT" })
            }

            try {
                const newTrim = await db.models.trims.create({
                    front_width: regFront.groups.width,
                    front_aspect: regFront.groups.aspect,
                    front_type: regFront.groups.type,
                    front_wheel: regFront.groups.wheel,

                    rear_width: regRear.groups.width,
                    rear_aspect: regRear.groups.aspect,
                    rear_type: regRear.groups.type,
                    rear_wheel: regRear.groups.wheel,
                })

                resolve({ type: 'insert', value: newTrim.id })
            } catch (err) {
                console.log(err)
                reject({ type: 'insert', value: err.parent.code })

            }
        })

    }

    const showAllTrim = () => {
        return new Promise(async (resolve, reject) => {
            try {
                const allTrim = await db.models.trims.findAll({})
                resolve({ type: 'select', value: allTrim })
            } catch (err) {
                console.log(err)
                reject({ type: 'select', value: err.parent.code })
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

    const showUserTrim = (user) => {
        return new Promise(async (resolve, reject) => {
            try{
                const userTrim = await db.models.users.findAll({
                    attributes : [],
                    where : {
                        id : {
                            [Op.eq] : user
                        }
                    },                    
                    include : [
                        {
                            model: db.models.trims,                        
                        }
                    ],
                })

                resolve ({ type: 'insert', value: userTrim.map(record => record.toJSON()) })
            } catch (err) {
                reject ({ type: 'insert', value: err })
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
    return { insertUser, validateUser, insertTrim, showAllTrim, insertUserTrim, showUserTrim, showMetadata }
}