import {MutationResolvers} from '../gql/resolvers-types'

// Use the generated `MutationResolvers` type to type check our mutations!
const mutations: MutationResolvers = {
//   Mutation: {
//     addCustomer: (_, { name, surename }, { dataSources: { customers } }) => {
//         const newCustomer = { id: `dasdasdad-no${Math.random()}`, name, surename }
//         customers.push(newCustomer)
//         return {
//                 code: '200',
//                 success: true,
//                 message: 'New customer added!',
//                 customer: customers[customers.length - 1],
//               };
//     },
//     rentABike: (_, { bikeId, clientId, rentTime }, { dataSources: { rents }}) => {
//         rents.push(newRent)
//         return {
//             code: '200',
//             success: true,
//             message: 'New rent reserved',
//             rent: rents[rents.length - 1]
//         }
//     }
//   },
}

export default mutations
