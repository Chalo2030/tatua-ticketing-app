document.addEventListener("DOMContentLoaded", () => {
    loadTickets(); // Load tickets from localStorage on page load
    renderTickets();
});

function refreshTickets() {
    console.log("Refreshing tickets...");
    renderTickets(); // Simply re-render the tickets from localStorage
}


function loadTickets() {
    const storedTickets = localStorage.getItem("formSubmissions");
    return storedTickets ? JSON.parse(storedTickets) : [];
}

function saveTickets(tickets) {
    localStorage.setItem("formSubmissions", JSON.stringify(tickets));
}

function renderTickets() {
    const tickets = loadTickets();
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
                <button title="Trigger call if preferred contact is email" onclick="alert('Emailing ${ticket.contact}')">
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


function addTicket(ticket) {
    let tickets = loadTickets();
    tickets.push(ticket);
    saveTickets(tickets);
    renderTickets();
}

function deleteTicket(id) {
    let tickets = loadTickets();
    tickets = tickets.filter(ticket => ticket.id !== id);
    saveTickets(tickets);
    renderTickets();
}
