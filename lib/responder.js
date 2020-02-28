const { readFileSync, promises: { open } } = require('fs')
const { lookup } = require('mime-types')
const Handlebars = require('handlebars')

const { STATIC_EXTENSIONS } = require('../config/constants')

const SAFE_FILE_PATTERN = /^\/?[a-zA-Z0-9_-]+\.[a-z]+$/

const routes = require('../routes')
const basePage = readFileSync(`./templates/template.hbs`, { encoding: 'utf8' })

const serveStaticFile = async ({ path, extension, statusCode }, response) => {
  if (STATIC_EXTENSIONS.indexOf(extension) === -1) throw new Error('not_found')
  if (!SAFE_FILE_PATTERN.test(path)) throw new Error('not found')

  let fileHandle

  try {
    fileHandle = await open(`./public/${path}`, 'r')
    const staticFile = await fileHandle.readFile()

    const mime = lookup(extension)
    if (!mime) throw new Error('not_found')

    response.writeHead(statusCode || 200, {
      'Content-Type': mime
    })

    return response.end(staticFile)
  } catch (error) {
    console.error(error)
    throw new Error('not_found')
  } finally {
    if (fileHandle) fileHandle.close()
  }
}

const serveRoute = async ({ request, context, db }, response) => {
  const key = `${request.method}:${request.url}`
  if (!routes[key]) throw new Error('not_found')

  Handlebars.registerPartial('content', routes[key].body)
  const hbs = Handlebars.compile(basePage)
  
  let routeContext = {}
  if (routes[key].data) routeContext = await routes[key].data({ request, db })

  return response.end(hbs({ ...context, ...routeContext }))
}

module.exports = { serveStaticFile, serveRoute }