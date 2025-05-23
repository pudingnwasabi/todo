// 할 일 목록을 저장할 배열
let todos = [];
let currentFilter = 'all';
let isPrioritySortActive = false;
let prioritySortOrder = 'desc'; // 'desc' (High->Low) or 'asc' (Low->High)

// DOM 요소 가져오기
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');
const prioritySelect = document.getElementById('prioritySelect');
const deadlineInput = document.getElementById('deadlineInput');
const filterButtons = document.querySelectorAll('.filter-btn:not(#sortPriorityBtn)'); // Exclude sort button
const sortPriorityBtn = document.getElementById('sortPriorityBtn');

// 페이지 로드 시 저장된 할 일 목록 불러오기
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    renderTodos();

    // Initialize flatpickr for the deadline input
    flatpickr("#deadlineInput", {
        enableTime: false, // Adjust options as needed, for now, only date
        dateFormat: "Y-m-d",
        placeholder: "마감일 선택..." // Optional: if you want placeholder via JS
    });
});

// 할 일 추가 함수
function addTodo() {
    const text = todoInput.value.trim();
    if (text === '') return;

    const priority = prioritySelect.value;
    const deadline = deadlineInput.value; // Get deadline value

    const newTodo = {
        id: Date.now(),
        text,
        completed: false,
        createdAt: new Date().toISOString(),
        priority: priority,
        deadline: deadline // Add deadline to todo object
    };

    todos.push(newTodo);
    saveTodos();
    renderTodos();
    todoInput.value = '';
    deadlineInput.value = ''; // Clear deadline input
    todoInput.focus();
}

// 할 일 토글 함수
function toggleTodo(id) {
    todos = todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    renderTodos();
}

// 할 일 삭제 함수
function deleteTodo(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

// 할 일 필터링 함수
function filterTodos(filter) {
    currentFilter = filter;
    // isPrioritySortActive remains unchanged
    
    filterButtons.forEach(btn => {
        // Check btn.dataset.filter if using data attributes, or match text/id
        // For this setup, we compare the filter parameter with a value derived from the button
        // Assuming buttons are 'all', 'active', 'completed'
        let btnFilterType = 'all'; // Default
        if (btn.textContent.toLowerCase().includes('할 일')) btnFilterType = 'active';
        if (btn.textContent.toLowerCase().includes('완료')) btnFilterType = 'completed';

        if (btnFilterType === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    renderTodos();
}

// 우선순위 정렬 토글 함수
function toggleSortByPriority() {
    if (!isPrioritySortActive) {
        isPrioritySortActive = true;
        prioritySortOrder = 'desc'; // Default to descending on first activation
    } else {
        // If already active, just toggle direction
        prioritySortOrder = prioritySortOrder === 'desc' ? 'asc' : 'desc';
    }
    renderTodos();
}

// 할 일 목록 렌더링 함수
function renderTodos() {
    let filteredTodos = [];
    
    switch(currentFilter) {
        case 'active':
            filteredTodos = todos.filter(todo => !todo.completed);
            break;
        case 'completed':
            filteredTodos = todos.filter(todo => todo.completed);
            break;
        default: // 'all'
            filteredTodos = [...todos];
    }

    // 우선순위 정렬 적용
    if (isPrioritySortActive) {
        const priorityOrderMap = { 'high': 1, 'medium': 2, 'low': 3 };
        filteredTodos.sort((a, b) => {
            const priorityA = priorityOrderMap[a.priority];
            const priorityB = priorityOrderMap[b.priority];
            if (prioritySortOrder === 'desc') {
                return priorityA - priorityB; // High (1) comes before Low (3)
            } else { // 'asc'
                return priorityB - priorityA; // Low (3) comes before High (1)
            }
        });
    }
    
    todoList.innerHTML = filteredTodos.map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}">
            <input 
                type="checkbox" 
                ${todo.completed ? 'checked' : ''} 
                onchange="toggleTodo(${todo.id})"
            >
            <span class="todo-text">${todo.text}</span>
            ${todo.deadline ? `<span class="todo-deadline">마감일: ${todo.deadline}</span>` : ''}
            <span class="todo-priority priority-${todo.priority.toLowerCase()}">Priority: ${todo.priority}</span>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">삭제</button>
        </li>
    `).join('');
    
    // 정렬 버튼 상태 업데이트
    if (sortPriorityBtn) { // Ensure button exists
        if (isPrioritySortActive) {
            sortPriorityBtn.classList.add('active');
            sortPriorityBtn.textContent = `우선순위 정렬 (${prioritySortOrder === 'desc' ? '높음순' : '낮음순'})`;
        } else {
            sortPriorityBtn.classList.remove('active');
            sortPriorityBtn.textContent = '우선순위 정렬';
        }
    }
    
    // 할 일 개수 표시
    const activeCount = todos.filter(todo => !todo.completed).length;
    const totalCount = todos.length;
    
    const counter = document.createElement('div');
    counter.className = 'todo-counter';
    counter.textContent = `총 ${totalCount}개 중 ${activeCount}개 남음`;
    
    const existingCounter = document.querySelector('.todo-counter');
    if (existingCounter) {
        existingCounter.remove();
    }
    todoList.after(counter);
}

// 로컬 스토리지에 할 일 저장
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// 로컬 스토리지에서 할 일 불러오기
function loadTodos() {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
        const loadedData = JSON.parse(savedTodos);
        todos = loadedData.map(todo => {
            const newTodo = { ...todo }; // Create a shallow copy to ensure mutability
            if (typeof newTodo.priority === 'undefined') {
                newTodo.priority = 'medium';
            }
            if (typeof newTodo.deadline === 'undefined') {
                newTodo.deadline = null; // Default deadline to null
            }
            return newTodo;
        });
    }
}

// 엔터 키로 할 일 추가
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// 드래그 앤 드롭 기능 (추가 기능 - Not part of this task, kept as is)
let draggedItem = null;
document.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('todo-item')) {
        draggedItem = e.target;
        e.target.style.opacity = '0.5';
    }
});
document.addEventListener('mousemove', (e) => {
    if (!draggedItem) return;
    draggedItem.style.position = 'absolute';
    draggedItem.style.left = (e.pageX - draggedItem.offsetWidth / 2) + 'px';
    draggedItem.style.top = (e.pageY - draggedItem.offsetHeight / 2) + 'px';
});
document.addEventListener('mouseup', (e) => {
    if (draggedItem) {
        draggedItem.style.opacity = '1';
        draggedItem.style.position = 'static';
        draggedItem = null;
        // Simplified, actual reordering logic would be more complex
    }
});
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.todo-item:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}
function handleDragStart(e) { e.target.classList.add('dragging'); }
function handleDragEnd(e) { e.target.classList.remove('dragging'); }
