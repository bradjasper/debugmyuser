require.paths.unshift '.'

express = require('express')
models = require('models')

app = express.createServer()
app.register '.coffee', require('coffeekup')
app.set 'view engine', 'coffee'

# Create Profile
app.get '/', (req, res) ->
    p = models.from_request(req)
    p.save -> res.redirect p.url

# Show Profile
app.get '/:slug', (req, res) ->
    models.Profile.find({slug: req.params.slug}).all (p) ->
        switch p.length
            when 0 then res.send "No Slug Found", 404
            when 1 then res.render 'show_profile', context: {profile: p[0]}
            else res.send "Found too many slugs", 500

app.listen 3000
