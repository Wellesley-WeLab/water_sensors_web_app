from django.shortcuts import render, redirect
from django.http      import HttpResponse, Http404
from django.template  import loader
from django.conf      import settings
from django.utils     import timezone

from django.contrib.auth            import authenticate
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models     import User
from django.forms.models            import model_to_dict
from django.core.exceptions         import FieldError, SuspiciousOperation
from django.db.models               import Q
from django.db.models.functions     import Concat, Extract

import django.contrib.auth as auth

from datetime import datetime

import json, csv, xlwt

from .models import *


def main (req) :
    """
    opens the main page or the presentation page
    """

    template = loader.get_template('main/intro.html')
    return HttpResponse(template.render({}, req))


def login (req) :
    """
    Returns the login page
    """

    template = loader.get_template('main/login.html')
    return HttpResponse(template.render({}, req))


def doLogin (req) :
    """
    This function does the actual login verification. It checks the credentials
    and returns error messages or an ok and saves the user session.
    """

    username = req.POST['username']
    password = req.POST['password']

    # search for a user with the username
    try :
        User.objects.get(username=username)
    except User.DoesNotExist :
        # return username error
        print("[doLogin] invalid username")
        res = '{"state":"err", "err": "username"}'
        return HttpResponse(res)

    user = authenticate(username=username, password=password)
    # check password
    if user is not None :
        # save session
        auth.login(req, user)
        print("[doLogin] login succeded")
    else:
        # return password error
        print("[doLogin] invalid password")
        res = '{"state":"err", "err": "password"}'
        return HttpResponse(res)

    # go to the home page
    return HttpResponse('{"state": "ok"}')


@login_required(login_url='/login')
def doLogout (req) :
    auth.logout(req)
    return redirect('/login')


@login_required(login_url='/login')
def home (req) :
    """
    Returns the home page
    """

    template = loader.get_template('main/home.html')
    return HttpResponse(template.render({}, req))


@login_required(login_url='/login')
def map (req) :
    """
    Returns a page with a map with the locations of the reservoirs, pumps and the conections.
    Maps can be show with all the information, can be shown with information focused on
    just one reservoir and its connections or focused on one region and its reservoirs
    """

    reservoirs    = []
    pumps         = []
    resCons       = []
    pumpCons      = []

    try:

        # get information related to one reservoir
        if 'id' in req.GET :
            reservoirId = int(req.GET['id'])
            resCons  = Connection.objects \
                .filter(Q(reservoirA__res_id=reservoirId) | Q(reservoirB__res_id=reservoirId))
            pumpCons = PumpConnection.objects.filter(reservoir__res_id=reservoirId)
            res      = Reservoir.objects.filter(Q(res_id=reservoirId) | Q(res_id__in=resCons))
            pmps     = Pump.objects.filter(pump_id__in=pumpCons)
            
            resCons = resCons.values('pipingLength', 'maxFlow', 'flowDirection',
                'con_id', 'reservoirA__res_id', 'reservoirB__res_id')
            pumpCons = pumpCons.values('pipingLength', 'maxFlow', 'reservoir__res_id', 'pump__pump_id')
        
        # get information of reservoirs only in a particular region
        elif 'region' in req.GET :
            regionName = req.GET['region']
            res = Reservoir.objects.filter(
                Q(island__icontains=regionName) | 
                Q(county__icontains=regionName) | 
                Q(town__icontains=regionName))
            resCons = Connection.objects \
                .filter(Q(reservoirA_id__in=res) | Q(reservoirB_id__in=res)) \
                .values('pipingLength', 'maxFlow', 'flowDirection',
                'con_id', 'reservoirA__res_id', 'reservoirB__res_id')
            pumpCons = PumpConnection.objects.filter(reservoir_id__in=res)
            pmps     = Pump.objects.filter(pump_id__in=pumpCons)

            pumpCons = pumpCons.values('pipingLength', 'maxFlow', 'reservoir__res_id', 'pump__pump_id')

        else : # get all data
            res       = Reservoir.objects.all()
            pmps      = Pump.objects.all()
            pumpCons  = PumpConnection.objects \
                .values('pipingLength', 'maxFlow', 'reservoir__res_id', 'pump__pump_id')
            resCons = Connection.objects \
                .values('pipingLength', 'maxFlow', 'flowDirection',
                'con_id', 'reservoirA__res_id', 'reservoirB__res_id')

        for r in res :
            reservoirs.append({
                'id': r.res_id,
                'position': {'lat': r.latitude, 'lng': r.longitude},
                'address': r.addressName()
            })
        for p in pmps :
            pumps.append({
                'id': p.pump_id,
                'position': {'lat': p.latitude, 'lng': p.longitude},
                'address': p.addressName()
            })

    except Exception as e:
        print("[map] couldn't get data: {}".format(e))

    
    # check return type: return json data or the full page
    if 'res-type' in req.GET and req.GET['res-type'] == 'json' :
        data = {
            'reservoirs'     : reservoirs,
            'pumps'          : pumps,
            'reservoirCons'  : list(resCons),
            'pumpCons'       : list(pumpCons)
        }
        return HttpResponse(json.dumps(data))

    data = {
        'google_maps_key': settings.GOOGLE_MAPS_KEY,
        'reservoirs'     : json.dumps(reservoirs),
        'pumps'          : json.dumps(pumps),
        'reservoirCons'  : json.dumps(list(resCons)),
        'pumpCons'       : json.dumps(list(pumpCons))
    }
    template = loader.get_template('main/map.html')
    return HttpResponse(template.render(data, req))


