// 할 일 목록을 저장할 배열
let todos = [];
let currentFilter = 'all';

// DOM 요소 가져오기
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');
const filterButtons = document.querySelectorAll('.filter-btn');

// 페이지 로드 시 저장된 할 일 목록 불러오기
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    renderTodos();
});

// 할 일 추가 함수
function addTodo() {
    const text = todoInput.value.trim();
    if (text === '') return;

    const newTodo = {
        id: Date.now(),
        text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    todos.push(newTodo);
    saveTodos();
    renderTodos();
    todoInput.value = '';
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
    
    // 필터 버튼 활성화 상태 업데이트
    filterButtons.forEach(btn => {
        if (btn.textContent.toLowerCase() === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    renderTodos();
}

// 할 일 목록 렌더링 함수
function renderTodos() {
    let filteredTodos = [];
    
    // 필터에 따라 할 일 필터링
    switch(currentFilter) {
        case 'active':
            filteredTodos = todos.filter(todo => !todo.completed);
            break;
        case 'completed':
            filteredTodos = todos.filter(todo => todo.completed);
            break;
        default:
            filteredTodos = [...todos];
    }
    
    // 할 일 목록 렌더링
    todoList.innerHTML = filteredTodos.map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}">
            <input 
                type="checkbox" 
                ${todo.completed ? 'checked' : ''} 
                onchange="toggleTodo(${todo.id})"
            >
            <span class="todo-text">${todo.text}</span>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">삭제</button>
        </li>
    `).join('');
    
    // 할 일 개수 표시
    const activeCount = todos.filter(todo => !todo.completed).length;
    const totalCount = todos.length;
    
    const counter = document.createElement('div');
    counter.className = 'todo-counter';
    counter.textContent = `총 ${totalCount}개 중 ${activeCount}개 남음`;
    
    // 이미 카운터가 있으면 제거하고 새로 추가
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
        todos = JSON.parse(savedTodos);
    }
}

// 엔터 키로 할 일 추가
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// 드래그 앤 드롭 기능 (추가 기능)
let draggedItem = null;

document.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('todo-item')) {
        draggedItem = e.target;
        e.target.style.opacity = '0.5';
    }
});

document.addEventListener('mousemove', (e) => {
    if (!draggedItem) return;
    
    // 드래그 중인 아이템의 위치 업데이트
    draggedItem.style.position = 'absolute';
    draggedItem.style.left = (e.pageX - draggedItem.offsetWidth / 2) + 'px';
    draggedItem.style.top = (e.pageY - draggedItem.offsetHeight / 2) + 'px';
});

document.addEventListener('mouseup', (e) => {
    if (draggedItem) {
        draggedItem.style.opacity = '1';
        draggedItem.style.position = 'static';
        draggedItem = null;
        
        // 드롭 위치에 따라 할 일 순서 변경 (간단한 예시)
        // 실제로는 더 복잡한 로직이 필요할 수 있음
        const afterElement = getDragAfterElement(todoList, e.clientY);
        const todoElement = document.querySelector('.dragging');
        if (afterElement == null) {
            todoList.appendChild(todoElement);
        } else {
            todoList.insertBefore(todoElement, afterElement);
        }
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

// 드래그 중인 요소에 클래스 추가
function handleDragStart(e) {
    e.target.classList.add('dragging');
}

// 드래그 종료 시 클래스 제거
function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}
