$(document).ready(function () {
    /** prevent form submission */
    const preventFormSubmission = (form) => form.preventDefault();

    /** Registration Form Process */
    $("#regForm").submit(function (form) {
        preventFormSubmission(form);

        var formData = $(this).serialize();

        var submitButton = $('#regForm').find('input[type="submit"]');

        submitButton.prop('disabled', true);
        submitButton.val('Registering...')

        // Send the form data using AJAX
        $.ajax({
            type: 'POST',
            url: '/auth/register', // Replace with your server URL
            data: formData,
            success: function (response) {
                // Handle the response from the server
                if (response.trim() == 'success') {
                    Swal.fire({
                        title: 'Success',
                        text: "Check your email a verification link is sent",
                        icon: 'info',
                        confirmButtonText: 'Close'
                    });
                }
                submitButton.prop('disabled', false);
                submitButton.val('Register');
                
                $('#regForm').trigger('reset');
            },
            error: function (xhr, status, error) {
                // Handle errors
                Swal.fire({
                    title: 'Error',
                    text: xhr.responseText,
                    icon: 'error',
                    confirmButtonText: 'Close'
                });
                submitButton.prop('disabled', false);
                submitButton.val('Register');
            }
        });
    });

    /** Login Form Process */
    $("#loginForm").submit(function (form) {
        preventFormSubmission(form);

        var formData = $(this).serialize();

        var submitButton = $('#loginForm').find('input[type="submit"]');

        submitButton.prop('disabled', true);
        submitButton.val('Logging in...')

        // Send the form data using AJAX
        $.ajax({
            type: 'POST',
            url: '/auth/login', // Replace with your server URL
            data: formData,
            success: function (response) {
                // Handle the response from the server
                if (response.trim() == 'success') {
                    Swal.fire({
                        title: 'Success',
                        text: "Redirecting to the home page...",
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false,
                    });

                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }

                $('#loginForm').trigger('reset');
            },
            error: function (xhr, status, error) {
                if (xhr.responseText.trim() == 'not-verified') {
                    Swal.fire({
                        title: 'Not Verified',
                        text: "Check your email a verification link is sent",
                        icon: 'info',
                        confirmButtonText: 'Close'
                    });

                    $('#loginForm').trigger('reset');
                    submitButton.prop('disabled', false);
                    submitButton.val('Login');
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: xhr.responseText,
                        icon: 'error',
                        confirmButtonText: 'Close'
                    });
                }

                submitButton.prop('disabled', false);
                submitButton.val('Login');
            }
        });
    });

    /** Reset Form Process */
    $("#resetForm").submit(function (form) {
        preventFormSubmission(form);

        var formData = $(this).serialize();

        var submitButton = $('#resetForm').find('input[type="submit"]');

        submitButton.prop('disabled', true);
        submitButton.val('Resetting...')

        // Send the form data using AJAX
        $.ajax({
            type: 'POST',
            url: '/auth/forgotPassword', // Replace with your server URL
            data: formData,
            success: function (response) {
                // Handle the response from the server
                if (response.trim() == 'success') {
                    Swal.fire({
                        title: 'Success',
                        text: "Check your email a password reset link in sent",
                        icon: 'info',
                        confirmButtonText: 'Close'
                    });

                    submitButton.prop('disabled', false);
                    submitButton.val('Reset');

                    $('#resetForm').trigger('reset');
                }
            },
            error: function (xhr, status, error) {
                // Handle errors
                Swal.fire({
                    title: 'Error',
                    text: xhr.responseText,
                    icon: 'error',
                    confirmButtonText: 'Close'
                });

                submitButton.prop('disabled', false);
                submitButton.val('Reset');
            }
        });
    });

    /** set New Password Form Process */
    $("#setPassForm").submit(function (form) {
        preventFormSubmission(form);

        var formData = $(this).serialize();

        var submitButton = $('#setPassForm').find('input[type="submit"]');

        submitButton.prop('disabled', true);
        submitButton.val('Changing...')

        // Send the form data using AJAX
        $.ajax({
            type: 'POST',
            url: '/auth/reset', // Replace with your server URL
            data: formData,
            success: function (response) {
                // Handle the response from the server
                if (response.trim() == 'success') {
                    Swal.fire({
                        title: 'Success',
                        text: "Your password has been changed",
                        icon: 'success',
                        timer: 2000
                    });

                    submitButton.prop('disabled', false);
                    submitButton.val('Change');
                    
                    $('#setPassForm').trigger('reset');

                    setTimeout(() => {
                        window.location.href = '/auth/login';
                    }, 1500);
                }
            },
            error: function (xhr, status, error) {
                // Handle errors
                Swal.fire({
                    title: 'Error',
                    text: xhr.responseText,
                    icon: 'error',
                    confirmButtonText: 'Close'
                });

                submitButton.prop('disabled', false);
                submitButton.val('Change');
            }
        });
    });
});
