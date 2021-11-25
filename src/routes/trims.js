var express = require('express');
var router = express.Router();
var db = require('../db/connector')
const cardocAPI = require('./utils/cardocAPI')
const jwtMiddle = require('./middlewares/jwt')
const config = require('../config.json')
const message = require('./utils/message.json')

router.use(jwtMiddle.checkToken)

router.post('/', async (req, res) => {
    let { id, manufacturer, name, front, rear } = req.body

    if (!id || !manufacturer || !name || !front || !rear) {
        return res
            .status(400)
            .send({ message: message.error.notEnoughInfo })
    }

    let connector = await db.getConnector()
    try {
        let result = await connector.predefinedQuery.insertTrim(id, manufacturer, name, front, rear)
        delete result.type
        return res
            .status(200)
            .send(result)
    } catch (err) {
        if (err.value) {
            if (err.value == 'WRONG_FORMAT') {
                return res
                    .status(400)
                    .send({ message: message.error.wrongTireFormat })
            }
        }
        return res
            .status(500)
            .send({ message: message.error.etc });
    }
})

router.get('/', async (req, res) => {

    let connector = await db.getConnector()
    try {
        let page = isNaN(parseInt(req.query.page)) || parseInt(req.query.page) <= 0 ?
            config.server.pageIndexDefault : parseInt(req.query.page)
        let size = isNaN(parseInt(req.query.size)) || parseInt(req.query.size) <= 0 ?
            config.server.pageSizeDefault : parseInt(req.query.size)

        let result = await connector.predefinedQuery.showAllTrim(page, size)
        delete result.type
        return res
            .status(200)
            .send(result)

    } catch (err) {

        return res
            .status(500)
            .send({ message: message.error.etc });
    }
})

router.patch('/:trimId', async (req, res) => {

    let connector = await db.getConnector()
    try {
        let { status, data } = await cardocAPI.getTrimInfo(req.params.trimId)

        if (status != 200) {
            return res
                .status(404)
                .send({ message: message.error.cardocAPINot200 })
        }

        let manufacturer = data.brandName;
        let name = data.modelName;
        let front = data.spec.driving.frontTire.value;
        let rear = data.spec.driving.rearTire.value;

        if (front.length == 0 && rear.length == 0) {
            return res
                .status(404)
                .send({ message: message.error.cardocAPINoTireInfo })
        }

        // 둘중에 하나만 존재한다면 같은 것으로 취급
        if (front.length == 0) {
            front = rear;
        }

        if (rear.length == 0) {
            rear = front
        }

        let result = await connector.predefinedQuery.insertTrim(req.params.trimId, manufacturer, name, front, rear)
        delete result.type

        if (result.value) {
            return res
                .status(200)
                .send()
        } else {
            return res
                .status(400)
                .send({ message: message.error.dataAlreadyExists })
        }
    } catch (err) {
        if (err.value) {
            if (err.value == 'WRONG_FORMAT') {
                return res
                    .status(400)
                    .send({ message: message.error.wrongTireFormat })
            }
        }
        return res
            .status(500)
            .send({ message: message.error.etc });
    }

})

router.get('/:trimId', async (req, res) => {

    if (isNaN(req.params.trimId) || req.params.trimId <= 0) {
        return res
            .status(400)
            .send({ message: message.error.trimIdInvalid})
    }

    let connector = await db.getConnector()
    try {
        let result = await connector.predefinedQuery.showTrim(req.params.trimId)
        delete result.type
        return res
            .status(200)
            .send(result)

    } catch (err) {
        return res
            .status(500)
            .send({ message: message.error.etc });
    }

})

router.post('/of', async (req, res) => {
    let connector = await db.getConnector()

    if (!Array.isArray(req.body)) {
        // 요청 본문은 반드시 배열이어야 합니다.
        return res
            .status(400)
            .send({ message: message.error.bodyHaveToBeArray })
    }

    let promises = []
    req.body.slice(0, config.server.maximumUserTrimRequestSize).forEach(ele => {
        let insertPromise = connector.predefinedQuery.insertUserTrim(ele.user, ele.trim)
        promises.push(insertPromise)
    })

    try {
        let result = await Promise.allSettled(promises)
        let toResponse = []

        result.forEach((ele, idx) => {
            if (ele.status == 'fulfilled') {
                toResponse.push({
                    result: true,
                    request: req.body[idx],
                })
            } else {              
                toResponse.push({
                    result: false,
                    reason: ele.reason.value.original.errno,
                    request: req.body[idx],
                })
            }
        })

        if (req.body.length > config.server.maximumUserTrimRequestSize) {
            let overFlow = req.body.slice(config.server.maximumUserTrimRequestSize, req.body.length)
            let overFlowLength = req.body.length - config.server.maximumUserTrimRequestSize

            overFlow.forEach((ele) => {
                toResponse.push({
                    result: false,
                    reason: message.warning.overMaximumRequest,
                    request: ele,
                })
            })
        }

        return res
            .status(200)
            .send(toResponse)

    } catch (err) {
        if (err.name == 'SequelizeDatabaseError') {
            switch (err.original.errno) {
                case 1048:
                    return res
                        .status(400)
                        .send({ message: message.error.notEnoughInfo });
                        
                case 1062:
                    return res
                        .status(400)
                        .send({ message: message.error.dataOrUserNotExists });
            }
        }

        return res
            .status(500)
            .send({ message: message.error.etc });
    }
})

router.get('/of/:userId', async (req, res) => {
    let connector = await db.getConnector()

    try {
        let page = isNaN(parseInt(req.query.page)) || parseInt(req.query.page) <= 0 ?
            config.server.pageIndexDefault : parseInt(req.query.page)
        let size = isNaN(parseInt(req.query.size)) || parseInt(req.query.size) <= 0 ?
            config.server.pageSizeDefault : parseInt(req.query.size)

        let result = await connector.predefinedQuery.showUserTrim(req.params.userId, page, size)
        delete result.type
        return res
            .status(200)
            .send(result)

    } catch (err) {
        return res
            .status(500)
            .send({ message: message.error.etc });
    }
})

module.exports = router;
