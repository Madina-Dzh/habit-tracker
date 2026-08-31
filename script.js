// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====

let habits = []; // массив с привычками
const addHabit_button = document.getElementById('addHabit_button');
const wrapper = document.getElementById('habit-wrapper'); // контейнер со списком привычек 
const editModal = document.getElementById('edit-modal');


// ===== УТИЛИТЫ (чистые функции)=====


// получить сегоднящнюю дату в формате YYYY-MM-DD
function formatDateISO(date = new Date()) {
    return date.toISOString().split('T')[0];
}

// расчитывает прогресс для каждой привычки
function calcProgress(habit, date = formatDateISO()) {
    const record = habit.history.find(h => h.date === date);

    if (!record) return 0;

    const done = record.value;
    return Math.min(100, Math.round((done / habit.goal) * 100));
}

// Сохранение состояния
function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

// определить, отмечена ли привычка сегодня
function markDetectionToday(habit) {
    const today = formatDateISO();
    if (habit.history.length > 0) {
        return habit.history.some(h => h.date === today)
    }
    else return false
}

// подсчёт выполненных сегодня привычек
function calcCompletedToday() {
    let count = 0;
    const today = formatDateISO();
    habits.forEach(habit => {
        const record = habit.history.find(h => h.date === today);
        if (record && record.value >= parseInt(habit.goal)) {
            count++;
        };
    });
    return count;
}

// для подсчёта средней доли выполнения за последние 7 дней
function calcAvg7Days() {
    let totalSum = 0;
    habits.forEach(habit => {
        let currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 7);
        let count = 0;
        let procent = 0;

        for (let i = 7; i > 0; i--) {
            currentDate.setDate(currentDate.getDate() + 1);
            const progress = calcProgress(habit, formatDateISO(currentDate));
            if (progress > 0) {
                procent += progress;
                count++;
            }
        }
        totalSum += procent / 7;
    });
    return Math.round(totalSum / habits.length * 100) / 100;
}

// отсчёт longest streak для привычки
function calcLongestStreak(habit) {
    let count = 0;
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 7);
    for (let i = 7; i > 1; i--) {
        currentDate.setDate(currentDate.getDate() + 1);
        const progress = calcProgress(habit, formatDateISO(currentDate));
        if (progress === 100) count++;
        else count = 0;
    }
    if (calcProgress(habit) === 100) count++;
    return count;
}

// найти привычку с самым долгим longest streak
function findMaxLongestStreak() {
    let max = -100;
    let index = -1;
    habits.forEach((habit, i) => {
        const streak = calcLongestStreak(habit)
        if (streak > max) {
            max = streak;
            index = i;
        }
    });
    return index;
}


// ===== ЛОГИКА РАБОТЫ С ДАННЫМИ =====

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

// при нажатии на привычку
wrapper.addEventListener('click', function (event) {
    const clickedElement = event.target;
    const habitEl = clickedElement.closest('.habit-el');
    const habitID = habitEl.id;
    const today = formatDateISO();
    const minutes = habitEl.querySelector('.num-minutes');

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
                habit.history[index].value = minutes.value;
            }
            else {
                habit.history.push({ date: today, value: minutes })
            }
        }
        saveHabits();
        renderHabits();
        recordStatistics();
    }

    // Нажата кнопка "Удалить"
    if (clickedElement.classList.contains('del-btn')) {
        let index = habits.findIndex(habit => habit.id === parseInt(habitID))
        let textHabit = habits[index].text;
        console.log(textHabit);
        if (confirm(`Удалить привычку "${textHabit}"`)) {
            if (index !== -1) {
                habits.splice(index, 1);
                saveHabits();
                renderHabits();
            }
        }
    }

    // нажата кнопка "Изменить"
    if (clickedElement.classList.contains('btn-edit')) {
        let index = habits.findIndex(habit => habit.id === parseInt(habitID));

        renderEditModal(habits[index]);
    }
})

// Кнопка сохранения изменений
function saveChanges(id, text, type, goal) {
    let countToday = document.getElementById('countMarkToday');
    let index = habits.findIndex(habit => habit.id === parseInt(id));
    habits[index].text = text;
    habits[index].type = type;
    habits[index].goal = goal;
    let today = formatDateISO();
    if (habits[index].history.some((h) => h.date === today)) {
        habits[index].history[habits[index].history.length - 1].value = countToday.value;
    }
    else {
        habits[index].history.push({ date: today, value: countToday.value });
    }
    saveHabits();
    closeEditModal();
    renderHabits();
}


// ===== ОТРИСОВКА (UI) =====


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

        // Кнопка изменения задачи
        const btnEdit = document.createElement('button');
        btnEdit.textContent = 'Изменить';
        btnEdit.classList.add('right');
        btnEdit.classList.add('btn-edit');
        newHabit.appendChild(btnEdit);

        // Создание кнопки удаления 
        const btnDel = document.createElement('button');
        btnDel.textContent = 'Удалить';
        btnDel.classList.add('del-btn');
        btnDel.classList.add('right');
        newHabit.appendChild(btnDel);

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

            const record = habit.history.find(h => h.date === formatDateISO());
            if (record) inputMinutes.value = record.value;
            newHabit.appendChild(inputMinutes);
        }

        // Включение привычки в контейнер
        wrapper.appendChild(newHabit);
    });

    if (habits.length === 0) {
        wrapper.textContent = 'Пока нет привычек - создай первую';
    }
}

