import gql from 'graphql-tag'

export const LOGIN = gql`
  query login (
    $username: String!
    $password: String!
    $type: Int!
  ) {
    login (
      username: $username
      password: $password
      type: $type
    ) {
      id
      token
      first_name
      last_name
      contact
      #image
    }
  }
`

export const REGISTER = gql`
mutation createUser () {
  createUser () {

  }
}
`

export const GET_ORDERS = gql`
query orders () {
  orders () {

  }
}
`

export const UPDATE_ORDER = gql`
mutation updateOrder (
  $id: ID!
  $status_id: Int!
) {
  updateOrder (
    id: $id
    status_id: $status_id
  ) {
    
  }
}
`