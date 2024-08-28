const loginTimestamp = new Date().toISOString(); // Get current timestamp
localStorage.setItem('phoneNumber', phoneNumber);
localStorage.setItem('loginTimestamp', loginTimestamp);

const calculateRemainingTime = (loginTimestamp, sessionDurationInMinutes) => {
    const now = new Date();
    const loginTime = new Date(loginTimestamp);
    const sessionDuration = sessionDurationInMinutes * 60 * 1000; // Convert minutes to milliseconds
    const elapsed = now - loginTime; // Time elapsed since login
    const remainingTime = sessionDuration - elapsed;

    return Math.max(0, Math.ceil(remainingTime / 1000)); // Return remaining time in seconds
};

const automaticLogin = async () => {
    const phoneNumber = localStorage.getItem('phoneNumber');
    const loginTimestamp = localStorage.getItem('loginTimestamp');

    if (!phoneNumber || !loginTimestamp) {
        alertInfo.textContent = 'No records for automatic login, please try manual login with Connect Back.';
        return;
    }

    const sessionDurationInMinutes = 30; // Example session duration
    const remainingTime = calculateRemainingTime(loginTimestamp, sessionDurationInMinutes);

    if (remainingTime <= 0) {
        alertInfo.textContent = 'Session expired. Please log in again.';
        return;
    }

    form.appendChild(spinner); // Show spinner while processing

    try {
        const response = await fetch('https://mikrotik-main-white-moon-8065.fly.dev/connectBackUser.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ UserPhoneNumber: phoneNumber }),
        });

        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        if (data.ResultCode === 0) {
            submitConnectBack(data.RemainingTime, phoneNumber);
            alertInfo.textContent = `Welcome back, user. Remaining time: ${remainingTime}`;
            alertInfo.className = 'text-green-500';
        } else {
            alertInfo.textContent = data.ResultCode === 1 ? 'Cannot share user details' :
                                    data.ResultCode === 2 ? 'Your package has expired. Purchase a new package.' :
                                    'Unexpected result from the server';
            alertInfo.className = 'text-red-500';
        }
    } catch (error) {
        console.error('Error:', error);
        alertInfo.textContent = "Error occurred while verifying.";
        alertInfo.className = 'text-red-500';
    } finally {
        form.removeChild(spinner); // Hide spinner after processing
    }
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
        localStorage.setItem('phoneNumber', phoneNumber);
        localStorage.setItem('loginTimestamp', new Date().toISOString()); // Store the current timestamp
        try {
            const response = await fetch('https://mikrotik-main-white-moon-8065.fly.dev/connectBackUser.php', {
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
                alertInfo.textContent = data.ResultCode === 1 ? 'Cannot share user details' : data.ResultCode === 2 ? 'Your package is expired or try Connect Back if not' : 'Unexpected result from the server';
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
