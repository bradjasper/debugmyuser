from django.conf.urls.defaults import *
from django.contrib import admin
from django.views.static import serve
from django.conf import settings

admin.autodiscover()

urlpatterns = patterns('',
    (r'^admin/', include(admin.site.urls)),
    (r'^media(?P<path>.*)$', serve, {"document_root": settings.MEDIA_ROOT}),
    (r'^$', 'profiles.views.create'),
    (r'^ajax$', "profiles.views.ajax"),
    (r'^(?P<slug>.*)/update', "profiles.views.update"),
    (r'^(?P<slug>.*)', "profiles.views.show")
)
