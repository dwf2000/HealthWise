// HealthWise PWA - Main Application Logic

// Initialize the app
let currentScreen = 'home-screen';
let currentWeek = 1;
let currentDate = new Date();

// App State
const appState = {
    user: {
        name: 'Colleen',
        hasCompletedOnboarding: false,
        notificationsEnabled: false,
        medications: [
            'Morning Pills',
            'Afternoon Pills',
            'Evening Pills',
            'Bedtime Pills'
        ]
    },
    todaysMeals: {},
    hydration: 0,
    glucose: [],
    symptoms: [],
    meds: [],
    logs: []
};

// Meal Templates - Imported from your JSON
const mealTemplates = {
    "7:30 AM": {
        "base": ["Low-fat oatmeal (1/4 cup)", "Cream of rice (1/4 cup)", "Quinoa porridge (1/4 cup)", "Unsweetened applesauce (2 oz)", "Mashed sweet potato (2 tbsp)"],
        "protein": ["Egg white (1–2)", "Greek yogurt (2 oz)", "Low-fat kefir (2 oz)"],
        "add_on": ["Chia seeds", "Flaxseed", "Cinnamon", "Almond butter (1 tsp)", "Olive oil drizzle"],
        "hydration": ["Warm lemon water (4 oz)", "Ginger tea (4 oz)", "Room-temp water"]
    },
    "10:00 AM": {
        "base": ["Plain Greek yogurt (2 oz)", "Low-fat cottage cheese (2 oz)", "Protein smoothie (almond milk + banana)", "Rice pudding (no sugar, 2 oz)", "Applesauce (2 oz)"],
        "protein": ["Boiled egg", "Greek yogurt", "Tofu (soft-blended)"],
        "add_on": ["Chia seeds", "Cinnamon", "Soft pear slices", "1 rice cake", "2 salt-free crackers"],
        "hydration": ["Chamomile tea", "Herbal tea", "Cucumber-infused water"]
    },
    "12:30 PM": {
        "base": ["Boiled white rice (1/4 cup)", "Steamed carrots (1/4 cup)", "Mashed butternut squash (1/4 cup)", "Boiled noodles (low fiber)", "Mashed potato (2 tbsp)"],
        "protein": ["Baked chicken (2 oz)", "Ground turkey (2 oz)", "Grilled tilapia (2 oz)", "Poached egg white", "White fish (2 oz)", "Lentils (2 tbsp)"],
        "add_on": ["Soft spinach", "Steamed zucchini", "No-salt herbs", "Olive oil drizzle"],
        "hydration": ["Electrolyte water", "Room-temp water", "Low-sodium broth"]
    },
    "3:00 PM": {
        "base": ["Rice cake", "Applesauce (no sugar)", "Blended veggie soup (1/4 cup)", "Gelatin cup (no sugar)", "Cucumber slices"],
        "protein": ["Peanut butter (1 tsp)", "Boiled egg", "Hummus (1 tbsp)"],
        "add_on": ["1/2 banana", "Tahini (1 tsp)", "Salt-free crackers", "Herbal tea"],
        "hydration": ["Ginger tea", "Warm water", "Room-temp water"]
    },
    "5:30 PM": {
        "base": ["Steamed zucchini (1/4 cup)", "Green beans (soft)", "Mashed cauliflower", "Soft-cooked asparagus", "Broth-based veggie soup"],
        "protein": ["Egg whites (2)", "Lean turkey patty (2 oz)", "Low-fat beef crumble", "Scrambled egg whites", "Tofu (2 oz)", "Baked cod (2 oz)"],
        "add_on": ["Soft spinach", "White rice (2 tbsp)", "Low-sodium seasoning", "No oil sauté"],
        "hydration": ["Room-temp water", "Broth", "Salted water (pinch of salt)"]
    },
    "7:30 PM": {
        "base": ["Bone broth (1/4 cup)", "Plain lentil soup (blended)", "Pureed vegetable broth", "Warm almond milk (2 oz)", "Rice congee (1/4 cup)"],
        "add_on": ["Soft toast (1/2 slice)", "Warm barley porridge (2 tbsp)", "No-salt seasoning", "Chamomile tea"],
        "hydration": ["Warm water", "Decaf tea", "Rice milk (2 oz)"]
    },
    "9:00 PM": {
        "base": ["1 Medjool date", "1/2 banana", "Sugar-free graham crackers (2)", "Low-sugar pudding cup (2 oz)", "Unsweetened applesauce (1 tbsp)"],
        "hydration": ["Coconut water (2 oz)", "Rice milk (2 oz)", "Warm herbal tea"]
    }
};

