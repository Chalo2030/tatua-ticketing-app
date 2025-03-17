// Load existing submissions from localStorage or initialize an empty array
let formSubmissions = JSON.parse(localStorage.getItem("formSubmissions")) || [];

// Hide phone 
const phone_input = document.getElementById("phone-label");
const email_input = document.getElementById("email-label");

const phone_btn = document.getElementById("phone_button");
const email_button = document.getElementById("email_button");

if (email_button.checked) {
    email_input.style.display = "block";
    phone_input.style.display = "none";
}

phone_btn.addEventListener("click", () => {
    phone_input.style.display = "flex";
    email_input.style.width = "100%";
    email_input.style.display = "none";
});

email_button.addEventListener("click", () => {
    email_input.style.display = "flex";
    email_input.style.width = "100%";
    phone_input.style.display = "none";
});

const fileInput = document.getElementById("attachmentfile");
const removeFileButton = document.getElementById("removeFileButton");

// Show remove button when a file is selected
fileInput.addEventListener("change", function () {
    if (fileInput.files.length > 0) {
        removeFileButton.style.display = "inline-block";
    } else {
        removeFileButton.style.display = "none";
    }
});

// Remove file when the button is clicked
removeFileButton.addEventListener("click", function () {
    fileInput.value = ""; // Clear the file input
    removeFileButton.style.display = "none"; // Hide the remove button
});

function generateUniqueId() {
    return Date.now(); // Generates a timestamp-based ID
}

// Function to store form data in localStorage and reset the form
function storeFormData(fullName, email, phone, message, subject, fileBase64, fileName) {
    let formData = { 
        id: generateUniqueId(),
        name: fullName, 
        contact: `${email} ${phone}`, 
        details: message,
        date: new Date().toLocaleString(),
        subject,
        file: fileBase64 ? {
            name: fileName,
            data: fileBase64
        } : null
    };

    formSubmissions.push(formData); 
    localStorage.setItem("formSubmissions", JSON.stringify(formSubmissions)); 

    alert("Form submitted successfully. Data saved in local storage."); 
    console.log("Data stored:", formSubmissions); 

    // Reset the form after storing data
    const form = document.getElementById("dataForm");
    form.reset();

    // Reset UI elements
    email_input.style.display = "block";
    phone_input.style.display = "none";
    removeFileButton.style.display = "none";
}

// Attach event listener to submit button
document.getElementById("submitButton").addEventListener("click", function (event) {
    event.preventDefault(); 

    let form = document.getElementById("dataForm");
    let fullName = document.getElementById("full-name").value.trim();
    let email = document.getElementById("email-address").value.trim();
    let phone = document.getElementById("phone-number").value.trim();
    let message = document.getElementById("message").value.trim();
    let terms = document.getElementById("terms-and-conditions").checked;
    let subjectElement = document.getElementById("subject");
    let subject = subjectElement ? subjectElement.value : "";
    let fileInput = document.getElementById("attachmentfile");
    let file = fileInput.files[0];

    if (subject === "") {
        alert("Please select a Subject");
        return;
    }
    if (fullName === "") {
        alert("Full Name required");
        return;
    }

    if (document.getElementById('email_button').checked) {
        if (!validateEmail(email)) {
            alert("Please enter a valid email address");
            return;
        }
    }

    if (document.getElementById('phone_button').checked) {
        let phoneRegex = /^\d{10}$/;
        if (phone && !phoneRegex.test(phone)) {
            alert("Phone number must be exactly 10 digits");
            return;
        }
    }

    if (!message) {
        alert("Message cannot be empty");
        return;
    }
    if (!terms) {
        alert("You must agree to the terms and conditions");
        return;
    }

    if (file) {
        let allowedExtensions = /(\.pdf|\.png|\.jpg|\.jpeg)$/i;
        if (!allowedExtensions.test(file.name)) {
            alert("Only {PDF, PNG, JPG, JPEG} files are allowed");
            return;
        }

        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            let fileBase64 = reader.result;
            let fileName = file.name;
            storeFormData(fullName, email, phone, message, subject, fileBase64, fileName);
        };
        reader.onerror = function () {
            alert("Error reading the file. Please try again.");
        };
    } else {
        storeFormData(fullName, email, phone, message, subject, null, null);
    }
});

// Validate email function
function validateEmail(email) {
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}