import mongoose from 'mongoose'
import { isMongoId } from '.'
import Error from '../../middlewares/errorHandler'
import moment from 'moment'

// TODO: Handle the Date Instance

interface paginateOutput {
  docs: any[]
  total: number
  perPage: number
  page: number
  pages: number
}
interface paginationOptions {
  select: any,
  sort: any,
  page: number,
  perPage: number
}

async function paginate (this: any, 
  query: any,
  options: paginationOptions = {
    select: {},
    sort: [],
    page: 1,
    perPage: 10
  }
): Promise<paginateOutput> {
  // get data from options
  let { select, sort, page, perPage } = options

  // Parse the query coming from the query
  let parsedQuery = JSON.parse(JSON.stringify(query))

  // Get the schema paths of the model
  const paths = this.schema.paths

  if (parsedQuery[0]) {
    // Filter unallowed keys
    parsedQuery = Object
      .values(parsedQuery[0])
      .filter((u: any) => typeof u !== 'string')
      .reduce((x: any, u:any) => { x.push(u[0]); return x }, [])
  }

  if (query.length) {
    // Construct the query
    query = parsedQuery.reduce((x: any, u: any) => {
      if (paths[u.field]['instance'] === 'ObjectID') {
        if (Array.isArray(u.value)) {
          // Check if all the Ids are valid mongoIds
          if (!u.value.every((u:any) => isMongoId(u.value))) {
            throw new Error('One or more of the provided Ids is Invalid', 400)
          }
          x[u.field] = { $in: u.value.map((u: any) => mongoose.Types.ObjectId(u.value)) }
        } else {
          // Check if the id is a valid mongoId
          if (!isMongoId(u.value)) { throw new Error('The provided Id is Invalid', 400) }
          x[u.field] = mongoose.Types.ObjectId(u.value)
        }
      } else if (paths[u.field]['instance'] === 'String') {
        x[u.field] = new RegExp(`${u.value}`, 'i')
      } else if (paths[u.field]['instance'] === 'Date') {
        // Convert the dates to moment objects
        const from = u.from === undefined ? undefined : moment(u.from)
        const to = u.to === undefined ? undefined : moment(u.to)
        
        // Check if the dates are valid
        if (to) {
          if (!to.isValid()) { throw new Error('The to date is invalid') }
        }
        if (from) {
          if (!from.isValid()) { throw new Error('The from date is invalid') }
        }
        
        // Check if the date from is higher than date to
        if (to && from) {
          if (to.isSameOrBefore(from)) {
            throw new Error('The TO date is the same or before the FROM date')
          }
        }

        // Else proceed with the filter
        let filter = {}
        if (from !== undefined) { filter = { $gte: from.toDate() } }
        if (to !== undefined) { filter = { ...filter, $lte: to.toDate() } }

        // create the filter
        x[u.field] = filter
      } else if (paths[u.field]['instance'] === 'Number') {
        // Check if the user selected the equal to field
        // If so no other field can be selected
        if (u.equalTo && (u.greaterThan || u.greaterOrEqualThan || u.lowerThan || u.lowerOrEqualThan)) {
          throw new Error('Unable to use any other operator when using equalTo', 400)
        } 
        // Check if using the greaterThan operator
        else if (u.greaterThan && u.greaterOrEqualThan) {
          throw new Error('Unable to use the greaterThan and greaterOrEqualThan together', 400)
        }
        // Check if using the lowerThan operator
        else if (u.lowerThan && u.lowerOrEqualThan) {
          throw new Error('Unable to use the lowerThan and lowerOrEqualThan together', 400)
        }

        // If all the possible errors were handled proceed to create the filter
        let filter = {}
        if (u.equalTo !== undefined) { filter = { $eq: u.equalTo } }
        if (u.greaterThan !== undefined) { filter = { $gt: u.greaterThan } }
        if (u.greaterOrEqualThan !== undefined) { filter = { $gte: u.greaterOrEqualThan } }
        if (u.lowerThan !== undefined) { filter = { ...filter, $lt: u.lowerThan } }
        if (u.lowerOrEqualThan !== undefined) { filter = { ...filter, $lte: u.lowerOrEqualThan } }

        x[u.field] = filter
      } else {
        // Check if the param is an array
        if (Array.isArray(u.value)) {
          x[u.field] = { $in: u.value.map((u: any) => u.value) }
        } else {
          x[u.field] = u.value
        }
      }
      return x
    }, {})
  } else {
    query = {}
  }

  console.log(query)

  // Parse the sort coming from the sort param
  const parsedSort = JSON.parse(JSON.stringify(sort))

  if (sort.length) {
    // Construct the sort
    sort = parsedSort.reduce((x: any, u: any) => {
      x[u.field] = u.direction
      return x
    }, {})
  } else {
    sort = {}
  }

  // calculate skip
  const skip = (page - 1) * perPage

  // calculate amount of documents
  const total = await this.countDocuments(query)

  const docs = await this.find(query)
    .select(select)
    .sort(sort)
    .skip(skip)
    .limit(perPage)

  // return the data
  return {
    docs,
    total,
    pages: Math.ceil(total / perPage) || 1,
    page,
    perPage
  }
}

export default function(schema: any) {
  schema.statics.paginate = paginate;
};
