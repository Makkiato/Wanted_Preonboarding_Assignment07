var express = require('express');
var router = express.Router();
var db = require('../db/connector')


router.get('/', function(req, res, next) {
  res.status(200).send();
});

/**
 * 메타데이터
 *    현재 DB에 저장된 user, trim의 갯수를 알려줌.
 *    test scenario 구성용 => 나중에는 직접 해당 PK를 알려주는게 나을지도
 */
router.get('/metadata', async function(req, res, next) {  
  let connector = await db.getConnector()
  
  res.status(200).send((await connector.predefinedQuery.showMetadata()).value);
});

module.exports = router;
