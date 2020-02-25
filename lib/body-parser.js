const { parse: parseFormatedata } = require('querystring')

const getRequestBody = request => new Promise((resolve, reject) => {
    let formData = ''

    request.on('data', buffer => formData += buffer.toString())
    request.on('error', reject)

    request.on('end', () => {
        const parseData = parseFormatedata(formData)
        return resolve(parseData)
    })
})

module.exports =  { getRequestBody }