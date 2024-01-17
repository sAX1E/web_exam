const endpoints = {
    routes: 'http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes?api_key=45e5f6f1-a24c-4ec7-aae9-56a2e9b375aa',
    guides: 'http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/routes/{id-маршрута}/guides?api_key=45e5f6f1-a24c-4ec7-aae9-56a2e9b375aa',
    orders: 'http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders?api_key=45e5f6f1-a24c-4ec7-aae9-56a2e9b375aa'
};

const xhr = new XMLHttpRequest();
let body = {
    guide_id: 0,
    route_id: 0,
    date: '',
    time: '',
    duration: 0,
    persons: 0,
    price: 0,
    optionFirst: false,
    optionSecond: false
};

function sendRequest(method, url, body = null) {
    return new Promise((resolve, reject) => {
        xhr.open(method, url)
        xhr.responseType = 'json'
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
        xhr.onload = () => {
            if (xhr.status >= 400) {
                reject(xhr.response)
            } else {  
                resolve(xhr.response)
            }
        }
        xhr.onerror = () => {
            reject(xhr.response)
        }

        if (body && typeof body === 'object') {
            const encodedData = Object.keys(body)
                .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(body[key]))
                .join('&');
            xhr.send(encodedData);
        } else {
            xhr.send();
        }
    })
}

let currentPage = 1;
const maxRows = 10;
let routesData = [];

function routes(page) {
    const first = (page - 1) * maxRows;
    const last = first + maxRows;
    const routesToDisplay = routesData.slice(first, last);
    const routesTable = document.getElementById('routesTable');

    while (routesTable.rows.length > 1) {
        routesTable.deleteRow(1);
    }

    routesToDisplay.forEach(route => {
        const row = routesTable.insertRow(-1);
        const name = row.insertCell(0);
        const des = row.insertCell(1);
        const main = row.insertCell(2);
        const btn = row.insertCell(3);
        name.innerHTML = route.name;
        des.innerHTML = route.description.length > 80 ? `${route.description.substring(0, 80)}... <a href="#" class="tooltip-wide" data-bs-toggle="tooltip" title="${route.description}">читать полностью</a>` : route.description;
        main.innerHTML = route.mainObject.length > 80 ? `${route.mainObject.substring(0, 80)}... <a href="#" class="tooltip-wide" data-bs-toggle="tooltip" title="${route.mainObject}">читать полностью</a>` : route.mainObject;
        btn.innerHTML = `<button class="btn btn-light" id="selectButton" onclick="selectedRoute(event, '${route.name}', '${route.id}')">Выбрать</button>`;
    });

    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });
}

function createPaginationBtns(totalPages) {
    const paginationContainer = document.getElementById('paginationButtons');
    paginationContainer.innerHTML = '';
    const ul = document.createElement('ul');
    ul.classList.add('pagination');
    ul.className += ' justify-content-center';
  
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.classList.add('page-item');
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.add('page-link');
        button.onclick = function() {
            currentPage = i;
            routes(currentPage);
        };
        li.appendChild(button); 
        ul.appendChild(li);
    }
    paginationContainer.appendChild(ul);
}

function nextBtn() {
    if (currentPage < Math.ceil(routesData.length / maxRows)) {
        currentPage++;
        routes(currentPage);
    }
}

function prevBtn() {
    if (currentPage > 1) {
        currentPage--;
        routes(currentPage);
    }
}

function displayRoutes() {
    sendRequest('GET', endpoints.routes)
    .then(data => {
        routesData = data;
        const totalPages = Math.ceil(routesData.length / maxRows);
        const next = document.getElementById('next');
        const prev = document.getElementById('prev');

        routes(currentPage);
        createPaginationBtns(totalPages);
        next.setAttribute('onclick', 'nextBtn()');
        prev.setAttribute('onclick', 'prevBtn()');
    }) 
}

displayRoutes();

function selectedRoute(event, name, id) {
    const table_td = document.querySelectorAll('#routesTable td');
    const table_btn = document.querySelectorAll('#routesTable button');
    const table_a = document.querySelectorAll('#routesTable a');
    const orderBtn = document.getElementById('orderBtn');
    let selected = event.target.parentElement.parentElement;
    var activeGuides = document.querySelector('.guides');
    const modifiedGuidesApi = endpoints.guides.replace('{id-маршрута}', `${id}`);

    table_td.forEach(row => {
        row.style.backgroundColor = '';
    });

    table_btn.forEach(row => {
        row.style.backgroundColor = '';
    });

    table_a.forEach(row => {
        row.style.backgroundColor = '';
    });

    selected.querySelectorAll('*').forEach(child => {
        child.style.backgroundColor = '#c8c8c8';
    });

    orderBtn.classList.add('disabled');
    activeGuides.classList.add('active');
    document.querySelector('#routeName').innerText = `${name}`;

    sendRequest('GET', modifiedGuidesApi)
    .then(data => {
        const guidesTable = document.getElementById('guidesTable');

        while (guidesTable.rows.length > 1) {
            guidesTable.deleteRow(1);
        }   
        
        data.forEach(guide => {
            const row = guidesTable.insertRow(-1);
            const photo = row.insertCell(0);
            const name = row.insertCell(1);
            const lang = row.insertCell(2);
            const exp = row.insertCell(3);
            const price = row.insertCell(4);
            const btn = row.insertCell(5);

            photo.innerHTML = `<i class="bi bi-file-person" style="font-size: 25px !important;"></i>`;
            name.innerHTML = guide.name;
            lang.innerHTML = guide.language;
            exp.innerHTML = guide.workExperience;
            price.innerHTML = `${guide.pricePerHour} руб.`;
            btn.innerHTML = `<button class="btn btn-light" id="selectButton" onclick="selectedGuide(event, '${name}', '${guide.name}', '${id}', '${guide.id}', '${guide.pricePerHour}')">Выбрать</button>`;
        });
    })
}