// Initialize app on load
document.addEventListener('DOMContentLoaded', () => {
    loadAppState();
    initializeApp();
    
    // Register service worker for offline functionality
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.error('Service Worker registration failed:', err));
    }
});

// Initialize the application
function initializeApp() {
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        
        // Show welcome screen or main app
        if (!appState.user.hasCompletedOnboarding) {
            document.getElementById('welcome-screen').style.display = 'block';
        } else {
            document.getElementById('main-app').style.display = 'block';
            updateHomeScreen();
            loadTodaysMeals();
            setupMedicationsList();
        }
    }, 1500);
    
    // Update date
    updateCurrentDate();
    
    // Set default export dates
    const today = new Date().toISOString().split('T')[0];
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    document.getElementById('export-start').value = lastWeek;
    document.getElementById('export-end').value = today;
}

// Complete onboarding
function completeOnboarding() {
    appState.user.hasCompletedOnboarding = true;
    saveAppState();
    
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    
    updateHomeScreen();
    loadTodaysMeals();
    setupMedicationsList();
    
    // Schedule notifications
    scheduleNotifications();
}

// Update current date display
function updateCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = currentDate.toLocaleDateString('en-US', options);
    document.getElementById('current-date').textContent = dateStr;
}

// Screen navigation
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
    });
    
    // Show selected screen
    const selectedScreen = document.getElementById(screenId);
    selectedScreen.style.display = 'block';
    setTimeout(() => selectedScreen.classList.add('active'), 10);
    
    // Update navigation
    updateNavigation(screenId);
    currentScreen = screenId;
    
    // Screen-specific updates
    if (screenId === 'home-screen') {
        updateHomeScreen();
    } else if (screenId === 'tracker-screen') {
        updateTrackerScreen();
    } else if (screenId === 'settings-screen') {
        loadSettingsScreen();
    }
}

// Update navigation highlighting
function updateNavigation(activeScreen) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const screenToNav = {
        'home-screen': 0,
        'meals-screen': 1,
        'tracker-screen': 2,
        'export-screen': 3
    };
    
    if (screenToNav[activeScreen] !== undefined) {
        document.querySelectorAll('.nav-item')[screenToNav[activeScreen]].classList.add('active');
    }
}

// Update home screen stats
function updateHomeScreen() {
    // Update meals completed
    const mealsCompleted = Object.values(appState.todaysMeals).filter(m => m.completed).length;
    document.getElementById('meals-completed').textContent = `${mealsCompleted}/7`;
    
    // Update hydration
    document.getElementById('hydration-oz').textContent = `${appState.hydration} oz`;
}

// Load today's meals
function loadTodaysMeals() {
    const mealsContainer = document.getElementById('meals-list');
    mealsContainer.innerHTML = '';
    
    const mealTimes = Object.keys(mealTemplates);
    
    mealTimes.forEach(time => {
        const mealData = appState.todaysMeals[time] || generateMealForTime(time);
        
        const mealCard = document.createElement('div');
        mealCard.className = `meal-card ${mealData.completed ? 'completed' : ''}`;
        mealCard.innerHTML = `
            <div class="meal-header">
                <span class="meal-time">${time}</span>
                <span class="meal-status">${mealData.completed ? '✅' : '⏰'}</span>
            </div>
            <div class="meal-content">
                <strong>Main:</strong> ${mealData.base}<br>
                <strong>Protein:</strong> ${mealData.protein}<br>
                <strong>Add:</strong> ${mealData.add_on}<br>
                <strong>Drink:</strong> ${mealData.hydration}
            </div>
            <div class="meal-actions">
                <button class="meal-btn" onclick="showMealOptions('${time}')">Change Meal</button>
                <button class="meal-btn" onclick="toggleMealComplete('${time}')">${mealData.completed ? 'Undo' : 'Complete'}</button>
            </div>
        `;
        
        mealsContainer.appendChild(mealCard);
    });
}

