from django.contrib import admin
from .models import ContentActivity, MediaAsset, WebsitePage

admin.site.register(WebsitePage)
admin.site.register(MediaAsset)
admin.site.register(ContentActivity)
