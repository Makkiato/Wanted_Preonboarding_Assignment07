var express = require('express');
var router = express.Router();
var db = require('../db/connector')
const jwt = require('./utils/jwt')
const config = require('../config.json')


/**
 *  회원가입 
 */
router.post('/', async (req, res) => {
    let connector = await db.getConnector()

    if (!req.body.id || !req.body.pw) {
        return res.status(400).send()
    }
    try {
        let result = await connector.predefinedQuery.insertUser(req.body.id, req.body.pw)
        delete result.type
        return res
            .status(200)
            .send();
    } catch (err) {
        if (err.value) {
            if (err.value == 'ER_DUP_ENTRY') {
                // 이미 존재하는 사용자입니다.
                return res
                    .status(400)
                    .send()
            }
        }
        return res
            .status(500)
            .send();



    }
})

/**
 *  로그인 
 */
router.post('/token', async (req, res) => {
    let connector = await db.getConnector()

    if (!req.body.id || !req.body.pw) {
        return res
            .status(400)
            .send()
    }
    try {
        let validation = await connector.predefinedQuery.validateUser(req.body.id, req.body.pw)

        if (!validation.value) {
            return res
                .status(404)
                .send()
        }

        const token = jwt.sign(req.body.id)

        const cookieOption = {
            domain: req.hostname,
            // second to milisecond
            expires: new Date(token.expires * 1000),
        };

        return res
            .cookie(config.server.cookieField, token.accessToken, cookieOption)            
            .status(200)
            .send()
    }
    catch (err) {
        return res
            .status(500)
            .send()
    }
})

module.exports = router;
