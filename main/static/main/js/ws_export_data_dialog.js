$(document).ready(() => {
    var exportDataDialog = document.getElementById('export-data-dialog');
    var reservoirsList = document.getElementById('export-data-reservoir-list');
    var fromField = document.getElementById('export-data-dateFrom');
    var untilField = document.getElementById('export-data-dateUntil');
    var dialogCancelBt = document.getElementById('export-data-bt-cancel');
    var dialogCSVBt = document.getElementById('export-data-bt-csv');
    var dialogXLSBt = document.getElementById('export-data-bt-xls');
    var cbCheckAll  = document.getElementById('export-data-reservoir-list-all');
    // reservoirs currently shown in the dialog
    var currentReservoirs = [];

    /**
     * Called when the export data button is called.
     */
    openExportDataDialog = () => {
        $.get(RESERVOIR_DATA_PATH)
        .done((result) => {
            var jsonRes = JSON.parse(result);

            // remove current children from reservoir list
            while (reservoirsList.firstChild)
                reservoirsList.removeChild(reservoirsList.firstChild);
            
            // clear currentReservoirs list
            for (var r in currentReservoirs)
                currentReservoirs.splice(r, 1);

            for (var r in jsonRes) {
                var reservoir = jsonRes[r];

                // create new list element and add to table
                reservoir.cb = document.createElement('input');
                reservoir.cb.type = "checkbox"; reservoir.cb.id = `export-data-reservoir-list-${reservoir.res_id}`;
                reservoir.cb.className = "mdl-checkbox__input";
                reservoir.cb.checked = reservoir.res_id == window.reservoir.res_id;
                var li = document.createElement('li');
                li.className = "mdl-list__item";
                var span1 = document.createElement('span');
                span1.className = "mdl-list__item-primary-content";
                span1.innerHTML = `${reservoir.town}, ${reservoir.county},` + 
                    ` ${reservoir.island}, #${reservoir.res_id}`;
                var span2 = document.createElement('span');
                span2.className = "mdl-list__item-secondary-action";
                var label = document.createElement('label');
                label.className = "mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect";
                label.for = `export-data-reservoir-list-${reservoir.res_id}`;
                li.appendChild(span1);
                label.appendChild(reservoir.cb);
                span2.appendChild(label);
                li.appendChild(span2);
                reservoirsList.appendChild(li);

                currentReservoirs.push(reservoir);
            }

            // show default date from yesterday to today
            var today = new Date();
            var yesterday = new Date(today.getTime() - 25*60*60*1000);
            fromField.value  = moment(yesterday).format('YYYY-MM-DD');
            untilField.value = moment(today).format('YYYY-MM-DD');

            exportDataDialog.showModal();
        })
    }

    /**
     * Downloads the reservoir measurement data
     */
    exportData = (format) => {
        var url = EXPORT_DATA_PATH + "?format=" + format;
        var reservoirsChosen = "";
        var dateFrom = fromField.value;
        var dateUntil = untilField.value;

        if (!moment(dateFrom).isValid() || !moment(dateUntil).isValid()) {
            Util.showMsgDialog('Datas', 'Formato de datas inválido. Utilize o formato ano-mês-dia');
            return;
        }

        url += `&dateFrom=${dateFrom}&dateUntil=${dateUntil}`;

        for (var r in currentReservoirs) {
            if (currentReservoirs[r].cb.checked)
                reservoirsChosen += resId + ",";
        }

        if (reservoirsChosen == '') {
            Util.showErrorDialog('Tens que escolher pelo menos um reservatório');
            return;
        }

        url += "&reservoirs=" + reservoirsChosen.substr(0, reservoirsChosen.length-1);
        var link = document.createElement('a');
        link.href = url;
        link.download = true;
        link.click();
        exportDataDialog.close();
    }

    /**
     * Set the choice to export data of all reservoirs
     */
    checkAll = () => {
        for (var r in currentReservoirs) {
            currentReservoirs[r].cb.checked = cbCheckAll.checked;
        }
    }

    /* set callbacks for buttons */
    document.getElementById('reservoir-link-export-data').onclick = openExportDataDialog;
    document.getElementById('export-data-bt-cancel').onclick = () => exportDataDialog.close();
    dialogXLSBt.onclick = () => exportData('xls');
    dialogCSVBt.onclick = () => exportData('csv');
    cbCheckAll.onclick = checkAll;
})