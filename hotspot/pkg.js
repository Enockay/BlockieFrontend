
//disable page view functionslity
document.addEventListener('keydown', function (event) {
    // Check if 'Ctrl' key is pressed along with 'U'
    if (event.ctrlKey && event.key === 'u') {
        event.preventDefault();
    }
});

//diconnect button 
function toggleDisconnectSection() {
    const section = document.getElementById('disconnectDeviceSection');
    const button = document.getElementById('toggleDisconnect');

    section.classList.toggle('hidden');

    // Update the button text based on the section's visibility
    if (section.classList.contains('hidden')) {
        button.textContent = 'Disconnect Device';
    } else {
        button.textContent = 'Close Disconnect';
    }
}

const RouterName = document.getElementById("identity").value;

function addSecondsToCurrentTime(seconds) {
    // Get the current date and time
    const currentTime = new Date();

    // Add the seconds to the current time (convert seconds to milliseconds)
    const futureTime = new Date(currentTime.getTime() + seconds * 1000);

    // Extract the day, month, year, and exact time components
    const day = futureTime.getDate();
    const month = futureTime.getMonth() + 1; // Months are 0-indexed, so we add 1
    const year = futureTime.getFullYear();

    const hours = futureTime.getHours();
    const minutes = futureTime.getMinutes();
    const secondsPart = futureTime.getSeconds();

    // Format the result as DD/MM/YYYY HH:MM:SS
    const formattedTime = `${day}/${month}/${year} ${hours}:${minutes}:${secondsPart}`;

    return formattedTime;
}
// Disable right-click
document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});

//variable settings
const input1 = document.querySelector(".phone-input");
const feedback = document.getElementById("prompt");
const feedbackPara = document.createElement('p')
feedback.appendChild(feedbackPara)
const form = document.getElementById("reconnectSection");
const form2 = document.getElementById("disconnectDeviceSection");
const loading = document.querySelector(".loading");
const phoneInput = document.querySelector(".phone");
const connectBack = document.createElement("button");
connectBack.className = "connectBack bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";
connectBack.textContent = "Connect Back";
const Disconnect = document.createElement("button");
Disconnect.className = 'w-full bg-red-600 text-white p-2 rounded shadow hover:bg-red-700 transition duration-200';
Disconnect.textContent = "Disconnect Device";
const alertInfo2 = document.createElement("h4");
alertInfo2.className = "text-red-500 mt-5 font-bold";
form2.append(Disconnect, alertInfo2);
const alertInfo = document.createElement("h4");
alertInfo.className = 'text-red-500 ';
const vocherBtn = document.getElementById("voucher");
const spinner = document.createElement("div");
spinner.className = 'loading-container flex items-center justify-center';
spinner.innerHTML = `<div class="loading-spinner border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div><span class="ml-2">Please wait...</span>`;
const formDiv = document.createElement("div");
form.append(connectBack, alertInfo);
const display = document.getElementById("display");
const spinnerd = document.getElementById("spinner1");

const showPrompt = () => {
    checkPromptContent();
    feedback.style.display = "block";
};

const closePrompt = () => {
    feedbackPara.textContent = "";
    feedback.style.display = "none";
    checkPromptContent();
};

const formatPhoneNumber = (phoneNumber) => {
    const numericOnly = phoneNumber.replace(/\D/g, '');
    return numericOnly.startsWith('0111') && numericOnly.length === 10 ? '254' + numericOnly.substring(1) : '254' + numericOnly.substring(1);
};

async function activateVoucher(voucherCode) {
    const routerHost = document.getElementById("identity").value;
    const ipAddress = document.getElementById("ip").value;
    const macAddress = document.getElementById("mac").value;

    // Prepare data for the POST request
    const requestData = {
        routerHost,
        macAddress,
        voucherCode,
        ipAddress,
    };

    try {
        // Send data to the backend
        const response = await fetch("https://node-blackie-networks.fly.dev/vocher/activate-voucher", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        // Handle the response
        if (response.ok) {
            const data = await response.json();
            display.textContent = `${data.message}`;
            display.className = "text-green mt-2 font-semibold bg-gray-100 p-2";
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;  // Redirect the user automatically
            }
            return { success: true, data };
        } else {
            spinnerd.style.display = "none";
            const error = await response.json();
            display.textContent = ` ${error.message}`;
            display.className = "text-red-600 mt-2 font-semibold bg-gray-100 p-2"
            return { success: false, error: error.message };
        }
    } catch (err) {
        spinnerd.style.display = "none";
        display.textContent = `failed: ${err.message}`;
        display.className = "text-red-600 mt-2 font-semibold bg-gray-100 p-2"
        //return { success: false, error: err.message };
    }
}