// Generate meal for specific time
function generateMealForTime(time) {
    const template = mealTemplates[time];
    const meal = {
        time: time,
        base: template.base[Math.floor(Math.random() * template.base.length)],
        protein: template.protein ? template.protein[Math.floor(Math.random() * template.protein.length)] : '',
        add_on: template.add_on ? template.add_on[Math.floor(Math.random() * template.add_on.length)] : '',
        hydration: template.hydration[Math.floor(Math.random() * template.hydration.length)],
        completed: false
    };
    
    appState.todaysMeals[time] = meal;
    saveAppState();
    return meal;
}

// Show meal options modal
function showMealOptions(mealTime) {
    const modal = document.getElementById('meal-modal');
    const modalTitle = document.getElementById('modal-meal-time');
    const optionsContainer = document.getElementById('meal-options');
    
    modalTitle.textContent = `${mealTime} Options`;
    optionsContainer.innerHTML = '';
    
    const template = mealTemplates[mealTime];
    
    // Create 4 different meal combinations
    for (let i = 0; i < 4; i++) {
        const option = {
            base: template.base[i % template.base.length],
            protein: template.protein ? template.protein[i % template.protein.length] : '',
            add_on: template.add_on ? template.add_on[i % template.add_on.length] : '',
            hydration: template.hydration[i % template.hydration.length]
        };
        
        const optionEl = document.createElement('div');
        optionEl.className = 'meal-option';
        optionEl.innerHTML = `
            <h4>Option ${i + 1}</h4>
            <p><strong>Main:</strong> ${option.base}</p>
            ${option.protein ? `<p><strong>Protein:</strong> ${option.protein}</p>` : ''}
            ${option.add_on ? `<p><strong>Add:</strong> ${option.add_on}</p>` : ''}
            <p><strong>Drink:</strong> ${option.hydration}</p>
        `;
        
        optionEl.onclick = () => selectMealOption(mealTime, option);
        optionsContainer.appendChild(optionEl);
    }
    
    modal.style.display = 'flex';
}

// Select meal option
function selectMealOption(mealTime, option) {
    appState.todaysMeals[mealTime] = {
        ...option,
        time: mealTime,
        completed: appState.todaysMeals[mealTime]?.completed || false
    };
    
    saveAppState();
    loadTodaysMeals();
    closeMealModal();
}

// Close meal modal
function closeMealModal() {
    document.getElementById('meal-modal').style.display = 'none';
}

// Toggle meal completion
function toggleMealComplete(mealTime) {
    if (!appState.todaysMeals[mealTime]) {
        appState.todaysMeals[mealTime] = generateMealForTime(mealTime);
    }
    
    appState.todaysMeals[mealTime].completed = !appState.todaysMeals[mealTime].completed;
    saveAppState();
    loadTodaysMeals();
    updateHomeScreen();
}

// Setup medications list
function setupMedicationsList() {
    const medList = document.getElementById('med-list');
    medList.innerHTML = '';
    
    appState.user.medications.forEach((med, index) => {
        const medDiv = document.createElement('div');
        medDiv.className = 'med-checkbox';
        medDiv.innerHTML = `
            <input type="checkbox" id="med-${index}" data-med="${med}">
            <label for="med-${index}">${med}</label>
        `;
        medList.appendChild(medDiv);
    });
}

// Update tracker screen
function updateTrackerScreen() {
    // Load today's readings
    const todayStr = currentDate.toDateString();
    const todayLogs = appState.logs.filter(log => 
        new Date(log.timestamp).toDateString() === todayStr
    );
    
    // Display glucose readings
    const glucoseContainer = document.getElementById('glucose-readings');
    glucoseContainer.innerHTML = '';
    
    todayLogs.forEach(log => {
        if (log.glucose) {
            const reading = document.createElement('div');
            reading.className = 'glucose-reading';
            reading.textContent = `${log.glucose.value} - ${log.glucose.time} (${new Date(log.timestamp).toLocaleTimeString()})`;
            glucoseContainer.appendChild(reading);
        }
    });
}

