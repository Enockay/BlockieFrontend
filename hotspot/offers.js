//disable page view functionslity
document.addEventListener('keydown', function (event) {
    // Check if 'Ctrl' key is pressed along with 'U'
    if (event.ctrlKey && event.key === 'u') {
        event.preventDefault();
    }
});

// Simulating a server endpoint
const serverEndpoint = "https://example.com/api/promo";

// Function to fetch promo code from the server
async function fetchPromoCode() {
  try {
    const response = await fetch(serverEndpoint);
    if (!response.ok) throw new Error("Failed to fetch promo code");
    const data = await response.json();
    return data.promoCode;
  } catch (error) {
    console.error(error);
    return "Error fetching promo code";
  }
}

// Function to validate promo code
async function validatePromoCode(userInput) {
  try {
    const response = await fetch(`${serverEndpoint}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promoCode: userInput }),
    });
    if (!response.ok) throw new Error("Validation failed");
    const data = await response.json();
    return data.isValid ? "Promo code is valid! 🎉" : "Invalid promo code.";
  } catch (error) {
    console.error(error);
    return "Error validating promo code.";
  }
}

// Display promo code
const promoDisplay = document.getElementById("promo-display");
const promoInput = document.getElementById("promo-input");
const submitBtn = document.getElementById("submit-btn");
const responseMessage = document.getElementById("response-message");

async function updatePromoCode() {
  const promoCode = await fetchPromoCode();
  promoDisplay.textContent = promoCode;
}

// Set up auto-update every hour
updatePromoCode(); // Initial fetch
setInterval(updatePromoCode, 60 * 60 * 1000); // Update every hour

// Handle promo code submission
submitBtn.addEventListener("click", async () => {
  const userInput = promoInput.value.trim();
  if (!userInput) {
    responseMessage.textContent = "Please enter a promo code.";
    responseMessage.className = "text-red-600";
    return;
  }

  responseMessage.textContent = "Validating promo code...";
  responseMessage.className = "text-blue-500";

  const result = await validatePromoCode(userInput);
  responseMessage.textContent = result;
  responseMessage.className = result.includes("valid") ? "text-green-600" : "text-red-600";
});

const confirmBtn = document.getElementById('confirmButton');
const offerspinner = document.getElementById('spinner1');
const spinner = document.getElementById("spinner");
const text = document.getElementById('notify');
const Router = document.getElementById("identity").value;
const connectBack = document.getElementById("connect-button");
const textNotify = document.getElementById("connect-notify");

const submitConnectBack = (time, phone, TransactionCode) => {
    const RouterName = document.getElementById("identity").value;

    const connectForm = document.createElement("form");
    connectForm.className = "connectForm";
    connectForm.method = "post";
    connectForm.action = "https://mikrotiksystem2.fly.dev/public/connect.php";

    const amountInput = document.createElement("input");
    amountInput.type = "hidden";
    amountInput.name = "remainingTime";
    amountInput.value = time;

    const phoneNumber = document.createElement("input");
    phoneNumber.type = "hidden";
    phoneNumber.name = "phoneNumber";
    phoneNumber.value = phone;

    const router = document.createElement("input");
    router.type = "hidden";
    router.name = "routername";
    router.value = RouterName;

    const Transaction = document.createElement("input");
    Transaction.type = "hidden";
    Transaction.name = "TransactionCode";
    Transaction.value = TransactionCode

    connectForm.append(amountInput, phoneNumber, router, Transaction);
    document.body.append(connectForm);
    connectForm.submit();
};

connectBack.addEventListener("click", async () => {
    const input = document.getElementById("phone").value;
    if (!input || input.length !== 10) {
        textNotify.style.display = "inline-block";
        textNotify.textContent = "Kindly check your phoneNumber..!"
        textNotify.className = "text-red-500 font-bold text-xm";
        return;
    }
    const formatPhoneNumber = (phoneNumber) => {
        const numericOnly = phoneNumber.replace(/\D/g, '');
        return numericOnly.startsWith('0111') && numericOnly.length === 10 ? '254' + numericOnly.substring(1) : '254' + numericOnly.substring(1);
    };
    const PhoneNumber = formatPhoneNumber(input);
    const mac = "00:01:4B:7B:27";
    //console.log(PhoneNumber)
    offerspinner.style.display = "block";
    connectBack.style.display = "none";
    textNotify.textContent = "";

    try {
        const response = await fetch("https://node-blackie-networks.fly.dev/api/jwt", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ phoneNumber: PhoneNumber, mac: mac })
        });
        
        const result = await response.json();
       // console.log(result);
        const ResultCode = result.ResultCode;

        // Handle the response based on the value of responseState
        switch (ResultCode) {
            case 0:
                offerspinner.style.display = "block";
                connectBack.style.display = "none"
                const remainingTime = result.remainingTime;
                const TransactionCode = result.TransactionCode;
                textNotify.style.display = "inline-block";
                textNotify.textContent = "wait as we connect you to internet"
                textNotify.className = "text-green-600 text-xm mt-5 font-bold";
                submitConnectBack(remainingTime, PhoneNumber, TransactionCode);
                break;
            case 1:
                textNotify.style.display = "inline-block";
                textNotify.className = "text-red-500 font-bold text-xm"
                textNotify.textContent = "You currently dont have an active offer package "
                break;
            case 2:
                textNotify.style.display = "inline-block";
                textNotify.className = "text-red-500 font-bold text-xm"
                textNotify.textContent = "You currently dont have an active offer package "
                break;
            default:
                // Handle other cases if needed
                break;
        }

    } catch (error) {

    } finally {
        offerspinner.style.display = "none";
        connectBack.style.display = "block";
    }
})


const extractTime2 = (packageName) => {
    let allocatedTime = null;
    const now = new Date();
    const currentHour = now.getHours();

    switch (packageName) {
        case 'Midnight Package':
            // Midnight Package is valid from midnight to 6 AM
            if (currentHour < 6) {
                allocatedTime = {
                    value: 6 - currentHour, // Time until 6 AM
                    unit: 'hour'
                };
            }
            break;

        case '3-Hour Package':
            // 3-Hour Package is valid for 3 hours
            allocatedTime = {
                value: 3,
                unit: 'hour'
            };
            break;

        case 'Weekend Package':
            // Weekend Package is valid for the entire weekend (Saturday-Sunday)
            allocatedTime = {
                value: 48, // Assuming 48 hours for a weekend
                unit: 'hour'
            };
            break;

        case '24-Hour Package':
            // 24-Hour Package is valid only between 5 AM and 6 AM
            if (currentHour >= 5 && currentHour < 6) {
                allocatedTime = {
                    value: 24,
                    unit: 'hour'
                };
            }
            break;

        default:
            break;
    }

    return allocatedTime;
};
const submitConnectForm2 = (amount, phone) => {
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
        createHiddenInput("routername", routerName)  // Router name input
    );

    // Append the form to the body and submit it
    document.body.append(connectForm);
    connectForm.submit();
};

// WebSocket connection logic with automatic reconnection and ping-pong mechanism
function connectWebSocket2(checkoutRequestID, phone, Amount, routername) {
    const socket = new WebSocket(`wss://node-blackie-networks.fly.dev/${checkoutRequestID}`); // Use wss if your server supports it
    let pingInterval;

    // Define a placeholder for the text element if not already in your HTML
    const text = document.getElementById('websocketErrorText') || document.createElement('span');

    // Handle WebSocket opening
    socket.addEventListener('open', () => {
        console.log('WebSocket is open now.');
        text.style.display = "none"; // Hide error message if connection is successful

        // Start sending ping messages every 30 seconds
        pingInterval = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: 'ping' }));
            }
        }, 3000);
    });

    // Handle WebSocket errors
    socket.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
        text.style.display = "inline-block";
        text.className = "text-red-500 text-sm";
        text.textContent = "Error: WebSocket connection failed, retrying...";
        socket.close(); // Close socket and trigger reconnect
    });

    let isProcessingComplete = false;

    // Handle WebSocket messages (to check for pong responses if needed)
    socket.addEventListener('message', (message) => {
        const data = JSON.parse(message.data);
        if (data.type === 'pong') {
            console.log('Received pong response');
        } else {
            if (data) {
                isProcessingComplete = true
            }
            console.log('Received data:', data);
        }
        function closeWebSocket() {
            if (pingInterval) clearInterval(pingInterval); // Clear ping interval
            if (isProcessingComplete) {
                socket.close();
            }
        }
        closeWebSocket();
    });

    // Handle WebSocket closure
    socket.addEventListener('close', () => {
        console.log('WebSocket connection closed');
        // clearInterval(pingInterval); // Stop pinging when the connection closes
        if (!isProcessingComplete) {
            reconnectWebSocket(checkoutRequestID, phone, Amount, routername);
        } // Attempt reconnection
    });

    return socket;
}

