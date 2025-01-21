document.addEventListener('DOMContentLoaded', function () {
  // Получение товаров
  fetchInventory();

  // Настроим кнопку для добавления товара
  document.getElementById('addItemButton').addEventListener('click', openAddModal);
});

let currentPage = 1;  // Текущая страница
const itemsPerPage = 10;  // Количество товаров на одной странице
let currentSortBy = null;  // Текущая сортировка
let inventoryData = [];  // Сохранение всех товаров
let searchQuery = ''; // Сохранение поискового запроса

function fetchInventory() {
  fetch('http://localhost:3000/inventory')
    .then(response => response.json())
    .then(data => {
      inventoryData = data;  // Сохраняем все товары
      displayInventory();  // Отобразим товары
      setupSortSelect();  // Настроим сортировку
      setupSearch();      // Настроим поиск
      setupPagination();  // Настроим пагинацию
    })
    .catch(err => console.error('Ошибка при загрузке товаров:', err));
}

function openAddModal() {
  // Открываем модальное окно для добавления товара
  const addModal = document.getElementById('addModal');
  addModal.style.display = 'flex';
}

function closeAddModal() {
  // Закрываем модальное окно для добавления товара
  const addModal = document.getElementById('addModal');
  addModal.style.display = 'none';
}

function setupPagination() {
  const totalPages = Math.ceil(filteredInventory().length / itemsPerPage);  // Общее количество страниц
  const paginationContainer = document.getElementById('pagination');  // Элемент для пагинации
  paginationContainer.innerHTML = '';  // Очищаем предыдущие кнопки пагинации

  // Добавляем кнопки пагинации
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.onclick = () => {
      currentPage = i;  // Устанавливаем текущую страницу
      displayInventory();  // Перерисовываем товары для новой страницы с учетом сортировки
    };
    paginationContainer.appendChild(pageButton);
  }
}

function filteredInventory() {
  let filteredItems = [...inventoryData];  // Копируем все товары

  // Фильтруем по поисковому запросу
  if (searchQuery) {
    filteredItems = filteredItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  // Применяем сортировку, если она была установлена
  if (currentSortBy) {
    filteredItems = sortInventory(currentSortBy, filteredItems);  // Сортируем товары
  }

  return filteredItems;  // Возвращаем отфильтрованные и отсортированные товары
}

function displayInventory() {
  const inventoryList = document.getElementById('inventory-list');
  inventoryList.innerHTML = '';  // Очищаем таблицу перед заполнением

  // Получаем отфильтрованные и отсортированные товары
  const itemsToDisplay = filteredInventory();

  // Находим индекс начальной и конечной строки для текущей страницы
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = itemsToDisplay.slice(startIndex, endIndex);  // Сегментируем данные для текущей страницы

  currentItems.forEach(item => {
    const row = document.createElement('tr');  // Создаем новую строку

    // Создаем ячейки для каждого поля товара
    const nameCell = document.createElement('td');
    nameCell.textContent = item.name;
    row.appendChild(nameCell);

    const quantityCell = document.createElement('td');
    quantityCell.textContent = item.quantity;
    row.appendChild(quantityCell);

    const priceCell = document.createElement('td');
    priceCell.textContent = item.price;
    row.appendChild(priceCell);

    const statusCell = document.createElement('td');
    statusCell.textContent = item.status === 'available' ? 'Доступен' : 'Нет в наличии';
    row.appendChild(statusCell);

    const employeeCell = document.createElement('td');
    employeeCell.textContent = item.employee;
    row.appendChild(employeeCell);

    const dateCell = document.createElement('td');
    dateCell.textContent = item.dateAdded;
    row.appendChild(dateCell);

    // Создаем ячейку для действий (например, редактировать или удалить)
    const actionsCell = document.createElement('td');
    const editButton = document.createElement('button');
    editButton.textContent = 'Редактировать';
    editButton.onclick = () => openEditModal(item);
    actionsCell.appendChild(editButton);
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Удалить';
    deleteButton.onclick = () => openDeleteModal(item);
    actionsCell.appendChild(deleteButton);

    row.appendChild(actionsCell);

    // Добавляем строку в таблицу
    inventoryList.appendChild(row);
  });

  setupPagination();  // Настроим пагинацию для отображенных товаров
}

function setupSortSelect() {
  const sortSelect = document.getElementById('sortSelect');
  
  // Добавляем обработчик события изменения выбора сортировки
  sortSelect.addEventListener('change', (e) => {
    const sortBy = e.target.value;
    currentSortBy = sortBy;  // Сохраняем текущую сортировку
    displayInventory();  // Перерисовываем товары с учётом сортировки и пагинации
  });
}

function sortInventory(sortBy, inventory) {
  if (sortBy === 'name') {
    return inventory.sort((a, b) => a.name.localeCompare(b.name));  // По названию
  } else if (sortBy === 'price') {
    return inventory.sort((a, b) => a.price - b.price);  // По цене
  } else if (sortBy === 'quantity') {
    return inventory.sort((a, b) => a.quantity - b.quantity);  // По количеству
  }
  return inventory;  // Если сортировка не выбрана, возвращаем данные без изменений
}

function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  
  // Добавляем обработчик события изменения поиска
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;  // Сохраняем поисковый запрос
    currentPage = 1;  // Сбрасываем на первую страницу при изменении поискового запроса
    displayInventory(); // Отображаем товары с учетом поиска и пагинации
  });
}