async function activateAccount(transactionCode, phoneNumber, remainingTime) {
    const routerHost = document.getElementById("identity").value;
    const ipAddress = document.getElementById("ip").value;
    const macAddress = document.getElementById("mac").value;

    // Prepare data for the POST request
    const requestData = {
        routerHost,
        macAddress,
        phoneNumber,
        transactionCode,
        remainingTime,
        ipAddress,
    };

    try {
        // Send data to the backend
        const response = await fetch("https://node-blackie-networks.fly.dev/hotspot/activate-account", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        // Handle the response
        if (response.ok) {
            const data = await response.json();
            alertInfo.textContent = `${data.message}`;
            alertInfo.className = "text-green mt-2 font-semibold bg-gray-100 p-2";
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;  // Redirect the user automatically
            }
            return { success: true, data };
        } else {
            
            const error = await response.json();
            alertInfo.textContent = ` ${error.message}`;
            alertInfo.className = "text-red-600 mt-2 font-semibold bg-gray-100 p-2"
            return { success: false, error: error.message };
        }
    } catch (err) {
        alertInfo.textContent = `failed: ${err.message}`;
        alertInfo.className = "text-red-600 mt-2 font-semibold bg-gray-100 p-2"
        return { success: false, error: err.message };
    }
}

async function disconnectAccount(transactionCode, phoneNumber, remainingTime) {
    const routerHost = document.getElementById("identity").value;
    const ipAddress = document.getElementById("ip").value;
    const macAddress = document.getElementById("mac").value;

    // Prepare data for the POST request
    const requestData = {
        routerHost,
        macAddress,
        phoneNumber,
        transactionCode,
        remainingTime,
        ipAddress
    };

    try {
        // Send data to the backend
        const response = await fetch("https://node-blackie-networks.fly.dev/hotspot/disconnect-user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        // Handle the response
        if (response.ok) {
            const data = await response.json();
            alertInfo2.textContent = `${data.message}`;
            alertInfo2.className = "text-green mt-2 font-semibold bg-gray-100 p-2";
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;  // Redirect the user automatically
            }
            return { success: true, data };
        } else {
            const error = await response.json();
            alertInfo2.textContent = ` ${error.message}`;
            alertInfo2.className = "text-red-600 mt-2 font-semibold bg-gray-100 p-2"
            return { success: false, error: error.message };
        }
    } catch (err) {
        alertInfo2.textContent = `failed: ${err.message}`;
        alertInfo2.className = "text-red-600 mt-2 font-semibold bg-gray-100 p-2"
        return { success: false, error: err.message };
    }
}

//update localstorage
const updateLocalstorage = (phoneNumber2) => {
    const phoneNumber = localStorage.getItem("phoneNumber");
    if (!phoneNumber || phoneNumber !== phoneNumber2) {
        localStorage.removeItem("phoneNumber");
    }
    return localStorage.setItem("phoneNumber", phoneNumber2)

}

