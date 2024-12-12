document.addEventListener('keydown', function (event) {
    // Check if 'Ctrl' key is pressed along with 'U'
    if (event.ctrlKey && event.key === 'u') {
        event.preventDefault();
    }
});

//disable page view functionslity
const ROUTER_IP = '192.168.100.2'; // Replace with your RouterOS IP address
const ADMIN_USER = 'api';       // Replace with your RouterOS admin username
const ADMIN_PASS = 'enock'; 
   // Replace with your RouterOS admin password
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

// Time ranges with corresponding profiles
const timeRanges = [
  [0, 300, "5min"],
  [300, 600, "10min"],
  [600, 900, "15min"],
  [900, 1200, "20min"],
  [1200, 1500, "25min"],
  [1500, 1800, "30min"],
  [1800, 2100, "35min"],
  [2100, 2400, "40min"],
  [2400, 2700, "45min"],
  [2700, 3000, "50min"],
  [3000, 3300, "55min"],
  [3300, 3600, "1hr"],
  [3600, 7200, "2hr"],
  [7200, 10800, "3hr"],
  [10800, 14400, "4hr"],
  [14400, 18000, "5hr"],
  [18000, 21600, "6hr"],
  [21600, 25200, "7hr"],
  [25200, 28800, "8hr"],
  [28800, 32400, "9hr"],
  [32400, 36000, "10hr"],
  [36000, 39600, "11hr"],
  [39600, 43200, "12hr"],
  [43200, 46800, "13hr"],
  [46800, 50400, "14hr"],
  [50400, 54000, "15hr"],
  [54000, 57600, "16hr"],
  [57600, 61200, "17hr"],
  [61200, 64800, "18hr"],
  [64800, 68400, "19hr"],
  [68400, 72000, "20hr"],
  [72000, 75600, "21hr"],
  [75600, 79200, "22hr"],
  [79200, 82800, "23hr"],
  [82800, 86400, "24hr"],
  [86400, 172800, "24hr"],
];

// Function to find the correct profile based on the time limit
function getProfileFromTimeLimit(timeLimit) {
  const range = timeRanges.find(([min, max]) => timeLimit >= min && timeLimit <= max);
  return range ? range[2] : null; // Return the profile name or null if not found
}

// Function to fetch user details
async function getUserDetails(username) {
  try {
    const response = await fetch(`http://${ROUTER_IP}/rest/ip/hotspot/user`, {
      method: 'GET',
      headers: {
        Authorization: 'Basic ' + btoa(`${ADMIN_USER}:${ADMIN_PASS}`),
      },
    });
    console.log(response)
    if (!response.ok) {
      throw new Error(`Failed to fetch user details: ${response.statusText}`);
    }

    const users = await response.json();
    return users.find((user) => user.name === username);
  } catch (error) {
    console.error('Error fetching user details:', error.message);
    return null;
  }
}

