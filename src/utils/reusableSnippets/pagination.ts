
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
  const parsedQuery = JSON.parse(JSON.stringify(query))

  if (query.length) {
    // Construct the query
    query = parsedQuery.reduce((x: any, u: any) => {
      x[u.field] = new RegExp(`${u.value}`, 'i')
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
