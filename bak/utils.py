import uuid

def gen_unique_id(length=4):
    """Generate a short random id"""
    return unicode(uuid.uuid4()).replace("-", "")[:length]

def dict_keys_to_str(dictionary):
    """Convert the keys for a dictionary to a string. This is useful because
    Django models don't accept unicode keywords"""
    return dict((str(pair[0]), pair[1]) for pair in dictionary.iteritems())