// Function to create a new user (without password)
async function createUser(username, profile) {
  try {
    const response = await fetch(`http://${ROUTER_IP}/rest/ip/hotspot/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + btoa(`${ADMIN_USER}:${ADMIN_PASS}`),
      },
      body: JSON.stringify({
        name: username,
        profile: profile,
      }),
    });
    console.log(response)
    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('User created successfully:', result);
  } catch (error) {
    console.error('Error creating user:', error.message);
  }
}

// Function to update user profile
async function updateUserProfile(username, newProfile) {
  try {
    const response = await fetch(`http://${ROUTER_IP}/rest/ip/hotspot/user/${username}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + btoa(`${ADMIN_USER}:${ADMIN_PASS}`),
      },
      body: JSON.stringify({ profile: newProfile }),
    });
    console.log(response)
    if (!response.ok) {
      throw new Error(`Failed to update user profile: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('User profile updated successfully:', result);
  } catch (error) {
    console.error('Error updating user profile:', error.message);
  }
}

// Main function to handle user profile based on submitted time limit
async function handleUserProfile(username, timeLimit) {
  const profile = getProfileFromTimeLimit(timeLimit);

  if (!profile) {
    console.error('No profile found for the given time limit.');
    return;
  }

  const user = await getUserDetails(username);

  if (!user) {
    console.log(`User "${username}" not found. Creating a new user.`);
    await createUser(username, profile);
  } else if (user.profile === profile) {
    console.log(`User "${username}" already has the profile "${profile}". No changes needed.`);
  } else {
    console.log(`Updating profile for user "${username}" to "${profile}".`);
    await updateUserProfile(username, profile);
  }
}
handleUserProfile("254796869402",22000)

connectBack.addEventListener('click', async () => {
    const phone2 = phoneInput.value;
    const checkbox = document.getElementById("termsCheckbox");
    if (!checkbox.checked) {
        alertInfo.textContent = "Kindly accept our Terms and Conditions";
        alertInfo.classList.add("text-red-600", "mt-2", "font-semibold"); // Add styling for emphasis
        return;
    } else {
        alertInfo.textContent = ""; // Clear the message if checkbox is selected
    }
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
        const mac = "00:01:4B:7B:27"
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
                    alertInfo.className = 'text-white font-bold';
                    return;
                } else {
                    form.appendChild(spinner);
                    loading.style.display = "block";
                    const TransactionCode = data.TransactionCode;
                    const remainingTime = data.RemainingTime
                    //console.log(TransactionCode)
                    handleUserProfile(phoneNumber,remainingTime);
                    const expiry = addSecondsToCurrentTime(data.RemainingTime);
                    alertInfo.textContent = `wait as we connect you to internet. your  unliminet package will expire on :${expiry}`;
                    alertInfo.className = 'text-white font-semibold';
                    //form.appendChild(spinner)
                }
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

const submitConnectForm = (amount, phone,TransactionCode) => {
    // Retrieve the router name from the input element by ID
    const routerName = document.getElementById("identity")?.value;
    
    if (!routerName) {
        console.error("Router name not provided.");
        return;
    }

    // Set the maximum amount to 35 if the input amount exceeds it
    const newAmount = Math.min(amount, 35);
    // Create a form element with method POST and the correct action URL
    const connectForm = document.createElement("form");
    connectForm.className = "connectForm";
    connectForm.method = "POST";
    connectForm.action = "https://mikrotiksystem2.fly.dev/authenticateApi.php";

    // Helper function to create hidden inputs
    const createHiddenInput = (name, value) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        return input;
    };

    // Append necessary hidden inputs to the form
    connectForm.append(
        createHiddenInput("amount", newAmount),      // Amount input
        createHiddenInput("phoneNumber", phone),     // Phone number input
        createHiddenInput("routername", routerName),
        createHiddenInput("TransactionCode", TransactionCode) // Router name input
    );

    // Append the form to the body and submit it
    document.body.append(connectForm);
    connectForm.submit();
};


const purchaseItem = (value, routername) => {
    const alertInfo = document.createElement("p");
    alertInfo.className = 'text-red-500';

    // WebSocket connection logic with automatic reconnection and ping-pong mechanism
    function connectWebSocket(checkoutRequestID, phone, Amount, routername) {
        const socket = new WebSocket(`ws://node-blackie-networks.fly.dev/${checkoutRequestID}`);

        let pingInterval;

        // Handle WebSocket opening
        socket.addEventListener('open', () => {
            console.log('WebSocket is open now.');
            // Start sending ping messages every 30 seconds
            pingInterval = setInterval(() => {
                socket.send(JSON.stringify({ type: 'ping' }));
            }, 3000);
        });

        // Handle WebSocket errors
        socket.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
            feedbackPara.textContent = "Error: WebSocket connection failed, retrying...";
            reconnectWebSocket(checkoutRequestID, phone, Amount, routername); // Attempt reconnection
        });

        // Handle WebSocket closure
        socket.addEventListener('close', () => {
            console.log('WebSocket connection closed');
            clearInterval(pingInterval); // Stop pinging when the connection closes
            reconnectWebSocket(checkoutRequestID, phone, Amount, routername); // Attempt reconnection
        });

        return socket;
    }

    // Reconnection logic for WebSocket
    function reconnectWebSocket(checkoutRequestID, phone, Amount, routername) {
        setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            connectWebSocket(checkoutRequestID, phone, Amount, routername);
        }, 1000); // Retry after 5 seconds
    }

    // Handle payment status received from WebSocket messages
    function handlePaymentStatus(status, phone, Amount, routername,time1,TransactionCode) {
        if (status === 'Payment Successful') {
            setCookie('phoneNumber', phone, time1);
            updateLocalstorage(phone);
            submitConnectForm(Amount, phone,TransactionCode);
            feedback.appendChild(spinner);
        } else {
            feedbackPara.textContent = `${status}`;
            feedbackPara.className = 'text-red-500 text-xm';
            feedback.removeChild(spinner);
            feedback.appendChild(close);
        }
    }

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
                    body: JSON.stringify({ phoneNumber: phone, Amount, timeUnit: time1 })
                });

                const data = await response.json();
                if (data.success && data.message.CheckoutRequestID) {
                    const checkoutRequestID = data.message.CheckoutRequestID;

                    const socket = connectWebSocket(checkoutRequestID, phone, Amount, routername);

                    // Fallback mechanism if no WebSocket message is received within 30 seconds
                    const fallbackTimeout = setTimeout(() => {
                        feedback.removeChild(spinner);
                        feedback.appendChild(confirmButton);
                        feedbackPara.textContent = "Waiting for Mpesa transaction verification. Do not close or refresh this page. If it takes too long, try with the connect button.";
                    }, 30000); // 30 seconds timeout

                    // WebSocket message handler
                    socket.addEventListener('message', (event) => {
                        clearTimeout(fallbackTimeout); // Clear the fallback timeout
                        const message = JSON.parse(event.data);
                        console.log(message)

                        if (message.checkoutRequestID === checkoutRequestID) {
                            const TransactionCode = message.Code;
                            handlePaymentStatus(message.status, phone, Amount, routername,time1,TransactionCode); // Handle the payment status
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
        purchaseItem(badge.value, RouterName);
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