// Define the reconnection function
function reconnectWebSocket(checkoutRequestID, phone, Amount, routername) {
    // Wait a few seconds before reconnecting to avoid too many rapid retries
    setTimeout(() => {
        console.log('Reconnecting WebSocket...');
        connectWebSocket2(checkoutRequestID, phone, Amount, routername);
    }, 5000); // 5-second delay before retry
}


function closeModal() {
    document.getElementById('purchaseModal').style.display = 'none';
}

// Handle payment status received from WebSocket messages
function handlePaymentStatus2(status, phone, Amount, routername, time1) {
    if (status === 'Payment Successful') {
        // setCookie('phoneNumber', phone, time1);
        // updateLocalstorage(phone);
        text.style.display = "block";
        text.textContent = "Success! processing internet connection";
        text.className = 'text-green-400 text-xm'
        submitConnectForm2(Amount, phone, routername);
        spinner.style.display = 'inline-block';
        confirmBtn.style.display = 'none';
    } else {
        text.style.display = "inline-block"
        text.textContent = `${status}`;
        text.className = 'text-red-500 text-xm';
        spinner.style.display = 'none';
    }
}

function openModal(packageName, packagePrice) {

    document.getElementById('modalTitle').innerText = `Purchase ${packageName}`;
    document.getElementById('modalDescription').innerText = `Enter your mobile number to proceed with payment of ${packagePrice}:`;
    document.getElementById('purchaseModal').style.display = 'block';

    async function confirmPurchase() {
        const mobileNumber = document.getElementById('userMobile').value;
        const formatPhoneNumber = (phoneNumber) => {
            const numericOnly = phoneNumber.replace(/\D/g, '');
            return numericOnly.startsWith('0111') && numericOnly.length === 10 ? '254' + numericOnly.substring(1) : '254' + numericOnly.substring(1);
        };
        if (!mobileNumber || mobileNumber.length !== 10) {
            text.style.display = "block";
            text.className = "text-red-500 text-xm"
            text.textContent = 'Please enter a valid  mobile number.';

            return;
        }
        const phoneNumber = formatPhoneNumber(mobileNumber)
        //console.log(phoneNumber);

        confirmBtn.style.display = 'none';
        spinner.style.display = 'inline-block';

        const extractAmount2 = (value) => {
            // Regular expression to match currency amounts
            const regex = /Ksh\s*(\d+)/i;
            const amountMatch = value.match(regex);

            // Declare the extracted amount
            let extractedAmount = null;

            if (amountMatch) {
                extractedAmount = parseInt(amountMatch[1], 10)
            }

            // Return the extracted amount
            return extractedAmount;
        };
        const time = extractTime2(packageName);
        //console.log(time)

        const Amount = extractAmount2(packagePrice);
        //console.log("amount", Amount);
        const fallbackTimeout = setTimeout(() => {
            text.style.display = "inline-block";
            text.className = 'text-red-500 text-xm';
            text.textContent = "Waiting for Mpesa transaction verification. Do not close or refresh this page. If it takes too long, try with the connect button.";
        }, 30000); // 30 seconds timeout

        try {
            // Replace this with the actual endpoint for purchase confirmation
            const response = await fetch("https://node-blackie-networks.fly.dev/api/makePayment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ phoneNumber: phoneNumber, Amount, timeUnit: time }), // Send mobile number in the request body
            });

            if (!response.ok) {
                throw new Error("Failed to confirm purchase. Please try again.");
            }

            const result = await response.json(); // Parse JSON response if needed
            if (result.success && result.message.CheckoutRequestID) {
                const checkoutRequestID = result.message.CheckoutRequestID;

                const socket = connectWebSocket2(checkoutRequestID, phoneNumber, Amount, Router);

                // WebSocket message handler
                socket.addEventListener('message', (event) => {
                    clearTimeout(fallbackTimeout); // Clear the fallback timeout
                    const message = JSON.parse(event.data);
                    //console.log(message)

                    if (message.checkoutRequestID === checkoutRequestID) {
                        handlePaymentStatus2(message.status, phoneNumber, Amount, Router, time); // Handle the payment status
                    }
                });
            }
            //alert("Purchase Successful!");

        } catch (error) {
            // Handle any errors that occurred during the API call
            console.error(error);
            text.style.display = 'block';
            text.className = "text-red-500 text-xm";
            text.textContent = "An error occurred while confirming the purchase. Please try again";
            spinner.style.display = 'none';
            confirmBtn.style.display = 'inline-block';
        }
    }

    confirmBtn.addEventListener("click", confirmPurchase)
}

