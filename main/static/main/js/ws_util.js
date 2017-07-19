$(document).ready(() => {

    var errorDialog  = document.getElementById('error-dialog');    
    var msgDialog    = document.getElementById('msg-dialog');
    var choiceDialog = document.getElementById('choice-dialog');

    /* some default actions for the dialog buttons */
    document.getElementById('error-dialog-bt-ok').onclick = () => errorDialog.close();
    document.getElementById('msg-dialog-bt-ok').onclick = () => msgDialog.close();
    document.getElementById('choice-dialog-bt-cancel').onclick = () => msgDialog.close();

    /**
     * to show error dialog
     * @param {string} msg error message to show
     */
    var showErrorDialog = (msg) => {
        document.getElementById('error-dialog-content').innerHTML = msg;
        errorDialog.showModal();
    }

    /**
     * to show message dialog
     * @param {string} title the title of the dialog
     * @param {string} msg the message to show
     */
    var showMsgDialog = (title, msg) => {
        document.getElementById('msg-dialog-title').innerHTML = title;        
        document.getElementById('msg-dialog-content').innerHTML = msg;
        msgDialog.showModal();
    }

    /**
     * to show a choice dialog
     * @param {string} title the title of the dialog
     * @param {string} msg the message to indicate the choice
     * @param {function} choiceOk the function to be called if user chooses 'Ok' button
     * @param {function} choiceCancel the function to be called if user chooses 'Cancelar' button
     */
    var showChoiceDialog = (title, msg, choiceOk, choiceCancel) => {

        document.getElementById('choice-dialog-title').innerHTML = title;
        document.getElementById('choice-dialog-content').innerHTML = title;

        document.getElementById('choice-dialog-bt-ok').onclick = () => {
            choiceOk();
            choiceDialog.close();
        }
        if (choiceCancel === undefined)
            document.getElementById('choice-dialog-bt-cancel').onclick = () => choiceDialog.close();
        else document.getElementById('choice-dialog-bt-cancel').onclick = () => {
            choiceCancel();
            choiceDialog.close();
        }

        choiceDialog.showModal();
    }


    /**
     * to add the CSRF token to the post body
     * @param {Object} post the post data to add the CSRF token
     */
    var addCSRF = (post) => {
        // var csrftoken = (document.getElementsByName('csrfmiddlewaretoken')[0]).value;
        var csrftoken = Cookies.get('csrftoken');
        post.csrfmiddlewaretoken = csrftoken;
    }

    /**
     * Create an integer color given the red, blue and green components
     * @param {number} red
     * @param {number} green
     * @param {number} blue
     * @return {number} the color
     */
    var color = (red, green, blue) => {
        var r = red & 255  ; r <<= 16;
        var g = green & 255; g <<= 8;
        var b = blue & 255   

        return r | g | b;
    }

    window.Util = {
        showErrorDialog: showErrorDialog,
        showMsgDialog: showMsgDialog,
        showChoiceDialog: showChoiceDialog,
        addCSRF: addCSRF
    }
})