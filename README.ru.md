Плагин для сортировки и фильтрации элементов без перезагрузки страницы. В отличие от большинства аналогичных плагинов, анимация задаётся в стилях, код минимизирован (~8.5 КБ), благодаря чему увеличена скорость работы и уменьшено потребление ресурсов.

- [x] Не влияет на стилизацию элементов.
- [x] Эффекта Masonry, в большинстве случаев, можно добиться при использовании свойств Grid CSS или Columns.

[Демонстрация](https://aleksimagner.github.io/w/Demo/filterElems/index.html "просмотреть пример работы кода")

## Поддерживаются следующие типы кнопок фильтра:
* radio - выбор только одного фильтра. Радиокнопки или элементы с их имитацией.
* toggle - выбор нескольких фильтров. Чекбоксы или элементы с их имитацией.

## Группировка кнопок
Кнопки могут быть разделены в разные группы, значения в которых считаются раздельно. В этом случае для контейнера каждой группы проставляется атрибут `data-filter-group` с именем группы.

## Фильтрация элементов производится по классам и/или функциям:
* У кнопки задаётся атрибут `data-filter` со значением.
* У элементов проставляются необходимые классы.

## Поддерживаются:
### `*` - сброс параметров
Показать все элементы
```html
<tag data-filter="*">Title button</tag>
```

### Одиночные классы
Например, показать все элементы с классом `.class1`
```html
<tag data-filter=".class1">Title button</tag>
```

### Исключения
Например, показать все элементы, кроме элементов с классом `.class1`
```html
<tag data-filter=":not(.class1)">Title button</tag>
```

### Классы с исключением
Например, показать все элементы с классом `.class1`, которые не содержат класс `.class2`
```html
<tag data-filter=".class1:not(.class2)">Title button</tag>
```

### Объединённые классы
Например, показать все элементы, которые содержат классы `.class1` И `.class2`
```html
<tag data-filter=".class1.class2">Title button</tag>
```

### Перечень классов и/или функций
Например, показать все элементы, которые содержат класс `.class1` ИЛИ `.class2`
```html
<tag data-filter=".class1, .class2">Title button</tag>
```

### Функции
Функции должны возвращать условие для оператора `IF`.
Например, показать все элементы, число которых больше 50
```html
<tag data-filter="func1">Title button</tag>
```

```js
function func1(itemElem) {
  return parseInt(itemElem.querySelector('.num').textContent) > 50;
}
```

## Установка плагина
### Достаточно подключить сам плагин
```js
<script src="filter-elems.min.js"></script>
```

### Инициализировать его и настроить
```js
<script>
  document.addEventListener('DOMContentLoaded', () => {
    new ItemsFiltering({
      'Items container': '.wrap',
      'Filter container': '.filter',
      'Filter groups': false,
      'Filter type': 'radio',
      'Sort buttons class': '.sort',
      'Sort button type': 'list',
      'User functions': { 'dateFormat': dateFormat },
      'Count class': '.filter-count',
      'Format count': 'n из N'
    })

    // Для сортировки дат. Не меняйте название функции. Должна возвращать строку в формате 'YYYY-MM-DD, HH:MM' или 'YYYY-MM-DD'
    function dateFormat(str) {
      // '18.11.2019, 18:19' => '2019-11-18, 18:19'
      let date = str.replace(/\s/g, '').split(',');
      return date[0].split('.').reverse().join('-') + ', ' + date[1];
    }
  })
</script>
```

### Добавить в стили код
```css
.hide,
.show {
  position: relative;
  bottom: 0;
  right: 0;
  -webkit-transition: opacity, width, height, -webkit-transform .2s ease-out;
          transition: opacity, width, height, -webkit-transform .2s ease-out;
          transition: opacity, width, height, transform .2s ease-out;
          transition: opacity, width, height, transform .2s ease-out, -webkit-transform .2s ease-out;
  -webkit-animation: hide ease-in-out forwards 1;
          animation: hide ease-in-out forwards 1;
}
.show {
  animation-direction: alternate-reverse;
}
/* анимация элементов */
@-webkit-keyframes hide {
  to {
    width: 0;
    height: 0;
    opacity: 0;
    -webkit-transform: scale(0);
            transform: scale(0);
  }
}

@keyframes hide {
  to {
    width: 0;
    height: 0;
    opacity: 0;
    -webkit-transform: scale(0);
            transform: scale(0);
  }
}
.active {
  /* стиль выбранного фильтра или кнопки сортировки */
}
```

## Настройки плагина
| Свойства           | Тип        | Описание                                                                                                 | По умолчанию |
| :---               | :---:      | :---                                                                                                     | :---:     |
| Items container    | строка     | Класс или ID контейнера, в котором содержатся элементы для сортировки и фильтрации                       | `''`           |
| Filter container   | строка     | Класс контейнера, в котором содержатся кнопки для фильтрации. Значение по умолчанию отключает фильтрацию | `''`           |
| Filter groups      | логический |  Если группы кнопок включены, каждая группа считается отдельно. В противном случае, все группы считаются как одна. При использовании более 1 группы необходимо каждому контейнеру группы установить атрибут `data-filter-group`                           | `false`   |
| Filter type        | строка     | Тип используемых кнопок фильтрации. Возможны значения `'radio'` или `'toggle'`. `'radio'` - выбор только одного фильтра. Радиокнопки или элементы с их имитацией. `'toggle'` - выбор нескольких фильтров. Чекбоксы или элементы с их имитацией.              | `'radio'` |
| Sort buttons class | строка     | Класс кнопок для сортировки. Значение по умолчанию отключает сортировку. Если кнопка сортировки оформлена списком, например, тегом `<select>`, класс устанавливается для главного тега (`<select>`). Если кнопки сортировки оформлены в виде отдельных кнопок, то класс устанавливается для каждой кнопки                                                                                                  | `''`           |
| Sort button type   | строка     | Тип используемых кнопок сортировки. Возможны значения `'list'` или `'button'`. `'list'` - выпадающие списки, `'button'` - отдельные кнопки.                                                                                                               | `'list'`  |
| User functions     | объект     | Пользовательские функции. При использовании функций для фильтрации, должны возвращать условие для оператора `IF`. Если используется сортировка по датам, должна быть функция с названием `dateFormat`                                                    | `{}`           |
| Count class        | строка     | Класс контейнера, куда будет добавляться значение счётчика отфильтрованных элементов.                    | `''`           |
| Format count       | строка     | Формат счётчика отфильтрованных элементов. `n` - количество отобранных элементов, `N` - общее количество элементов.                                                                                                                                   | `'n / N'`      |
