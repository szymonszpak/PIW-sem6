const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const deleteModal = document.getElementById('deleteModal');
const taskToDeleteText = document.getElementById('taskToDeleteText');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const undoBtn = document.getElementById('undoBtn');
const searchInput = document.getElementById('searchInput');
const caseInsensitiveCheckbox = document.getElementById('caseInsensitiveCheckbox');

let lastDeletedTask = null;
let itemToDelete = null;

function addTask() {
    const text = taskInput.value.trim();

    if (text === '') {
        alert('Pole nie może być puste!');
        return;
    }

    const li = document.createElement('li');
    
    const taskTextSpan = document.createElement('span');
    taskTextSpan.className = 'task-text';
    taskTextSpan.textContent = text;
    li.appendChild(taskTextSpan);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btnDelete';
    deleteBtn.textContent = 'X';
    
    deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        itemToDelete = li;
        taskToDeleteText.textContent = text;
        deleteModal.classList.remove('hidden');
    });
    
    li.appendChild(deleteBtn);

    li.addEventListener('click', function() {
        this.classList.toggle('completed');

        if (this.classList.contains('completed')) {
            const now = new Date();
            const dateStr = now.toLocaleString(); 
            
            const dateSpan = document.createElement('span');
            dateSpan.className = 'completion-date';
            dateSpan.textContent = `Wykonano: ${dateStr}`;
            this.appendChild(dateSpan);
        } else {
            const dateSpan = this.querySelector('.completion-date');
            if (dateSpan) {
                dateSpan.remove();
            }
        }
    });

    const listSelector = document.getElementById('listSelector');
    const targetListId = listSelector.value;
    
    const targetList = document.getElementById(targetListId);
    targetList.appendChild(li);
    taskInput.value = '';
    filterTasks();
}

addBtn.addEventListener('click', addTask);

cancelDeleteBtn.addEventListener('click', function() {
    deleteModal.classList.add('hidden');
    itemToDelete = null;
});

confirmDeleteBtn.addEventListener('click', function() {
    if (itemToDelete !== null) {

        const taskText = itemToDelete.querySelector('.task-text').textContent;
        const isCompleted = itemToDelete.classList.contains('completed');
        const dateSpan = itemToDelete.querySelector('.completion-date');
        const dateText = dateSpan !== null ? dateSpan.textContent : null;
        const targetListId = itemToDelete.parentElement.id;

        lastDeletedTask = {
            text: taskText,
            isCompleted: isCompleted,
            dateText: dateText,
            targetListId: targetListId
        };

        itemToDelete.remove(); 
        deleteModal.classList.add('hidden');
        itemToDelete = null;
    }
});

const listHeaders = document.querySelectorAll('.list-header');

listHeaders.forEach(function(header) {
    header.addEventListener('click', function() {
        const ul = this.nextElementSibling;
        const arrow = this.querySelector('.arrow');
        
        ul.classList.toggle('collapsed');
        
        if (ul.classList.contains('collapsed')) {
            arrow.textContent = '►';
        } else {
            arrow.textContent = '▼';
        }
    });
});

undoBtn.addEventListener('click', function() {
    if (lastDeletedTask !== null) {
        taskInput.value = lastDeletedTask.text;
        document.getElementById('listSelector').value = lastDeletedTask.targetListId;
        
        addBtn.click();
        
        if (lastDeletedTask.isCompleted) {
            const targetList = document.getElementById(lastDeletedTask.targetListId);
            const justAddedLi = targetList.lastElementChild;
            
            justAddedLi.classList.add('completed');
            const newDateSpan = document.createElement('span');
            newDateSpan.className = 'completion-date';
            newDateSpan.textContent = lastDeletedTask.dateText;
            justAddedLi.appendChild(newDateSpan);
        }

        lastDeletedTask = null;
    }
});

function filterTasks() {
    const query = searchInput.value;
    const isCaseInsensitive = caseInsensitiveCheckbox.checked; 
    
    const allLists = document.querySelectorAll('.task-list');

    allLists.forEach(function(ul) {
        let hasVisibleTasks = false;
        const tasks = ul.querySelectorAll('li');

        tasks.forEach(function(li) {
            const textSpan = li.querySelector('.task-text');
            
            if (textSpan === null) {
                return; 
            }
            
            let taskText = textSpan.textContent;
            let searchQuery = query;

            if (isCaseInsensitive) {
                taskText = taskText.toLowerCase();
                searchQuery = searchQuery.toLowerCase();
            }

            if (taskText.includes(searchQuery)) {
                li.style.display = ''; 
                hasVisibleTasks = true;
            } else {
                li.style.display = 'none'; 
            }
        });

        if (query !== '' && hasVisibleTasks) {
            ul.classList.remove('collapsed');
            
            const header = ul.previousElementSibling; 
            if (header !== null) {
                const arrow = header.querySelector('.arrow');
                if (arrow !== null) {
                    arrow.textContent = '▼';
                }
            }
        }
    });
}

searchInput.addEventListener('input', filterTasks);
caseInsensitiveCheckbox.addEventListener('change', filterTasks);