// Authorized users
const AUTHORIZED_USERS = [
    'heena.chauhan@ibm.com',
    'david.thibault@ibm.com'
];

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    // Add Enter key support for authentication
    const authEmailInput = document.getElementById('authEmail');
    if (authEmailInput) {
        authEmailInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                authenticate();
            }
        });
    }
});

// Check if user is authenticated
function checkAuth() {
    const authEmail = sessionStorage.getItem('dashboardAuth');
    
    if (authEmail && AUTHORIZED_USERS.includes(authEmail.toLowerCase())) {
        showDashboard();
        loadRegistrations();
        // Refresh data every 30 seconds
        setInterval(loadRegistrations, 30000);
    } else {
        showAuthModal();
    }
}

// Authenticate user
function authenticate() {
    const emailInput = document.getElementById('authEmail');
    const email = emailInput.value.trim().toLowerCase();
    const errorDiv = document.getElementById('authError');
    
    if (!email) {
        errorDiv.textContent = 'Please enter your email address.';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (AUTHORIZED_USERS.includes(email)) {
        sessionStorage.setItem('dashboardAuth', email);
        showDashboard();
        loadRegistrations();
        // Refresh data every 30 seconds
        setInterval(loadRegistrations, 30000);
    } else {
        errorDiv.textContent = 'Access denied. Only authorized users (heena.chauhan@ibm.com and david.thibault@ibm.com) can view this dashboard.';
        errorDiv.style.display = 'block';
        emailInput.value = '';
    }
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('dashboardAuth');
        location.reload();
    }
}

// Show authentication modal
function showAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
    document.getElementById('dashboardContent').style.display = 'none';
}

// Show dashboard
function showDashboard() {
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('dashboardContent').style.display = 'block';
}

// Get registrations from localStorage
function getRegistrations() {
    const registrations = localStorage.getItem('eventRegistrations');
    return registrations ? JSON.parse(registrations) : [];
}

// Save registrations to localStorage
function saveRegistrations(registrations) {
    localStorage.setItem('eventRegistrations', JSON.stringify(registrations));
}

// Format date to readable format
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Calculate statistics
function calculateStats() {
    const registrations = getRegistrations();
    const today = new Date().toDateString();
    
    // Total registrations
    const total = registrations.length;
    
    // Unique companies
    const uniqueCompanies = new Set(registrations.map(reg => reg.company.toLowerCase())).size;
    
    // Today's registrations
    const todayCount = registrations.filter(reg => {
        const regDate = new Date(reg.registeredAt).toDateString();
        return regDate === today;
    }).length;
    
    return { total, uniqueCompanies, todayCount };
}

// Update statistics display
function updateStats() {
    const stats = calculateStats();
    document.getElementById('totalRegistrations').textContent = stats.total;
    document.getElementById('uniqueCompanies').textContent = stats.uniqueCompanies;
    document.getElementById('todayRegistrations').textContent = stats.todayCount;
}

// Delete registration
function deleteRegistration(id) {
    if (confirm('Are you sure you want to delete this registration?')) {
        let registrations = getRegistrations();
        registrations = registrations.filter(reg => reg.id !== id);
        saveRegistrations(registrations);
        loadRegistrations();
    }
}

// Load and display registrations
function loadRegistrations() {
    const registrations = getRegistrations();
    const tbody = document.getElementById('registrationsBody');
    const emptyState = document.getElementById('emptyState');
    const table = document.getElementById('registrationsTable');
    
    // Update statistics
    updateStats();
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    if (registrations.length === 0) {
        table.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    table.style.display = 'table';
    emptyState.style.display = 'none';
    
    // Sort by registration date (newest first)
    registrations.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));
    
    // Populate table
    registrations.forEach((reg, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${escapeHtml(reg.name)}</td>
            <td>${escapeHtml(reg.email)}</td>
            <td>${escapeHtml(reg.company)}</td>
            <td>${escapeHtml(reg.title)}</td>
            <td>${formatDate(reg.registeredAt)}</td>
            <td>
                <button onclick="deleteRegistration(${reg.id})" class="btn-small btn-delete">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export registrations to CSV
function exportToCSV() {
    const registrations = getRegistrations();
    
    if (registrations.length === 0) {
        alert('No registrations to export.');
        return;
    }
    
    // Create CSV header
    const headers = ['Name', 'Email', 'Company', 'Title', 'Registered At'];
    let csv = headers.join(',') + '\n';
    
    // Add data rows
    registrations.forEach(reg => {
        const row = [
            `"${reg.name}"`,
            `"${reg.email}"`,
            `"${reg.company}"`,
            `"${reg.title}"`,
            `"${formatDate(reg.registeredAt)}"`
        ];
        csv += row.join(',') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ibm-bob-developer-day-registrations-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Made with Bob
