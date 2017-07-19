from django.db    import models
from django.utils import timezone
from django.conf  import settings
from os           import path
from enum         import Enum
from datetime     import datetime

from .models_conf import *
from .Reservoir import Reservoir
from .Pump      import Pump

class PumpConnection (models.Model) :
    """
    Represents the connection between a pump and a reservoir
    """

    # id of this connection
    pump_con_id  = models.AutoField(primary_key=True)
    # the length of the piping in the conexion
    pipingLength = models.FloatField() # meters
    # maximum flow of water supported by this conexion
    maxFlow      = models.FloatField() # cubic meters / second
    # the reservoir that are connected
    reservoir    = models.ForeignKey(Reservoir)
    # the pump that is the source of the connection
    pump         = models.ForeignKey(Pump)
