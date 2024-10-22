const btn_rule = document.getElementById("btn-rule");
const btn_rule_close = document.getElementById("btn-rule-close");
const dialog_rule = document.getElementById("dialog-rule");

btn_rule.addEventListener("click", () => {
    dialog_rule.style.display = "flex";
});

btn_rule_close.addEventListener("click", () => {
    dialog_rule.style.display = "none";
});

const btn_invite = document.getElementById("btn-invite");
const btn_invite_close = document.getElementById("btn-invite-close");
const dialog_invite = document.getElementById("dialog-invite");

btn_invite.addEventListener("click", () => {
    dialog_invite.style.display = "flex";
});

btn_invite_close.addEventListener("click", () => {
    dialog_invite.style.display = "none";
});

const loader = document.getElementById("dialog-loader");

const btn_trns_hist = document.getElementById("btn-trns-hist");
const btn_trns_hist_close = document.getElementById("btn-trns-hist-close");
const dialog_trns_hist = document.getElementById("dialog-trns-hist");

btn_trns_hist.addEventListener("click", async () => {
    loader.style.display = "flex";

    const transactionHistory = await get("transactionHistory");

    let html = '';

    if (transactionHistory == 'failed') {
        html = `<p>No transaction History</p>`;
    } else {
        html = `
        <table>
            <thead>
                <th>#</th>
                <th>UPI ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Message</th>
                <th>Date</th>
                <th>Time</th>
            </thead>
            <tbody>`;

        for (let i = 0; i < transactionHistory.length; i++) {
            const dateString = transactionHistory[i].createdAt;
            const date = new Date(dateString);

            // Extracting date components
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // getMonth() returns 0-based (0 for January)
            const day = date.getDate();

            // Extracting time components
            let hours = date.getHours();
            const minutes = date.getMinutes();

            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;

            // Formatting output
            const formattedDate = `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`;
            const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;

            html += `
                <tr>
                    <td>${i + 1}</td>
                    <td>${transactionHistory[i].upiId}</td>
                    <td>₹ ${transactionHistory[i].amount}</td>
                    <td>${transactionHistory[i].status}</td>
                    <td class="text-middle">${(transactionHistory[i].failureStatus ? transactionHistory[i].failureStatus : '-')}</td>
                    <td>${formattedDate}</td>
                    <td>${formattedTime}</td>
                </tr>`;
        }

        html += `
            </tbody>
        </table>`;
    }

    $('#transactions').html(html);
    loader.style.display = "none";
    dialog_trns_hist.style.display = "flex";
});

btn_trns_hist_close.addEventListener("click", () => {
    dialog_trns_hist.style.display = "none";
});

const btn_cash_out = document.getElementById("btn-cash-out");
const btn_cash_out_close = document.getElementById("btn-cash-out-close");
const dialog_cash_out = document.getElementById("dialog-cash-out");

btn_cash_out.addEventListener("click", () => {
    dialog_cash_out.style.display = "flex";
});

btn_cash_out_close.addEventListener("click", () => {
    dialog_cash_out.style.display = "none";
});

const currentUrl = new URL(window.location.href);
const protocol = currentUrl.protocol;
const host = currentUrl.host;


function get(what) {
    // Return the axios.get promise
    return axios.get(`${protocol}//${host}/get/${what}`)
        .then(function (response) {
            return response.data;
        })
        .catch(function (error) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'warning',
                title: "Something went wrong",
                showConfirmButton: false,
                timer: 3000
            });
            window.location.reload();
            return false;
        });
}

document.getElementsByClassName('link')[0].addEventListener('click', async () => {
    document.getElementsByClassName('link')[0].disabled = true;
    document.getElementsByClassName('link')[0].style.opacity = 0.5;

    if (navigator.share) {
        try {
            await navigator.share({
                title: `Join ${await get("AppName")}`,
                text: 'Join use to earn money',
                url: `${protocol}//${host}/auth/register?referredBy=${await get("myReferral")}`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    } else {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(`${protocol}//${host}/auth/register?referredBy=${await get("myReferral")}`).then(function () {
                showToast('Text copied to clipboard!');
            }).catch(function (err) {
                console.error('Failed to copy: ', err);
                fallbackCopyTextToClipboard(text);
            });
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = `${protocol}//${host}/auth/register?referredBy=${await get("myReferral")}`;
            textarea.style.position = 'fixed';  // Avoid scrolling to bottom
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();

            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    showToast('Text copied to clipboard!');
                } else {
                    console.error('Fallback: Oops, unable to copy');
                }
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
            }

            document.body.removeChild(textarea);
        }

        function showToast(message) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: message,
                showConfirmButton: false,
                timer: 3000
            });
        }
    }

    document.getElementsByClassName('link')[0].disabled = false;
    document.getElementsByClassName('link')[0].style.opacity = 1;
});

document.getElementsByClassName('fb-share')[0].addEventListener('click', async () => {

    document.getElementsByClassName('fb-share')[0].disabled = true;
    document.getElementsByClassName('fb-share')[0].style.opacity = 0.5;

    // Replace 'your-url' with the URL you want to share
    let shareUrl = `${protocol}//${host}/auth/register?referredBy=${await get("myReferral")}`;

    FB.ui({
        method: 'share',
        href: shareUrl,
    }, function (response) { });

    document.getElementsByClassName('fb-share')[0].disabled = false;
    document.getElementsByClassName('fb-share')[0].style.opacity = 1;
});

