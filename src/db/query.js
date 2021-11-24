const { Op } = require('sequelize')

module.exports = (db) => {

    const insertUser = async (id, pw) => {
        try {
            const newUser = await db.models.users.create({
                id: id,
                pw: pw
            })

            return { type: 'insert', value: true }
        } catch (err) {
            console.log(err)
            if (err.parent.code == 'ER_DUP_ENTRY') {
                // 이미 존재하는 사용자입니다.
                return { type: 'insert', value: false, reason: err.parent.code }
            }
        }

    }

    const validateUser = async (id, pw) => {
        try {
            const result = await db.models.users.count({
                where: {
                    [Op.and]: [
                        { id: id },
                        { pw: pw }
                    ]
                }
            })

            return { type: 'select', value: result }
        } catch (err) {
            console.log(err)
        }
    }

    const insertTrim = async (front, rear) => {
        const regexCheck = new RegExp(/(?<width>[0-9]+)+\/(?<aspect>[0-9]+)+(?<type>\w)(?<wheel>[0-9]+)+/)
        
        let regFront = regexCheck.exec(front)
        let regRear = regexCheck.exec(rear)

        console.log(regFront)
        console.log(regRear)

        if (!regFront || !regRear) {
            return { type: 'insert', value: false, reason: "WRONG_FORMAT" }
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

            return { type: 'insert', value: newTrim.id }
        } catch (err) {
            console.log(err)            
            return { type: 'insert', value: false, reason: err.parent.code }
            
        }

    }

    const showAllTrim = async () => {

    }

    const insertUserTrim = async (user, trim) => {

    }

    const showUserTrim = async (user) => {

    }

    const showMetadata = async () => {
        try{
            let meta = await Promise.all([db.models.users.count({}),db.models.trims.count({})])
            
            
            return {type : 'select', value : {users : meta[0], trims : meta[1]}}
        } catch (err){
            return {type : 'select', value : false, reason : err}
        }
    }

    return { insertUser, validateUser, insertTrim, showAllTrim, insertUserTrim, showUserTrim, showMetadata }

}