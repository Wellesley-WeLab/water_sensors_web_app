from django.contrib import admin

from .models import *

admin.site.register(Reservoir)
admin.site.register(InputPoint)
admin.site.register(OutputPoint)
admin.site.register(Measurement)
admin.site.register(Pump)
admin.site.register(Connection)
admin.site.register(PumpConnection)