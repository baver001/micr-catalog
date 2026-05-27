/**
 * Static Data Client (No Backend Mode)
 */

// Get all published apps from local JSON
export async function getApps() {
    console.log('Static: Fetching apps from local JSON...');
    try {
        const response = await fetch('/data/apps.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Return the apps array from the JSON structure
        console.log('Static: Apps fetched:', data.apps);
        return data.apps || [];
    } catch (error) {
        console.error('Error fetching apps:', error);
        return [];
    }
}

// Mock functions for other API calls (no backend)
export async function incrementViews(appId) {
    console.log('Static: incrementViews mock for', appId);
    return { success: true };
}

export async function submitApp(submission) {
    console.log('Static: submitApp mock', submission);
    alert('В режиме без бэкенда отправка не работает. Но мы это скоро поправим!');
    return { success: true };
}

export async function getSubmissions() {
    return [];
}

export async function updateSubmissionStatus(id, status) {
    return { success: true };
}

export async function deleteSubmission(id) {
    return { success: true };
}
