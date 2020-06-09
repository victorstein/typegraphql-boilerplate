const notFound = (_: any, res: any) => {
  return res.status(404).json({
    code: '404',
    message: 'The requested route or method is invalid'
  })
}

export default notFound