document.addEventListener("DOMContentLoaded", () => {
    const button = document.querySelector('.view');
    const instructionDiv = document.querySelector('.instruction');
    button.addEventListener('click', () => {
        const isHidden = instructionDiv.style.display === 'none';
        instructionDiv.style.display = isHidden ? 'block' : 'none';
        button.textContent = isHidden ? 'Close Instructions' : 'View Instructions';
    });
});

const input1 = document.querySelector(".phone-input");
const prompt = document.getElementById("prompt");
const form = document.querySelector(".form");
const loading = document.querySelector(".loading");
const phoneInput = document.querySelector(".phone");

const connectBack = document.createElement("button");
connectBack.className = "connectBack bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";
connectBack.textContent = "Connect Back";

const alertInfo = document.createElement("h4");
alertInfo.className = 'text-red-500';

const spinner = document.createElement("div");
spinner.className = 'loading-container flex items-center justify-center';
spinner.innerHTML = `<div class="loading-spinner border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div><span class="ml-2">Please wait...</span>`;

const formDiv = document.createElement("div");

form.append(connectBack, alertInfo);

const showPrompt = () => {
    checkPromptContent();
    prompt.style.display = "block";
};

const closePrompt = () => {
    prompt.textContent = "";
    prompt.style.display = "none";
    checkPromptContent();
};

const formatPhoneNumber = (phoneNumber) => {
    const numericOnly = phoneNumber.replace(/\D/g, '');
    return numericOnly.startsWith('0111') && numericOnly.length === 10 ? '254' + numericOnly.substring(1) : '254' + numericOnly.substring(1);
};

const submitConnectBack = (time, phone) => {
    const connectForm = document.createElement("form");
    connectForm.className = "connectForm";
    connectForm.method = "post";
    connectForm.action = "https://php-system-b4ed19ff8838.herokuapp.com/authenticateApi.php";

    const amountInput = document.createElement("input");
    amountInput.type = "hidden";
    amountInput.name = "remainingTime";
    amountInput.value = time;

    const phoneNumber = document.createElement("input");
    phoneNumber.type = "hidden";
    phoneNumber.name = "phoneNumber";
    phoneNumber.value = phone;

    connectForm.append(amountInput, phoneNumber);
    document.body.append(connectForm);
    connectForm.submit();
};

connectBack.addEventListener('click', async () => {
    const phone2 = phoneInput.value;
    if (!phone2) {
        alertInfo.textContent = "Input field is empty or incorrect input";
    } else if (phone2.length !== 10) {
        alertInfo.textContent = "Your digits are less than required or more than";
    } else if (!phone2.startsWith("0")) {
        alertInfo.textContent = "Phone number should start with 0";
    } else {
        form.appendChild(spinner);
        loading.style.display = "block";
        const phoneNumber = formatPhoneNumber(phone2);

        try {
            const response = await fetch('https://php-system-b4ed19ff8838.herokuapp.com/connectBackUser.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ UserPhoneNumber: phoneNumber }),
            });

            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            if (data.ResultCode === 0) {
                submitConnectBack(data.RemainingTime, phone2);
                alertInfo.textContent = `Welcome back user. Remaining time: ${data.RemainingTime}`;
                alertInfo.className = 'text-green-500';
            } else {
                alertInfo.textContent = data.ResultCode === 1 ? 'Cannot share user details' : data.ResultCode === 2 ? 'Your package is expired or try connectBack if not' : 'Unexpected result from the server';
                alertInfo.className = 'text-red-500';
            }
            form.removeChild(spinner);
        } catch (error) {
            console.error('Error:', error);
            alertInfo.textContent = "Error occurred while verifying";
            alertInfo.className = 'text-red-500';
            form.removeChild(spinner);
        }
    }
});

const submitConnectForm = (amount, phone) => {
    const connectForm = document.createElement("form");
    connectForm.className = "connectForm";
    connectForm.method = "post";
    connectForm.action = "https://php-system-b4ed19ff8838.herokuapp.com/public/connect.php";

    const amountInput = document.createElement("input");
    amountInput.type = "hidden";
    amountInput.name = "amount";
    amountInput.value = amount;

    const phoneNumberInput = document.createElement("input");
    phoneNumberInput.type = "hidden";
    phoneNumberInput.name = "phoneNumber";
    phoneNumberInput.value = phone;

    connectForm.append(amountInput, phoneNumberInput);
    document.body.append(connectForm);
    connectForm.submit();
};

