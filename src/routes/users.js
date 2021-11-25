var express = require('express');
var router = express.Router();
var db = require('../db/connector')
const jwt = require('./utils/jwt')
const config = require('../config.json')
const message = require('./utils/message.json')

router.post('/', async (req, res) => {
    let connector = await db.getConnector()

    if (!req.body.id || !req.body.pw) {
        return res.status(400).send({message : message.error.notEnoughInfo})
    }
    try {
        let result = await connector.predefinedQuery.insertUser(req.body.id, req.body.pw)
        delete result.type

        if (result.value) {
            // 회원가입 성공
            return res
                .status(200)
                .send();
        } else {
            // 이미 존재하는 사용자
            return res
                .status(400)
                .send({message : message.error.userAlreadyExists})
        }

    } catch (err) {
        return res
            .status(500)
            .send({message : message.error.etc});



    }
})

router.post('/token', async (req, res) => {
    let connector = await db.getConnector()

    if (!req.body.id || !req.body.pw) {
        return res
            .status(400)
            .send({message : message.error.notEnoughInfo})
    }
    try {
        let validation = await connector.predefinedQuery.validateUser(req.body.id, req.body.pw)

        if (!validation.value) {
            // 등록정보 없음
            return res
                .status(404)
                .send({message : message.error.userNotExists})
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
            .send({message : message.error.etc})
    }
})

module.exports = router;
