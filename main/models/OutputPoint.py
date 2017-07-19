from django.db    import models

from .models_conf import *
from .Reservoir import Reservoir

class OutputPoint (models.Model) :
    """
    A point of water exit in the reservoir
    """

    # the id of this object
    outPoint_id = models.AutoField(primary_key=True)
    # the reservoir it belongs to
    reservoir = models.ForeignKey(Reservoir, on_delete=models.CASCADE)