//disconnect function is yet done the logic isnt complete
Disconnect.addEventListener('click', async () => {
    const input = document.querySelector(".disconnect-phone");
    const MpesaCode = document.getElementById("transactionCode").value;
    const routerHost = document.getElementById("identity").value;
    const ipAddress = document.getElementById("ip").value;
    const macAddress = document.getElementById("mac").value;

    //console.log(input.value,MpesaCode)
    const phone2 = input.value;

    if (!phone2 || !MpesaCode) {
        alertInfo2.textContent = "Input field is empty";
    } else if (phone2.length !== 10) {
        alertInfo2.textContent = "Your digits are less than required or more than";
    } else if (!phone2.startsWith("0")) {
        alertInfo2.textContent = "Phone number should start with 0";
    } else {
        form2.appendChild(spinner);
        loading.style.display = "block";
        const phoneNumber = formatPhoneNumber(phone2);
        try {
            const response = await fetch('https://node-blackie-networks.fly.dev/hotspot/disconnect-user', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ phoneNumber: phoneNumber, MpesaCode: MpesaCode ,routerHost:routerHost,ipAddress:ipAddress})
            });

            const data = await response.json();
            console.log(data);

            if (data.success) {
                if (data.remainingTime < 1) {
                    alertInfo2.textContent = `your package is already expired kindly renew it ..`;
                    alertInfo2.className = ' text-white font-bold';
                    return;
                } else {
                    form2.appendChild(spinner);
                    loading.style.display = "block";
                    //console.log(TransactionCode)
                    disconnectAccount(MpesaCode, phoneNumber, data.remainingTime)
                    const expiry = addSecondsToCurrentTime(data.RemainingTime);
                    alertInfo2.textContent = `wait as we connect you to internet. your  unliminet package will expire on :${expiry}`;
                    alertInfo2.className = 'text-white font-semibold';
                    //form.appendChild(spinner)
                }
            } else {
                alertInfo2.textContent = data.message;
                alertInfo2.className = 'text-red-500 p-3 bg-gray-100 mt-2 font-semibold rounded-lg';
            }
            form2.removeChild(spinner);
        } catch (error) {
            console.error('Error:', error);
            alertInfo2.textContent = "Error occurred while verifying";
            alertInfo2.className = 'text-red-500';
            form2.removeChild(spinner);
        }
    }
});

//connect back logic functionality
connectBack.addEventListener('click', async () => {
    const phone2 = phoneInput.value;
    if (!phone2) {
        alertInfo.textContent = "Input field is empty or incorrect input";
        alertInfo.className = "text-red-600 mt-2 font-semibold bg-gray-100 p-2"
    } else if (phone2.length !== 10) {
        alertInfo.textContent = "Your digits are less than required or more than";
        alertInfo.className = "text-red-600 mt-2 font-semibold bg-gray-100 p-2"
    } else if (!phone2.startsWith("0")) {
        alertInfo.textContent = "Phone number should start with 0";
        alertInfo.className = "text-red-600 mt-2 font-semibold bg-gray-100 p-2"
    } else {
        form.appendChild(spinner);
        loading.style.display = "block";
        const phoneNumber = formatPhoneNumber(phone2);
        const mac = "00:01:4B:7B:27"
        updateLocalstorage(phoneNumber);
        //setCookie('phoneNumber',phone2,{ unit: 'day', value: 1 });
        try {
            const response = await fetch('https://node-blackie-networks.fly.dev/api/jwt', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ phoneNumber: phoneNumber, mac: mac })
            });

            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            console.log(data);

            if (data.ResultCode === 0) {
                if (data.remainingTime < 1) {
                    alertInfo.textContent = `your package is already expired kindly renew it ..`;
                    alertInfo.className = "text-red-600 mt-2 font-semibold bg-gray-100 p-2"
                    return;
                } else {
                    form.appendChild(spinner);
                    loading.style.display = "block";
                    const TransactionCode = data.TransactionCode;
                    const remainingTime = data.RemainingTime
                    //console.log(TransactionCode)
                    activateAccount(TransactionCode, phoneNumber, remainingTime)
                    //submitConnectBack(remainingTime, phoneNumber,TransactionCode);
                    const expiry = addSecondsToCurrentTime(data.RemainingTime);
                    alertInfo.textContent = `Success.. wait as we connect you to internet. your  unliminet package will expire on :${expiry}`;
                    alertInfo.className = "text-gray-950 mt-2 font-semibold bg-gray-100 p-2"
                    //form.appendChild(spinner)
                }
            } else {
                alertInfo.textContent = data.ResultCode === 1 ? 'Cannot share user details' : data.ResultCode === 2 ? 'Your package is expired or try connectBack if not' : 'Unexpected result from the server';
                alertInfo.className = "text-red-600 mt-2 font-semibold bg-gray-100 p-2"
            }
            form.removeChild(spinner);
        } catch (error) {
            console.error('Error:', error);
            alertInfo.textContent = `Network Error ${error}`;
            alertInfo.className = "text-red-600 mt-2 font-semibold bg-gray-100 p-2"
            form.removeChild(spinner);
        }
    }
});
vocherBtn.addEventListener("click",async()=>{
    try{
     const voucherCode = document.getElementById("voucherCode").value;
     if (!voucherCode) {
        display.textContent = "Input field is empty or incorrect input";
        display.className = "text-red-600  font-semibold bg-gray-100 p-2 mb-3";
        return;
    }
     spinnerd.style.display = "block";
      await activateVoucher(voucherCode);
    }catch(error){
    spinner.style.display = "none";

    }
})
const directLogin = async (phoneNumber, transactionCode, amount) => {
    const routerHost = document.getElementById("identity").value;
    const ipAddress = document.getElementById("ip").value;
    const macAddress = document.getElementById("mac").value;

    const url = "https://node-blackie-networks.fly.dev/hotspot/direct-login";
    const payload = {
        routerHost,
        macAddress,
        phoneNumber,
        transactionCode,
        ipAddress,
        amount
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.redirectUrl) {
            window.location.href = data.redirectUrl;  // Redirect the user automatically
        }
        console.log("Response data:", data);
        return data;
    } catch (error) {
        console.error("Error during login request:", error);
        throw error;
    }
};

