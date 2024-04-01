// Массив со стикерами на доске
let stickers_text = {};
// Уникальный номер последнего стикера
let last_index = 0;
// Массив с завершенными стикерами в чаше
let stickers_finished = {};

// Максимальное количество стикеров в чаше
const max_finished_stickers = 7;
// Текущее количество стикеров в чаше
let count_finished_stickers = 0;

//Загрузим сохраненные стикеры из памяти браузера
loadState();

//Найдем элемент с идентификатором add-sticker-button - это кнопка добавлния нового стикера
const add_sticker_button = document.querySelector('#add-sticker-button');
//Добавим обработчик нажатия кнопки добавлния нового стикера
add_sticker_button.addEventListener('click', () => {
    const new_sticker_text = document.querySelector('#new-sticker-text');
    new_text = new_sticker_text.value;
    //Если текст стикера добавлен, то 
    if (new_text) {
        //то добавим стикер на доску и в массив стикеров
        add_sticker_on_canban(new_text);
        new_sticker_text.value = "";
    } else {
        //или иначе выведем сообщение
        alert("Вы ничего не ввели!");
    }
});

/** добавление стикера на доску и в массив стикеров*/
function add_sticker_on_canban(new_text) {
    stickers_text[last_index] = new_text;
    show_sticker_on_canban(new_text, last_index);
    last_index++;

    //сохраним текущее состояние в память браузера
    saveState();
}

/** отображение стикера на доске */
function show_sticker_on_canban(new_text, index) {
    //Получим область для стикеров - элемент с классом canban-stickers
    let stickers = document.querySelector(".canban-stickers");
    // Создадим новый элемент для стикера. Укажем для него класс и идентификатор
    let sticker = document.createElement("div");
    sticker.setAttribute("class", "canban-sticker");
    sticker.setAttribute("id", "canban-sticker" + index);

    //Укажем для стикера элементы для вывода текста и кнопки-галочки
    sticker.innerHTML = "<p class='canban-sticker__text'>" + new_text + "</p>";
    sticker.innerHTML += "<a class='canban-sticker__finished_button' id='canban-sticker__finished_button-" + index + "' stickerIndex=" + index + ">&#10003;</a>";

    //Добавим стикера как HTML-элемент на доску
    stickers.append(sticker);

    //Добавим на кнопку-галочку обработчик клика по ней. Обработчик вызовет функцию move_sticker_to_progress(), которая переместит стикер с доски в чашу и из массива стикеров в массив завершенных стикеров. Затем функция saveState() сохранит текущее состояние в память браузера
    const finished_button = document.querySelector('#canban-sticker__finished_button-' + index);
    finished_button.addEventListener('click', function (e) {
        let sticker_index = e.target.getAttribute("stickerIndex");
        move_sticker_to_progress(e.target.parentElement, sticker_index);
        saveState();
        return false;
    });
}

/** перемещение стикера с доски в чашу прогресса */
function move_sticker_to_progress(sticker, index) {

    //1. убираем стикер с доски плавно в течение 1 секунды
    sticker.classList.add("removing");
    setTimeout(() => sticker.remove(), 1000);

    //2. добавляем стикер в массив заверешнных стикеров и отображаем в чаше
    add_sticker_on_progress(index);

    //3. убираем стикер из массива стикеров
    delete stickers_text[index];
    count_finished_stickers++;

    //Проверяем, не заполнилась ли чаша?
    is_max_finished_stickers();
}

//Функция проверки заполненности чаши завершенными стикерами.
function is_max_finished_stickers() {
    //Если текущее количсевто завершенных стикеров достигло максимума
    if (count_finished_stickers >= max_finished_stickers) {
        // то через секунду выведем сообщение и очистим чашу от стикеров
        setTimeout(() => {
            alert("Поздравляем! Вы заполнили чашу прогресса! Насладитесь отдыхом и приступайте к новым задачам");
            for (let index in stickers_finished) {
                const sticker = document.querySelector('#canban-sticker-finished-' + index);
                sticker.classList.add("removing");
                setTimeout(() => sticker.remove(), 1000);
                delete stickers_finished[index];
            }
            count_finished_stickers = 0;
            saveState();
        }, 1000);
    }
}

/** Функция добавления стикера в чашу прогресса*/
function add_sticker_on_progress(index) {
    //1. добавляем стикер в массив заверешнных стикеров
    stickers_finished[index] = stickers_text[index];

    //3. отображаем стикер в чаше завершенных стикеров
    show_sticker_on_progress(stickers_finished[index], index);
    saveState();
}

/** Функция отображения стикера в чаше прогресса*/
function show_sticker_on_progress(new_sticker_text, index) {
    let progress = document.querySelector(".canban-progress");
    let sticker = document.createElement("div");
    sticker.setAttribute("class", "canban-sticker-finished");
    sticker.setAttribute("id", "canban-sticker-finished-" + index);
    add_html = "<div class='canban-sticker-finished__background'>";
    add_html += "<div class='canban-sticker-finished__text' stickerIndex=" + index + ">" + new_sticker_text + "</div>";
    add_html += "</div>";
    sticker.innerHTML = add_html;
    progress.append(sticker);
}

/** Функция сохранения стикера в локальное хранилище браузера */
function saveState() {
    localStorage.setItem("stickers_text", JSON.stringify(stickers_text));
    localStorage.setItem("stickers_finished", JSON.stringify(stickers_finished));
    localStorage.setItem("last_index", last_index);
    localStorage.setItem("count_finished_stickers", count_finished_stickers);
    console.log("saveState", stickers_text, stickers_finished, last_index, count_finished_stickers);
}

/** Функция загрузки стикеров из локального хранилища браузера и отобразить их */
function loadState() {
    stickers_text = JSON.parse(localStorage.getItem("stickers_text"));
    stickers_text ??= {};
    stickers_finished = JSON.parse(localStorage.getItem("stickers_finished"));
    stickers_finished ??= {};
    last_index = localStorage.getItem("last_index");
    last_index ??= 0;
    count_finished_stickers = localStorage.getItem("count_finished_stickers");
    count_finished_stickers ??= 0;
    console.log("loadStates", stickers_text, stickers_finished, last_index, count_finished_stickers);

    show_all_sticker_on_canban();
    show_all_sticker_on_progress();
}

/** Функция отображения всех стикеров на доске */
function show_all_sticker_on_canban() {
    let stickers = document.querySelector(".canban-stickers");
    stickers.innerHTML = "";
    for (const index in stickers_text) {
        show_sticker_on_canban(stickers_text[index], index);
    }
}

/** Функция отображения всех стикеров в чаше прогресса */
function show_all_sticker_on_progress() {
    let progress = document.querySelector(".canban-progress");
    progress.innerHTML = "";
    for (const index in stickers_finished) {
        show_sticker_on_progress(stickers_finished[index], index);
    }
}