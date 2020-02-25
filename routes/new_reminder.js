const { getRequestBody } = require('../lib/body-parser')

exports.uri = '/new'
exports.template = 'new_reminder'
exports.method = 'POST'

exports.data = async request => {
    const formData = await getRequestBody(request)
    return formData
}