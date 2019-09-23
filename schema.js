const axios = require("axios");
const { signToken, verifyJwt } = require('../GraphQL-Tutorial/utils/auth');
const data = require('./data.json');

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = require("graphql");

// Actors Type
const ActorsType = new GraphQLObjectType({
  name: "actors",
  fields: () => ({
    name: { type: GraphQLString },
    birthday: { type: GraphQLString },
    country: { type: GraphQLString },
    directors: { type: ActorsType }
  })
})

const UserType = new GraphQLObjectType({
  name: "users",
  fields: () => ({
    id: { type: GraphQLString },
    username: { type: GraphQLString },
    password: { type: GraphQLString }
  })
})

const UserObject = new GraphQLObjectType({
  name: "user",
  fields: () => ({
    token: { type: GraphQLString },
    user: { type: UserType }
  })
})

// Movie Type
const MovieType = new GraphQLObjectType({
  name: "Movie",
  fields: () => ({
    scoutbase_rating: {
      type: GraphQLString,
      args: {
        access_token: { type: GraphQLString }
      },
      resolve: async (parentValue, args) => {
        try {
          await verifyJwt(args);
          return `${Math.floor(Math.random() * (11 - 5)) + 5}.0`
        } catch (err) {
          console.log(err)
          return '';
        }
      }
    },
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    year: { type: GraphQLString },
    rating: { type: GraphQLString },
    actors: { type: ActorsType }
  })
});

// Root Query
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    movie: {
      type: MovieType,
      args: {
        id: { type: GraphQLString }
      },
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/movies/${args.id}`)
          .then(res => res.data)
          .catch(err => console.error(err));
      }
    },
    movies: {
      type: new GraphQLList(MovieType),
      resolve(parentValue, args) {
        return axios
          .get("http://localhost:3000/movies")
          .then(res => res.data)
          .catch(err => console.error(err));
      }
    }
  }
});

// mutations
const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    createUser: {
      type: UserObject,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parentValue, args) {
        const isUser = data.users.find(user => user.username === args.username)
        if (isUser) {
          return new Error('User already exists')
        }
        return axios
          .post('http://localhost:3000/users', {
            username: args.username,
            password: args.password
          })
          .then(res => ({ token: signToken(res.data.id), user: res.data }))
          .catch(err => console.error(err));
      }
    },
    login: {
      type: UserObject,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parentValue, args) {
        return axios
          .get('http://localhost:3000/users')
          .then((res) => {
            const isUser = res.data.find(user => user.username === args.username && user.password === args.password)
            if (isUser) {
              return { token: signToken(isUser.id), user: isUser }
            }
            return new Error('username or password incorrect')
           })
          .catch(err => console.error(err));
      }
    }
  }
});

module.exports = new GraphQLSchema({ query: RootQuery, mutation });
