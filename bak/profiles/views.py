import json

from django.shortcuts import get_object_or_404, redirect, render_to_response
from django.http import Http404, HttpResponse

from profiles.models import Profile
from profiles.base import ProfileData

from utils import dict_keys_to_str

def create(request):
    "Create a new profile"
    request.session.set_test_cookie()
    return redirect(ProfileData(request).create_profile(auto_slug=True))

def show(request, slug):
    "Show an existing profile"
    profile = get_object_or_404(Profile, slug=slug)
    if not profile.updated:
        if request.session.test_cookie_worked():
            profile.cookies = "enabled"
            profile.save()

    return render_to_response("profiles/show.html", {"profile": profile})

def ajax(request):
    return HttpResponse("success")

def update(request, slug):
    "Update features on a profile"

    # We do it this way instead of get_object_or_404 so that we can use the
    # update() method on QuerySet and do it without any race conditions
    profile = Profile.objects.filter(slug=slug)
    assert len(profile) == 1, "Couldn't find a single profile with that slug"

    features = dict_keys_to_str(json.loads(request.REQUEST["features"]))
    assert all(map(lambda f: f not in Profile.FORBID_UPDATES, features.keys())), \
        "Don't have permission to update those fields"

    profile.update(updated=True, **features)

    return HttpResponse(json.dumps({"status": "ok"}))
