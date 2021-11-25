const jwt = require('../utils/jwt.js');
const config = require('../../config.json')
const db = require('../../db/connector')

//토큰 확인
exports.checkToken = async (req, res, next) => {
    try {
        //const authorization = req.headers.authorization;
        const authorization = req.cookies[config.server.cookieField]

        //토큰이 없는경우
        if (!authorization) {
            return res
                .status(401)
                .send()
        }

        //토큰 인증(확인)
        const user = await jwt.verify(authorization);

        //토큰 만료되는 경우 
        if (user === 'TOKEN_EXPIRED') {
            return res
                .status(401)
                .send()
        }

        //토큰 무효되는 경우
        if (user === 'TOKEN_INVALID' || user.userId === undefined) {
            return res
                .status(401)
                .send()
        }

        let connector = db.getConnector();
        let exists = await connector.predefinedQuery.userExists(user.userId)

        //토큰에서 추출한 userId payload가 회원 아이디로 존재하지 않은 경우
        if(!exists){
            return res
                .status(401)
                .send()
        }

        req.decoded = user;
        next();
    } catch (err) {
        next(err);
    }
}
