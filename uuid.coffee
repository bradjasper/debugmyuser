###
### uuid
###
### Generate a random string of characters
###

exports.uuid = (length=4) ->

    random_char = (chars="abcdefghijklmnopqrstuvwxyz1234567890") ->
        chars[Math.round(Math.random() * 100 % chars.length)]

    (random_char() for i in [0...length]).join("")
