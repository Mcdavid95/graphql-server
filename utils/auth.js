const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');

dotenv.config();

const signToken = str => {
  return new Promise(resolve => {
    resolve(jwt.sign({ userId: str }, process.env.JWT_SECRET))
  })
}
const verifyJwt = args => {
  let token
  if (args && args.hasOwnProperty('access_token')) {
    token = args.access_token
  } else if (args.authorization && args.authorization.includes('Bearer')) {
    token = args.authorization.split(' ')[1]
  }
  
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) reject('401: User is not authenticated')
   
      resolve(decoded)
    })
  })
}
module.exports = { signToken, verifyJwt }