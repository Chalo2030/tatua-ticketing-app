// Store tickets in memory instead of localStorage
let tickets = [];

// Function to load tickets (from memory)
function loadTickets() {
    return tickets; // Directly return the in-memory array
}

// Function to save tickets (not needed since we use in-memory storage)
function saveTickets(updatedTickets) {
    tickets = updatedTickets; // Update the global tickets array
}

// Function to render tickets
function renderTickets() {
    const tableBody = document.getElementById("ticketTableBody");
    tableBody.innerHTML = ""; // Clear table before rendering

    tickets.forEach(ticket => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${ticket.id}</td>
            <td>${ticket.name} <br> ${ticket.contact}</td>
            <td>${ticket.subject} <br> ${ticket.details}</td>
            <td>${ticket.date}</td>
            <td>
                <button title="Show popup with more information" onclick="alert('More Info: ${ticket.details}')">
                    <img src="projectIcons/info.png" alt="More Info" width="24" height="24">
                </button>
                <button title="Download ticket attachment" onclick="alert('Downloading attachment...')">
                    <img src="projectIcons/application.png" alt="Download" width="24" height="24">
                </button>
                <button title="Trigger call if preferred contact is phone" onclick="alert('Calling ${ticket.contact}')">
                    <img src="projectIcons/call.png" alt="Call" width="24" height="24">
                </button>
                <button title="Trigger email if preferred contact is email" onclick="alert('Emailing ${ticket.contact}')">
                    <img src="projectIcons/email.png" alt="Email" width="24" height="24">
                </button>
                <button title="Edit on a pop-up the details of the ticket" onclick="alert('Editing ticket ${ticket.id}')">
                    <img src="projectIcons/edit.png" alt="Edit" width="24" height="24">
                </button>
                <button title="Delete the ticket" onclick="deleteTicket(${ticket.id})">
                    <img src="projectIcons/delete.png" alt="Delete" width="24" height="24">
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Function to add a new ticket
function addTicket(ticket) {
    tickets.push(ticket); // Add to in-memory array
    renderTickets(); // Refresh table display
}

// Function to delete a ticket
function deleteTicket(id) {
    tickets = tickets.filter(ticket => ticket.id !== id); // Remove from in-memory array
    renderTickets(); // Refresh table display
}

// Refresh tickets when page loads
document.addEventListener("DOMContentLoaded", () => {
    renderTickets(); // Directly render from in-memory storage
});