function openEditModal(item) {
  // Открываем модальное окно для редактирования товара
  const editModal = document.getElementById('editModal');
  editModal.style.display = 'flex';

  // Заполняем поля формы в модальном окне данными о товаре
  document.getElementById('editName').value = item.name;
  document.getElementById('editQuantity').value = item.quantity;
  document.getElementById('editPrice').value = item.price;
  document.getElementById('editStatus').value = item.status;
  document.getElementById('editEmployee').value = item.employee;

  // Привязываем ID товара к форме, чтобы использовать его при отправке запроса
  document.getElementById('editItemForm').dataset.id = item.id;
}

function closeEditModal() {
  // Закрываем модальное окно для редактирования товара
  const editModal = document.getElementById('editModal');
  editModal.style.display = 'none';
}

function editItem(id) {
  // Получаем обновленные данные из формы
  const updatedItem = {
    name: document.getElementById('editName').value,
    quantity: parseInt(document.getElementById('editQuantity').value),
    price: parseFloat(document.getElementById('editPrice').value),
    status: document.getElementById('editStatus').value,
    employee: document.getElementById('editEmployee').value,
    dateAdded: new Date().toLocaleDateString(),  // Дата добавления
  };

  // Отправляем данные на сервер для обновления товара
  fetch(`http://localhost:3000/inventory/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedItem),
  })
    .then(response => response.json())
    .then(data => {
      console.log('Товар обновлен:', data);

      // Закрываем модальное окно
      closeEditModal();

      // Получаем обновленный список товаров и отображаем
      fetchInventory(); // Загружаем актуальный список товаров
    })
    .catch(err => console.error('Ошибка при обновлении товара:', err));
}

document.getElementById('editItemForm').addEventListener('submit', function (event) {
  event.preventDefault(); // Отменяем стандартное поведение формы (перезагрузку страницы)

  // Получаем ID товара, который редактируем
  const id = document.getElementById('editItemForm').dataset.id;

  // Вызываем функцию для редактирования товара
  editItem(id);
});

function openDeleteModal(item) {
  // Открываем модальное окно для подтверждения удаления
  const deleteModal = document.getElementById('deleteModal');
  deleteModal.style.display = 'flex';

  // Привязываем ID товара к кнопке подтверждения
  document.getElementById('confirmDeleteButton').onclick = () => deleteItem(item.id);
}

function closeDeleteModal() {
  // Закрываем модальное окно для подтверждения удаления
  const deleteModal = document.getElementById('deleteModal');
  deleteModal.style.display = 'none';
}

function deleteItem(id) {
  // Отправляем запрос на удаление товара с сервера
  fetch(`http://localhost:3000/inventory/${id}`, {
    method: 'DELETE',
  })
    .then(response => {
      if (response.ok) {
        console.log('Товар удален');

        // Закрываем модальное окно
        closeDeleteModal();

        // Получаем обновленный список товаров и отображаем
        fetchInventory(); // Загружаем актуальный список товаров
      } else {
        console.error('Ошибка при удалении товара');
      }
    })
    .catch(err => console.error('Ошибка при удалении товара:', err));
}

document.getElementById('addItemForm').addEventListener('submit', function (event) {
  event.preventDefault(); // Отменяем стандартное поведение формы (перезагрузку страницы)

  const newItem = {
    name: document.getElementById('addName').value,
    quantity: parseInt(document.getElementById('addQuantity').value),
    price: parseFloat(document.getElementById('addPrice').value),
    status: document.getElementById('addStatus').value,
    employee: document.getElementById('addEmployee').value,
    dateAdded: new Date().toLocaleDateString(),  // Дата добавления
  };

  // Отправляем запрос на добавление товара на сервер
  fetch('http://localhost:3000/inventory', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newItem),
  })
    .then(response => response.json())
    .then(data => {
      console.log('Товар добавлен:', data);

      // Закрываем модальное окно
      closeAddModal();

      // Получаем обновленный список товаров и отображаем
      fetchInventory(); // Загружаем актуальный список товаров
    })
    .catch(err => console.error('Ошибка при добавлении товара:', err));
});
