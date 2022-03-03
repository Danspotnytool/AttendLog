
const express = require('express');
const router = express.Router();


// Intex route
router.get('/', (req, res, next) => {
    res.statusCode = 200;
    res.send({
        message: 'Invalid call',
        code: '400'
    });
});

module.exports = router;