function connectWebSocket(checkoutRequestID) {
    let socket;
    let reconnectInterval = 5000; // Reconnection interval in milliseconds
    let pingInterval;

    function initializeWebSocket() {
        // Create a new WebSocket instance
        socket = new WebSocket(`wss://node-blackie-networks.fly.dev/${checkoutRequestID}`);

        // Handle WebSocket opening
        socket.addEventListener('open', () => {
            console.log('WebSocket is open now.');

            // Start sending pings every 30 seconds
            pingInterval = setInterval(() => {
                if (socket.readyState === WebSocket.OPEN) {
                    console.log('Sending ping');
                    socket.send(JSON.stringify({ type: 'ping' }));
                }
            }, 30000);
        });

        // Handle WebSocket messages
        socket.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            console.log('Message from server:', data);

            // Handle specific server responses
            if (data.type === 'pong') {
                console.log('Received pong from server');
            } else if (data.type === 'statusUpdate') {
                console.log('Received status update:', data);
                if (data.status === 'success') {
                    window.location.href = data.redirectUrl; // Redirect on success
                }
            } else if (data.type === 'error') {
                console.error('Error from server:', data.message);
            }
        });

        // Handle WebSocket errors
        socket.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
        });

        // Handle WebSocket closure
        socket.addEventListener('close', () => {
            console.log('WebSocket connection closed');

            // Clear ping interval
            clearInterval(pingInterval);

            // Attempt to reconnect
            setTimeout(() => {
                console.log('Attempting to reconnect...');
                initializeWebSocket();
            }, reconnectInterval);
        });
    }

    // Initialize WebSocket connection
    initializeWebSocket();
    return socket; // Return the WebSocket instance
}

const purchaseItem = (value, routername) => {
    const alertInfo = document.createElement("p");
    alertInfo.className = 'text-red-500';
    const ipAddress = document.getElementById("ip").value;
    const macAddress = document.getElementById("mac").value;
    const RouterName = document.getElementById("identity").value;

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

            feedbackPara.textContent = '';

            try {
                feedback.removeChild(form);
                feedback.appendChild(spinner);

                const response = await fetch('https://node-blackie-networks.fly.dev/api/makePayment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phoneNumber: phone, Amount, timeUnit: time1, ipAddress: ipAddress, macAddress: macAddress, RouterName: RouterName })
                });

                const data = await response.json();
                if (data.success && data.message.CheckoutRequestID) {
                    const checkoutRequestID = data.message.CheckoutRequestID;

                    // Usage Example
                    const socket = connectWebSocket(checkoutRequestID);

                    // WebSocket message handler
                    socket.addEventListener('message', (event) => {
                        const message = JSON.parse(event.data);
                        console.log('Received message:', message);

                        if (message.type === 'statusUpdate' && message.status === 'success') {
                            window.location.href = message.redirectUrl;
                            socket.close()
                        }else{
                            feedback.removeChild(spinner);
                            feedbackPara.className = 'text-red-600 mt-2 font-semibold bg-gray-100 p-2'
                            feedbackPara.textContent = `${message.status}`
                        }
                    });
                } else {
                    feedback.removeChild(spinner);
                    feedbackPara.textContent = "Your request failed, try again";
                    feedback.appendChild(close);
                }
            } catch (error) {
                feedbackPara.textContent = "Error in processing transaction";
                feedback.removeChild(spinner);
                feedback.appendChild(close);
                console.error("Error submitting form: " + error.message);
            }
        }
    };



    const form = document.createElement("form");
    form.className = "prompt1";
    form.method = "";
    form.action = "";

    const inputPhoneNumber = document.createElement("input");
    inputPhoneNumber.className = "phone-input border p-1 rounded-md text-black w-2/3";
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
    button.className = "pay bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded-lg";
    button.textContent = "Pay";

    const close = document.createElement("button");
    close.className = "close bg-gray-300 hover:bg-gray-400 text-black font-bold py-1 px-2 rounded-lg text-center";
    close.textContent = "Close";
    close.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent form submission
        closePrompt();
        feedback.removeChild(form);
    });

    form.append(para1, para, inputPhoneNumber, inputAmount, inputTimeUnit, button, close);
    feedback.appendChild(form);

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

    return timeremaing`days${days} hours${hours} minutes${minutes} seconds${seconds}`
};

