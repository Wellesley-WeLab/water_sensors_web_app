from django.conf.urls import url

from . import views

app_name = 'main'
# this list contains the urls of the app functionalities
urlpatterns = [
    url(r'^login$', views.login, name='login'),
    url(r'^do-login$', views.doLogin, name='doLogin'),
    url(r'^do-logout$', views.doLogout, name='doLogout'),
    url(r'^home$', views.home, name='home'),
    url(r'^map$', views.map, name='map'),
    url(r'^reservoir-detailed-info$', views.reservoirDetailedInfo, name='reservoirDetailedInfo'),
    url(r'^reservoir-list$', views.reservoirList, name='reservoirList'),
    url(r'^export$', views.exportMeasurementData, name='exportData'),
    url(r'^measurement-data$', views.measurementData, name="measurementData"),
    url(r'^reservoir-data$', views.reservoirData, name="reservoirData"),
    url(r'^$', views.main, name='main'),
]