//заполнение полей статистики
function recordStatistics() {
    const numCompletedspan = document.getElementById('number-completed');
    const sevenDaysCmopletedSpan = document.getElementById('seven-days-completed');
    const longestStreakSpan = document.getElementById('longest-streak');

    numCompletedspan.textContent = 'Сегодня выполнено: ' + calcCompletedToday();
    sevenDaysCmopletedSpan.textContent = 'За неделю выполнено: ' + calcAvg7Days() + '%';
    longestStreakSpan.textContent = 'Лучший стрик: ' + calcLongestStreak(habits[findMaxLongestStreak()]);
}

// окно редактирования
function renderEditModal(habit) {
    editModal.classList.remove('hidden');
    editModal.innerHTML = "";

    const labelName = document.createElement('label');
    labelName.setAttribute('for', 'editText');
    labelName.textContent = 'Название:';
    editModal.appendChild(labelName);

    const inputName = document.createElement('input');
    inputName.setAttribute('type', 'text');
    inputName.setAttribute('id', 'editText');
    inputName.setAttribute('placeholder', 'Введите название');
    inputName.setAttribute('value', habit.text);
    editModal.appendChild(inputName);

    const labelType = document.createElement('label');
    labelType.setAttribute('for', 'editType');
    labelType.textContent = 'Тип:';
    editModal.appendChild(labelType);

    // Настроить предопределенный вариант
    const selectType = document.createElement('select');
    selectType.setAttribute('id', 'editType');
    selectType.setAttribute('value', habit.type);
    const optionOnce = document.createElement('option');
    optionOnce.setAttribute('value', 'once')
    optionOnce.textContent = 'Сделать 1 раз';
    selectType.appendChild(optionOnce);
    const optionX = document.createElement('option');
    optionX.setAttribute('value', 'x')
    optionX.textContent = 'X раз в день';
    selectType.appendChild(optionX);
    const optionN = document.createElement('option');
    optionN.setAttribute('value', 'n')
    optionN.textContent = 'N минут';
    selectType.appendChild(optionN);

    const targetText = habit.type; // Замените на нужный текст

    // Ищем опцию
    for (let i = 0; i < selectType.options.length; i++) {
        if (selectType.options[i].value == targetText) {
            // Устанавливаем выбранным
            selectType.selectedIndex = i;
            break; // Прекращаем поиск, если нашли
        }
    }

    editModal.appendChild(selectType);

    const labelGoal = document.createElement('label');
    labelGoal.setAttribute('for', 'editGoal');
    labelGoal.textContent = 'Цель на день:';
    editModal.appendChild(labelGoal);

    const inputGoal = document.createElement('input');
    inputGoal.setAttribute('id', 'editGoal');
    inputGoal.setAttribute('type', 'number');
    inputGoal.setAttribute('value', habit.goal);
    editModal.appendChild(inputGoal);

    if (habit.type === 'once') {
        const labelStatus = document.createElement('label');
        labelStatus.setAttribute('for', 'countMarkToday');
        labelStatus.textContent = 'Статус задачи:'
        editModal.appendChild(labelStatus);

        // Настроить предопределенный вариант
        const selectStatus = document.createElement('select');
        selectStatus.setAttribute('id', 'countMarkToday')

        const optionTrue = document.createElement('option');
        optionTrue.setAttribute('value', '1');
        optionTrue.textContent = 'Выполнено';
        selectStatus.appendChild(optionTrue)
        const optionFalse = document.createElement('option');
        optionFalse.setAttribute('value', '0');
        optionFalse.textContent = 'Невыполнено';
        selectStatus.appendChild(optionFalse);
        editModal.appendChild(selectStatus);

        const todayISO = formatDateISO();
        const record = habit.history.find(h => h.date === todayISO);

        // Если запись есть И она выполнена — ставим «Выполнено», иначе «Невыполнено»
        if (record && (record.value === 1 || record.value === '1')) {
            selectStatus.value = '1'; // «Выполнено»
        } else {
            selectStatus.value = '0'; // «Невыполнено»
        }
        
    }
    else {
        const labelMarkToday = document.createElement('label');
        labelMarkToday.setAttribute('for', 'countMarkToday');
        labelMarkToday.textContent = 'Выполнено сегодня:'
        editModal.appendChild(labelMarkToday);

        const inputMarkToday = document.createElement('input');
        inputMarkToday.setAttribute('id', 'countMarkToday');
        inputMarkToday.setAttribute('type', 'number');
        const record = habit.history.find(h => h.date === formatDateISO());
        if (!record) inputMarkToday.setAttribute('value', 0)
        else inputMarkToday.setAttribute('value', record.value)
        editModal.appendChild(inputMarkToday);

        countToday = inputMarkToday.value;
    }

    const buttonClose = document.createElement('button');
    buttonClose.onclick = function () {
        closeEditModal();
    };
    buttonClose.textContent = 'Закрыть';
    editModal.appendChild(buttonClose);
    const buttonSave = document.createElement('button');
    buttonSave.onclick = function () {
        saveChanges(habit.id, inputName.value, selectType.value, inputGoal.value);
    }
    buttonSave.textContent = 'Сохранить';
    editModal.appendChild(buttonSave);

    editModal.setAttribute('class', 'ModalWindow');
}

// функция для закрытия модального окна
function closeEditModal() {
    editModal.innerHTML = "";
    editModal.classList.add('hidden');
}

// ===== Инициализация =====


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
    recordStatistics();
});