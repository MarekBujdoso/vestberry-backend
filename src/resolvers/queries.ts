import {QueryResolvers} from '../gql/resolvers-types'

// Use the generated `QueryResolvers` type to type check our queries!
const queries: QueryResolvers = {
  // Query: {
//     bikes: (_, __, { dataSources }) => {
//       return dataSources.bikes;
//     },
//     freeBikes: (_, __, { dataSources }) => {
//       return dataSources.bikes.filter(({ isBorrowed }) => !isBorrowed);
  // }
//     rents: (_, __, { dataSources }) => {
//       const { rents, bikes, customers } = dataSources;
//       return rents.map(({ bikeId, customerId, rentDate, paidTime }) => ({
//         bikeModel: bikes.find(({ id }) => id === bikeId).model,
//         customerName: customers.find(({ id }) => id === customerId)
//           .surename,
//         rentDate,
//         paidTime,
//       }));
//     },
//   },
}

export default queries
