document.addEventListener('DOMContentLoaded', function() {
    const registerButton = document.querySelector('.reg__btn');
    let errorMessage = "";

    
    // Переключение видимости пароля
    $('#toggle-password').on('click', function () {
        let passwordInput = $('#log-password-input');
        if (passwordInput.attr('type') === 'password') {
            passwordInput.attr('type', 'text');
            $(this).text('visibility_off');
        } else {
            passwordInput.attr('type', 'password');
            $(this).text('visibility'); 
        }
    });

    // Переключение видимости пароля (повторного)
    $('#toggle-second-password').on('click', function () {
        let passwordInput = $('#log-second-password-input');
        if (passwordInput.attr('type') === 'password') {
            passwordInput.attr('type', 'text');
            $(this).text('visibility_off');
        } else {
            passwordInput.attr('type', 'password');
            $(this).text('visibility');
        }
    });

    // Обработчик регистрации
    registerButton.addEventListener('click', async function() {
        const emailInput = document.getElementById('log-name-input').value;
        const loginInput = document.getElementById('log-login-input').value;
        const passwordInput = document.getElementById('log-password-input').value;
        const passwordConfirmInput = document.getElementById('log-second-password-input').value;

        // Формируем объект для отправки на сервер
        const requestBody = {
            email: emailInput,
            password: passwordInput,
            password_confirm: passwordConfirmInput,
            username: loginInput  // Добавляем loginInput как userName
        };

        try {
            const response = await fetch('https://iotdatahub.online/iot_lk/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();

            if (response.ok) {
                // Перенаправляем пользователя на страницу входа после успешной регистрации
                window.location.href = 'login.html';
            } else {
                console.log(result);
                console.log(typeof(result.error));
                if (typeof(result.error) === 'object') {
                    if (result.error.email) {errorMessage = result.error.email.join(' ') + '.';}
                    if (result.error.password_confirm) {errorMessage += ' ' + result.error.password_confirm.join(' ') + '.';}
                    if (result.error.password) {errorMessage += ' ' + result.error.password.join(' ') + '.';}
                } else if (result.error === "Username is required") {errorMessage += ' ' + "Введите логин"}
                
                if(errorMessage != "") {
                    showErrorMessage(errorMessage);
                    errorMessage = "";
                }
            }
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
        }
    });

    function showErrorMessage(errorMessage) {
        const errorDiv = document.querySelector('.reg__error-text');
        errorDiv.innerHTML = '';
        errorDiv.textContent = errorMessage;
    }

});