document.getElementsByClassName('wp')[0].addEventListener('click', async () => {

    document.getElementsByClassName('wp')[0].disabled = true;
    document.getElementsByClassName('wp')[0].style.opacity = 0.5;
    // Replace 'your-url' with the URL you want to share
    let shareUrl = `${protocol}//${host}/auth/register?referredBy=${await get("myReferral")}`;

    // Create the WhatsApp share URL
    let whatsappUrl = `whatsapp://send?text=${encodeURIComponent(shareUrl)}`;

    // Open the WhatsApp app
    window.location.href = whatsappUrl;

    document.getElementsByClassName('wp')[0].disabled = false;
    document.getElementsByClassName('wp')[0].style.opacity = 1;
});

document.getElementsByClassName('twit')[0].addEventListener('click', async () => {
    document.getElementsByClassName('twit')[0].disabled = true;
    document.getElementsByClassName('twit')[0].style.opacity = 0.5;
    // Replace 'your-url' with the URL you want to share
    let shareUrl = `${protocol}//${host}/auth/register?referredBy=${await get("myReferral")}`;

    // Create the Twitter share URL
    let twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`;

    // Open the Twitter intent in a new window
    window.open(twitterUrl, '_blank');

    document.getElementsByClassName('twit')[0].disabled = false;
    document.getElementsByClassName('twit')[0].style.opacity = 1;
})

let isTaskRunning = false;
let y = 0;

document.getElementById("run-spin").addEventListener("click", async () => {
    if (isTaskRunning) {
        return;
    }

    isTaskRunning = true;
    document.getElementById("run-spin").style.opacity = "0.5";
    loader.style.display = "flex";

    const mySpinsAvailable = await get("mySpinsAvailable");
    const totalEarnings = await get("myEarning");

    if (mySpinsAvailable <= 0) {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'warning',
            title: "Spins are not available.",
            showConfirmButton: false,
            timer: 3000
        });

        $("#spinsAvailable").text("0");

        isTaskRunning = false;
        document.getElementById("run-spin").style.opacity = "1";
        loader.style.display = "none";
        return;
    }

    $("#spinsAvailable").text(function (i, oldText) {
        return parseInt(mySpinsAvailable, 10) - 1;
    });

    axios.post(`${protocol}//${host}/auth/spin`)
        .then(function (response) {
            y = parseInt(response.data);

            loader.style.display = "none";
            runSequences();
        }).catch(function (error) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'warning',
                title: "Something went wrong",
                showConfirmButton: false,
                timer: 3000
            });

            isTaskRunning = false;
            document.getElementById("run-spin").style.opacity = "1";
            loader.style.display = "none";
            return;
        });

    function generateSequence() {
        const sequence = [];
        for (let i = 0; i < 10; i++) {
            sequence.push(i);
        }
        return sequence;
    }

    async function repeatSequence(times, interval, id, value) {
        let count = 0;
        const sequence = generateSequence();
        const totalRepeats = times * sequence.length;
        return new Promise((resolve) => {
            const intervalId = setInterval(() => {
                if (count >= totalRepeats) {
                    clearInterval(intervalId);
                    document.getElementById(id).innerText = value;
                    resolve(); // Resolve the promise when done
                    return;
                }
                document.getElementById(id).innerText = sequence[count % sequence.length];
                count++;
            }, interval);
        });
    }

    async function startSequence(id, value) {
        const totalDuration = 3000; // 3 seconds
        const totalRepeats = 8; // repeat 8 times
        const interval = totalDuration / (totalRepeats * 10);
        await repeatSequence(totalRepeats, interval, id, value);
    }

    async function runSequences() {
        const a = y >= 100 ? 1 : 0;
        const b = y < 100 ? Math.floor(y / 10) : 0;
        const c = y < 10 ? y : (y < 100 ? y % 10 : 0);

        startSequence("item-1", a);
        startSequence("item-2", b);
        await startSequence("item-3", c);

        $("#totalEarnings").text(function (i, oldText) {
            return parseInt(totalEarnings) + y;
        });

        $("#widthdraw-amt").text(function (i, oldText) {
            return parseInt(totalEarnings) + y;
        });

        let earn = 0;

        $("#totalEarningsToWithdrwal").text(function (i, oldText) {
            earn = (parseInt(totalEarnings) + y);
            if (earn < 100) {
                return 100 - earn;
            } else {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'info',
                    title: "you can withdraw your money now",
                    showConfirmButton: false,
                    timer: 3000
                });
                return 0;
            }
        });

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: "you've earned " + y + "₹",
            showConfirmButton: false,
            timer: 3000
        });

        document.getElementById("earningProgress").style.width = earn + "%";

        isTaskRunning = false;
        document.getElementById("run-spin").style.opacity = "1";
    }
});

/** Withdraw Process */
$("#withdrawForm").submit(async function (form) {
    form.preventDefault();

    var formData = $(this).serialize();
    var submitButton = $('#withdrawForm').find('button[type="submit"]');

    submitButton.prop('disabled', true);
    loader.style.display = "flex";
    submitButton.css("opacity", "0.5");

    // Send the form data using AJAX
    $.ajax({
        type: 'POST',
        url: '/withdraw', // Replace with your server URL
        data: formData,
        success: function (response) {
            // Handle the response from the server
            if (response.trim() == 'success') {
                loader.style.display = "none";

                Swal.fire({
                    title: 'Success',
                    text: "Your request for withdrawal is pending. it may take up to 3-5 days to complete the transaction.",
                    icon: 'success',
                })
                    .then((confirm) => {
                        if (confirm) {
                            document.location.reload();
                        }
                    })
            }

            $('#loginForm').trigger('reset');
            submitButton.prop('disabled', false);
            submitButton.css("opacity", "1");
        },
        error: function (xhr, status, error) {
            loader.style.display = "none";

            Swal.fire({
                title: 'Error',
                text: xhr.responseText,
                icon: 'error',
            });

            submitButton.prop('disabled', false);
            submitButton.css("opacity", "1");
        }
    });
})