import datetime

from django.db.utils import IntegrityError
from django.db.models import Model, CharField, DateTimeField, IPAddressField, \
                             PositiveIntegerField, BooleanField

from utils import gen_unique_id
from jsonfield.fields import JSONField

class DuplicateSlug(Exception):
    "Slug is already taken"

class Profile(Model):

    # Fields to forbid updating from AJAX client
    FORBID_UPDATES = ["slug", "created", "num_views", "updated", "request",
                      "browscap", "ip"]

    # Status choices for features. No :keywords, blergh Python
    STATUS = (
        ("unknown", "Unknown"),
        ("unsupported", "Unsupported"),
        ("supported", "Supported"),
        ("enabled", "Enabled"))

    # Some of these fields won't be filled out until the JS client replies
    # back to server. Those fields are:
    #   Only update if num_views = 0 && created < 60 seconds
    #   screen_resolution, connection_speed, ajax, javascript, java, flash

    # Meta
    slug = CharField(max_length=10, default=gen_unique_id, unique=True)
    created = DateTimeField(default=datetime.datetime.now)
    num_views = PositiveIntegerField(default=0)
    updated = BooleanField(default=False)

    # Raw Data
    request = JSONField()
    browscap = JSONField()
    ip = IPAddressField()

    # Platform
    os = CharField(max_length=255)
    screen_resolution = CharField(max_length=10, default="unknown")
    connection_speed = CharField(max_length=10, default="unknown")

    # Browser 
    browser = CharField(max_length=255)
    is_mobile = BooleanField(default=False)
    http_protocol = CharField(max_length=10, default="unknown")

    # Features
    javascript = CharField(max_length=20, choices=STATUS, default="unsupported")
    ajax = CharField(max_length=20, choices=STATUS, default="unsupported")
    java = CharField(max_length=20, choices=STATUS, default="unknown")
    css = CharField(max_length=20, choices=STATUS, default="unknown")
    flash = CharField(max_length=20, choices=STATUS, default="unknown")
    gzip = CharField(max_length=20, choices=STATUS, default="unknown")
    cookies = CharField(max_length=20, choices=STATUS, default="unsupported")
    frames = CharField(max_length=20, choices=STATUS, default="unknown")
    iframes = CharField(max_length=20, choices=STATUS, default="unknown")
    tables = CharField(max_length=20, choices=STATUS, default="unknown")

    javascript_version = CharField(max_length=20, default="unknown")
    css_version = CharField(max_length=20, default="unknown")
    flash_version = CharField(max_length=20, default="unknown")
    java_version = CharField(max_length=20, default="unknown")

    def get_absolute_url(self):
        return "/%s" % self.slug

    def save(self, auto_slug=False, *args, **kwargs):
        try:
            super(Profile, self).save(*args, **kwargs)
        except IntegrityError, e:

            if e.args[0] == 1062 and e.args[1].endswith("for key 'slug'"):

                if auto_slug:
                    self.slug = gen_unique_id()
                    super(Profile, self).save(*args, **kwargs)
                else:
                    raise DuplicateSlug("Profile with slug '%s' already exists" % self.slug)
