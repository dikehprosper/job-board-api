const express = require("express");
const router = express.Router();
const { routesWrapper } = require('../utils/handlers')
const { getUserFlag } = require('../middlewares/flags.middleware')

router.route('/').get(routesWrapper([getUserFlag, getUser]))