@login_required(login_url='/login')
def reservoirList (req) :
    """
    Returns the page with the list of reservoirs
    """

    reservoirs = []
    islands    = []
    counties   = []
    try:
        reservoirs = Reservoir.objects.all()
        islands    = reservoirs.order_by().values_list('island', flat=True).distinct()
        counties   = reservoirs.order_by().values_list('county', flat=True).distinct()

        for r in reservoirs :
            r.setTemplateValues()
            # get the data from the last measurement from this reservoir
            try :
                r.lastMeasurement_ = Measurement.objects.filter(reservoir_id=r.res_id).latest('dateTime')
                r.waterVolume_     = r.lastMeasurement_.waterVolume()
            except Measurement.DoesNotExist :
                r.lastMeasurement_ = None
                r.waterVolume_ = 'Sem medições'

    except Exception as e:
        print("[reservoirList] couldn't get reservoir data: {}".format(e))

    template = loader.get_template('main/reservoirs_list.html')
    data = {
        'islands': islands,
        'counties': counties,
        'reservoirs': reservoirs
    }
    return HttpResponse(template.render(data, req))


@login_required(login_url='/login')
def reservoirDetailedInfo (req) :
    """
    Returns detailed information about the a reservoir and today's measurements
    """

    reservoirId = req.GET['id']
    try:
        reservoir = Reservoir.objects.get(res_id=reservoirId)
        reservoir.setTemplateValues()
        reservoir.totalCapacity_   = '{:.2f}'.format(reservoir.totalCapacity_)        
        # get the data from the last measurement from this reservoir
        try :
            reservoir.lastMeasurement_ = Measurement.objects.filter(
                reservoir_id=reservoir.res_id).latest('dateTime')
            reservoir.waterVolume_     = '{:.2f}'.format(reservoir.lastMeasurement_.waterVolume())
        except Measurement.DoesNotExist :
            reservoir.lastMeasurement_ = None
            reservoir.waterVolume_ = 'Sem medições'
        inputs  = InputPoint.objects.filter(reservoir_id=reservoir.res_id).values()
        outputs = OutputPoint.objects.filter(reservoir_id=reservoir.res_id).values()
    except Reservoir.DoesNotExist as e:
        print('[reservoirDetailedInfo] data for reservoir {} not found: {}'.format(reservoirId, e))
        raise Http404('Página não encontrada')

    data = {
        'reservoirState': reservoir, # will contain water level info, etc.
        'reservoir': json.dumps(model_to_dict(reservoir)), # won't contain current waterLevel, etc.
        'pictures': reservoir.allPics(),
        'inputs': json.dumps(list(inputs)),
        'outputs': json.dumps(list(outputs)),
    }

    template = loader.get_template('main/reservoir_info.html')
    return HttpResponse(template.render(data, req))


