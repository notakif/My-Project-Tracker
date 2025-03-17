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
        for (let i = 0; i < 7; i++) {  // Updated from 6 to 7 cells (added Priority)
            const td = document.createElement('td');
            if (i === 0) { // Action column (delete button)
                td.innerHTML = `<button class="delete-btn">-</button>`;
            } else if (i === 3) { // Due Date column
                const today = new Date().toISOString().split('T')[0];
                td.innerHTML = `<input type="date" class="date-input" value="${today}">`;
            } else if (i === 4) { // Status column
                const selectHTML = `
                    <select class="status-select">
                        <option value="in-progress">In Progress</option>
                        <option value="pending" selected>Pending</option>
                        <option value="completed">Completed</option>
                    </select>
                `;
                td.innerHTML = selectHTML;
                
                // Add the completed class if needed
                const select = td.querySelector('.status-select');
                if (select.value === 'completed') {
                    select.classList.add('status-completed');
                }
            } else if (i === 5) { // Priority column
                td.innerHTML = `
                    <select class="priority-select">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
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
                        <option value="email">Email</option>
                        <option value="social-media">Social Media</option>
                        <option value="other">Other</option>
                    </select>
                `;
            } else {
                td.contentEditable = true;
                // Set default content for each cell
                switch(i) {
                    case 1:
                        td.textContent = 'New Task';
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
    taskTable.addEventListener('change', function(event) {
        // Check if it's a status dropdown being changed
        if (event.target.classList.contains('status-select')) {
            const select = event.target;
            // Apply or remove the completed class depending on the selected value
            if (select.value === 'completed') {
                select.classList.add('status-completed');
            } else {
                select.classList.remove('status-completed');
            }
        }
        
        // Save the data
        saveTableData();
    }); // For dropdown changes

    // Add event listener to select all text in contenteditable cells when clicked
    taskTable.addEventListener('click', function(event) {
        const target = event.target;
        // Check if the clicked element is a contenteditable cell
        if (target.matches('td[contenteditable="true"]')) {
            // Select all text in the cell
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(target);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    });

    // Function to save table data to localStorage
    function saveTableData() {
        const rows = Array.from(taskTable.querySelectorAll('tbody tr')).map(row => {
            return Array.from(row.cells).slice(1, 8).map(cell => {  // Updated from slice(1, 7) to slice(1, 8) to get 7 columns
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
        const tbody = taskTable.querySelector('tbody');
        tbody.innerHTML = ''; // Clear existing rows
        
        if (savedData) {
            const rows = JSON.parse(savedData);
            
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
                        const selectHTML = `
                            <select class="status-select">
                                <option value="in-progress" ${cellContent === 'in-progress' ? 'selected' : ''}>In Progress</option>
                                <option value="pending" ${cellContent === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="completed" ${cellContent === 'completed' ? 'selected' : ''}>Completed</option>
                            </select>
                        `;
                        td.innerHTML = selectHTML;
                        
                        // Add the completed class if needed
                        const select = td.querySelector('.status-select');
                        if (cellContent === 'completed') {
                            select.classList.add('status-completed');
                        }
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
                                <option value="email" ${cellContent === 'email' ? 'selected' : ''}>Email</option>
                                <option value="social-media" ${cellContent === 'social-media' ? 'selected' : ''}>Social Media</option>
                                <option value="other" ${cellContent === 'other' ? 'selected' : ''}>Other</option>
                            </select>
                        `;
                    } else {
                        td.contentEditable = true;
                        td.textContent = cellContent;
                    }
                    newRow.appendChild(td);
                });
                tbody.appendChild(newRow);
            });
        } else {
            // Create 4 default rows if no data exists
            createDefaultRows();
        }
    }
    
    // Function to create 4 default tasks
    function createDefaultRows() {
        // Clear the table first
        const tbody = taskTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        // Create 4 default rows with example tasks
        const defaultTasks = [
            {
                task: "New Task",
                notes: "Discuss project timeline and objectives",
                dueDate: getFutureDate(7), // 1 week from now
                status: "pending",
                priority: "high",
                channel: "website"
            },
            {
                task: "New Task",
                notes: "Plan social media posts for next month",
                dueDate: getFutureDate(14), // 2 weeks from now
                status: "in-progress",
                priority: "medium",
                channel: "social-media"
            },
            {
                task: "New Task",
                notes: "Prepare slides for quarterly review",
                dueDate: getFutureDate(3), // 3 days from now
                status: "in-progress",
                priority: "high",
                channel: "email"
            },
            {
                task: "New Task",
                notes: "Update product information and images",
                dueDate: getFutureDate(10), // 10 days from now
                status: "pending",
                priority: "medium",
                channel: "website"
            }
        ];
        
        // Add the default rows to the table
        defaultTasks.forEach(task => {
            const newRow = document.createElement('tr');
            
            // Add delete button cell
            const deleteCell = document.createElement('td');
            deleteCell.innerHTML = `<button class="delete-btn">-</button>`;
            newRow.appendChild(deleteCell);
            
            // Add task cell
            const taskCell = document.createElement('td');
            taskCell.contentEditable = true;
            taskCell.textContent = task.task;
            newRow.appendChild(taskCell);
            
            // Add notes cell
            const notesCell = document.createElement('td');
            notesCell.contentEditable = true;
            notesCell.textContent = task.notes;
            newRow.appendChild(notesCell);
            
            // Add due date cell
            const dueDateCell = document.createElement('td');
            dueDateCell.innerHTML = `<input type="date" class="date-input" value="${task.dueDate}">`;
            newRow.appendChild(dueDateCell);
            
            // Add status cell
            const statusCell = document.createElement('td');
            const statusHTML = `
                <select class="status-select">
                    <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                    <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
            `;
            statusCell.innerHTML = statusHTML;
            
            // Add the completed class if needed
            const statusSelect = statusCell.querySelector('.status-select');
            if (task.status === 'completed') {
                statusSelect.classList.add('status-completed');
            }
            
            newRow.appendChild(statusCell);
            
            // Add priority cell
            const priorityCell = document.createElement('td');
            priorityCell.innerHTML = `
                <select class="priority-select">
                    <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                    <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                </select>
            `;
            newRow.appendChild(priorityCell);
            
            // Add channel cell
            const channelCell = document.createElement('td');
            channelCell.innerHTML = `
                <select class="channel-select">
                    <option value="meta" ${task.channel === 'meta' ? 'selected' : ''}>Meta</option>
                    <option value="website" ${task.channel === 'website' ? 'selected' : ''}>Website</option>
                    <option value="programmatic" ${task.channel === 'programmatic' ? 'selected' : ''}>Programmatic</option>
                    <option value="digital-ad" ${task.channel === 'digital-ad' ? 'selected' : ''}>Digital Ad</option>
                    <option value="print-ad" ${task.channel === 'print-ad' ? 'selected' : ''}>Print Ad</option>
                    <option value="email" ${task.channel === 'email' ? 'selected' : ''}>Email</option>
                    <option value="social-media" ${task.channel === 'social-media' ? 'selected' : ''}>Social Media</option>
                    <option value="other" ${task.channel === 'other' ? 'selected' : ''}>Other</option>
                </select>
            `;
            newRow.appendChild(channelCell);
            
            // Add the row to the table
            tbody.appendChild(newRow);
        });
        
        // Save the default tasks to localStorage
        saveTableData();
    }
    
    // Helper function to get a date in the future
    function getFutureDate(daysFromNow) {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }

    // Load saved data when the page loads
    loadTableData();
    
    // Ensure we always have at least 4 rows
    ensureMinimumRows(4);
    
    // Function to ensure a minimum number of rows
    function ensureMinimumRows(minRows) {
        const tbody = taskTable.querySelector('tbody');
        const currentRowCount = tbody.children.length;
        
        // If we have fewer than minRows, add more rows
        if (currentRowCount < minRows) {
            for (let i = 0; i < minRows - currentRowCount; i++) {
                createNewRow();
            }
        }
    }

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