document.addEventListener('DOMContentLoaded', () => {
    const locationInput = document.getElementById('location');
    const checkButton = document.querySelector('.button');
    const availableLocations = ['Mungoni', 'Near Bamu Apartments', 'Around Promise Hostels', 'Around Malimu Alfha', 'Nyali Center', 'Shanzu Beach Road', 'Changamwe Estate', 'Majengo Area'];
    const resultMessage = document.querySelector(".result");
    resultMessage.className = 'mt-6 text-center font-semibold';
    checkButton.parentElement.appendChild(resultMessage);

    checkButton.addEventListener('click', () => {
        const enteredLocation = locationInput.value.trim();
        resultMessage.innerHTML = ''; // Clear previous result

        if (!enteredLocation) {
            resultMessage.className = 'mt-6 text-center font-semibold text-red-600';
            resultMessage.textContent = 'Please enter a location to check coverage.';
            return;
        }

        const match = availableLocations.find((location) =>
            location.toLowerCase().includes(enteredLocation.toLowerCase())
        );

        if (match) {
            resultMessage.className = 'mt-6 text-center font-semibold text-teal-600';
            resultMessage.innerHTML = `🎉 <span class="font-bold">${match}</span> is covered! You can enjoy our services in your area.`;
        } else {
            resultMessage.className = 'mt-6 text-center font-semibold text-gray-600';
            resultMessage.innerHTML = '🚫 Sorry, coverage is not available in your area yet. Stay tuned as we expand!';
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const suggestionForm = document.getElementById('suggestionsForm');
    const suggestionText = document.getElementById('suggestionText');
    const suggestionCategory = document.getElementById('suggestionCategory');
    const submissionMessage = document.getElementById('submissionMessage');

    async function submitSuggestion() {
        // Clear any previous message
        submissionMessage.classList.add('hidden');
        submissionMessage.textContent = '';

        // Validate inputs
        const text = suggestionText.value.trim();
        const category = suggestionCategory.value;

        if (!text) {
            showMessage('Please enter your suggestion.', 'error');
            return;
        }
        if (!category) {
            showMessage('Please select a category.', 'error');
            return;
        }

        // Prepare payload
        const payload = {
            suggestionText: text,
            category: category,
        };

        try {
            // Mock API endpoint (replace with your actual endpoint)
            const response = await fetch('/api/suggestions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                // Clear form fields on success
                suggestionText.value = '';
                suggestionCategory.value = '';

                showMessage(
                    `Thank you for your amazing suggestion! 🎉 Your input helps us improve and serve you better. 
                    Remember, great ideas like yours drive innovation! Keep sharing your thoughts — we value you! 💡`,
                    'success'
                );
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'Failed to submit suggestion. Please try again.';
                showMessage(errorMessage, 'error');
            }
        } catch (error) {
            showMessage('An error occurred while submitting your suggestion. Please try again later.', 'error');
        }
    }

    function showMessage(message, type) {
        submissionMessage.textContent = message;
        submissionMessage.classList.remove('hidden', 'text-teal-600', 'text-red-600');
        submissionMessage.classList.add(type === 'success' ? 'text-teal-600' : 'text-red-600');
    }

    // Attach the submit handler
    suggestionForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent form submission
        submitSuggestion();
    });
});

