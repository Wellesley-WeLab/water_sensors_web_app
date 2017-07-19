from django.db    import models

from .models_conf import *
from .Reservoir import Reservoir

class InputPoint (models.Model) :
    """
    A point of water entry in the reservoir
    """

    # the id of this object
    inPoint_id = models.AutoField(primary_key=True)
    # the reservoir it belongs to
    reservoir = models.ForeignKey(Reservoir, on_delete=models.CASCADE)
