from django.urls import path
from . import views

urlpatterns = [
    path("dashboard/", views.dashboard, name="content-dashboard"),
    path("pages/", views.pages, name="content-pages"),
    path("pages/<int:page_id>/", views.page_detail, name="content-page-detail"),
    path("media/", views.media, name="content-media"),
    path("media/<int:asset_id>/", views.media_detail, name="content-media-detail"),
    path("media/folders/", views.media_folders, name="content-media-folders"),
    path("media/folders/<str:folder_id>/", views.media_folder_detail, name="content-media-folder-detail"),
    path("search/", views.search, name="content-search"),
]
