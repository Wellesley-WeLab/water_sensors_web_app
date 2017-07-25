doLogin = () => {

    var usernameField = document.getElementById('username');
    var usernameFieldWrapper = document.getElementById('username-field');    
    var passwordField = document.getElementById('password');
    var passwordFieldWrapper = document.getElementById('password-field');
    

    // POST data
    var data = {
        username: usernameField.value,
        password: passwordField.value
    }

    // to add the CSRF token
    Util.addCSRF(data);
    
    $.post(DO_LOGIN_PATH, data)
    .done((result) => {

        jsonRes = JSON.parse(result);

        if (jsonRes.state == 'ok') {
            window.location.href = window.location.origin + HOME_PATH;
        } else {
            if (jsonRes.err == 'username') {
                // clear fields and show error in username field
                usernameField.value = '';
                passwordField.value = '';
                usernameFieldWrapper.classList.add('is-invalid');
            } else if (jsonRes.err == 'password') {
                // clear fields and show error in password field
                usernameField.value = '';
                passwordField.value = '';
                passwordFieldWrapper.classList.add('is-invalid');
            }
        }

    })
    .fail(() => {

        Util.showErrorDialog('Erro de conexão');

    });
}

// doLogin when Enter pressed
document.addEventListener('keydown', (event) => {
    if (event.key == 'Enter')
        doLogin();
});