// Add glucose reading
function addGlucoseReading() {
    const value = document.getElementById('glucose-value').value;
    const time = document.getElementById('glucose-time').value;
    
    if (!value || !time) {
        alert('Please enter both glucose value and timing');
        return;
    }
    
    const reading = {
        type: 'glucose',
        glucose: { value: parseInt(value), time: time },
        timestamp: new Date().toISOString()
    };
    
    appState.logs.push(reading);
    saveAppState();
    
    // Clear inputs
    document.getElementById('glucose-value').value = '';
    document.getElementById('glucose-time').value = '';
    
    // Update display
    updateTrackerScreen();
    
    // Show success
    showToast('Glucose reading saved!');
}

// Add hydration
function addHydration(oz) {
    appState.hydration += oz;
    
    // Save log entry
    const log = {
        type: 'hydration',
        hydration: oz,
        timestamp: new Date().toISOString()
    };
    appState.logs.push(log);
    saveAppState();
    
    // Update display
    const progress = Math.min((appState.hydration / 64) * 100, 100);
    document.getElementById('hydration-progress').style.width = `${progress}%`;
    document.getElementById('hydration-total').textContent = `${appState.hydration} / 64 oz`;
    
    updateHomeScreen();
    showToast(`Added ${oz} oz of water!`);
}

// Toggle symptom
function toggleSymptom(btn) {
    btn.classList.toggle('active');
}

// Save tracker data
function saveTrackerData() {
    // Get symptoms
    const activeSymptoms = [];
    document.querySelectorAll('.symptom-btn.active').forEach(btn => {
        activeSymptoms.push(btn.dataset.symptom);
    });
    
    const symptomNotes = document.getElementById('symptom-notes').value;
    
    // Get medications
    const takenMeds = [];
    document.querySelectorAll('#med-list input:checked').forEach(checkbox => {
        takenMeds.push(checkbox.dataset.med);
    });
    
    // Create log entry
    const log = {
        type: 'daily-tracker',
        symptoms: activeSymptoms,
        symptomNotes: symptomNotes,
        medications: takenMeds,
        timestamp: new Date().toISOString()
    };
    
    appState.logs.push(log);
    saveAppState();
    
    showToast('Daily tracker data saved!');
    
    // Clear form
    document.querySelectorAll('.symptom-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('symptom-notes').value = '';
    document.querySelectorAll('#med-list input').forEach(cb => cb.checked = false);
}

// Export functionality
function selectFormat(btn) {
    document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function generateExport() {
    const startDate = new Date(document.getElementById('export-start').value);
    const endDate = new Date(document.getElementById('export-end').value);
    const format = document.querySelector('.format-btn.active').dataset.format;
    
    // Filter logs by date range
    const exportLogs = appState.logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= startDate && logDate <= endDate;
    });
    
    if (format === 'csv') {
        generateCSV(exportLogs, startDate, endDate);
    } else {
        generatePDF(exportLogs, startDate, endDate);
    }
}

function generateCSV(logs, startDate, endDate) {
    let csv = 'Date,Time,Type,Details\n';
    
    logs.forEach(log => {
        const date = new Date(log.timestamp);
        const dateStr = date.toLocaleDateString();
        const timeStr = date.toLocaleTimeString();
        
        if (log.type === 'glucose') {
            csv += `${dateStr},${timeStr},Glucose,"${log.glucose.value} - ${log.glucose.time}"\n`;
        } else if (log.type === 'hydration') {
            csv += `${dateStr},${timeStr},Hydration,"${log.hydration} oz"\n`;
        } else if (log.type === 'daily-tracker') {
            const details = `Symptoms: ${log.symptoms.join(', ')}; Notes: ${log.symptomNotes}; Meds: ${log.medications.join(', ')}`;
            csv += `${dateStr},${timeStr},Daily Tracker,"${details}"\n`;
        }
    });
    
    // Create email with CSV attachment
    const subject = `HealthWise Logs - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`;
    const body = `Dear Doctor,\n\nPlease find attached my health logs for the period ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}.\n\nBest regards,\n${appState.user.name}`;
    
    // Create data URI for CSV
    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    
    // Create download link
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `healthwise_logs_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.csv`;
    link.click();
    
    showToast('CSV file downloaded! You can now attach it to an email to your doctor.');
}

