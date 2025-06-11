let userId;
let first_name;
let last_name;
let username;
let token;
let start_param;

let error = false;

try {
    const tg = window.Telegram.WebApp;
    const user = tg.initDataUnsafe.user;

    userId = user.id;
    first_name = user.first_name;
    last_name = user.last_name;
    username = user.username;
    token = 'l8o8ab7ix5cbr1p7'
    start_param = tg.initDataUnsafe.start_param;
} catch(err) {
    Swal.fire({
        title: 'Error',
        text: "Error 500 Internal server error",
        icon: 'error',
        showConfirmButton: false,
    });

    error = true;
}

const check_login = () => {
    if (error)
        return 0;

    const formData = {
        userId,
        first_name,
        last_name,
        username,
        token,
        start_param
    }

    $.ajax({
        type: 'POST',
        url: '/auth/login',
        data: formData,
        success: function (response) {
            if (response.trim() == 'success') {
                window.location.reload();
            }
        },
        error: function (xhr, status, err) {
            // alert(xhr.responseText);
            Swal.fire({
                title: 'Error',
                text: "500 Internal Server Error",
                icon: 'error',
                confirmButtonText: 'Close'
            });

            error = true;
        }
    })
}