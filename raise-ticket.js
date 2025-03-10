// Store tickets in memory (RAM) only
let formSubmissions = [];

// Function to get the next incremental ID
function getNextId() {
    return formSubmissions.length === 0 ? 1 : formSubmissions[formSubmissions.length - 1].id + 1;
}

// Store form data in memory
function storeFormData(fullName, email, phone, message, subject, fileName) {
    let formData = { 
        id: getNextId(), 
        name: fullName, 
        contact: `${email} | ${phone}`, 
        details: message,
        date: new Date().toLocaleString(),
        subject,
        fileName
    };

    formSubmissions.push(formData); // Store in RAM
    alert("Form submitted successfully. Data stored in memory.");
    console.log("Data stored:", formSubmissions);
    renderTickets();
}

// Attach event listener to submit button
document.getElementById("submitButton").addEventListener("click", function (event) {
    event.preventDefault(); 

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
    if (!validateEmail(email)) {
        alert("Please enter a valid email address");
        return;
    }
    if (!/^\d{10}$/.test(phone)) {
        alert("Please enter a valid 10-digit phone number");
        return;
    }
    if (message === "") {
        alert("Message cannot be empty");
        return;
    }
    if (!terms) {
        alert("You must agree to the terms and conditions");
        return;
    }
    if (!file) {
        alert("Please attach a file before submitting");
        return;
    }

    let allowedExtensions = /(\.pdf|\.docx)$/i;
    if (!allowedExtensions.test(file.name)) {
        alert("Only PDF and DOCX files are allowed");
        return;
    }

    storeFormData(fullName, email, phone, message, subject, file.name);
});

// Validate email function
function validateEmail(email) {
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Render tickets in the table
function renderTickets() {
    const tableBody = document.getElementById("ticketTableBody");
    tableBody.innerHTML = "";

    formSubmissions.forEach(ticket => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${ticket.id}</td>
            <td>${ticket.name} <br> ${ticket.contact}</td>
            <td>${ticket.details}</td>
            <td>${ticket.date}</td>
            <td>
                <button onclick="alert('More Info: ${ticket.details}')">
                    <img src="projectIcons/info.png" alt="More Info" title="More Info">
                </button>
                <button onclick="downloadAttachment('${ticket.fileName}')">
                    <img src="projectIcons/application.png" alt="Download" title="Download Attachment">
                </button>
                <button onclick="alert('Calling ${ticket.contact}')">
                    <img src="projectIcons/call.png" alt="Call" title="Call">
                </button>
                <button onclick="alert('Emailing ${ticket.contact}')">
                    <img src="projectIcons/email.png" alt="Email" title="Email">
                </button>
                <button onclick="alert('Editing ticket ${ticket.id}')">
                    <img src="projectIcons/edit.png" alt="Edit" title="Edit Ticket">
                </button>
                <button onclick="deleteTicket(${ticket.id})">
                    <img src="projectIcons/delete.png" alt="Delete" title="Delete Ticket">
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Simulated download function for attachment
function downloadAttachment(fileName) {
    alert(`Downloading file: ${fileName}`);
}

// Delete a ticket from memory
function deleteTicket(id) {
    formSubmissions = formSubmissions.filter(ticket => ticket.id !== id);
    renderTickets();
}
