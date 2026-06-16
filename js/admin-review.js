// Admin review page — stub
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const resp = await fetch('/api/submissions');
        const submissions = await resp.json();
        const container = document.getElementById('submissions-list');
        if (submissions.length === 0) {
            container.innerHTML = '<p>No submissions yet.</p>';
            return;
        }
        container.innerHTML = submissions.map(s => `
            <div style="border:1px solid #333;padding:1rem;margin:0.5rem 0;border-radius:8px">
                <strong>${s.name}</strong> (${s.status})
                <p>${s.description || ''}</p>
                <small>by ${s.author_name || 'anon'}</small>
            </div>
        `).join('');
    } catch {
        document.getElementById('submissions-list').innerHTML = '<p>API not available.</p>';
    }
});
