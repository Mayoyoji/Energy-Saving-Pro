    console.log('Loading optimized Energy Saving Pro...');

    const Utils = {
        showMessage: function(message, type = 'info', duration = 3000) {
           
            const existingMessage = document.querySelector('.message');
            if (existingMessage) existingMessage.remove();
            
            const messageEl = document.createElement('div');
            messageEl.className = `message ${type}`;
            messageEl.textContent = message;
            
            const formHeader = document.querySelector('.form-header');
            if (formHeader) {
                formHeader.parentNode.insertBefore(messageEl, formHeader.nextSibling);
            }
            
            
            setTimeout(() => {
                if (messageEl.parentNode) messageEl.parentNode.removeChild(messageEl);
            }, duration);
        },
        
        isValidEmail: function(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        
        isValidPassword: function(password) {
            // Enhanced password validation with criteria:
            // - Minimum 8 characters
            // - At least one capital letter
            // - At least one number
            // - At least one special character (!@#$%^&*()\-_=+{};:,<.>)
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,}$/;
            return passwordRegex.test(password);
        },
        
        getPasswordValidationMessage: function(password) {
            const requirements = [];
            
            if (password.length < 8) {
                requirements.push('at least 8 characters');
            }
            if (!/(?=.*[A-Z])/.test(password)) {
                requirements.push('one capital letter');
            }
            if (!/(?=.*\d)/.test(password)) {
                requirements.push('one number');
            }
            if (!/(?=.*[!@#$%^&*()\-_=+{};:,<.>])/.test(password)) {
                requirements.push('one special character (!@#$%^&*()-_=+{};:,<.>)');
            }
            
            if (requirements.length === 0) {
                return 'Password meets all requirements';
            } else {
                return 'Password must contain: ' + requirements.join(', ');
            }
        },
        
        doPasswordsMatch: function(password, confirmPassword) {
            return password === confirmPassword;
        }
    };

   
    function togglePassword(inputId) {
        const input = document.getElementById(inputId);
        const toggleBtn = input.nextElementSibling;
        
        if (input.type === 'password') {
            input.type = 'text';
            toggleBtn.textContent = '🔒';
        } else {
            input.type = 'password';
            toggleBtn.textContent = '👁️';
        }
    }

    
    window.EnergySavingApp = window.EnergySavingApp || {};

    window.EnergySavingApp.FailedAttemptsManager = {
        getFailedAttempts: function(email) {
            try {
                const attemptsData = localStorage.getItem('failedLoginAttempts');
                if (attemptsData) {
                    const attempts = JSON.parse(attemptsData);
                    return attempts[email] || 0;
                }
                return 0;
            } catch (error) {
                console.error('Error getting failed attempts:', error);
                return 0;
            }
        },
        
        incrementFailedAttempts: function(email) {
            try {
                const attemptsData = localStorage.getItem('failedLoginAttempts') || '{}';
                const attempts = JSON.parse(attemptsData);
                attempts[email] = (attempts[email] || 0) + 1;
                localStorage.setItem('failedLoginAttempts', JSON.stringify(attempts));
                console.log(`Failed attempts for ${email}: ${attempts[email]}`);
                return attempts[email];
            } catch (error) {
                console.error('Error incrementing failed attempts:', error);
                return 1;
            }
        },
        
        resetFailedAttempts: function(email) {
            try {
                const attemptsData = localStorage.getItem('failedLoginAttempts') || '{}';
                const attempts = JSON.parse(attemptsData);
                delete attempts[email];
                localStorage.setItem('failedLoginAttempts', JSON.stringify(attempts));
                console.log(`Reset failed attempts for: ${email}`);
            } catch (error) {
                console.error('Error resetting failed attempts:', error);
            }
        },
    };

    window.EnergySavingApp.SessionManager = {
        getCurrentAccount: function() {
            try {
                const accountId = localStorage.getItem('currentAccountId');
                const email = localStorage.getItem('currentUser');
                const sessionToken = localStorage.getItem('sessionToken');
                
                if (accountId && email && sessionToken) {
                    return { 
                        id: parseInt(accountId), 
                        email: email,
                        sessionToken: sessionToken
                    };
                }
                return null;
            } catch (error) {
                console.error('Error getting current account:', error);
                return null;
            }
        },
        
        setCurrentAccount: function(accountId, email, sessionToken = null) {
            try {
                localStorage.setItem('currentAccountId', accountId.toString());
                localStorage.setItem('currentUser', email);
                
                if (sessionToken) {
                    localStorage.setItem('sessionToken', sessionToken);
                } else {
            
                    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
                    localStorage.setItem('sessionToken', token);
                }
                
                console.log('Session set for account:', accountId, email);
            
                
            } catch (error) {
                console.error('Error setting session:', error);
            }
        },
        
        clearSession: function() {
            try {
                localStorage.removeItem('currentAccountId');
                localStorage.removeItem('currentUser');
                localStorage.removeItem('sessionToken');
                console.log('Session cleared');
            } catch (error) {
                console.error('Error clearing session:', error);
            }
        },
        
        isLoggedIn: function() {
            const account = this.getCurrentAccount();
            if (!account) return false;
            
         
            if (typeof energyDB !== 'undefined' && energyDB && energyDB.db) {
                
                return true;
            }
            
            return !!account;
        },
        
        validateSession: async function() {
            try {
                const account = this.getCurrentAccount();
                if (!account) return false;
                
                if (typeof energyDB !== 'undefined' && energyDB && energyDB.db) {
                   
                    const isValid = await energyDB.validateUserSession(account.id, account.sessionToken);
                    return isValid;
                }
                
                return true; 
            } catch (error) {
                console.error('Error validating session:', error);
                return false;
            }
        },

        
        getCurrentPage: function() {
            const path = window.location.pathname;
            if (path.includes('dashboard.html')) return 'Dashboard';
            if (path.includes('preferences.html')) return 'Preferences';
            if (path.includes('calculators.html')) return 'Calculators';
            if (path.includes('CreateAccount.html')) return 'Create Account';
            return 'Login';
        }
    };

    
    let dbReady = false;
    let dbInitializing = false;

    async function waitForDatabaseReady(maxWait = 10000) {
        if (dbReady) return true;
        
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            function checkDB() {
                if (dbReady) {
                    resolve(true);
                } else if (Date.now() - startTime > maxWait) {
                    reject(new Error('Database initialization timeout'));
                } else if (typeof energyDB !== 'undefined' && energyDB.db && !dbInitializing) {
                   
                    try {
                       
                        energyDB.db.accounts.count().then(() => {
                            dbReady = true;
                            resolve(true);
                        }).catch(() => {
                            setTimeout(checkDB, 100);
                        });
                    } catch (error) {
                        setTimeout(checkDB, 100);
                    }
                } else {
                    setTimeout(checkDB, 100);
                }
            }
            
            checkDB();
        });
    }

    
    async function simulateLogin(email, password) {
        console.log('Starting fast login process...');
        const loginBtn = document.querySelector('.btn-primary');
        const originalText = loginBtn.textContent;
        loginBtn.textContent = 'Logging in...';
        loginBtn.disabled = true;

        const startTime = performance.now();

        try {
            
            if (!email || !password) {
                Utils.showMessage('Please fill in all fields', 'info');
                return;
            }

            if (!Utils.isValidEmail(email)) {
                Utils.showMessage('Please enter a valid email address', 'info');
                return;
            }

            console.log('Phase 1 - Validation passed');

            
            loginBtn.textContent = 'Initializing system...';
            
            try {
                await waitForDatabaseReady();
                console.log('Database ready for authentication');
            } catch (error) {
                console.error('Database wait error:', error);
                Utils.showMessage('System is initializing. Please try again.', 'info');
                return;
            }

           
            loginBtn.textContent = 'Authenticating...';
            const authStart = performance.now();
            
            const account = await energyDB.authenticateAccount(email, password);
            console.log(`Authentication took: ${(performance.now() - authStart).toFixed(1)}ms`);

            if (account) {
                
                window.EnergySavingApp.FailedAttemptsManager.resetFailedAttempts(email);
                
                
                const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
                await energyDB.createUserSession(account.id, sessionToken);
                
               
                window.EnergySavingApp.SessionManager.setCurrentAccount(account.id, email, sessionToken);
                
                const totalTime = performance.now() - startTime;
                console.log(`LOGIN COMPLETE: ${totalTime.toFixed(1)}ms`);
                
                Utils.showMessage('Welcome back! Redirecting...', 'success');
                            
             
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 800);
                
            } else {
              
                const failedAttempts = window.EnergySavingApp.FailedAttemptsManager.incrementFailedAttempts(email);
                
                if (failedAttempts >= 3) {
                    Utils.showMessage(`Too many failed attempts. Please try again later`, 'info');
                } else {
                    const remainingAttempts = 3 - failedAttempts;
                    Utils.showMessage(`Invalid email or password.`, 'info');
                }
            }
            
        } catch (error) {
            console.error('Login process error:', error);
            Utils.showMessage('Invalid email or password.', 'info');
        } finally {
            loginBtn.textContent = originalText;
            loginBtn.disabled = false;
        }
    }

    async function simulateAccountCreation(email, password, confirmPassword, surname, firstName, middleName = '') {
        console.log('Starting fast account creation...');
        const createAccountBtn = document.querySelector('.btn-create-account');
        const originalText = createAccountBtn.textContent;
        createAccountBtn.textContent = 'Creating...';
        createAccountBtn.disabled = true;

        const startTime = performance.now();

        try {
   
            if (!email || !password || !confirmPassword || !surname || !firstName) {
                Utils.showMessage('Please fill in all required fields', 'info');
                return;
            }

            if (!Utils.isValidEmail(email)) {
                Utils.showMessage('Please enter a valid email address', 'info');
                return;
            }

          
            if (!Utils.isValidPassword(password)) {
                const validationMessage = Utils.getPasswordValidationMessage(password);
                Utils.showMessage(validationMessage, 'info');
                return;
            }

            if (!Utils.doPasswordsMatch(password, confirmPassword)) {
                Utils.showMessage('Passwords do not match', 'info');
                return;
            }

           
            const termsChecked = document.getElementById('termsOfUse')?.checked;
            const privacyChecked = document.getElementById('privacyPolicy')?.checked;
            
            if (!termsChecked || !privacyChecked) {
                Utils.showMessage('Please accept both Terms of Use and Data Privacy Policy', 'info');
                return;
            }

            console.log('Phase 1 - Validation passed');

        
            createAccountBtn.textContent = 'Initializing system...';
            
            try {
                await waitForDatabaseReady();
                console.log('Database ready for account creation');
            } catch (error) {
                Utils.showMessage('System is initializing. Please try again.', 'info');
                return;
            }

            createAccountBtn.textContent = 'Creating account...';
            const accountId = await energyDB.createAccount(email, password, surname, firstName, middleName);
            
            console.log('Account created with ID:', accountId);

          
            const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
            await energyDB.createUserSession(accountId, sessionToken);
            
       
            window.EnergySavingApp.SessionManager.setCurrentAccount(accountId, email, sessionToken);

            const totalTime = performance.now() - startTime;
            console.log(`ACCOUNT CREATION COMPLETE: ${totalTime.toFixed(1)}ms`);

            Utils.showMessage('Account created! Welcome!', 'success');
            
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 800);
            
        } catch (error) {
            console.error('Account creation error:', error);
            if (error.message === 'Account already exists') {
                Utils.showMessage('An account with this email already exists', 'info');
            } else {
                Utils.showMessage('Account creation failed. Please try again.', 'info');
            }
        } finally {
            createAccountBtn.textContent = originalText;
            createAccountBtn.disabled = false;
        }
    }

    
    function setupAccountCreationHandlers() {
        const createAccountForm = document.getElementById('createAccountForm');
        if (createAccountForm) {
            createAccountForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const surname = document.getElementById('surname').value;
                const firstName = document.getElementById('firstname').value;
                const middleName = document.getElementById('middlename').value;
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                
                simulateAccountCreation(email, password, confirmPassword, surname, firstName, middleName);
            });
        }
    }

    function openTermsModal() {
        const modal = document.getElementById('termsModal');
        if (modal) {
            modal.style.display = 'block';
            const modalBody = modal.querySelector('.modal-body');
            const termsCheckbox = document.getElementById('termsOfUse');
           
            modalBody.scrollTop = 0;
           
            
            modalBody.onscroll = function() {
                const isAtBottom = modalBody.scrollHeight - modalBody.scrollTop <= modalBody.clientHeight + 10;
                if (isAtBottom) {
                    termsCheckbox.disabled = false;
                    termsCheckbox.parentElement.classList.remove('checkbox-disabled');
                    termsCheckbox.parentElement.classList.add('checkbox-enabled');
                }
            };
        }
    }

    function closeTermsModal() {
        const modal = document.getElementById('termsModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    function openPrivacyModal() {
        const modal = document.getElementById('privacyModal');
        if (modal) {
            modal.style.display = 'block';
            const modalBody = modal.querySelector('.modal-body');
            const privacyCheckbox = document.getElementById('privacyPolicy');
            
            
            modalBody.scrollTop = 0;
            privacyCheckbox.disabled = true;
            privacyCheckbox.parentElement.classList.add('checkbox-disabled');
            
         
            modalBody.onscroll = function() {
                const isAtBottom = modalBody.scrollHeight - modalBody.scrollTop <= modalBody.clientHeight + 10;
                if (isAtBottom) {
                    privacyCheckbox.disabled = false;
                    privacyCheckbox.parentElement.classList.remove('checkbox-disabled');
                    privacyCheckbox.parentElement.classList.add('checkbox-enabled');
                }
            };
        }
    }

    function closePrivacyModal() {
        const modal = document.getElementById('privacyModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

   
    function setupLoginHandlers() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                simulateLogin(email, password);
            });
        }
    }

    function setupAccountCreationHandlers() {
        const createAccountForm = document.getElementById('createAccountForm');
        if (createAccountForm) {
            createAccountForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const surname = document.getElementById('surname').value;
                const firstName = document.getElementById('firstname').value;
                const middleName = document.getElementById('middlename').value;
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                
                simulateAccountCreation(email, password, confirmPassword, surname, firstName, middleName);
            });
        }
    }


 
    function updateDatabaseStatus() {
        const dbCheckInterval = setInterval(() => {
            if (typeof energyDB !== 'undefined' && energyDB.db) {
                dbReady = true;
                console.log('Database is ready and operational');
                clearInterval(dbCheckInterval);
            }
        }, 500);
    }

 
    async function validateSessionForProtectedPages() {
        const currentPage = window.EnergySavingApp.SessionManager.getCurrentPage();
        const protectedPages = ['Dashboard', 'Preferences', 'Calculators'];
        
        if (protectedPages.includes(currentPage)) {
            const isValid = await window.EnergySavingApp.SessionManager.validateSession();
            if (!isValid) {
                console.log('Session invalid or expired, redirecting to login');
                window.EnergySavingApp.SessionManager.clearSession();
                window.location.href = 'index.html';
                return false;
            }
            
        
        }
        
        return true;
    }

  
    async function initializePage() {
        console.log('Initializing page with optimized flow...');
        const initStart = performance.now();
        
       
        const currentAccount = window.EnergySavingApp.SessionManager.getCurrentAccount();
        const currentPage = window.EnergySavingApp.SessionManager.getCurrentPage();
        
       
        if (currentAccount) {
            if (currentPage === 'Login' || currentPage === 'Create Account') {
                console.log('User already logged in, redirecting to dashboard');
                window.location.href = 'dashboard.html';
                return;
            }
            
            
            await validateSessionForProtectedPages();
        } else {
           
            const protectedPages = ['Dashboard', 'Preferences', 'Calculators'];
            if (protectedPages.includes(currentPage)) {
                console.log('No active session, redirecting to login');
                window.location.href = 'index.html';
                return;
            }
        }
        
        if (currentPage === 'Login') {
            setupLoginHandlers();
    
        } else if (currentPage === 'Create Account') {
            setupAccountCreationHandlers();
        } else if (currentPage === 'Reset Password') {
            setupPasswordResetHandlers();
        }
        

        
        console.log(`Page initialized in: ${(performance.now() - initStart).toFixed(1)}ms`);
    }


    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM Content Loaded - Starting optimized initialization');
        
       
        if (!window.EnergySavingApp) {
            window.EnergySavingApp = {};
        }
     
        if (!window.EnergySavingApp.SessionManager) {
            window.EnergySavingApp.SessionManager = {
                getCurrentAccount: function() {
                    const accountId = localStorage.getItem('currentAccountId');
                    const email = localStorage.getItem('currentUser');
                    const sessionToken = localStorage.getItem('sessionToken');
                    return accountId && email && sessionToken ? { 
                        id: parseInt(accountId), 
                        email: email,
                        sessionToken: sessionToken 
                    } : null;
                },
                setCurrentAccount: function(accountId, email, sessionToken = null) {
                    localStorage.setItem('currentAccountId', accountId.toString());
                    localStorage.setItem('currentUser', email);
                    
                    if (sessionToken) {
                        localStorage.setItem('sessionToken', sessionToken);
                    } else {
                        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
                        localStorage.setItem('sessionToken', token);
                    }
                },
                clearSession: function() {
                    localStorage.removeItem('currentAccountId');
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('sessionToken');
                },
                isLoggedIn: function() {
                    return !!this.getCurrentAccount();
                },
                validateSession: async function() {
                    try {
                        const account = this.getCurrentAccount();
                        if (!account) return false;
                        
                        if (typeof energyDB !== 'undefined' && energyDB && energyDB.db) {
                            const isValid = await energyDB.validateUserSession(account.id, account.sessionToken);
                            return isValid;
                        }
                        
                        return true;
                    } catch (error) {
                        console.error('Error validating session:', error);
                        return false;
                    }
                },
            
                getCurrentPage: function() {
                    const path = window.location.pathname;
                    if (path.includes('dashboard.html')) return 'Dashboard';
                    if (path.includes('preferences.html')) return 'Preferences';
                    if (path.includes('calculators.html')) return 'Calculators';
                    if (path.includes('CreateAccount.html')) return 'Create Account';
                    return 'Login';
                }
            };
        }
        
       
        if (!window.EnergySavingApp.FailedAttemptsManager) {
            window.EnergySavingApp.FailedAttemptsManager = {
                getFailedAttempts: function(email) {
                    try {
                        const attemptsData = localStorage.getItem('failedLoginAttempts');
                        if (attemptsData) {
                            const attempts = JSON.parse(attemptsData);
                            return attempts[email] || 0;
                        }
                        return 0;
                    } catch (error) {
                        console.error('Error getting failed attempts:', error);
                        return 0;
                    }
                },
                incrementFailedAttempts: function(email) {
                    try {
                        const attemptsData = localStorage.getItem('failedLoginAttempts') || '{}';
                        const attempts = JSON.parse(attemptsData);
                        attempts[email] = (attempts[email] || 0) + 1;
                        localStorage.setItem('failedLoginAttempts', JSON.stringify(attempts));
                        return attempts[email];
                    } catch (error) {
                        console.error('Error incrementing failed attempts:', error);
                        return 1;
                    }
                },
                resetFailedAttempts: function(email) {
                    try {
                        const attemptsData = localStorage.getItem('failedLoginAttempts') || '{}';
                        const attempts = JSON.parse(attemptsData);
                        delete attempts[email];
                        localStorage.setItem('failedLoginAttempts', JSON.stringify(attempts));
                    } catch (error) {
                        console.error('Error resetting failed attempts:', error);
                    }
                },
                shouldShowResetButton: function(email) {
                    return this.getFailedAttempts(email) >= 3;
                }
            };
        }
        
      
        initializePage();
        
      
        updateDatabaseStatus();
        
        console.log('Main initialization sequence started');
    });

   
    window.addEventListener('error', function(e) {
        console.error('Global error:', e.error);
    });

    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
    });

    async function logout() {
        try {
            const account = window.EnergySavingApp.SessionManager.getCurrentAccount();
            if (account && typeof energyDB !== 'undefined' && energyDB && energyDB.db) {
                
                await energyDB.cleanupExpiredSessions();
            }
            
            window.EnergySavingApp.SessionManager.clearSession();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
            window.EnergySavingApp.SessionManager.clearSession();
            window.location.href = 'index.html';
        }
    }

    function openDeleteAccountModal() {
        console.log('Opening delete account modal');
        const modal = document.getElementById('deleteAccountModal');
        if (modal) {
            modal.style.display = 'block';
            
            
            document.getElementById('confirmDeletePassword').value = '';
            document.getElementById('deletePasswordFeedback').textContent = '';
            document.getElementById('confirmDeleteBtn').disabled = true;
            
            
            const passwordInput = document.getElementById('confirmDeletePassword');
            passwordInput.addEventListener('input', validateDeletePassword);
            
            
            setTimeout(() => {
                passwordInput.focus();
            }, 300);
        }
    }

    function closeDeleteAccountModal() {
        console.log('Closing delete account modal');
        const modal = document.getElementById('deleteAccountModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    function validateDeletePassword() {
        const password = document.getElementById('confirmDeletePassword').value;
        const feedback = document.getElementById('deletePasswordFeedback');
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        
        if (password.length === 0) {
            feedback.textContent = '';
            feedback.className = 'real-time-feedback';
            confirmBtn.disabled = true;
            return;
        }
        
        if (password.length < 1) {
            feedback.textContent = 'Please enter your password';
            feedback.className = 'real-time-feedback invalid';
            confirmBtn.disabled = true;
        } else {
            feedback.textContent = '✓ Password entered';
            feedback.className = 'real-time-feedback valid';
            confirmBtn.disabled = false;
        }
    }

    async function confirmDeleteAccount() {
        console.log('Confirming account deletion');
        const password = document.getElementById('confirmDeletePassword').value;
        const currentAccount = window.EnergySavingApp.SessionManager.getCurrentAccount();
        
        if (!currentAccount) {
            showToast('No active session found', 'error');
            return;
        }
        
        if (!password) {
            showToast('Please enter your password', 'error');
            return;
        }
        
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        const originalText = confirmBtn.textContent;
        confirmBtn.textContent = 'Deleting Account...';
        confirmBtn.disabled = true;
        
        try {
            console.log('Verifying password for account:', currentAccount.email);
            

            const account = await energyDB.authenticateAccount(currentAccount.email, password);
            if (!account) {
                showToast('Incorrect password. Please try again.', 'error');
                confirmBtn.textContent = originalText;
                confirmBtn.disabled = false;
                return;
            }
            
            console.log('Password verified, proceeding with account deletion');
            
          
            showToast('Deleting account and all data...', 'info');
            
           
            await deleteUserAccount(currentAccount.id);
            
            showToast('Account deleted successfully', 'success');
            
           
            window.EnergySavingApp.SessionManager.clearSession();
            
           
            closeDeleteAccountModal();
            
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            
        } catch (error) {
            console.error('Error deleting account:', error);
            showToast('Error deleting account: ' + error.message, 'error');
            confirmBtn.textContent = originalText;
            confirmBtn.disabled = false;
        }
    }

    async function deleteUserAccount(accountId) {
        try {
            console.log('Starting account deletion for ID:', accountId);
            
           
            await energyDB.deleteAccount(accountId);
            
            console.log('Account and all related data deleted successfully');
            
        } catch (error) {
            console.error('Error in deleteUserAccount:', error);
            throw new Error('Failed to delete account and associated data: ' + error.message);
        }
    }

  
    window.onclick = function(event) {
        const modal = document.getElementById('deleteAccountModal');
        if (event.target === modal) {
            closeDeleteAccountModal();
        }
    }

 
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeDeleteAccountModal();
        }
    });
    async function handleDeleteAccount() {
        openDeleteAccountModal();
    }

    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    }

    function optimizeForMobile() {
        if (isMobileDevice()) {
           
            document.body.classList.add('mobile-device');
            
          
            const buttons = document.querySelectorAll('.btn, .nav-item, .action-btn');
            buttons.forEach(btn => {
                btn.style.cursor = 'pointer';
            });
        }
    }


    document.addEventListener('DOMContentLoaded', function() {
        optimizeForMobile();
        
        
        window.addEventListener('orientationchange', function() {
            setTimeout(optimizeForMobile, 100);
        });
        
        
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(optimizeForMobile, 250);
        });
    });

  
    window.logout = logout;
    window.openDeleteAccountModal = openDeleteAccountModal;
    window.closeDeleteAccountModal = closeDeleteAccountModal;
    window.confirmDeleteAccount = confirmDeleteAccount;
    window.handleDeleteAccount = handleDeleteAccount;