from browscap import BrowserCapabilities

from profiles.models import Profile

# This may take a second to load so lets do it once on startup
bc = BrowserCapabilities()

class ProfileData(object):
    "Profile data containing browscap and additional information"

    def __init__(self, request):
        self.request = self.filter_request(request)
        self.browscap = bc.query(self.request.get("HTTP_USER_AGENT"))

    def filter_request(self, request):
        """Filter a request. It contains a bunch of things we don't need and
           don't want to store"""
        # Don't need anything that's not a string
        filter_func = lambda pair: isinstance(pair[1], basestring)
        return dict(filter(filter_func, request.META.iteritems()))

    def create_profile(self, **kwargs):
        profile = Profile()

        # Raw Data
        profile.request = self.request
        profile.browscap = self.browscap.__dict__

        # Platform
        profile.os = self.os()
        profile.ip = self.request["REMOTE_ADDR"]

        # Browser
        profile.browser = self.browser()
        profile.is_mobile = self.browscap.is_mobile()
        profile.http_protocol = self.request["SERVER_PROTOCOL"]

        if self.browscap.supports_java():
            profile.java = "supported"

        if self.browscap.supports_javascript():
            profile.javascript = "supported" 

        if self.browscap.supports_iframes():
            profile.iframes = "supported" 

        if self.browscap.supports_frames():
            profile.frames = "supported" 

        if self.browscap.supports_tables():
            profile.tables = "supported" 

        if self.browscap.css_version() != 0:
            profile.css = "supported"
            profile.css_version = self.browscap.css_version()

        if "gzip" in self.request["HTTP_ACCEPT_ENCODING"].lower():
            profile.gzip = "supported"

        profile.save(**kwargs)

        return profile

    def os(self):
        if self.browscap["platform"] == "MacOSX":
            return "Mac OS X"

        return self.browscap["platform"]

    def browser(self):
        return "%s %s" % (self.browscap.get("browser"), self.browscap.get("version"))
