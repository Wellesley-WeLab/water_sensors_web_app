from django.db    import models

from .models_conf import *
from .Reservoir import Reservoir

class Connection (models.Model) :
    """
    Represents a connection between 2 reservoirs
    """

    # id of this object
    con_id       = models.AutoField(primary_key=True)
    # the length of the piping in the conexion
    pipingLength = models.FloatField() # meters
    # maximum flow of water supported by this conexion
    maxFlow      = models.FloatField() # cubic meters / second
    # the reservoirs that are connected
    reservoirA   = models.ForeignKey(Reservoir, related_name='A_con')
    reservoirB   = models.ForeignKey(Reservoir, related_name='B_con')
    # from a to b (if positive), b to a (if negative)  or bidirectional (if 0)
    flowDirection = models.IntegerField()
