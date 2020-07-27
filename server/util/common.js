const common = require('@root/config/common')
require('dotenv').config()

const PORT = process.env.PORT || 8000
const MONGODB_URI = process.env.MONGODB_URI
const PRIVATE_KEY = process.env.PRIVATE_KEY
const EMAIL_PWORD = process.env.EMAIL_PWORD

// game variables
const NUM_ROUNDS = common.inProduction ? 10 : 3
const ROUND_LEN = common.inProduction ? 20 : 45
const WORDS_PER_ROUND = common.inProduction ? 3 : 1

// the number of high scores to track per player
const NUM_HIGH_SCORES = 10

module.exports = {
  ...common,
  PORT, MONGODB_URI, PRIVATE_KEY, NUM_ROUNDS, ROUND_LEN, 
  WORDS_PER_ROUND, NUM_HIGH_SCORES, EMAIL_PWORD
}
