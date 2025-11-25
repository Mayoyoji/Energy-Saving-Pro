(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        const currentAccount = window.EnergySavingApp?.SessionManager?.getCurrentAccount();
        
        if (!currentAccount) {
            console.log('No valid session found, redirecting to login page');
            window.location.href = 'index.html';
            return;
        }
        
        console.log('User session found:', currentAccount);
        initializeCalculators();
    });

  
    let userProfile = {};
    let appliances = [];
    let notifications = [];

    async function initializeCalculators() {
        console.log('Calculators page loaded');
        
        if (!window.EnergySavingApp.SessionManager.getCurrentAccount()) {
            window.location.href = 'index.html';
            return;
        }

    
        let attempts = 0;
        while ((!energyDB || !energyDB.db) && attempts < 10) {
            console.log('Waiting for database...', attempts);
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }

        if (!energyDB || !energyDB.db) {
            showToast('Database not ready. Please refresh the page.', 'error');
            return;
        }

        try {
            await loadAllData();
            initializeNotificationSystem();
            initializeDarkMode();
            setupEventListeners();
            
            console.log('Calculators page initialized successfully');
            
        } catch (error) {
            console.error('Error initializing calculators:', error);
            showToast('Error initializing calculators', 'error');
        }
    }


    async function loadAllData() {
        const accountId = window.EnergySavingApp.SessionManager.getCurrentAccount().id;
        
        try {
         
            const accountData = await energyDB.getAccountById(accountId);
            console.log('Account data:', accountData);
            
           
            userProfile = {};
            
     
            const userProfileData = await energyDB.getUserProfile(accountId) || {};
            Object.assign(userProfile, userProfileData);
            
        
            const locationTariff = await energyDB.getLocationTariff(accountId) || {};
            Object.assign(userProfile, locationTariff);
            
 
            const preferences = await energyDB.getPreferences(accountId) || {};
            Object.assign(userProfile, preferences);
            

            if (accountData) {
                userProfile.fullName = accountData.fullname || userProfile.fullName;
                userProfile.email = accountData.email || userProfile.email;
                userProfile.createdAt = accountData.createdAt || userProfile.createdAt;
            }
            
            console.log('Final merged userProfile:', userProfile);
            
          
            appliances = await energyDB.getAppliances(accountId) || [];
            notifications = await energyDB.getNotifications(accountId) || [];
  
            updateHeaderInfo();
            populateApplianceSelect();
            

            const tariffRateInput = document.getElementById('tariffRate');
            if (tariffRateInput && userProfile.electricityTariff) {
                tariffRateInput.value = userProfile.electricityTariff;
            }
            
        } catch (error) {
            console.error('Error loading data:', error);
            showToast('Error loading your data', 'error');
        }
    }

    function updateHeaderInfo() {
        const userNameElement = document.getElementById('userName');
        const userLocationElement = document.getElementById('userLocation');
        
        if (userNameElement) {
            let fullName = '';
            if (userProfile.firstName) fullName += userProfile.firstName;
            if (userProfile.surname) fullName += ' ' + userProfile.surname;
            
            userNameElement.textContent = fullName.trim() || userProfile.fullName || userProfile.fullname || 'User';
        }
        
        if (userLocationElement) {
            let locationText = 'Set your location';
            if (userProfile.city && userProfile.region) {
                locationText = `${userProfile.city}, ${userProfile.province}, ${userProfile.region}`;
            } else if (userProfile.city) {
                locationText = userProfile.city;
            } else if (userProfile.region) {
                locationText = userProfile.region;
            } else if (userProfile.province) {
                locationText = userProfile.province;
            }
            userLocationElement.textContent = locationText;
        }
        
        console.log('Header info updated:', {
            name: userNameElement?.textContent,
            location: userLocationElement?.textContent
        });
    }

    function populateApplianceSelect() {
        const select = document.getElementById('scenarioAppliance');
        if (!select) return;
        
        select.innerHTML = '<option value="">Select an appliance</option>';
        
        appliances.forEach(appliance => {
            const option = document.createElement('option');
            option.value = appliance.id;
            option.textContent = appliance.name;
            select.appendChild(option);
        });
    }
    function formatLargeNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toLocaleString();
    }
    

    function calculateCarbon() {
        const energy = parseFloat(document.getElementById('energyConsumption').value) || 0;
        const emissionFactor = 0.691;
        const carbonEmissions = energy * emissionFactor;
        
        
        const formattedResult = formatLargeNumber(Math.round(carbonEmissions));
        document.getElementById('carbonResult').textContent = formattedResult;
    }

    function calculateBill() {
        const reading = parseFloat(document.getElementById('meterReading').value) || 0;
        const tariff = parseFloat(document.getElementById('tariffRate').value) || 0;
        const billAmount = reading * tariff;
   
        const formattedBill = formatCurrency(billAmount);
        document.getElementById('billResult').textContent = formattedBill;
    }
    function formatCurrency(amount) {
        if (amount >= 1000000) {
            return '₱' + (amount / 1000000).toFixed(1) + 'M';
        } else if (amount >= 1000) {
            return '₱' + (amount / 1000).toFixed(1) + 'K';
        }
        return '₱' + amount.toLocaleString(undefined, { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    }


    async function calculateScenario() {
        const applianceId = document.getElementById('scenarioAppliance').value;
        const hours = parseFloat(document.getElementById('scenarioHours').value) || 0;
        const tariff = parseFloat(document.getElementById('tariffRate').value) || (userProfile.electricityTariff || 11.00);
        
        if (!applianceId) {
            showToast('Please select an appliance', 'error');
            return;
        }
        
        const appliance = appliances.find(a => a.id == applianceId);
        if (appliance) {
            const dailyConsumption = (appliance.wattage * hours) / 1000;
            const dailyCost = dailyConsumption * tariff;
            const monthlyCost = dailyCost * 30;
            const dailyCarbon = dailyConsumption * 0.691;
            
            document.getElementById('scenarioCost').textContent = `₱${dailyCost.toFixed(2)}`;
            document.getElementById('scenarioCostMonthly').textContent = `₱${monthlyCost.toFixed(2)}`;
            document.getElementById('scenarioCarbon').textContent = `${dailyCarbon.toFixed(2)} kg`;
            
            showToast(`Scenario calculated for ${appliance.name}`, 'success');
        }
    }


    function initializeNotificationSystem() {
        updateUnreadBadge();
        loadNotifications();
        
        const inbox = document.querySelector('.inbox');
        if (inbox) {
            inbox.addEventListener('click', openNotificationModal);
        }
    }

    function updateUnreadBadge() {
        const unreadBadges = document.querySelectorAll('.unread-badge');
        const unreadCount = notifications.filter(notification => !notification.read).length;
        
   
        unreadBadges.forEach(badge => badge.remove());
        
       
        if (unreadCount > 0) {
            const inboxItems = document.querySelectorAll('.nav-inbox .nav-item, .inbox');
            
            inboxItems.forEach(item => {
                const badge = document.createElement('div');
                badge.className = 'unread-badge';
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                item.style.position = 'relative';
                item.appendChild(badge);
            });
        }
    }

    function loadNotifications() {
        const notificationsList = document.getElementById('notificationsList');
        const emptyNotifications = document.getElementById('emptyNotifications');
        
        if (!notificationsList || !emptyNotifications) return;
        
        if (notifications.length === 0) {
            notificationsList.style.display = 'none';
            emptyNotifications.style.display = 'block';
            return;
        }
        
        notificationsList.style.display = 'block';
        emptyNotifications.style.display = 'none';
        notificationsList.innerHTML = '';
        
        const sortedNotifications = [...notifications].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        sortedNotifications.forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item ${notification.read ? '' : 'unread'}`;
            notificationItem.onclick = () => markAsRead(notification.id);
            
            const icon = getNotificationIcon(notification.type);
            const timeAgo = getTimeAgo(notification.timestamp);
            
            notificationItem.innerHTML = `
                <div class="notification-icon ${notification.type}">${icon}</div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${timeAgo}</div>
                    <div class="notification-actions-single">
                        <button class="btn-delete-notification" onclick="event.stopPropagation(); deleteNotification(${notification.id})">
                            Delete
                        </button>
                    </div>
                </div>
            `;
            
            notificationsList.appendChild(notificationItem);
        });
        
  
        updateUnreadBadge();
    }

    function getNotificationIcon(type) {
        const icons = {
            info: 'ℹ️',
            warning: '⚠️',
            success: '✅',
            error: '❌'
        };
        return icons[type] || '🔔';
    }

    function getTimeAgo(timestamp) {
        const now = new Date();
        const diffMs = now - new Date(timestamp);
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return new Date(timestamp).toLocaleDateString();
    }


    function openNotificationModal() {
        const modal = document.getElementById('notificationModal');
        if (modal) {
            modal.style.display = 'block';
            loadNotifications();
        }
    }

    function closeNotificationModal() {
        const modal = document.getElementById('notificationModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    window.onclick = function(event) {
        const modal = document.getElementById('notificationModal');
        if (event.target === modal) {
            closeNotificationModal();
        }
    }

    async function markAsRead(notificationId) {
        try {
            await energyDB.markNotificationAsRead(notificationId);
            const notification = notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.read = true;
            }
            updateUnreadBadge();
            loadNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    async function markAllAsRead() {
        try {
            for (const notification of notifications) {
                if (!notification.read) {
                    await energyDB.markNotificationAsRead(notification.id);
                    notification.read = true;
                }
            }
            updateUnreadBadge();
            loadNotifications();
            showToast('All notifications marked as read', 'success');
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }

    async function deleteNotification(notificationId) {
        try {
            await energyDB.deleteNotification(notificationId);
            notifications = notifications.filter(notification => notification.id !== notificationId);
            updateUnreadBadge();
            loadNotifications();
            showToast('Notification deleted', 'success');
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }

    async function clearAllNotifications() {
        if (notifications.length === 0) {
            showToast('No notifications to clear', 'info');
            return;
        }
        
        if (confirm('Are you sure you want to clear all notifications?')) {
            try {
                for (const notification of notifications) {
                    await energyDB.deleteNotification(notification.id);
                }
                notifications = [];
                updateUnreadBadge();
                loadNotifications();
                showToast('All notifications cleared', 'success');
            } catch (error) {
                console.error('Error clearing notifications:', error);
            }
        }
    }


    function initializeDarkMode() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (!darkModeToggle) return;
        
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        
        if (savedDarkMode) {
            document.body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        }
        
        darkModeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'true');
                showToast('Dark mode enabled', 'info');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'false');
                showToast('Dark mode disabled', 'info');
            }
        });
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `
            <span>${getNotificationIcon(type)}</span>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }

    async function addNotification(type, title, message) {
        const accountId = window.EnergySavingApp.SessionManager.getCurrentAccount().id;
        
        try {
            const notificationId = await energyDB.addNotification(accountId, {
                type: type,
                title: title,
                message: message,
                read: false,
                timestamp: new Date()
            });
            
            console.log('Notification added with ID:', notificationId);
            
         
            notifications = await energyDB.getNotifications(accountId);
            updateUnreadBadge();

            if (document.getElementById('notificationModal').style.display === 'block') {
                loadNotifications();
            }
            
            showToast('New notification received', 'info');
        } catch (error) {
            console.error('Error adding notification:', error);
            showToast('Error creating notification', 'error');
        }
    }


    function setupEventListeners() {
   
        document.querySelectorAll('.nav-item').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetHref = this.getAttribute('href');
                window.location.href = targetHref;
            });
        });
    }


    window.calculateCarbon = calculateCarbon;
    window.calculateBill = calculateBill;
    window.calculateScenario = calculateScenario;
    window.openNotificationModal = openNotificationModal;
    window.closeNotificationModal = closeNotificationModal;
    window.markAllAsRead = markAllAsRead;
    window.clearAllNotifications = clearAllNotifications;
    window.deleteNotification = deleteNotification;
    window.markAsRead = markAsRead;
    window.logout = logout;

})();