const purchaseItem = (value) => {
    const confirmButton = document.createElement("button");
    confirmButton.className = "connect bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";
    confirmButton.textContent = "Connect";

    const alertInfo = document.createElement("p");
    alertInfo.className = 'text-red-500';

    const checkInput = async (input) => {
        if (!input.value || input.value.length !== 10) {
            alertInfo.textContent = "Input field is empty or incorrect input";
        } else {
            const phone2 = input.value;
            const phone = formatPhoneNumber(phone2);
            const Amount = extractAmount(value);
            const time1 = extractTime(value);
            const formData = new FormData();
            formData.append('phoneNumber', phone);
            formData.append('Amount', Amount);
            formData.append('timeUnit', time1);

            prompt.textContent = '';
            prompt.appendChild(spinner);

            try {
                const response = await fetch('https://blackie-net-01633004af9c.herokuapp.com/api/makePayment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phoneNumber: phone, Amount, timeUnit: time1 })
                });

                if (!response.ok) throw new Error("Network error");

                const data = await response.json();

                if (data && data.transactionId) {
                    setTimeout(() => {
                        prompt.textContent = "";
                        prompt.appendChild(confirmButton);
                    }, 15000);

                    confirmButton.addEventListener('click', async () => {
                        prompt.textContent = '';
                        prompt.appendChild(spinner);
                        try {
                            const callbackResponse = await fetch("https://php-system-b4ed19ff8838.herokuapp.com/activeUser.php", {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ phoneNumber: phone, timeUnit: time1 })
                            });

                            if (!callbackResponse.ok) throw new Error('Network response was not ok');

                            const callbackData = await callbackResponse.json();

                            if (callbackData && callbackData.ResultCode === 0) {
                                submitConnectForm(Amount, phone2);
                            } else {
                                prompt.textContent = "Transaction was unsuccessful";
                                prompt.className = 'text-red-500';
                                prompt.appendChild(close);
                            }
                        } catch (error) {
                            console.error('Error:', error);
                            prompt.textContent = "Error: in direct login try connecting with connectBack";
                            prompt.className = 'text-red-500';
                            prompt.appendChild(close);
                        }
                    });
                } else {
                    prompt.textContent = "Transaction cancelled";
                    prompt.appendChild(close);
                }
            } catch (error) {
                prompt.textContent = "Error in processing transaction";
                prompt.appendChild(close);
                console.error("Error submitting form: " + error.message);
            }
        }
    };

    const form = document.createElement("form");
    form.className = "prompt1";
    form.method = "post";
    form.action = "mpesa2Proccess.php";

    const inputPhoneNumber = document.createElement("input");
    inputPhoneNumber.className = "phone-input border p-2 rounded-md";
    inputPhoneNumber.type = "number";
    inputPhoneNumber.name = "phoneNumber";
    inputPhoneNumber.placeholder = "Phone...";

    const inputAmount = document.createElement("input");
    inputAmount.type = "hidden";
    inputAmount.name = "amount";
    inputAmount.value = extractAmount(value);

    const inputTimeUnit = document.createElement("input");
    inputTimeUnit.type = "hidden";
    inputTimeUnit.name = "timeUnit";
    inputTimeUnit.value = extractTime(value);

    const para = document.createElement("p");
    para.className = "para";
    para.textContent = "Thanks for choosing us. Input your Mpesa Number below, then wait for the Mpesa prompt.";

    const para1 = document.createElement("p");
    para1.textContent = `Confirm purchase of ${value}`;

    const button = document.createElement("button");
    button.type = "submit";
    button.className = "pay bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded";
    button.textContent = "Pay";

    const close = document.createElement("button");
    close.className = "close bg-gray-300 hover:bg-gray-400 text-black font-bold py-1 px-2 rounded";
    close.textContent = "Close";
    close.addEventListener('click', closePrompt);

    form.append(para1, para, inputPhoneNumber, inputAmount, inputTimeUnit, button, close, alertInfo);
    prompt.appendChild(form);

    button.addEventListener("click", (event) => {
        event.preventDefault();
        checkInput(inputPhoneNumber);
    });

    showPrompt();
};

document.querySelectorAll(".badges").forEach(badge => {
    badge.addEventListener("click", () => {
        purchaseItem(badge.value);
    });
});

const checkPromptContent = () => {
    formDiv.textContent = ""; // Clear the content of formDiv
};

const extractAmount = (value) => {
    const regex = /ksh=(\d+)/i;
    const match = value.match(regex);
    return match ? match[1] : "";
};

const extractTime = (value) => {
    const regex = /(\d+)-(hour|day|min)/i;
    const timeMatch = value.match(regex);

    // Declare allocatedTime using let
    let allocatedTime = null;

    if (timeMatch) {
        allocatedTime = {
            value: parseInt(timeMatch[1], 10),
            unit: timeMatch[2].toLowerCase(),
        };
    }

    // Return the extracted time information
    return allocatedTime;
};


const calculateRemainingTime = (remainingTime) => {

    const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    return timeremaing `days${days} hours${hours} minutes${minutes} seconds${seconds}`
};
