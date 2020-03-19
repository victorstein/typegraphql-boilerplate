import mongoose from 'mongoose'
import { isMongoId } from '.'

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

  // Filter unallowed keys
  parsedQuery = Object
    .values(parsedQuery[0])
    .filter((u: any) => typeof u !== 'string')
    .reduce((x: any, u:any) => { x.push(u[0]); return x }, [])

  if (query.length) {
    // Construct the query
    query = parsedQuery.reduce((x: any, u: any) => {
      if (paths[u.field]['instance'] === 'ObjectID') {
        if (Array.isArray(u.value)) {
          // Check if all the Ids are valid mongoIds
          if (!u.value.every((u:any) => isMongoId(u.value))) {
            throw new Error('One or more of the provided Ids is Invalid')
          }
          x[u.field] = { $in: u.value.map((u: any) => mongoose.Types.ObjectId(u.value)) }
        } else {
          // Check if the id is a valid mongoId
          if (!isMongoId(u.value)) { throw new Error('The provided Id is Invalid') }
          x[u.field] = mongoose.Types.ObjectId(u.value)
        }
      } else if (paths[u.field]['instance'] === 'String') {
        x[u.field] = new RegExp(`${u.value}`, 'i')
      } else if (paths[u.field]['instance'] === 'Date') {
        // console.log(u.field, parsedQuery)
      } else {
        x[u.field] = u.value
      }
      return x
    }, {})
  } else {
    query = {}
  }

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
