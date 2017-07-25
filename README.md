# Ouriço

The Ouriço Water Monitoring System is a collaborative project between the University of Cabo Verde and Wellesley College. Its objective is to measure and record water level and water quality in the reservoirs of Cabo Verde. These reservoirs are typically distanced from the communities they provide water, which makes their maintenence and monitoring difficult. This project intends to address this problem by providing quality and level data in real time.

## Dependencies

This project uses:
* Python v3.5.3
* Django v1.11.3
* MySQL v5.7.18.
* MySQLdb v1.3.7 - MySQL driver for Python
* xlwt v1.2 - To generate XLS (Excel) files

## Source Code Structure

The relevant code is in the folders ```main``` and ```water_sensor```. The folder ```water_sensor``` contains the project settings. The folder ```main``` contains the application functionality:
```
migrations
models     // contains the database tables-classes
static
|___main
|______css // css files
|______img // images
|______js  // javascript files
templates
|___main   // contains the html files
admin.py   // data to manage in the administrator page
apps.py 
urls.py    // urls for the application functionality
views.py   // the functions to handle the user requests
```

## Data Models

The models are defined in the folder main/models:

* ```Reservoir``` (Reservoir.py) Data to describe the reservoir
* ```Measurement``` (Measurement.py) Data from a measurement
* ```Pump``` (Pump.py) Data to describe a water pump (source)
* ```Connection``` (Connection.py) Data to describe a connection between reservoirs
* ```PumpConnection``` (PumpConnection.py) Data to describe a connection between a pump and a reservoir
* ```OutputPoint``` (OutputPoint.py) Data to describe a water output in the reservoir
* ```InputPoint``` (InputPoint.py) Data to describe a water input in the reservoir

## URL's

Each URL implements a specific functionality of the system. When accessed a specific function will be called to return an HTML page or JSON result.

* /login: the login page. Calls the function login in the views.py file.
* /doLogin: validates the credentials inserted. Calls the function doLogin in the views.py file
* /doLogout: Calls the function doLogout in the views.py file
* /home: Home page of the user. NOTE: not yet implemented
* /map: Map with the reservoir locations. Calls the function map in the file views.py
* /reservoir-list: Shows the list of the reservoirs registered in the database. Calls the function reservoirList in the file views.py
* /reservoir-detailed-info: Detailed information of a certain reservoir. Calls the function reservoirDetailedInfo in the file views.py
* /export: To measurement data to Excel format. Calls the function exportMeasurementData in the file views.py
* /measurement-data: To query measurement data. Calls the function measurementData in the file views.py
* /reservoir-data: To query reservoir data. Calls the function reservoirData in the file views.py