// Utility function to calculate the remaining time based on current time and expiration
function calculateRemainingTime2(expirationHour, durationHours = 0) {
    const now = new Date();
    let expirationTime = new Date();

    if (durationHours) {
        expirationTime.setHours(now.getHours() + durationHours, now.getMinutes(), 0, 0);
    } else {
        expirationTime.setHours(expirationHour, 0, 0, 0);
        if (now.getHours() >= expirationHour) {
            expirationTime.setDate(expirationTime.getDate() + 1); // Set for the next day if past expiration
        }
    }

    const timeLeft = expirationTime - now;
    return timeLeft > 0 ? timeLeft : 0;
}

// Utility function to format time left into hours and minutes
function formatTimeLeft(milliseconds) {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
}

// Calculate remaining time in milliseconds to target hour and duration (in hours) if provided
function calculateRemainingTime2(targetHour, durationHours) {
    const now = new Date();
    let targetTime;

    if (targetHour !== null) {
        targetTime = new Date();
        targetTime.setHours(targetHour, 0, 0, 0); // Set to the target hour
        if (now > targetTime) {
            targetTime.setDate(targetTime.getDate() + 1); // Move to next day if target time has passed
        }
    } else if (durationHours) {
        targetTime = new Date(now.getTime() + durationHours * 60 * 60 * 1000); // Duration-based countdown
    }

    return targetTime ? targetTime - now : 0;
}

