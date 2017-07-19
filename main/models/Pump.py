from django.db    import models

from .models_conf import *


class Pump (models.Model) :
    """
    Represents a water extraction an pumping site
    """

    # id of this pump
    pump_id = models.AutoField(primary_key=True)
    # the maximum daily water production capacity
    maxProdCapacity = models.FloatField()  # cubic meters / day
    # the maximum pumping capacity
    maxPumpingCapacity = models.FloatField() # cubic meters / second
    # the specific location of the pump
    latitude  = models.FloatField()
    longitude = models.FloatField()
    # island where the pump is located
    island    = models.CharField(max_length=MAX_STR_SIZE)
    # county(concelho) where the pump is located
    county  = models.CharField(max_length=MAX_STR_SIZE)
    # the town where the pump is located
    town      = models.CharField(max_length=MAX_STR_SIZE)

    def addressName (self) :
        """
        Builds a printable address of the pump's location.

        Returns
        -------
        str
        """

        return "{}, {}, {}, @({}, {})".format(
                self.town, self.county, self.island, self.latitude, self.longitude)
