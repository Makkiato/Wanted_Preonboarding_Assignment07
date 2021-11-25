var express = require('express');
var router = express.Router();
var db = require('../db/connector')
const jwtMiddle = require('./middlewares/jwt')

router.use(jwtMiddle.checkToken)

/**
 *  trim 추가 
 */
router.post('/', async (req, res) => {
    let { manufacturer, name, front, rear } = req.body

    if (!manufacturer || !name || !front || !rear) {
        return res
            .status(400)
            .send()
    }

    let connector = await db.getConnector()
    try {
        let result = await connector.predefinedQuery.insertTrim(manufacturer, name, front, rear)
        delete result.type
        return res
            .status(200)
            .send(result)

    } catch (err) {
        if (err.value) {
            if (err.value == 'WRONG_FORMAT') {
                // front 혹은 rear의 입력 양식이 맞지 않습니다.
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

router.get('/', async (req, res) => {

    let connector = await db.getConnector()
    try {
        let result = await connector.predefinedQuery.showAllTrim(parseInt(req.query.page), parseInt(req.query.size))
        delete result.type
        return res
            .status(200)
            .send(result)

    } catch (err) {
        if (err.value) {
            return res
                .status(400)
                .send()
        }
        return res
            .status(500)
            .send();
    }
})

router.get('/:trimId', async (req, res) => {

    if (isNaN(req.params.trimId)) {
        return res
            .status(400)
            .send()
    }

    let connector = await db.getConnector()
    try {
        let result = await connector.predefinedQuery.showTrim(req.params.trimId)
        delete result.type
        return res
            .status(200)
            .send(result)

    } catch (err) {
        if (err.value) {
            return res
                .status(400)
                .send()
        }
        return res
            .status(500)
            .send();
    }

})

router.post('/of', async (req, res) => {
    let connector = await db.getConnector()

    if (!Array.isArray(req.body)) {
        // 요청 본문은 반드시 배열이어야 합니다.
        return res
            .status(400)
            .send()
    }

    let promises = []
    req.body.slice(0,4).forEach(ele => {
        let insertPromise = connector.predefinedQuery.insertUserTrim(ele.user, ele.trim)
        promises.push(insertPromise)
    })

    try {
        let result = await Promise.allSettled(promises)
        let toResponse = []

        result.forEach(ele => {
            if (ele.status == 'fulfilled') {
                toResponse.push({
                    result: true,
                })
            } else {
                toResponse.push({
                    result: false,
                    reason: ele.reason.value,
                })
            }
        })

        return res
            .status(200)
            .send(toResponse)

    } catch (err) {
        if (err.value) {
            return res
                .status(400)
                .send()
        }
        return res
            .status(500)
            .send();
    }
})

router.get('/of/:userId', async (req, res) => {
    let connector = await db.getConnector()

    try {
        let result = await connector.predefinedQuery.showUserTrim(req.params.userId, req.query.page, req.query.size)
        delete result.type
        return res
            .status(200)
            .send(result)

    } catch (err) {
        if (err.value) {
            return res
                .status(400)
                .send()
        }
        return res
            .status(500)
            .send();
    }
})

module.exports = router;
