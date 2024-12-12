const ROUTER_IP = '192.168.100.2'; // Replace with your RouterOS IP address
const ADMIN_USER = 'api';       // Replace with your RouterOS admin username
const ADMIN_PASS = 'enock';    // Replace with your RouterOS admin password

// Function to fetch user details
async function getUserDetails(username) {
  try {
    const response = await fetch(`http://${ROUTER_IP}/rest/ip/hotspot/user`, {
      method: 'GET',
      mode: 'no-cors',
      headers: {
        Authorization: 'Basic ' + btoa(`${ADMIN_USER}:${ADMIN_PASS}`),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user details: ${response.statusText}`);
    }

    const users = await response.json();
    return users.find((user) => user.name === username); // Find the user by name
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
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + btoa(`${ADMIN_USER}:${ADMIN_PASS}`),
      },
      body: JSON.stringify({
        name: username,
        profile: profile,
      }),
    });

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
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + btoa(`${ADMIN_USER}:${ADMIN_PASS}`),
      },
      body: JSON.stringify({ profile: newProfile }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user profile: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('User profile updated successfully:', result);
  } catch (error) {
    console.error('Error updating user profile:', error.message);
  }
}

// Function to check, create, or modify the user profile
async function checkAndModifyUserProfile(username, targetProfile) {
  const user = await getUserDetails(username);

  if (!user) {
    console.log(`User "${username}" not found. Creating a new user.`);
    await createUser(username, targetProfile);
  } else if (user.profile === targetProfile) {
    console.log(`User "${username}" already has the profile "${targetProfile}". No changes needed.`);
  } else {
    console.log(`Updating profile for user "${username}" to "${targetProfile}".`);
    await updateUserProfile(username, targetProfile);
  }
}

// Example usage
checkAndModifyUserProfile('254796869402', 'default');
