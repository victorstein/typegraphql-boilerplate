
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
    sort: {},
    page: 1,
    perPage: 10
  }
): Promise<paginateOutput> {
  // get data from options
  const { select, sort, page, perPage } = options

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
