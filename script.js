let habits = [];// массив с привычками

// функция очищает контейнер списка и рисует карточки по массиву habits
function renderHabits() {
    const wrapper = document.getElementById('habbit-wrapper'); // контейнер со списком привычек 
    wrapper.innerHTML = '';

    // перебор всей привычек
    habits.forEach(h => {
        // создание блока карточки
        const newHabit = document.createElement('div');
        newHabit.classList.add('habbit-el');

        // создание тега span с текстом
        const spanHabit = document.createElement('span');
        spanHabit.textContent = habits[h];

        // создание радиокнопки
        const radioButtonHabit = document.createElement('input');
        radioButtonHabit.setAttribute('type', 'checkbox');
        radioButtonHabit.classList.add('checkbox');

        // Включение текста и радиокнопки в привычку
        newHabit.appendChild(spanHabit);
        newHabit.appendChild(radioButtonHabit);

        // Включение привычки в контейнер
        wrapper.appendChild(newHabit);
    });

}