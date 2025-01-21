const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');  // Добавляем поддержку CORS

const app = express();
const port = 3000;

// Путь к файлу с товарами
const inventoryFilePath = path.join(__dirname, 'inventory.json');

// Миддлвар для парсинга JSON тела запроса
app.use(express.json());
app.use(cors());  // Разрешаем кросс-доменные запросы

// Функция для чтения товаров из файла
const readInventory = () => {
  try {
    const data = fs.readFileSync(inventoryFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Ошибка при чтении файла:', error);
    return [];
  }
};

// Функция для записи обновленного списка товаров в JSON файл
const saveInventory = (inventory) => {
  try {
    fs.writeFileSync(inventoryFilePath, JSON.stringify(inventory, null, 2), 'utf8');
  } catch (error) {
    console.error('Ошибка при записи в файл:', error);
  }
};

// Маршрут для получения списка товаров с фильтрацией и сортировкой
app.get('/inventory', (req, res) => {
  
  const { search, sortBy } = req.query;

  // Загружаем товары из файла
  let inventory = readInventory();

  // Фильтрация по названию
  if (search) {
    inventory = inventory.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Сортировка
  if (sortBy === 'name') {
    inventory.sort((a, b) => a.name.localeCompare(b.name));  // По названию
  } else if (sortBy === 'price') {
    inventory.sort((a, b) => b.price - a.price);  // По цене (убывание)
  } else if (sortBy === 'quantity') {
    inventory.sort((a, b) => b.quantity - a.quantity);  // По количеству (убывание)
  }

  // Отправляем результат
  res.json(inventory);
});

// Маршрут для получения товара по ID
app.get('/inventory/:id', (req, res) => {
  const { id } = req.params;  // Получаем id из URL
  let inventory = readInventory();
  const item = inventory.find(item => item.id === id);  // Ищем товар по ID

  if (item) {
    res.json(item); // Отправляем товар, если он найден
  } else {
    res.status(404).json({ message: 'Товар не найден' }); // Если товар не найден, возвращаем 404
  }
});

// Маршрут для удаления товара
app.delete('/inventory/:id', (req, res) => {
  const { id } = req.params;
  let inventory = readInventory();

  // Ищем индекс товара с таким ID
  const itemIndex = inventory.findIndex(item => item.id === id);

  if (itemIndex !== -1) {
    // Удаляем товар
    inventory.splice(itemIndex, 1);

    // Перезаписываем файл с обновленным списком товаров
    saveInventory(inventory);

    res.status(200).send('Товар удален');
  } else {
    res.status(404).send('Товар не найден');
  }
});

// Маршрут для добавления нового товара
app.post('/inventory', (req, res) => {
  const newItem = req.body; // Получаем данные нового товара

  // Загружаем текущий список товаров
  let inventory = readInventory();

  // Находим максимальный ID среди всех товаров
  const maxId = inventory.reduce((max, item) => Math.max(max, parseInt(item.id)), 0);

  // Генерация нового ID на основе максимального (инкрементируем)
  newItem.id = (maxId + 1).toString(); // Преобразуем в строку, если нужно

  // Добавляем новый товар в список
  inventory.push(newItem);

  // Перезаписываем файл с обновленным списком товаров
  saveInventory(inventory);

  // Отправляем успешный ответ
  res.status(201).json(newItem);
});

// Маршрут для обновления товара по ID
app.put('/inventory/:id', (req, res) => {
  const { id } = req.params;  // Получаем id товара из URL

  let inventory = readInventory();
  const updatedItem = req.body;

  // Если ID в JSON строковые, то не нужно преобразовывать в число, просто сравниваем строки
  const index = inventory.findIndex(item => item.id === id);

  if (index !== -1) {
    inventory[index] = { ...inventory[index], ...updatedItem };
    saveInventory(inventory);  // Обновляем данные в файле
    res.json(inventory[index]);
  } else {
    res.status(404).json({ message: 'Товар не найден' });
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});