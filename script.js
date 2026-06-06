// Register functionality

const registerBtn =
document.getElementById('registerBtn');

if (registerBtn) {

    registerBtn.addEventListener(
        'click',
        function(e) {

            e.preventDefault();

            registerUser();

        }
    );

}

// Login functionality

const loginBtn =
document.getElementById('loginBtn');

if (loginBtn) {

    loginBtn.addEventListener(
        'click',
        function(e) {

            e.preventDefault();

            loginUser();

        }
    );

}

// REGISTER USER FUNCTION

function registerUser() {

    const username =
    document.getElementById('username').value.trim();

    const email =
    document.getElementById('email').value.trim();

    const password =
    document.getElementById('password').value;

    const confirmPassword =
    document.getElementById('confirmPassword').value;

    const errorDiv =
    document.getElementById('registerError');

    // CLEAR ERRORS

    if (errorDiv)
    errorDiv.innerHTML = '';

    // VALIDATION

    if (!username) {

        showError(
            'registerError',
            'Username is required'
        );

        return;
    }

    if (!email) {

        showError(
            'registerError',
            'Email is required'
        );

        return;
    }

    if (!isValidEmail(email)) {

        showError(
            'registerError',
            'Please enter a valid email'
        );

        return;
    }

    if (!password) {

        showError(
            'registerError',
            'Password is required'
        );

        return;
    }

    if (password.length < 6) {

        showError(
            'registerError',
            'Password must be at least 6 characters'
        );

        return;
    }

    if (password !== confirmPassword) {

        showError(
            'registerError',
            'Passwords do not match'
        );

        return;
    }

    // GET USERS

    const users =
    JSON.parse(
        localStorage.getItem('users')
    ) || [];

    // CHECK EXISTING EMAIL

    if (
        users.some(
            user => user.email === email
        )
    ) {

        showError(
            'registerError',
            'Email already registered'
        );

        return;
    }

    // NEW USER OBJECT

    const newUser = {

        username: username,
        email: email,
        password: password,
        registeredAt:
        new Date().toLocaleString()

    };

    // SAVE USER

    users.push(newUser);

    localStorage.setItem(
        'users',
        JSON.stringify(users)
    );

    // SUCCESS MESSAGE

    if (errorDiv) {

        errorDiv.style.color =
        '#4dff91';

        errorDiv.innerHTML =
        '✓ Account created successfully! Redirecting...';

    }

    // GO TO LOADING PAGE

    setTimeout(() => {

        window.location.href =
        'extra-files/loading.html';

    }, 1500);

}

// LOGIN USER FUNCTION

function loginUser() {

    const email =
    document.getElementById('loginEmail').value.trim();

    const password =
    document.getElementById('loginPassword').value;

    const errorDiv =
    document.getElementById('loginError');

    // CLEAR ERRORS

    if (errorDiv)
    errorDiv.innerHTML = '';

    // VALIDATION

    if (!email) {

        showError(
            'loginError',
            'Email is required'
        );

        return;
    }

    if (!password) {

        showError(
            'loginError',
            'Password is required'
        );

        return;
    }

    // GET USERS

    const users =
    JSON.parse(
        localStorage.getItem('users')
    ) || [];

    // FIND USER

    const user =
    users.find(
        u =>
        u.email === email &&
        u.password === password
    );

    // INVALID LOGIN

    if (!user) {

        showError(
            'loginError',
            'Invalid email or password'
        );

        return;
    }

    // SAVE SESSION

    localStorage.setItem(
        'currentUser',
        JSON.stringify(user)
    );

    // SUCCESS MESSAGE

    if (errorDiv) {

        errorDiv.style.color =
        '#4dff91';

        errorDiv.innerHTML =
        '✓ Login successful! Redirecting...';

    }

    // REDIRECT TO LOADING PAGE

    setTimeout(() => {

        window.location.href =
        'extra-files/loading.html';

    }, 1000);

}

// SHOW ERROR FUNCTION

function showError(
    elementId,
    message
) {

    const errorDiv =
    document.getElementById(elementId);

    if (errorDiv) {

        errorDiv.style.color =
        '#ff6b6b';

        errorDiv.innerHTML =
        '✗ ' + message;

    }

}

// EMAIL VALIDATION

function isValidEmail(email) {

    const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);

}

// CHECK LOGIN

function checkLogin() {

    const currentUser =
    localStorage.getItem('currentUser');

    if (!currentUser) {

        window.location.href =
        'login.html';

    } else {

        const user =
        JSON.parse(currentUser);

        const userNameElement =
        document.getElementById('userName');

        const userEmailElement =
        document.getElementById('userEmail');

        const userUsernameElement =
        document.getElementById('userUsername');

        if (userNameElement)
        userNameElement.textContent =
        user.username;

        if (userEmailElement)
        userEmailElement.textContent =
        user.email;

        if (userUsernameElement)
        userUsernameElement.textContent =
        user.username;

    }

}

// LOGOUT

function logout() {

    localStorage.removeItem(
        'currentUser'
    );

    window.location.href =
    'index.html';

}

// RESET PASSWORD SYSTEM

const resetBtn =
document.getElementById("resetBtn");

if(resetBtn){

    resetBtn.addEventListener(
        "click",
        function(){

            const resetEmail =
            document.getElementById(
                "resetEmail"
            ).value;

            const newPassword =
            document.getElementById(
                "newPassword"
            ).value;

            const confirmNewPassword =
            document.getElementById(
                "confirmNewPassword"
            ).value;

            // EMPTY CHECK

            if(
                resetEmail === "" ||
                newPassword === "" ||
                confirmNewPassword === ""
            ){

                alert(
                    "Please fill all fields"
                );

                return;

            }

            // GET USERS

            const users =
            JSON.parse(
                localStorage.getItem('users')
            ) || [];

            // FIND USER

            const user =
            users.find(
                u => u.email === resetEmail
            );

            if(!user){

                alert(
                    "Email not found"
                );

                return;

            }

            // PASSWORD LENGTH

            if(newPassword.length < 6){

                alert(
                    "Password must be at least 6 characters"
                );

                return;

            }

            // PASSWORD MATCH

            if(
                newPassword !==
                confirmNewPassword
            ){

                alert(
                    "Passwords do not match"
                );

                return;

            }

            // UPDATE PASSWORD

            user.password =
            newPassword;

            localStorage.setItem(
                'users',
                JSON.stringify(users)
            );

            alert(
                "Password reset successful"
            );

            window.location.href =
            "login.html";

        }
    );

}

// SHOW / HIDE PASSWORD

function togglePassword(id){

    const input =
    document.getElementById(id);

    if(input.type === "password"){

        input.type = "text";

    }else{

        input.type = "password";

    }

}

// RUN ON PAGE LOAD

document.addEventListener(
    'DOMContentLoaded',
    function() {

        if (
            window.location.pathname.includes(
                'dashboard.html'
            )
        ) {

            checkLogin();

        }

    }
);