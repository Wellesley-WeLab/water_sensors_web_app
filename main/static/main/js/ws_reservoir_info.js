$(document).ready(() => {

    /* to specify the range of data to read */
    var fromField = document.getElementById('dateFrom');
    var untilField = document.getElementById('dateUntil');
    var xDimField = document.getElementById('xDim');

    
    // chart specific data
    var chartParameters = {
        'waterLevel': {
            'chartOptions': {
                chart: {
                    title: 'Altura do nível de água no reservatório',
                    subtitle: 'em metros (m)'
                },
                colors: ['blue']
            },
            'chartDesc': 'Altura da Água'
        }, 
        'pH': {
            'chartOptions': {
                chart: { title: 'pH da Água' },
                colors: ['green']
            },
            'chartDesc': 'pH'
        }, 
        'salinity': {
            'chartOptions': {
                chart: {
                    title: 'Salinidade da Água',
                    subtitle: 'em gramas de sal por kilogramas de água (PSU)'
                },
                colors: ['#808080']
            },
            'chartDesc': 'Salinidade'
        },
        'conductivity': {
            'chartOptions': {
                chart: {
                    title: 'Condutividade da Água',
                    subtitle: 'em micro Siemens (µS)'
                },
                colors: ['orange']
            },
            'chartDesc': 'Condutividade'
        },
        'tds': {
            'chartOptions': {
                chart: {
                    title: 'Total de Sólidos Disolvidos na Água',
                    subtitle: 'em partes por millão (ppm)'
                },
                colors: ['#423f38']
            },
            'chartDesc': 'TDS'
        }
    }

    /**
     * To load the data into the charts
     */
    loadChartsValues = () => {
        
        var from  = fromField.value;
        var until = untilField.value;
        var dateFrom  = moment(from);
        var dateUntil = moment(until);

        if (!dateFrom.isValid() || !dateUntil.isValid()) {
            Util.showMsgDialog('Datas', 'Formato de datas inválido. Utilize o formato ano-mês-dia');
            return;
        }

        // choose how to group data (by hour, day or month)
        duration = moment.duration(dateUntil.diff(dateFrom));
        var grouping;
        if (duration.years() == 0 && duration.months() == 0 && duration.days() <= 1) {
            document.getElementById('xDim_hour').hidden = false;
            document.getElementById('xDim_day').hidden = true;
            document.getElementById('xDim_month').hidden = true;

            grouping = 'day,hour';            
            if (xDimField.value != 'Horas')
                xDimField.value = 'Horas';
        }
        else if (duration.years() == 0 && duration.months() <= 1) {
            document.getElementById('xDim_hour').hidden = false;
            document.getElementById('xDim_day').hidden = false;
            document.getElementById('xDim_month').hidden = true;

            grouping = 'month,day';
            if (xDimField.value == 'Horas')
                grouping += ',hour';
            else xDimField.value = 'Dias'
        }
        else {
            document.getElementById('xDim_hour').hidden = true;
            document.getElementById('xDim_day').hidden = false;
            document.getElementById('xDim_month').hidden = false;

            grouping = 'year,month';
            if (xDimField.value == 'Dias')
                grouping += ',day';
            else  xDimField.value = 'Meses';
        }
            

        drawChart(grouping, from, until);
    }

    /**
     * Load initial values in the charts
     */
    drawCharts = () => {

        chartParameters['waterLevel'].chart = new google.charts.Line(
            document.getElementById('reservoir-water-level-chart'));
        chartParameters['salinity'].chart = new google.charts.Line(
            document.getElementById('reservoir-salinity-chart'));
        chartParameters['conductivity'].chart = new google.charts.Line(
            document.getElementById('reservoir-conductivity-chart'));
        chartParameters['pH'].chart = new google.charts.Line(
            document.getElementById('reservoir-pH-chart'));
        chartParameters['tds'].chart = new google.charts.Line(
            document.getElementById('reservoir-tds-chart'));

        var today = new Date();
        var yesterday = new Date(today.getTime() - 25*60*60*1000);

        // initially load only today's data
        fromField.value  = moment(yesterday).format('YYYY-MM-DD');
        untilField.value = moment(today).format('YYYY-MM-DD');

        // for when the values change
        fromField.onchange = untilField.onchange = xDimField.onchange = loadChartsValues;

        // load chart values for the first time
        loadChartsValues();
    }

    /**
     * Draw new data in a chart
     * @param {string} clusterBy how to group the data (by hour, day or month)
     * @param {string} from all the measurements should be after this date. Format yyyy-mm-dd
     * @param {string} until all the measurements should be before this date. Format yyyy-mm-dd
     */
    drawChart = (clusterBy, from, until) => {
        var url = RESERVOIR_INFO_PATH + "?data=all" +
            "&res_id=" + window.reservoir.res_id +
            "&dateFrom=" + from + "&dateUnitl=" + until +
            "&clusterBy=" + clusterBy;

        $.get(url)
        .done((result) => {

            var jsonRes = JSON.parse(result); // should be a list of measurements

            for (var data in chartParameters) {

                var chartData = new google.visualization.DataTable();
                chartData.addColumn('string', '');
                
                var chartToDraw = chartParameters[data]['chart'];
                var options = chartParameters[data]['chartOptions'];
                var desc = chartParameters[data]['chartDesc'];

                chartData.addColumn('number', desc);
                var xLabelParts = clusterBy.split(',');

                for (var m in jsonRes) {
                    var measurement = jsonRes[m];
                    var xVal = '';
                    // set the x label as the date of the measurement
                    for (var p in xLabelParts) {
                        var lp = xLabelParts[p];
                        if (lp == 'month')
                            xVal += moment.monthsShort(measurement[lp]-1) + ', ';
                        else if (lp == 'hour')
                            xVal += measurement[lp] + ':00, '
                        else
                            xVal += measurement[lp] + ', ';
                    }
                    // remove the last 2 characters
                    xVal = xVal.substr(0, xVal.length-2);
                    chartData.addRow([xVal, measurement[data]]);
                }

                chartToDraw.draw(chartData, google.charts.Line.convertOptions(options));
            }

        })
        .fail(() => {
            console.log('fail');
        })
    }

    /* load google charts API */
    google.charts.load('current', { 'packages': ['line'] });
    google.charts.setOnLoadCallback(drawCharts);

});
