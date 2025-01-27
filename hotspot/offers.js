//disable page view functionslity
document.addEventListener('keydown', function (event) {
    // Check if 'Ctrl' key is pressed along with 'U'
    if (event.ctrlKey && event.key === 'u') {
        event.preventDefault();
    }
});

const confirmBtn = document.getElementById('confirmButton');
const offerspinner = document.getElementById('spinner1');
const spinner = document.getElementById("spinner");
const text = document.getElementById('notify');
const Router = document.getElementById("identity").value;
const connectBack = document.getElementById("connect-button");
const textNotify = document.getElementById("connect-notify");

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
            textNotify.textContent = `${data.message}`;
            textNotify.className = "text-green mt-2 font-semibold bg-gray-100 p-2";
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;  // Redirect the user automatically
            }
            return { success: true, data };
        } else {
            const error = await response.json();
            textNotify.textContent = ` ${error.message}`;
            textNotify.className = "text-red-600 mt-2 font-semibold bg-gray-100 p-2"
            return { success: false, error: error.message };
        }
    } catch (err) {
        textNotify.textContent = `failed: ${err.message}`;
        textNotify.className = "text-red-600 mt-2 font-semibold bg-gray-100 p-2"
        return { success: false, error: err.message };
    }
}


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
                activateAccount(TransactionCode, PhoneNumber,remainingTime,);
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





function closeModal() {
    document.getElementById('purchaseModal').style.display = 'none';
}

function openModal(packageName, packagePrice) {

    document.getElementById('modalTitle').innerText = `Purchase ${packageName}`;
    document.getElementById('modalDescription').innerText = `Enter your mobile number to proceed with payment of ${packagePrice}:`;
    document.getElementById('purchaseModal').style.display = 'block';
    
    const ipAddress = document.getElementById("ip").value;
    const macAddress = document.getElementById("mac").value;
    const RouterName = document.getElementById("identity").value;
    
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
            offerspinner.style.display = "block";

            const response = await fetch('https://node-blackie-networks.fly.dev/api/makePayment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: phoneNumber, Amount:Amount, timeUnit: time, ipAddress: ipAddress, macAddress: macAddress, RouterName: RouterName })
            });

            const data = await response.json();
            if (data.success && data.message.CheckoutRequestID) {
                const checkoutRequestID = data.message.CheckoutRequestID;

                // Usage Example
                const socket = connectWebSocket(checkoutRequestID);

                // WebSocket message handler
                socket.addEventListener('message', (event) => {
                    const message = JSON.parse(event.data);
                    //console.log('Received message:', message);

                    if (message.type === 'statusUpdate' && message.status === 'success') {
                        window.location.href = message.redirectUrl;
                        socket.close()
                    }else{
                        spinner.style.display = "none";
                        text.className = 'text-red-600 mt-2 font-semibold bg-gray-100 p-2'
                        text.textContent = `${message.status}`
                    }
                });
            } else {
                spinner.style.display = "none";
                text.textContent = "Your request failed, try again";
            }
        } catch (error) {
            text.textContent = "Error in processing transaction";
            spinner.style.display = "none";
            console.error("Error submitting form: " + error.message);
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


