const express = require('express');
const expressGraphQl = require('express-graphql');
const schema = require('./schema');

const app = express();

app.use('/graphql', expressGraphQl({
  schema,
  graphiql: true
}))

app.listen(4000, () => {
  console.log('server running on port 4000.....')
})