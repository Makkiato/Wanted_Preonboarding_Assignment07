const jsonwebtoken = require('jsonwebtoken');
const config = require('../../config.json')

module.exports = {
    sign : userId => {
        const payload = {
            userId : userId
        };

        const token = jsonwebtoken.sign(payload, config.jwt.secretKey, config.jwt.options)
        const decrypt =  jsonwebtoken.verify(token, config.jwt.secretKey)
        

        const result = {
            accessToken: token,
            expires: decrypt.exp,
        };

        return result;
    },

    verify : (token) => {
        let decoded;
        try {
            decoded = jsonwebtoken.verify(token, config.jwt.secretKey);
        } catch (err) {
            if (err.message === 'jwt expired') return 'TOKEN_EXPIRED';
            if (err.message === 'invalid token') return 'TOKEN_INVALID';
            return 'TOKEN_INVALID';
        }
        return decoded;
    },
}