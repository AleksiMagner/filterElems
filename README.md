Plugin for sorting and filtering items without reloading the page. Unlike most similar plug-ins, animation is set in styles, the code is minimized (~ 8.5 KB), which increases the speed of work and reduces the consumption of resources.

- [x] Doesn`t affect the styling of elements.
- [x] The Masonry effect, in most cases, can be achieved using the CSS Grid or Columns properties.

[DEMO](https://aleksimagner.github.io/w/Demo/filterElems/index.html "view code example")

## The following types of filter buttons are supported:
* radio - select only one filter. Radio buttons or items with their imitation.
* toggle - select multiple filters. Checkboxes or elements with their imitation.

## Button Grouping
Buttons can be divided into different groups, the values ​​of which are considered separately. In this case, the attribute `data-filter-group` with the name of the group is affixed to the container of each group.

## Elements are filtered by classes and / or functions:
* The button has the `data-filter` attribute with a value.
* Set the necessary classes to elements.

## Are supported:
### `*` - reset
Show all items
```html
<tag data-filter="*">Title button</tag>
```

### Single classes
For example, show all items with class `.class1`
```html
<tag data-filter=".class1">Title button</tag>
```

### Exceptions
For example, show all items, except elements with class `.class1`
```html
<tag data-filter=":not(.class1)">Title button</tag>
```

### Classes with exception
For example, show all items with class `.class1` and not containing class `.class2`
```html
<tag data-filter=".class1:not(.class2)">Title button</tag>
```

### Joint classes
For example, show all items containing classes `.class1` AND `.class2`
```html
<tag data-filter=".class1.class2">Title button</tag>
```

### List of classes and / or functions
For example, show all items containing class `.class1` OR `.class2`
```html
<tag data-filter=".class1, .class2">Title button</tag>
```

### Functions
Function should return a condition for the `IF` statement.
For example, show all items, number of which is more than 50
```html
<tag data-filter="func1">Title button</tag>
```

```js
function func1(itemElem) {
  return parseInt(itemElem.querySelector('.num').textContent) > 50;
}
```

## Plugin installation
### It is enough to connect the plugin itself
```js
<script src="filter-elems.min.js"></script>
```

### Initialize it and configure
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
      'Format count': 'n from N'
    })

    // To sort dates. Do not change the name of the function. Should return a string in the format 'YYYY-MM-DD, HH:MM' or 'YYYY-MM-DD'
    function dateFormat(str) {
      // '18.11.2019, 18:19' => '2019-11-18, 18:19'
      let date = str.replace(/\s/g, '').split(',');
      return date[0].split('.').reverse().join('-') + ', ' + date[1];
    }
  })
</script>
```

### Add code to styles
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
/* element animation */
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
  /* active filter or sort button */
}
```

## Plugin settings
| Properties           | Type    | Description                                                                                          | Default   |
| :---                 | :---:   | :---                                                                                                 | :---:     |
| Items container    | string  | Class or ID of the container that contains the items to sort and filter.                             | `''`      |
| Filter container   | string  | The container class that contains the buttons for filtering. The default value disables filtering.   | `''`      |
| Filter groups      | boolean |  If button groups are enabled, each group is considered separately. Otherwise, all groups are considered as one. When using more than 1 group, it is necessary for each container of the group to set the attribute `data-filter-group`                  | `false`   |
| Filter type        | string  | The type of filter buttons used. Possible values `'radio'` or `'toggle'`. `'radio'` - select only one filter. Radio buttons or items with their imitation. `'toggle'` - select multiple filters. Checkboxes or elements with their imitation.         | `'radio'` |
| Sort buttons class | string  | Class of buttons for sorting. The default value disables sorting. If the sort button is designed with a list, for example, with the `<select>` tag, the class is set for the main tag (`<select>`). If the sort buttons are designed as separate buttons, then the class is set for each button                                                                                                            | `''`      |
| Sort button type   | string  | Type of sorting buttons used. Possible values `'list'` or `'button'`. `'list'` for dropdown options, `'button'` for individual buttons.                                                                                                                 | `'list'`  |
| User functions     | object  | Custom functions. When using functions for filtering, should return a condition for the `IF` statement. If date sorting is used, there should be a function called `dateFormat`                                                                         | `{}`      |
| Count class        | string  | The container class where the counter value of the filtered elements will be added.                    | `''`          |
| Format count       | string  | Format of the counter of the filtered elements. `n` - displayed number of elements, `N` - total number of elements.                                                                                                                               | `'n / N'` |