// Format time remaining to display as hours, minutes, and seconds
function formatTimeLeft(timeLeft) {
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
}

// Function to calculate the remaining time until the specified target hour on the same or next day
function calculateRemainingTime(targetHour) {
    const currentTime = new Date();
    let targetTime = new Date();

    targetTime.setHours(targetHour, 0, 0, 0);

    // If target time is earlier than current time, move to the next day
    if (currentTime >= targetTime) {
        targetTime.setDate(targetTime.getDate() + 1);
    }

    return targetTime - currentTime;
}
function calculateRemainingTimeToWeekend() {
    const currentTime = new Date();
    const currentDay = currentTime.getDay();
    const daysUntilSaturday = (6 - currentDay + 7) % 7; // Days until Saturday (6 = Saturday)
    
    let targetTime = new Date(currentTime);
    targetTime.setDate(currentTime.getDate() + daysUntilSaturday);
    targetTime.setHours(0, 0, 0, 0); // Midnight on the next Saturday

    const timeDifference = targetTime - currentTime;
    
    return {
        days: Math.floor(timeDifference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((timeDifference % (1000 * 60)) / 1000),
    };
}

// Main function to initiate countdowns based on package name
function startCountdown(packageName, elementId, buttonId) {
    const interval = setInterval(() => {
        let timeLeft;
        const now = new Date();
        const day = now.getDay();
        const hours = now.getHours();

        if (packageName === 'Midnight Package') {
            // Display button only between midnight and 6 AM
            if (hours >= 0 && hours < 6) {
                document.getElementById(buttonId).style.display = 'inline-block';
                document.getElementById(elementId).style.display = 'none';
            } else {
                timeLeft = calculateRemainingTime(0); // Countdown to next midnight
                document.getElementById(buttonId).style.display = 'none';
                document.getElementById(elementId).style.display = 'block';
            }
        } else if (packageName === '3-Hour Package') {
            // Display button between 8 PM - 12 AM and 12 AM - 6 AM
            if ((hours >= 20 && hours < 24) || (hours >= 0 && hours < 6)) {
                document.getElementById(buttonId).style.display = 'inline-block';
                document.getElementById(elementId).style.display = 'none';
            } else {
                timeLeft = calculateRemainingTime(20); // Countdown to 8 PM
                document.getElementById(buttonId).style.display = 'none';
                document.getElementById(elementId).style.display = 'block';
            }
        } else if (packageName === 'Weekend Package') {
            const isWeekend = day === 6 || day === 0; // Saturday or Sunday
            if (isWeekend) {
                document.getElementById(buttonId).style.display = 'inline-block';
                document.getElementById(elementId).style.display = 'none';
            } else {
                const weekendTimeLeft = calculateRemainingTimeToWeekend();
                document.getElementById(buttonId).style.display = 'none';
                document.getElementById(elementId).style.display = 'block';
                document.getElementById(elementId).innerText = `Starts in ${weekendTimeLeft.days}d ${weekendTimeLeft.hours}h ${weekendTimeLeft.minutes}m ${weekendTimeLeft.seconds}s`;
            }
        } else if (packageName === '24-Hour Package') {
            // Display button between 11 PM and 6 AM
            if (hours >= 23 || hours < 6) {
                document.getElementById(buttonId).style.display = 'inline-block';
                document.getElementById(elementId).style.display = 'none';
            } else {
                timeLeft = calculateRemainingTime(23); // Countdown to 11 PM
                document.getElementById(buttonId).style.display = 'none';
                document.getElementById(elementId).style.display = 'block';
            }
        }

        // Update countdown display if time left
        if (timeLeft && timeLeft > 0) {
            document.getElementById(elementId).innerText = `Starts in ${formatTimeLeft(timeLeft)}`;
        }

        // Clear interval when package becomes available
        if (timeLeft <= 0 && document.getElementById(buttonId).style.display === 'none') {
            clearInterval(interval);
            startCountdown(packageName, elementId, buttonId); // Restart countdown for next availability
        }
    }, 1000); // Update every second
}

// Helper function to format remaining time into hours, minutes, and seconds
function formatTimeLeft(ms) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
}

// Call the countdown function for each package on page load or purchase
document.addEventListener("DOMContentLoaded", () => {
    startCountdown('Midnight Package', 'countdownToMidnight', 'midnightButton');
    startCountdown('3-Hour Package', 'countdownToThreeHour', 'threeHourButton');
    startCountdown('Weekend Package', 'countdownToWeekend', 'weekendButton');
    startCountdown('24-Hour Package', 'countdownToTwentyFourHour', 'twentyFourHourButton');
});


