get = (path, callback) ->
    console.log "PATH", path
    callback()



get "/", ->
    console.log "Hey Now!"

get "/:slug", (slug) ->
    console.log "SLUG"
