// Petfinder Auto-response bot

/* 

MIT License

Copyright (c) 2020 Johnny Richardson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. 

*/

const { ApolloServer, ApolloError, gql } = require('apollo-server-express');

const Apollo = () => {
  const typeDefs = gql`
    type Dog {
      id: ID!
      name: String
      isPending: Boolean
    }
    type Query {
      getDogs: [Dog]
    }
  `;

  const resolvers = {
    Query: {
      getDogs: async () =>
        Dogs.find({})
          .sort({
            date: 'desc',
          })
          .exec(),
    },
  };

  // Instantiate Apollo
  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (err) => {
      // Don't give the specific errors to the client.
      if (err.message.startsWith('Database Error: ')) {
        return new Error('Internal server error');
      }

      // Otherwise return the original error.  The error can also
      // be manipulated in other ways, so long as it's returned.
      return err;
    },
  });

  return apollo;
};

module.exports = Apollo();
