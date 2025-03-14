// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const taskTable = document.getElementById('taskTable');
    const addRowBtn = document.getElementById('addRowBtn');

    // Function to handle row deletion
    function deleteRow(event) {
        if (event.target.classList.contains('delete-btn')) {
            const row = event.target.closest('tr');
            row.remove();
            saveTableData(); // Save after deletion
        }
    }

    // Add click event listener for delete buttons
    taskTable.addEventListener('click', deleteRow);

    // Function to create a new row
    function createNewRow() {
        const tbody = taskTable.querySelector('tbody');
        const newRow = document.createElement('tr');
        
        // Create cells
        for (let i = 0; i < 7; i++) {  // Updated from 6 to 7 cells
            const td = document.createElement('td');
            if (i === 0) { // Action column (delete button)
                td.innerHTML = `<button class="delete-btn">-</button>`;
            } else if (i === 3) { // Due Date column
                const today = new Date().toISOString().split('T')[0];
                td.innerHTML = `<input type="date" class="date-input" value="${today}">`;
            } else if (i === 4) { // Status column
                td.innerHTML = `
                    <select class="status-select">
                        <option value="in-progress">In Progress</option>
                        <option value="pending" selected>Pending</option>
                        <option value="completed">Completed</option>
                    </select>
                `;
            } else if (i === 5) { // Priority column
                td.innerHTML = `
                    <select class="priority-select">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                `;
            } else if (i === 6) { // Channel column
                td.innerHTML = `
                    <select class="channel-select">
                        <option value="meta">Meta</option>
                        <option value="website" selected>Website</option>
                        <option value="programmatic">Programmatic</option>
                        <option value="digital-ad">Digital Ad</option>
                        <option value="print-ad">Print Ad</option>
                    </select>
                `;
            } else {
                td.contentEditable = true;
                // Set default content for each cell
                switch(i) {
                    case 1:
                        td.textContent = 'New Task';
                        td.contentEditable = false;
                        break;
                    case 2:
                        td.textContent = 'Enter description';
                        break;
                }
            }
            newRow.appendChild(td);
        }
        
        // Insert at the top of the table instead of appending to the bottom
        if (tbody.firstChild) {
            tbody.insertBefore(newRow, tbody.firstChild);
        } else {
            tbody.appendChild(newRow);
        }
        
        // Save the updated table data
        saveTableData();
    }

    // Add event listener to the Add Task button
    addRowBtn.addEventListener('click', createNewRow);

    // Save data to localStorage when changes are made
    taskTable.addEventListener('input', saveTableData);
    taskTable.addEventListener('change', saveTableData); // For dropdown changes

    // Function to save table data to localStorage
    function saveTableData() {
        const rows = Array.from(taskTable.querySelectorAll('tbody tr')).map(row => {
            return Array.from(row.cells).slice(1, 8).map(cell => {  // Updated from 7 to 8 to include all columns
                // Check if the cell contains a select element
                const select = cell.querySelector('select');
                if (select) return select.value;
                
                // Check if the cell contains a date input
                const dateInput = cell.querySelector('input[type="date"]');
                if (dateInput) return dateInput.value;
                
                return cell.textContent;
            });
        });
        localStorage.setItem('taskData', JSON.stringify(rows));
    }

    // Function to load table data from localStorage
    function loadTableData() {
        const savedData = localStorage.getItem('taskData');
        if (savedData) {
            const rows = JSON.parse(savedData);
            const tbody = taskTable.querySelector('tbody');
            tbody.innerHTML = ''; // Clear existing rows

            // Process rows in reverse order to maintain consistency with new task insertion
            [...rows].reverse().forEach(rowData => {
                const newRow = document.createElement('tr');
                // Add delete button as first column
                const deleteCell = document.createElement('td');
                deleteCell.innerHTML = `<button class="delete-btn">-</button>`;
                newRow.appendChild(deleteCell);

                // Add the data columns
                rowData.forEach((cellContent, index) => {
                    const td = document.createElement('td');
                    if (index === 2) { // Due Date column
                        td.innerHTML = `<input type="date" class="date-input" value="${cellContent}">`;
                    } else if (index === 3) { // Status column
                        td.innerHTML = `
                            <select class="status-select">
                                <option value="in-progress" ${cellContent === 'in-progress' ? 'selected' : ''}>In Progress</option>
                                <option value="pending" ${cellContent === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="completed" ${cellContent === 'completed' ? 'selected' : ''}>Completed</option>
                            </select>
                        `;
                    } else if (index === 4) { // Priority column
                        td.innerHTML = `
                            <select class="priority-select">
                                <option value="low" ${cellContent === 'low' ? 'selected' : ''}>Low</option>
                                <option value="medium" ${cellContent === 'medium' ? 'selected' : ''}>Medium</option>
                                <option value="high" ${cellContent === 'high' ? 'selected' : ''}>High</option>
                            </select>
                        `;
                    } else if (index === 5) { // Channel column
                        td.innerHTML = `
                            <select class="channel-select">
                                <option value="meta" ${cellContent === 'meta' ? 'selected' : ''}>Meta</option>
                                <option value="website" ${cellContent === 'website' ? 'selected' : ''}>Website</option>
                                <option value="programmatic" ${cellContent === 'programmatic' ? 'selected' : ''}>Programmatic</option>
                                <option value="digital-ad" ${cellContent === 'digital-ad' ? 'selected' : ''}>Digital Ad</option>
                                <option value="print-ad" ${cellContent === 'print-ad' ? 'selected' : ''}>Print Ad</option>
                            </select>
                        `;
                    } else {
                        td.contentEditable = true;
                        td.textContent = cellContent;
                        // Make Task column non-editable
                        if (index === 0) { // Task column (index 0 in the data array, which is index 1 in the row)
                            td.contentEditable = false;
                        }
                    }
                    newRow.appendChild(td);
                });
                tbody.appendChild(newRow);
            });
        }
    }

    // Load saved data when the page loads
    loadTableData();

    // Add smooth scrolling to all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add a welcome message to the console
    console.log('Welcome to My Web Project!');
}); 