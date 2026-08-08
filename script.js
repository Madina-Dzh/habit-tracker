let habits = []; // массив с привычками
const addHabit_button = document.getElementById('addHabit_button');

// функция очищает контейнер списка и рисует карточки по массиву habits
function renderHabits() {
    const wrapper = document.getElementById('habbit-wrapper'); // контейнер со списком привычек 
    wrapper.innerHTML = '';

    // перебор всей привычек
    habits.forEach((habit) => {
        // создание блока карточки
        const newHabit = document.createElement('div');
        newHabit.setAttribute('id', habit.id)
        newHabit.classList.add('habbit-el');

        // создание тега span с текстом
        const spanHabit = document.createElement('span');
        spanHabit.textContent = habit.text;

        // Включение текста и радиокнопки в привычку
        newHabit.appendChild(spanHabit);

        // Включение привычки в контейнер
        wrapper.appendChild(newHabit);
    });

    if (habits.length === 0) {
        wrapper.textContent = 'Пока нет привычек - создай первую';
    }
}

// кнопка заглушка "Добавить"
addHabit_button.onclick = function () {
    const valHabit = document.getElementById('valHabit_input'); // получить текст для привычки
    const typeGoal = document.getElementById('type_select');
    const goalCount = document.getElementById('goal_input');

    // Создание объекта привычка
    const habit = {
        id: Date.now(),
        text: valHabit.value,
        type: typeGoal.value,
        goal: goalCount.value,
        history =[],
        isReady: false
    };

    habits.push(habit); // Добавление объекта в массив привычек

    renderHabits();
    saveHabits();
    console.log(habits);
}

// Выгрузка данных их хранилища при перезагрузке
document.addEventListener('DOMContentLoaded', function () {
    const storedData = localStorage.getItem('habits');
    if (storedData === null) {
        // Если данных нет
        habits = [];
        console.log('Данных нет');
    }
    else {
        habits = JSON.parse(storedData);
        console.log(habits);
    };

    renderHabits();
});

function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

// получить сегоднящнюю дату в формате YYYY-MM-DD
function formatDateISO(date = new Date()) {
    return date.toISOString().split('T');
}

// определить, отмечена ли привычка сегодня
function markDetectionToday(habit) {
    const today = formatDateISO();
    if (habit.history.length > 0) {
        return habit.history.some((h) => h === today)
    }
    else return false
}