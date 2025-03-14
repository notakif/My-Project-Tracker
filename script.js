// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const taskTable = document.getElementById('taskTable');
    const addRowBtn = document.getElementById('addRowBtn');

    // Function to handle row deletion
    function deleteRow(event) {
        if (event.target.classList.contains('delete-btn')) {
            const row = event.target.closest('tr');
            const rowId = row.getAttribute('data-id');
            
            // Also delete any subtasks associated with this task
            const subtasks = document.querySelectorAll(`tr[data-parent="${rowId}"]`);
            subtasks.forEach(subtask => subtask.remove());
            
            row.remove();
            saveTableData(); // Save after deletion
        }
    }

    // Add click event listener for delete buttons
    taskTable.addEventListener('click', deleteRow);

    // Generate a unique ID for tasks
    function generateUniqueId() {
        return 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }

    // Function to create a new row
    function createNewRow() {
        const tbody = taskTable.querySelector('tbody');
        const newRow = document.createElement('tr');
        const taskId = generateUniqueId();
        newRow.setAttribute('data-id', taskId);
        
        // Create cells
        for (let i = 0; i < 6; i++) {
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
                    <button class="subtask-btn" title="Add Subtask">+</button>
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

    // Function to create a new subtask
    function createSubtask(parentRow) {
        const tbody = taskTable.querySelector('tbody');
        const subtaskRow = document.createElement('tr');
        const parentId = parentRow.getAttribute('data-id');
        const subtaskId = generateUniqueId();
        
        subtaskRow.classList.add('subtask-row');
        subtaskRow.setAttribute('data-id', subtaskId);
        subtaskRow.setAttribute('data-parent', parentId);
        
        // Create a cell that spans all columns
        const subtaskCell = document.createElement('td');
        subtaskCell.setAttribute('colspan', '6');
        
        // Create subtask content
        subtaskCell.innerHTML = `
            <input type="checkbox" class="subtask-checkbox">
            <input type="text" class="subtask-input" placeholder="Enter subtask description">
            <button class="delete-btn" style="margin-left: 10px;">-</button>
        `;
        
        subtaskRow.appendChild(subtaskCell);
        
        // Insert after the parent row
        const nextRow = getNextMainTaskRow(parentRow);
        if (nextRow) {
            tbody.insertBefore(subtaskRow, nextRow);
        } else {
            tbody.appendChild(subtaskRow);
        }
        
        // Focus on the new subtask input
        setTimeout(() => {
            subtaskRow.querySelector('.subtask-input').focus();
        }, 0);
        
        // Save the updated table data
        saveTableData();
    }
    
    // Helper function to get the next main task row
    function getNextMainTaskRow(currentRow) {
        let nextRow = currentRow.nextElementSibling;
        while (nextRow && nextRow.classList.contains('subtask-row') && 
               nextRow.getAttribute('data-parent') === currentRow.getAttribute('data-id')) {
            nextRow = nextRow.nextElementSibling;
        }
        return nextRow;
    }

    // Add event listener for subtask buttons
    taskTable.addEventListener('click', function(event) {
        if (event.target.classList.contains('subtask-btn')) {
            const parentRow = event.target.closest('tr');
            createSubtask(parentRow);
        }
    });
    
    // Handle subtask checkbox changes
    taskTable.addEventListener('change', function(event) {
        if (event.target.classList.contains('subtask-checkbox')) {
            const subtaskInput = event.target.nextElementSibling;
            if (event.target.checked) {
                subtaskInput.classList.add('completed-subtask');
            } else {
                subtaskInput.classList.remove('completed-subtask');
            }
            saveTableData();
        }
    });

    // Save data to localStorage when changes are made
    taskTable.addEventListener('input', saveTableData);
    taskTable.addEventListener('change', saveTableData); // For dropdown changes

    // Function to save table data to localStorage
    function saveTableData() {
        // Save main tasks
        const mainTasks = [];
        const mainRows = Array.from(taskTable.querySelectorAll('tbody tr:not(.subtask-row)'));
        
        mainRows.forEach(row => {
            const taskId = row.getAttribute('data-id');
            const taskData = {
                id: taskId,
                cells: Array.from(row.cells).slice(1, 6).map(cell => {
                    // Check if the cell contains a select element
                    const select = cell.querySelector('select');
                    if (select) return select.value;
                    
                    // Check if the cell contains a date input
                    const dateInput = cell.querySelector('input[type="date"]');
                    if (dateInput) return dateInput.value;
                    
                    return cell.textContent;
                }),
                subtasks: []
            };
            
            // Get subtasks for this task
            const subtaskRows = document.querySelectorAll(`tr.subtask-row[data-parent="${taskId}"]`);
            subtaskRows.forEach(subtaskRow => {
                const checkbox = subtaskRow.querySelector('.subtask-checkbox');
                const input = subtaskRow.querySelector('.subtask-input');
                
                taskData.subtasks.push({
                    id: subtaskRow.getAttribute('data-id'),
                    description: input.value,
                    completed: checkbox.checked
                });
            });
            
            mainTasks.push(taskData);
        });
        
        localStorage.setItem('taskData', JSON.stringify(mainTasks));
    }

    // Function to load table data from localStorage
    function loadTableData() {
        const savedData = localStorage.getItem('taskData');
        if (savedData) {
            const tasks = JSON.parse(savedData);
            const tbody = taskTable.querySelector('tbody');
            tbody.innerHTML = ''; // Clear existing rows

            // Process tasks in reverse order to maintain consistency with new task insertion
            [...tasks].reverse().forEach(taskData => {
                // Create main task row
                const newRow = document.createElement('tr');
                newRow.setAttribute('data-id', taskData.id);
                
                // Add delete button as first column
                const deleteCell = document.createElement('td');
                deleteCell.innerHTML = `<button class="delete-btn">-</button>`;
                newRow.appendChild(deleteCell);

                // Add the data columns
                taskData.cells.forEach((cellContent, index) => {
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
                            <button class="subtask-btn" title="Add Subtask">+</button>
                        `;
                    } else {
                        td.contentEditable = true;
                        td.textContent = cellContent;
                    }
                    newRow.appendChild(td);
                });
                tbody.appendChild(newRow);
                
                // Create subtask rows
                if (taskData.subtasks && taskData.subtasks.length > 0) {
                    taskData.subtasks.forEach(subtask => {
                        const subtaskRow = document.createElement('tr');
                        subtaskRow.classList.add('subtask-row');
                        subtaskRow.setAttribute('data-id', subtask.id);
                        subtaskRow.setAttribute('data-parent', taskData.id);
                        
                        const subtaskCell = document.createElement('td');
                        subtaskCell.setAttribute('colspan', '6');
                        
                        const completedClass = subtask.completed ? 'completed-subtask' : '';
                        subtaskCell.innerHTML = `
                            <input type="checkbox" class="subtask-checkbox" ${subtask.completed ? 'checked' : ''}>
                            <input type="text" class="subtask-input ${completedClass}" value="${subtask.description}" placeholder="Enter subtask description">
                            <button class="delete-btn" style="margin-left: 10px;">-</button>
                        `;
                        
                        subtaskRow.appendChild(subtaskCell);
                        tbody.appendChild(subtaskRow);
                    });
                }
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