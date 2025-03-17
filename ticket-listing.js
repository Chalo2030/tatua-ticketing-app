// Global variable to store filtered tickets
let filteredTickets = null;

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded, starting initialization...");

    // Load and render tickets
    try {
        const tickets = loadTickets();
        console.log("Loaded tickets from localStorage:", tickets);
        renderTickets();
    } catch (error) {
        console.error("Error during initialization:", error);
    }

    // Search input setup (adjusting for your HTML structure)
    const searchLink = document.querySelector("#filter a");
    if (searchLink) {
        console.log("Filter link found, using as trigger for search input");
        // Since there's no direct input, we'll handle search via the filter popup
    } else {
        console.error('Filter link not found');
    }

    // Sort Modal Setup
    const sortModal = document.querySelector('#sort_modal');
    const sortCloseButton = document.querySelector('#close-icon');
    const addSorterButton = document.querySelector('.add-sorter');
    const sorterContainer = document.querySelector('#sorter-container');
    const sortSubmitButton = document.querySelector('.sort-submit-btn');
    const sortResetButton = document.querySelector('.sort-reset-btn');
    const sortCount = document.getElementById("sort-count");

    console.log("Sort modal elements:", { sortModal, sortCloseButton, addSorterButton, sorterContainer, sortSubmitButton, sortResetButton, sortCount });

    const sortColumns = ['Select column', 'Ticket ID', 'Name', 'Contact', 'Email', 'Phone', 'Date'];
    const sortOrders = ['Select Order', 'Ascending', 'Descending'];

    function updateSortCount() {
        const totalSorters = sorterContainer ? sorterContainer.children.length : 0;
        if (sortCount) sortCount.textContent = totalSorters;
        console.log("Updated sort count:", totalSorters);
    }

    function createSorterRow() {
        if (!sorterContainer) {
            console.error("sorterContainer is null, cannot create sorter row");
            return null;
        }

        const sorterRow = document.createElement('div');
        sorterRow.className = 'sorter-row';

        const labelsRow = document.createElement('div');
        labelsRow.className = 'sorter-labels';

        const columnLabel = document.createElement('label');
        columnLabel.textContent = 'Column:';
        columnLabel.style.flex = '1';

        const orderLabel = document.createElement('label');
        orderLabel.textContent = 'Order:';
        orderLabel.style.flex = '1';

        labelsRow.appendChild(columnLabel);
        labelsRow.appendChild(orderLabel);

        const selectsRow = document.createElement('div');
        selectsRow.className = 'sorter-selects';

        const columnSelect = document.createElement('select');
        sortColumns.forEach(column => {
            const option = document.createElement('option');
            option.value = column.toLowerCase();
            option.textContent = column;
            columnSelect.appendChild(option);
        });

        const orderSelect = document.createElement('select');
        sortOrders.forEach(order => {
            const option = document.createElement('option');
            option.value = order.toLowerCase();
            option.textContent = order;
            orderSelect.appendChild(option);
        });

        selectsRow.appendChild(columnSelect);
        selectsRow.appendChild(orderSelect);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-icon';
        const deleteImg = document.createElement('img');
        deleteImg.src = 'projectIcons/Filter&&SortIcons/trash-can-outline.png';
        deleteImg.alt = 'Delete';
        deleteButton.appendChild(deleteImg);

        sorterRow.appendChild(labelsRow);
        sorterRow.appendChild(selectsRow);
        sorterRow.appendChild(deleteButton);

        columnSelect.addEventListener('change', function () {
            if (columnSelect.value && columnSelect.value !== 'select column') {
                orderSelect.value = sortOrders[1].toLowerCase();
                const newSorterRow = createSorterRow();
                if (newSorterRow) sorterRow.insertAdjacentElement('afterend', newSorterRow);
                updateSortCount();
            }
        });

        deleteButton.addEventListener('click', function () {
            sorterRow.remove();
            if (sorterContainer.children.length === 0) {
                sorterContainer.style.display = 'none';
            }
            updateSortCount();
        });

        return sorterRow;
    }

    if (addSorterButton) {
        addSorterButton.addEventListener('click', function (event) {
            console.log('Add Sorter clicked', event);
            const sorterRow = createSorterRow();
            if (sorterRow) {
                sorterContainer.style.display = 'block';
                sorterContainer.appendChild(sorterRow);
                updateSortCount();
            }
        });
    } else {
        console.error('Add Sorter button not found');
    }

    if (sortSubmitButton) {
        sortSubmitButton.addEventListener('click', function () {
            console.log('Sort Submit button clicked');
            applySorting();
            closeSortModal();
        });
    } else {
        console.error('Sort Submit button not found');
    }

    if (sortResetButton) {
        sortResetButton.addEventListener('click', function () {
            console.log('Reset Sorting clicked');
            if (sorterContainer) sorterContainer.innerHTML = '';
            if (sorterContainer) sorterContainer.style.display = 'none';
            if (sortCount) sortCount.textContent = '0';
            const tickets = loadTickets();
            saveTickets(tickets);
            filteredTickets = null;
            renderTickets();
        });
    } else {
        console.error('Sort Reset button not found');
    }

    function closeSortModal() {
        console.log("Closing sort modal");
        if (sortModal) sortModal.style.display = 'none';
        if (sorterContainer) sorterContainer.innerHTML = '';
        if (sorterContainer) sorterContainer.style.display = 'none';
        if (sortCount) sortCount.textContent = '0';
        filteredTickets = null;
        renderTickets();
    }

    if (sortCloseButton) {
        sortCloseButton.addEventListener('click', closeSortModal);
    } else {
        console.error('Sort close button (#close-icon) not found');
    }

    window.toggleSortPopup = function () {
        console.log('Toggling sort popup');
        const popup = document.getElementById("sort_modal");
        if (popup) {
            if (popup.style.display === "block") {
                closeSortModal();
            } else {
                popup.style.display = "block";
            }
            console.log('Sort modal display state:', popup.style.display);
        } else {
            console.error('sort_modal not found');
        }
    };

    window.togglePopup = function (event) {
        if (event) event.preventDefault();
        toggleSortPopup();
    };

    window.closeSortModal = function () {
        closeSortModal();
    };

    function applySorting() {
        if (!sorterContainer) {
            console.error("sorterContainer is null, cannot apply sorting");
            return;
        }
        const sorters = Array.from(sorterContainer.children).map(row => {
            const columnSelect = row.querySelector('select');
            const orderSelect = row.querySelector('select:nth-child(2)');
            return {
                column: columnSelect ? columnSelect.value : '',
                order: orderSelect ? orderSelect.value : ''
            };
        });
        console.log("Applying sorters:", sorters);
        sortTicketsBySorters(sorters);
    }

    function sortTicketsBySorters(sorters) {
        let tickets = loadTickets();
        console.log("Sorting tickets:", tickets);
        if (sorters.length === 0 || sorters.every(s => s.column === 'select column')) {
            saveTickets(tickets);
            filteredTickets = null;
            renderTickets();
            return;
        }

        tickets.sort((a, b) => {
            for (let sorter of sorters) {
                if (sorter.column === 'select column') continue;
                let valueA, valueB;
                switch (sorter.column) {
                    case 'ticket id':
                        valueA = a.id || 0;
                        valueB = b.id || 0;
                        break;
                    case 'name':
                        valueA = a.name || '';
                        valueB = b.name || '';
                        break;
                    case 'contact':
                        valueA = a.contact || '';
                        valueB = b.contact || '';
                        break;
                    case 'email':
                        valueA = extractEmail(a.contact) || '';
                        valueB = extractEmail(b.contact) || '';
                        break;
                    case 'phone':
                        valueA = extractPhone(a.contact) || '';
                        valueB = extractPhone(b.contact) || '';
                        break;
                    case 'date':
                        valueA = new Date(a.date.replace(/(\d+)\/(\d+)\/(\d+),.*$/, '$3-$1-$2')) || new Date(0);
                        valueB = new Date(b.date.replace(/(\d+)\/(\d+)\/(\d+),.*$/, '$3-$1-$2')) || new Date(0);
                        break;
                    default:
                        continue;
                }
                if (sorter.order === 'ascending') {
                    if (typeof valueA === 'number' && typeof valueB === 'number') {
                        return valueA - valueB;
                    }
                    return valueA.toString().localeCompare(valueB.toString());
                } else if (sorter.order === 'descending') {
                    if (typeof valueA === 'number' && typeof valueB === 'number') {
                        return valueB - valueA;
                    }
                    return valueB.toString().localeCompare(valueA.toString());
                }
            }
            return 0;
        });
        saveTickets(tickets);
        if (filteredTickets !== null) {
            applyFilters();
        } else {
            renderTickets();
        }
    }

    function extractEmail(contact) {
        if (!contact) return '';
        const emailMatch = contact.match(/^([^\s@]+@[^\s@]+\.[^\s@]+)/);
        return emailMatch ? emailMatch[0] : '';
    }

    function extractPhone(contact) {
        if (!contact) return '';
        const phoneMatch = contact.match(/\d{10}$/);
        return phoneMatch ? phoneMatch[0] : '';
    }

    // Filter Modal Setup
    const filterModal = document.getElementById('filterPopup');
    const filterCloseButton = document.querySelector('.filter-close-btn');
    const addFilterButton = document.querySelector('.filter-add-btn');
    const filterContainer = document.getElementById('filter-rows-container');
    const filterSubmitButton = document.querySelector('.filter-submit-btn');
    const filterResetButton = document.querySelector('.filter-reset-btn');
    const filterCount = document.getElementById("filter-count");

    console.log("Filter modal elements:", { filterModal, filterCloseButton, addFilterButton, filterContainer, filterSubmitButton, filterResetButton, filterCount });

    const filterColumns = ['Select Column', 'Ticket ID', 'Subject', 'Date', 'Name', 'Phone', 'Email'];
    const relationsEqualsOnly = ['Equals'];
    const relationsWithComparison = ['Equals', 'Greater Than', 'Less Than'];

    function updateFilterCount() {
        const totalFilters = filterContainer ? filterContainer.children.length : 0;
        if (filterCount) filterCount.textContent = totalFilters;
        console.log("Updated filter count:", totalFilters);
    }

    function createFilterRow() {
        if (!filterContainer) {
            console.error("filterContainer is null, cannot create filter row");
            return null;
        }

        const filterRow = document.createElement('div');
        filterRow.className = 'filter-row';

        const labelsRow = document.createElement('div');
        labelsRow.className = 'filter-labels';

        const columnLabel = document.createElement('label');
        columnLabel.textContent = 'Column:';
        const columnField = document.createElement('div');
        columnField.className = 'filter-field';
        columnField.appendChild(columnLabel);

        const relationLabel = document.createElement('label');
        relationLabel.textContent = 'Relation:';
        const relationField = document.createElement('div');
        relationField.className = 'filter-field';
        relationField.appendChild(relationLabel);

        const valueLabel = document.createElement('label');
        valueLabel.textContent = 'Filter Value:';
        const valueField = document.createElement('div');
        valueField.className = 'filter-field';
        valueField.appendChild(valueLabel);

        labelsRow.appendChild(columnField);
        labelsRow.appendChild(relationField);
        labelsRow.appendChild(valueField);

        const inputsRow = document.createElement('div');
        inputsRow.className = 'filter-inputs';

        const columnSelect = document.createElement('select');
        columnSelect.className = 'filter-column';
        filterColumns.forEach(column => {
            const option = document.createElement('option');
            option.value = column.toLowerCase().replace(/\s/g, '');
            option.textContent = column;
            columnSelect.appendChild(option);
        });

        const relationSelect = document.createElement('select');
        relationSelect.className = 'filter-relation';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select Relation';
        relationSelect.appendChild(defaultOption);

        const valueContainer = document.createElement('div');
        valueContainer.className = 'filter-value-container';

        const deleteButton = document.createElement('button');
        deleteButton.className = 'filter-delete-btn';
        const deleteImg = document.createElement('img');
        deleteImg.src = 'projectIcons/Filter&&SortIcons/trash-can-outline.png';
        deleteImg.alt = 'Delete';
        deleteButton.appendChild(deleteImg);

        inputsRow.appendChild(columnField.cloneNode(true));
        columnField.innerHTML = '';
        columnField.appendChild(columnSelect);

        inputsRow.appendChild(relationField.cloneNode(true));
        relationField.innerHTML = '';
        relationField.appendChild(relationSelect);

        inputsRow.appendChild(valueField.cloneNode(true));
        valueField.innerHTML = '';
        valueField.appendChild(valueContainer);

        inputsRow.appendChild(deleteButton);

        filterRow.appendChild(labelsRow);
        filterRow.appendChild(inputsRow);

        let isColumnSet = false;

        columnSelect.addEventListener('change', function () {
            relationSelect.innerHTML = '<option value="">Select Relation</option>';
            valueContainer.innerHTML = '';

            const column = columnSelect.value;
            let allowedRelations = [];
            let valueInput;

            if (['ticketid', 'subject', 'name'].includes(column)) {
                allowedRelations = relationsEqualsOnly;
            } else if (['date'].includes(column)) {
                allowedRelations = relationsWithComparison;
            } else if (['phone', 'email'].includes(column)) {
                allowedRelations = relationsEqualsOnly;
            }

            allowedRelations.forEach(relation => {
                const option = document.createElement('option');
                option.value = relation.toLowerCase().replace(/\s/g, '');
                option.textContent = relation;
                relationSelect.appendChild(option);
            });

            if (column === 'date') {
                valueInput = document.createElement('input');
                valueInput.type = 'date';
                valueInput.className = 'filter-value';
            } else if (column === 'phone') {
                valueInput = document.createElement('input');
                valueInput.type = 'text';
                valueInput.className = 'filter-value';
                valueInput.value = '+254';
                valueInput.addEventListener('input', function () {
                    let value = valueInput.value;
                    if (!value.startsWith('+254')) {
                        valueInput.value = '+254';
                        value = '+254';
                    }
                    const numberPart = value.slice(4).replace(/\D/g, '');
                    if (numberPart.length > 9) {
                        valueInput.value = '+254' + numberPart.slice(0, 9);
                    } else {
                        valueInput.value = '+254' + numberPart;
                    }
                    valueInput.style.border = numberPart.length === 9 ? '1px solid #ccc' : '1px solid red';
                });
            } else if (column === 'email') {
                valueInput = document.createElement('input');
                valueInput.type = 'email';
                valueInput.className = 'filter-value';
                valueInput.addEventListener('input', function () {
                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    const isValid = emailPattern.test(valueInput.value);
                    valueInput.style.border = isValid ? '1px solid #ccc' : '1px solid red';
                });
            } else if (column !== 'selectcolumn') {
                valueInput = document.createElement('input');
                valueInput.type = 'text';
                valueInput.className = 'filter-value';
            }

            if (valueInput) {
                valueContainer.appendChild(valueInput);
            }

            if (column !== 'selectcolumn' && !isColumnSet) {
                const newFilterRow = createFilterRow();
                if (newFilterRow) filterRow.insertAdjacentElement('afterend', newFilterRow);
                updateFilterCount();
                isColumnSet = true;
            }
        });

        deleteButton.addEventListener('click', function () {
            filterRow.remove();
            updateFilterCount();
            applyFilters();
        });

        return filterRow;
    }

    if (addFilterButton) {
        addFilterButton.addEventListener('click', function () {
            console.log('Add Filter clicked');
            const filterRow = createFilterRow();
            if (filterRow && filterContainer) {
                filterContainer.appendChild(filterRow);
                updateFilterCount();
            }
        });
    } else {
        console.error('Add Filter button not found');
    }

    if (filterSubmitButton) {
        filterSubmitButton.addEventListener('click', function () {
            console.log('Filter Submit clicked');
            applyFilters();
            closeFilterModal();
        });
    } else {
        console.error('Filter Submit button not found');
    }

    if (filterResetButton) {
        filterResetButton.addEventListener('click', function () {
            console.log('Filter Reset clicked');
            if (filterContainer) filterContainer.innerHTML = '';
            if (filterCount) filterCount.textContent = '0';
            filteredTickets = null;
            renderTickets();
        });
    } else {
        console.error('Filter Reset button not found');
    }

    function closeFilterModal() {
        console.log("Closing filter modal");
        if (filterModal) filterModal.style.display = 'none';
        if (filterContainer) filterContainer.innerHTML = '';
        if (filterCount) filterCount.textContent = '0';
        filteredTickets = null;
        renderTickets();
    }

    if (filterCloseButton) {
        filterCloseButton.addEventListener('click', closeFilterModal);
    } else {
        console.error('Filter close button (.filter-close-btn) not found');
    }

    window.toggleFilterPopup = function (event) {
        if (event) event.preventDefault();
        console.log('Toggling filter popup');
        const popup = document.getElementById("filterPopup");
        if (popup) {
            if (popup.style.display === "block") {
                closeFilterModal();
            } else {
                popup.style.display = "block";
            }
            console.log('Filter popup display state:', popup.style.display);
        } else {
            console.error('filterPopup not found');
        }
    };

    window.removeFilter = function () {
        console.log('Removing filter');
        if (filterContainer) filterContainer.innerHTML = '';
        if (filterCount) filterCount.textContent = '0';
        filteredTickets = null;
        renderTickets();
    };

    function applyFilters() {
        if (!filterContainer) {
            console.error("filterContainer is null, cannot apply filters");
            return;
        }
        const filters = Array.from(filterContainer.children).map(row => {
            const column = row.querySelector('.filter-column').value;
            const relation = row.querySelector('.filter-relation').value;
            const value = row.querySelector('.filter-value') ? row.querySelector('.filter-value').value : '';
            return { column, relation, value };
        });
        console.log("Applying filters:", filters);

        let tickets = loadTickets();
        if (filters.length === 0 || filters.every(f => f.column === 'selectcolumn' || f.value === '')) {
            filteredTickets = null;
            renderTickets();
            return;
        }

        filteredTickets = tickets.filter(ticket => {
            return filters.every(filter => {
                if (filter.column === 'selectcolumn' || filter.value === '' || filter.relation === '') return true;

                let ticketValue;
                let filterValue = filter.value;

                switch (filter.column) {
                    case 'ticketid':
                        ticketValue = ticket.id.toString();
                        break;
                    case 'subject':
                        ticketValue = ticket.subject ? ticket.subject.toLowerCase() : '';
                        filterValue = filterValue.toLowerCase();
                        break;
                    case 'date':
                        ticketValue = new Date(ticket.date.replace(/(\d+)\/(\d+)\/(\d+),.*$/, '$3-$1-$2'));
                        filterValue = new Date(filterValue);
                        if (isNaN(filterValue.getTime())) return true;
                        break;
                    case 'name':
                        ticketValue = ticket.name ? ticket.name.toLowerCase() : '';
                        filterValue = filterValue.toLowerCase();
                        break;
                    case 'phone':
                        ticketValue = extractPhone(ticket.contact) || '';
                        break;
                    case 'email':
                        ticketValue = extractEmail(ticket.contact) || '';
                        filterValue = filterValue.toLowerCase();
                        break;
                    default:
                        return true;
                }

                if (filter.relation === 'equals') {
                    if (filter.column === 'date') {
                        return ticketValue.toISOString().split('T')[0] === filterValue.toISOString().split('T')[0];
                    }
                    return ticketValue === filterValue;
                } else if (filter.column === 'date') {
                    if (filter.relation === 'greaterthan') {
                        return ticketValue > filterValue;
                    } else if (filter.relation === 'lessthan') {
                        return ticketValue < filterValue;
                    }
                }
                return true;
            });
        });

        renderTickets();
    }

    function refreshTickets() {
        console.log("Refreshing tickets...");
        filteredTickets = null;
        renderTickets();
    }

    function loadTickets() {
        const storedTickets = localStorage.getItem("formSubmissions");
        const tickets = storedTickets ? JSON.parse(storedTickets) : [];
        console.log("Raw loaded tickets:", tickets);
        return tickets;
    }

    function saveTickets(tickets) {
        localStorage.setItem("formSubmissions", JSON.stringify(tickets));
        console.log("Tickets saved to localStorage:", tickets);
    }

    function showTicketInfo(ticketId) {
        try {
            const tickets = loadTickets();
            const ticket = tickets.find(t => t.id === ticketId);
            if (!ticket) {
                alert("Ticket not found.");
                return;
            }
            const ticketInfo = document.getElementById("ticketInfo");
            if (ticketInfo) {
                ticketInfo.innerHTML = `
                    <strong>Ticket ID:</strong> ${ticket.id}<br>
                    <strong>Name:</strong> ${ticket.name || 'N/A'}<br>
                    <strong>Contact:</strong> ${ticket.contact || 'N/A'}<br>
                    <strong>Subject:</strong> ${ticket.subject || 'N/A'}<br>
                    <strong>Details:</strong> ${ticket.details || 'N/A'}<br>
                    <strong>Date:</strong> ${ticket.date || 'N/A'}
                `;
            }
            const ticketImage = document.getElementById("ticketImage");
            if (ticketImage) {
                if (ticket.file && ticket.file.data) {
                    ticketImage.src = ticket.file.data;
                    ticketImage.style.display = "block";
                } else {
                    ticketImage.style.display = "none";
                }
            }
            const ticketModal = document.getElementById("ticketModal");
            if (ticketModal) ticketModal.style.display = "block";
        } catch (error) {
            console.error("Error in showTicketInfo:", error);
        }
    }

    function closeModal() {
        const ticketModal = document.getElementById("ticketModal");
        if (ticketModal) ticketModal.style.display = "none";
    }

    function downloadAttachment(ticketId) {
        try {
            const tickets = loadTickets();
            const ticket = tickets.find(t => t.id === ticketId);
            if (!ticket || !ticket.file) {
                alert("No attachment found");
                return;
            }
            const link = document.createElement("a");
            link.href = ticket.file.data;
            link.download = ticket.file.name || `attachment_${ticketId}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error in downloadAttachment:", error);
        }
    }

    function deleteTicket(id) {
        try {
            let tickets = loadTickets();
            tickets = tickets.filter(ticket => ticket.id !== id);
            saveTickets(tickets);
            filteredTickets = null;
            renderTickets();
        } catch (error) {
            console.error("Error in deleteTicket:", error);
        }
    }

    let currentEditingTicketId = null;

    function openEditModal(ticketId) {
        try {
            const tickets = loadTickets();
            const ticket = tickets.find(t => t.id === ticketId);
            if (!ticket) {
                alert("Ticket not found.");
                return;
            }
            const editName = document.getElementById("editName");
            const editContact = document.getElementById("editContact");
            const editSubject = document.getElementById("editSubject");
            const editDetails = document.getElementById("editDetails");
            if (editName) editName.value = ticket.name || '';
            if (editContact) editContact.value = ticket.contact || '';
            if (editSubject) editSubject.value = ticket.subject || '';
            if (editDetails) editDetails.value = ticket.details || '';
            currentEditingTicketId = ticketId;
            const editModal = document.getElementById("editTicketModal");
            if (editModal) editModal.style.display = "block";
            else console.error("editTicketModal not found");
        } catch (error) {
            console.error("Error in openEditModal:", error);
        }
    }

    function saveEditedTicket() {
        try {
            if (currentEditingTicketId === null) return;
            let tickets = loadTickets();
            let ticket = tickets.find(t => t.id === currentEditingTicketId);
            if (!ticket) return;
            const newName = document.getElementById("editName").value.trim();
            const newContact = document.getElementById("editContact").value.trim();
            const newSubject = document.getElementById("editSubject").value;
            const newDetails = document.getElementById("editDetails").value.trim();
            if (newName !== ticket.name) ticket.name = newName;
            if (newContact !== ticket.contact) ticket.contact = newContact;
            if (newSubject !== ticket.subject) ticket.subject = newSubject;
            if (newDetails !== ticket.details) ticket.details = newDetails;
            saveTickets(tickets);
            filteredTickets = null;
            renderTickets();
            closeEditModal();
        } catch (error) {
            console.error("Error in saveEditedTicket:", error);
        }
    }

    function closeEditModal() {
        const editModal = document.getElementById("editTicketModal");
        if (editModal) editModal.style.display = "none";
        currentEditingTicketId = null;
    }

    let currentPage = 1;
    const ticketsPerPage = 3;

    function renderTickets() {
        try {
            const tickets = filteredTickets !== null ? filteredTickets : loadTickets();
            console.log("Rendering tickets:", tickets);
            const tableBody = document.getElementById("ticketTableBody");
            if (!tableBody) {
                console.error("ticketTableBody not found");
                return;
            }
            tableBody.innerHTML = "";

            if (tickets.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">${filteredTickets !== null ? "No matching tickets found" : "No tickets available"}</td></tr>`;
                const paginationDiv = document.getElementById("pagination");
                if (paginationDiv) paginationDiv.style.display = 'none';
                return;
            }

            const paginationDiv = document.getElementById("pagination");
            if (paginationDiv) paginationDiv.style.display = 'flex';

            const start = (currentPage - 1) * ticketsPerPage;
            const end = start + ticketsPerPage;
            const paginatedTickets = tickets.slice(start, end);

            paginatedTickets.forEach(ticket => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${ticket.id || 'N/A'}</td>
                    <td>${(ticket.name || 'N/A') + '<br>' + (ticket.contact || 'N/A')}</td>
                    <td>${(ticket.subject || 'N/A') + '<br>' + (ticket.details || 'N/A')}</td>
                    <td>${ticket.date || 'N/A'}</td>
                    <td>
                        <button title="Show popup with more information" onclick="showTicketInfo(${ticket.id || 0})">
                            <img src="projectIcons/information.png" alt="More Info" width="16" height="16">
                        </button>
                        <button title="Download ticket attachment" onclick="downloadAttachment(${ticket.id || 0})">
                            <img src="projectIcons/download.png" alt="Download" width="16" height="16">
                        </button>
                        <button title="Trigger call if preferred contact is phone" onclick="alert('Calling ${extractPhone(ticket.contact) || 'No phone'}')">
                            <img src="projectIcons/phone.png" alt="Call" width="16" height="16">
                        </button>
                        <button title="Trigger call if preferred contact is email" onclick="alert('Emailing ${extractEmail(ticket.contact) || 'No email'}')">
                            <img src="projectIcons/email.png" alt="Email" width="16" height="16">
                        </button>
                        <button title="Edit on a pop-up the details of the ticket" onclick="openEditModal(${ticket.id || 0})">
                            <img src="projectIcons/edit.png" alt="Edit" width="16" height="16">
                        </button>
                        <button title="Delete the ticket" onclick="deleteTicket(${ticket.id || 0})">
                            <img src="projectIcons/trash-can.png" alt="Delete" width="16" height="16">
                        </button>
                    </td>`;
                tableBody.appendChild(row);
            });
            renderPagination();
        } catch (error) {
            console.error("Error in renderTickets:", error);
        }
    }

    function renderPagination() {
        try {
            const tickets = filteredTickets !== null ? filteredTickets : loadTickets();
            const paginationDiv = document.getElementById("pagination");
            if (!paginationDiv) {
                console.error("pagination div not found");
                return;
            }
            paginationDiv.innerHTML = "";

            const totalPages = Math.ceil(tickets.length / ticketsPerPage);
            if (totalPages <= 1) {
                paginationDiv.style.display = 'none';
                return;
            }

            const prevButton = document.createElement("a");
            prevButton.href = "#";
            prevButton.innerText = "Previous";
            prevButton.onclick = () => changePage(currentPage - 1);
            prevButton.style.display = currentPage === 1 ? "none" : "inline";
            paginationDiv.appendChild(prevButton);

            for (let i = 1; i <= totalPages; i++) {
                const pageLink = document.createElement("a");
                pageLink.href = "#";
                pageLink.innerText = i;
                pageLink.classList.add("page-link");
                if (i === currentPage) pageLink.classList.add("active");
                pageLink.onclick = () => changePage(i);
                paginationDiv.appendChild(pageLink);
            }

            const nextButton = document.createElement("a");
            nextButton.href = "#";
            nextButton.innerText = "Next";
            nextButton.onclick = () => changePage(currentPage + 1);
            nextButton.style.display = currentPage === totalPages ? "none" : "inline";
            paginationDiv.appendChild(nextButton);
        } catch (error) {
            console.error("Error in renderPagination:", error);
        }
    }

    function changePage(page) {
        const tickets = filteredTickets !== null ? filteredTickets : loadTickets();
        const totalPages = Math.ceil(tickets.length / ticketsPerPage);
        if (page < 1 || page > totalPages) return;
        currentPage = page;
        renderTickets();
    }

    window.removeSortFilter = function () {
        console.log('Removing sort filter');
        filteredTickets = null;
        renderTickets();
    }
});