let startingPrice = 0;
const quantity = document.getElementById("quantity");
const option1 = document.getElementById("option1");
const option2 = document.getElementById("option2");
const duration = document.getElementById("duration");
const time = document.getElementById("time");
const date = document.getElementById("date");
const totalCost = document.getElementById("totalCost");
const sendButton = document.getElementById('send');

function selectedGuide(event, routeName, guideName, routeId, guideId, price) {
    const table_td = document.querySelectorAll('#guidesTable td');
    const table_btn = document.querySelectorAll('#guidesTable button');
    const table_a = document.querySelectorAll('#guidesTable a');
    const table_svg = document.querySelectorAll('#guidesTable svg');
    const orderBtn = document.getElementById('orderBtn');
    let selected = event.target.parentElement.parentElement;

    table_td.forEach(row => {
        row.style.backgroundColor = '';
    });

    table_btn.forEach(row => {
        row.style.backgroundColor = '';
    });

    table_a.forEach(row => {
        row.style.backgroundColor = '';
    });

    table_svg.forEach(row => {
        row.style.backgroundColor = '';
    });

    selected.querySelectorAll('*').forEach(child => {
        child.style.backgroundColor = '#c8c8c8';
    });

    document.querySelector('#guideName').innerText = `${guideName}`;
    document.querySelector('#routeName1').innerText = `${routeName}`;
    orderBtn.classList.remove('disabled');

    startingPrice = parseInt(price);
    body.guide_id = parseInt(guideId);
    body.route_id = parseInt(routeId);
    totalCost.innerHTML = `${parseInt(startingPrice)} руб.`;
}

function excludingDates() {
    var today = new Date();
    var dd = today.getDate() + 1;
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if(dd < 10){
      dd='0' + dd
    } 
    if(mm < 10){
      mm='0' + mm
    } 
    today = yyyy + '-' + mm + '-' + dd;
    document.getElementById("date").setAttribute("min", today);
    document.getElementById("date").setAttribute("value", today);
}

excludingDates();

function calculateTotalPrice(guideCost) {
    const persons = parseInt(quantity.value);
    let increase = 0;

    if (persons > 5 && persons <= 10) {
        increase = 1000;
    } else if (persons > 10 && persons <= 20) {
        increase = 1500;
    }

    const durationValue = duration.value;
    const selectedDate = new Date(date.value);
    const selectedTime = new Date(`1970-01-01T${time.value}:00`);
    const hours = ('0' + selectedTime.getHours()).slice(-2);
    const minutes = ('0' + selectedTime.getMinutes()).slice(-2);
    const week = selectedDate.getDay();

    let totalPrice = guideCost * durationValue + increase;

    if (week === 6 || week === 0) {
        totalPrice = (1.5 * guideCost * durationValue) + increase;
    }

    if (option1.checked) {
        totalPrice *= 0.75;
        body.optionFirst = true;
    }

    if  (option2.checked) {
        body.optionSecond = true;
        if (week === 6 || week === 0) {
            totalPrice *= 1.25;
        }
        else {
            totalPrice *= 1.30;
        }
    }

    if (selectedTime.getHours() >= 9 && selectedTime.getHours() < 12) {
        totalPrice += 400;
    }

    body.date = selectedDate.toISOString().split('T')[0];
    body.time = `${hours}:${minutes}`;
    body.duration = parseInt(durationValue);
    body.persons = parseInt(persons);
    body.price = parseInt(totalPrice);

    totalCost.innerHTML = `${parseInt(totalPrice)} руб.`;
}

function store() { 
    calculateTotalPrice(startingPrice);
}

quantity.addEventListener('input', store);
date.addEventListener('input', store);
time.addEventListener('input', store);
option1.addEventListener('click', store);
option2.addEventListener('click', store);
duration.addEventListener('change', store);    
sendButton.addEventListener('submit', send);

function send(event) {
    event.preventDefault();
    sendRequest('POST', endpoints.orders, body)
    .then(response => {
        console.log('Order placed successfully:', response);

        const alert = document.getElementById('alert');
        alert.classList.add('active');
        setTimeout(() => {
            alert.classList.remove('active');
        }, 5000);
        console.log(body);
    })
    .catch(error => {
        console.error('Error placing order:', error);
    });
}