function generatePDF(logs, startDate, endDate) {
    // For PDF, we'll create a printable HTML version
    let html = `
        <div style="font-family: Georgia, serif; padding: 20px;">
            <h1>HealthWise Health Report</h1>
            <p><strong>Patient:</strong> ${appState.user.name}</p>
            <p><strong>Period:</strong> ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}</p>
            <hr>
    `;
    
    // Group logs by date
    const logsByDate = {};
    logs.forEach(log => {
        const dateStr = new Date(log.timestamp).toLocaleDateString();
        if (!logsByDate[dateStr]) logsByDate[dateStr] = [];
        logsByDate[dateStr].push(log);
    });
    
    // Generate report for each date
    Object.keys(logsByDate).sort().forEach(dateStr => {
        html += `<h2>${dateStr}</h2>`;
        
        logsByDate[dateStr].forEach(log => {
            const time = new Date(log.timestamp).toLocaleTimeString();
            
            if (log.type === 'glucose') {
                html += `<p><strong>${time} - Glucose:</strong> ${log.glucose.value} (${log.glucose.time})</p>`;
            } else if (log.type === 'hydration') {
                html += `<p><strong>${time} - Hydration:</strong> ${log.hydration} oz</p>`;
            } else if (log.type === 'daily-tracker') {
                html += `<div style="margin-bottom: 10px;">`;
                html += `<p><strong>${time} - Daily Check-in:</strong></p>`;
                html += `<ul>`;
                if (log.symptoms.length) html += `<li>Symptoms: ${log.symptoms.join(', ')}</li>`;
                if (log.symptomNotes) html += `<li>Notes: ${log.symptomNotes}</li>`;
                if (log.medications.length) html += `<li>Medications: ${log.medications.join(', ')}</li>`;
                html += `</ul></div>`;
            }
        });
    });
    
    html += '</div>';
    
    // Open print dialog
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>HealthWise Report</title>
                <style>
                    body { font-family: Georgia, serif; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>${html}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Show toast notification
function showToast(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 1000;
        animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Schedule notifications
function scheduleNotifications() {
    // First, check if notifications are supported
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return;
    }
    
    // Request permission
    if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                setupMealReminders();
                showToast('Meal reminders enabled! 🔔');
            }
        });
    } else if (Notification.permission === 'granted') {
        setupMealReminders();
    }
}

// Setup meal reminders
function setupMealReminders() {
    const mealTimes = Object.keys(mealTemplates);
    
    // Clear any existing intervals
    if (window.mealIntervals) {
        window.mealIntervals.forEach(id => clearInterval(id));
    }
    window.mealIntervals = [];
    
    // Check every minute if it's time for a meal
    const checkInterval = setInterval(() => {
        const now = new Date();
        const currentTime = now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        
        mealTimes.forEach(mealTime => {
            // Check if current time matches meal time
            if (currentTime === mealTime) {
                // Check if meal hasn't been completed
                if (!appState.todaysMeals[mealTime]?.completed) {
                    sendMealNotification(mealTime);
                }
            }
        });
    }, 60000); // Check every minute
    
    window.mealIntervals.push(checkInterval);
    
    // Also check immediately
    checkForUpcomingMeals();
}

// Send meal notification
function sendMealNotification(mealTime) {
    const notification = new Notification('HealthWise Meal Reminder', {
        body: `Time for your ${mealTime} meal! 🍽️\nTap to view your meal plan.`,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: `meal-${mealTime}`,
        requireInteraction: true,
        vibrate: [200, 100, 200]
    });
    
    notification.onclick = () => {
        window.focus();
        showScreen('meals-screen');
        notification.close();
    };
}

// Check for upcoming meals (within 5 minutes)
function checkForUpcomingMeals() {
    const now = new Date();
    const mealTimes = Object.keys(mealTemplates);
    
    mealTimes.forEach(time => {
        const [hourMin, period] = time.split(' ');
        const [hour, minute] = hourMin.split(':').map(Number);
        let hour24 = hour;
        
        if (period === 'PM' && hour !== 12) hour24 += 12;
        if (period === 'AM' && hour === 12) hour24 = 0;
        
        const mealDate = new Date();
        mealDate.setHours(hour24, minute, 0, 0);
        
        const timeDiff = mealDate - now;
        const minutesUntilMeal = Math.floor(timeDiff / 60000);
        
        // If meal is in next 5 minutes and not completed
        if (minutesUntilMeal > 0 && minutesUntilMeal <= 5) {
            if (!appState.todaysMeals[time]?.completed) {
                showToast(`${time} meal coming up in ${minutesUntilMeal} minutes!`);
            }
        }
    });
}

