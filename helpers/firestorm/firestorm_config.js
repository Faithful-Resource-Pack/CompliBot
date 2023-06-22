require("dotenv").config();
const firestorm = require("./index");

module.exports = function () {
	firestorm.address(process.env.FIRESTORM_URL);
	firestorm.token(process.env.FIRESTORM_TOKEN);
};
