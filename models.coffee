require.paths.unshift('.')

uuid = require('uuid').uuid
mongoose = require('mongoose').Mongoose
db = mongoose.connect('mongodb://localhost/db')

mongoose.model('Profile', {

    properties: ['slug', 'created', 'views', 'updates',     # Meta
                 'request', 'browscap',                     # Data
                 'os', 'ip', 'resolution', 'connection']    # Platform

    indexes: ['slug']

    getters: {
        url: -> '/' + @slug
    }

})

exports.Profile = db.model("Profile")
exports.from_request = (req) ->
    p = new exports.Profile({slug: uuid()})
    p