// Local Storage Management
function saveAppState() {
    localStorage.setItem('healthwise_state', JSON.stringify(appState));
}

function loadAppState() {
    const saved = localStorage.getItem('healthwise_state');
    if (saved) {
        Object.assign(appState, JSON.parse(saved));
        
        // Reset daily data if it's a new day
        const lastSaved = localStorage.getItem('healthwise_last_date');
        const today = new Date().toDateString();
        
        if (lastSaved !== today) {
            appState.todaysMeals = {};
            appState.hydration = 0;
            localStorage.setItem('healthwise_last_date', today);
            saveAppState();
        }
    }
}

// Modal close on outside click
window.onclick = function(event) {
    const modal = document.getElementById('meal-modal');
    if (event.target === modal) {
        closeMealModal();
    }
}

// Settings Functions
function toggleNotifications() {
    const toggle = document.getElementById('notification-toggle');
    
    if (!appState.user.notificationsEnabled) {
        // Enable notifications
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    appState.user.notificationsEnabled = true;
                    toggle.textContent = 'On';
                    toggle.classList.add('active');
                    setupMealReminders();
                    saveAppState();
                    showToast('Meal reminders enabled!');
                } else {
                    showToast('Please allow notifications in your browser settings');
                }
            });
        } else {
            showToast('Your browser doesn\'t support notifications');
        }
    } else {
        // Disable notifications
        appState.user.notificationsEnabled = false;
        toggle.textContent = 'Off';
        toggle.classList.remove('active');
        
        // Clear any existing intervals
        if (window.mealIntervals) {
            window.mealIntervals.forEach(id => clearInterval(id));
            window.mealIntervals = [];
        }
        
        saveAppState();
        showToast('Meal reminders disabled');
    }
}

function updateUserName() {
    const nameInput = document.getElementById('user-name');
    appState.user.name = nameInput.value;
    saveAppState();
    
    // Update greeting
    document.querySelector('.greeting-card h2').textContent = `Hi ${appState.user.name}! 💜`;
    showToast('Name updated!');
}

function loadSettingsScreen() {
    // Update notification toggle
    const toggle = document.getElementById('notification-toggle');
    if (appState.user.notificationsEnabled) {
        toggle.textContent = 'On';
        toggle.classList.add('active');
    } else {
        toggle.textContent = 'Off';
        toggle.classList.remove('active');
    }
    
    // Update name
    document.getElementById('user-name').value = appState.user.name;
    
    // Load medications list
    const medList = document.getElementById('med-settings-list');
    medList.innerHTML = '';
    
    appState.user.medications.forEach((med, index) => {
        const medItem = document.createElement('div');
        medItem.className = 'med-setting-item';
        medItem.innerHTML = `
            <input type="text" value="${med}" onchange="updateMedication(${index}, this.value)">
            <button class="btn-remove" onclick="removeMedication(${index})">×</button>
        `;
        medList.appendChild(medItem);
    });
}

function addMedication() {
    const newMed = prompt('Enter medication name:');
    if (newMed) {
        appState.user.medications.push(newMed);
        saveAppState();
        loadSettingsScreen();
        setupMedicationsList();
        showToast('Medication added!');
    }
}

function updateMedication(index, value) {
    appState.user.medications[index] = value;
    saveAppState();
    setupMedicationsList();
}

function removeMedication(index) {
    if (confirm('Remove this medication?')) {
        appState.user.medications.splice(index, 1);
        saveAppState();
        loadSettingsScreen();
        setupMedicationsList();
        showToast('Medication removed');
    }
}

function clearOldData() {
    if (confirm('This will remove all data older than 30 days. Continue?')) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        appState.logs = appState.logs.filter(log => 
            new Date(log.timestamp) > thirtyDaysAgo
        );
        
        saveAppState();
        showToast('Old data cleared');
    }
}

function resetApp() {
    if (confirm('This will delete ALL your data and reset the app. Are you sure?')) {
        if (confirm('This cannot be undone. Really reset everything?')) {
            localStorage.clear();
            location.reload();
        }
    }
}