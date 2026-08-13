let habits = []; // массив с привычками
const addHabit_button = document.getElementById('addHabit_button');
const wrapper = document.getElementById('habit-wrapper'); // контейнер со списком привычек 

// функция очищает контейнер списка и рисует карточки по массиву habits
function renderHabits() {
    wrapper.innerHTML = '';

    // перебор всей привычек
    habits.forEach((habit) => {
        // создание блока карточки
        const newHabit = document.createElement('div');
        newHabit.setAttribute('id', habit.id)
        newHabit.classList.add('habit-el');

        // создание тега span с текстом
        const spanHabit = document.createElement('span');
        spanHabit.textContent = habit.text;
        newHabit.appendChild(spanHabit);

        // Создание кнопки "Сделано сегодня"
        const btnMark = document.createElement('button');
        btnMark.textContent = 'Сделано сегодня';
        btnMark.classList.add('mark-btn');
        btnMark.classList.add('right');

        newHabit.appendChild(btnMark);

        // Создание прогресс бара
        const progressBar = document.createElement('progress');
        progressBar.classList.add('right');
        progressBar.setAttribute('max', '100');
        progressBar.setAttribute('value', calcProgress(habit));
        newHabit.appendChild(progressBar);

        // Создание поля для ввода минут
        if (habit.type === 'n') {
            const inputMinutes = document.createElement('input');
            inputMinutes.setAttribute('type', 'number');
            inputMinutes.setAttribute('placeholder', 'Количество минут');
            inputMinutes.classList.add('num-minutes');
            inputMinutes.classList.add('right');
            newHabit.appendChild(inputMinutes);
        }

        // Включение привычки в контейнер
        wrapper.appendChild(newHabit);
    });

    if (habits.length === 0) {
        wrapper.textContent = 'Пока нет привычек - создай первую';
    }
}

// расчитывает прогресс для каждой привычки
function calcProgress(habit) {
    const today = formatDateISO();
    const record = habit.history.find(h => h.date === today);

    // Если записи за сегодня нет — прогресс 0
    if (!record) return 0;

    const done = record.value; // вот это число, которое нужно
    return Math.min(100, Math.round((done / habit.goal) * 100));
}

// кнопка заглушка "Добавить"
addHabit_button.onclick = function () {
    const valHabit = document.getElementById('valHabit_input'); // получить текст для привычки
    const typeGoal = document.getElementById('type_select');
    const goalCount = document.getElementById('goal_input');
    if (goalCount.value === '') goalCount.value = 1;

    // Создание объекта привычка
    const habit = {
        id: Date.now(),
        text: valHabit.value,
        type: typeGoal.value,
        goal: goalCount.value,
        history: [],
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
    return date.toISOString().split('T')[0];
}

// определить, отмечена ли привычка сегодня
function markDetectionToday(habit) {
    const today = formatDateISO();
    if (habit.history.length > 0) {
        return habit.history.some((h) => h === today)
    }
    else return false
}

// при нажатии на привычку
wrapper.addEventListener('click', function (event) {
    const clickedElement = event.target;
    const habitEl = clickedElement.closest('.habit-el');
    const habitID = habitEl.id;
    const today = formatDateISO();
    const minute = 10; // В будущем брать из поля ввода в привычке

    // Нажата кнопка "Сделано сегодня"
    if (clickedElement.classList.contains('mark-btn')) {
        // Логика нажатия на кнопку
        const habit = habits.find(h => h.id == habitID);

        if (habit.type === 'once') {
            if (habit.history.some((h) => h.date === today)) {
                alert('Эта привычка уже отмечена сегодня');
            }
            else {
                habit.history.push({ date: today, value: 1 });
            }
        }
        else if (habit.type === 'x') {
            // Логика x раз
            if (habit.history.some((h) => h.date === today)) {
                let index = habit.history.findIndex(item => item.date === today); // Индекс записи в истории сегодня
                habit.history[index].value = habit.history[index].value + 1;
            }
            else {
                habit.history.push({ date: today, value: 1 })
            }
        }
        else {
            // Логика n Minute сделать
            if (habit.history.some((h) => h.date === today)) {
                let index = habit.history.findIndex(item => item.date === today); // Индекс записи в истории сегодня
                habit.history[index].value = habit.history[index].value + minute;
            }
            else {
                habit.history.push({ date: today, value: minute })
            }
        }
        saveHabits();
        renderHabits();
    }
})