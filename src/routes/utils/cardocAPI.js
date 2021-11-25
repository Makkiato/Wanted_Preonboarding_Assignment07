const https = require('https')
const config = require('../../config.json')


module.exports.getTrimInfo = (trimId => {
    return new Promise ((resolve, reject) => {
        let option = {
            hostname : config.cardoc.hostname,
            port: config.cardoc.port,
            path: config.cardoc.path+`/${trimId}`,
            method: config.cardoc.method,      
        }
    
        let req = https.request(option, res => {
            let aggregator = ''

            res.on('data', data => {
                aggregator = aggregator.concat(data)                
            })

            res.on('end', () => {
                resolve({status : res.statusCode, data : JSON.parse(aggregator)})
            })
        })

        req.on('error', err => {
            reject(err)
        })

        req.end()
    })    
})