@login_required(login_url='/login')
def measurementData (req) :
    """
    Returns Measurements in json format
    """
    reservoirId =  'all'
    if 'res_id' in req.GET :
        reservoirId = req.GET['res_id']
    data          = req.GET['data']
    dateFrom      = req.GET['dateFrom']
    dateUntil     = req.GET['dateUnitl']
    clusterBy     = req.GET['clusterBy']

    # return JSON values
    measurements = Measurement.get(reservoirId, data, clusterBy, dateFrom, dateUntil)
    return HttpResponse(json.dumps(list(measurements)))


@login_required(login_url='/login')
def reservoirData (req) :
    """
    Returns Reservoir data in json format
    """

    # return JSON values
    reservoirs = Reservoir.objects.values()
    return HttpResponse(json.dumps(list(reservoirs)))


@login_required(login_url='/login')
def exportMeasurementData (req) :
    """
    Returns the measurement data from a list of reservoirs in Excel compatible format (csv or xls)
    """
    
    availableFormats = ['csv', 'xls']
    if not 'format' in req.GET or \
    not req.GET['format'] in availableFormats or \
    not 'dateFrom' in req.GET or \
    not 'dateUntil' in req.GET or \
    not 'reservoirs' in req.GET :
        print('[exportMeasurementData] missing parameters')
        raise FieldError('Pedido Inválido')
    
    # names that will be shown in the header of Excel table
    dataColumns = ['Reservatório', 'Data e Hora', 'Nivel de Água', 
                         'pH', 'Condutividade', 'Salinidade', 'TDS']
    # the attributes to export
    attrKeys = ['reservoir__res_id', 'dateTime', 
                    'waterLevel', 'pH', 'conductivity', 'salinity', 'tds']

    try :
        dtFrom  = timezone.datetime.strptime(req.GET['dateFrom'], '%Y-%m-%d')
        dtUntil = timezone.datetime.strptime(req.GET['dateUntil'], '%Y-%m-%d')
        data = Measurement.objects \
            .filter(dateTime__gte=dtFrom, dateTime__lte=dtUntil) \
            .values(*attrKeys)
        
        if req.GET['reservoirs'] != 'all' or req.GET['reservoirs'] == '':
            data.filter(reservoir__res_id__in=req.GET['reservoirs'].split(','))

        # change dates to string values
        for value in data :
            value['dateTime'] = value['dateTime'].strftime('%d-%m-%Y %H:%M')

    except Exception as e:
        print('[exportMeasurementData] failed to read data: {}'.format(e))
        raise SuspiciousOperation('Não foi possivel ler os dados')


    if req.GET['format'] == 'csv' :
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachement; filename="exported_data.csv"'
        writer = csv.writer(response)
        writer.writerow(dataColumns)
        dataAsValuesList = data.values_list(*attrKeys)
        for values in dataAsValuesList :
            writer.writerow(values)
        
        return response
    
    else : # format == 'xls'
        response = HttpResponse(content_type='text/ms-excel')
        response['Content-Disposition'] = 'attachement; filename="exported_data.xls"'
        writer = xlwt.Workbook(encoding='utf-8')
        sheet = writer.add_sheet('Medições')

        row = 0

        headerFont = xlwt.XFStyle()
        headerFont.font.bold
        # write the table header
        for col in range(len(dataColumns)) :
            sheet.write(row, col, dataColumns[col], headerFont)
        
        bodyFont = xlwt.XFStyle()
        # write the body
        for values in data :
            row += 1
            for col in range(len(values)) :
                sheet.write(row, col, values[attrKeys[col]], bodyFont)
        
        writer.save(response)
        return response