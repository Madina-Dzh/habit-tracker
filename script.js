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
        isReady: false
    };

    habits.push(habit); // Добавление объекта в массив привычек
    console.log(habits);
    renderHabits();
}
