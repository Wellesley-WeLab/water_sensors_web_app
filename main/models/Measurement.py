from django.db    import models
from enum         import Enum
from django.utils import timezone

from .models_conf import *
from .Reservoir import Reservoir

class Measurement (models.Model) :
    """
    A periodic measurement of the water level and quality
    Water quality is given by it's pH and conductivity
    """


    # the id of this measurement
    mes_id       = models.AutoField(primary_key=True)
    # the reservoir this measurement belongs to
    reservoir    = models.ForeignKey(Reservoir)
    # date and time of reading
    dateTime = models.DateTimeField(default=timezone.now)
    # height of water in the reservoir
    waterLevel   = models.FloatField(default=-1)
    # pH of the water
    pH           = models.FloatField(default=-1)
    # conductivity of the water
    conductivity = models.FloatField(default=-1)
    # salinity of the water
    salinity     = models.FloatField(default=-1)
    # total disolved solids in the water
    tds          = models.FloatField(default=-1)
    # the number of the package corresponding to this measurement
    packetNr     = models.IntegerField()

    def waterQuality (self) :
        """
        Returns a measure of water quality according to pH and conductivity
        """
        # TODO: implement
        pass


    def waterVolume (self) :
        """
        Returns the quantity of water in the reservoir according to this measurement.

        Returns
        -------
        float
        """

        return self.waterLevel*self.reservoir.width*self.reservoir.length

    ## TODO: get only the attributes specified in data
    ## TODO: at this point everything is being retrieved
    def get (reservoirs, data, clusterBy, dateFrom, dateUntil) :
        """
        Returns a set of measurements filtered by 'dataFilter'.

        Parameters
        ----------
        reservoirs: int
            The reservoirs to get measurements. If it is 'all' or '' every reservoir will be considered.
        data: str
            Specifies the attribute to read. If it is 'all' or '' every attribute will be read.
        clusterBy: [str]
            Indicates how to distinguish the data (by hours, days(averages), months(averages))
        dateFrom: str
            Measurements should have dateTime value after, or at, this date
        dateUntil: str
            Measurements should have dateTime value before, or at, this date
        Returns
        -------
        QuerySet
        """

        # choose how to group values
        selectedValues =  clusterBy.split(',')

        dtFrom  = timezone.datetime.strptime(dateFrom, '%Y-%m-%d')
        dtUntil = timezone.datetime.strptime(dateUntil, '%Y-%m-%d')

        measurements =  Measurement.objects \
            .extra(select={'minute': 'minute(dateTime)', 'hour': 'hour(dateTime)', \
                  'day': 'day(dateTime)', 'month': 'month(dateTime)', 'year': 'year(dateTime)'}) \
            .filter(dateTime__gt=dtFrom, dateTime__lte=dtUntil)

        if reservoirs != 'all' :
            reservoirsAccpeted = reservoirs.split(',')
            measurements = measurements.filter(reservoir__res_id__in=reservoirsAccpeted)

        measurements = measurements.order_by(*selectedValues) \
            .values(*selectedValues) \
            .annotate(
                waterLevel=models.Avg('waterLevel'),
                pH=models.Avg('pH'),
                conductivity=models.Avg('conductivity'),
                salinity=models.Avg('salinity'),
                tds=models.Avg('tds'))

        return measurements
        