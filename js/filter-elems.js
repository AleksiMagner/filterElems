class ItemsFiltering {
	constructor(userOptions) {
		const DEFAULTS = {
			'Items container': '', // class or id
			'Filter container': '', // class. '' - disabled function (default)
			'Filter groups': false, // default: false. Filters can be combined from all button groups. Each buttons group has 'data-filter-group' attribute
			'Filter type': 'radio', // 'radio' or 'toggle'. Default: 'radio'
															// 'radio' - select only one filter. Radio buttons or items with their imitation
															// 'toggle' - select multiple filters. Checkboxes or elements with their imitation
			'Sort buttons class': '', // class. '' - disabled function (default). For the button type 'list', the class is indicated by the main tag, for example, <select>. For individual buttons, the class is indicated on the buttons themselves
			'Sort button type': 'list', // 'list' for dropdown options or 'button' for individual buttons
			'User functions': {}, // function should return a condition for the IF statement
			'Count class': '', // class. '' - disabled function (default). Display of the counter of the selected elements
			'Format count': 'n / N' // n - displayed number of elements; N - total number of elements
		};

		this.options = Object.assign(DEFAULTS, userOptions);

		this.groupName = {};
		this.userFunctions = [];
		this.duration = '.4s';
		this.timer;

		this.init();
	}

	init() {
		if (this.options['Filter container'] != '') {
			this.setCount();
			this.setButtonListener();
		}

		if (this.options['Sort buttons class'] != '') { this.sort_init(); }
	}

	// Collecting group names into an object. Set all filter buttons to click tracking
	setButtonListener() {
		document.querySelectorAll(this.options['Filter container']).forEach(filterGroup => {
			if (filterGroup.dataset.filterGroup) { this.groupName[filterGroup.dataset.filterGroup] = null; }

			filterGroup.querySelectorAll('[data-filter]').forEach(filter => {
				filter.addEventListener('click', () => {
					if (this.options['Filter type'] == 'radio' && filter.classList.contains('active')) { return; }
					this.getFilterGroup(filter);
				})
			})
		})
	}

	// After click on the button, collecting the filter data and send it to filter the elements
	getFilterGroup(button) {
		if (!button.dataset.filter) { return; }

		let filter = '*';

		// If filter groups are enabled, consider each group separately
		if (this.options['Filter groups'] == true) {
			this.groupName[button.parentElement.dataset.filterGroup] = this.getFilterParams(button, button.parentElement.querySelectorAll('[data-filter]')) || '*';
			filter = this.joinFilterGroups(this.groupName) || '*'; // combine the parameters of all groups into a single
		}
		// if filter groups are disabled, consider all groups as one
		else if (this.options['Filter groups'] == false) {
			filter = this.getFilterParams(button, document.querySelectorAll(`${this.options['Filter container']} [data-filter]`)) || '*';
		}
		filter = this.formatFilterValues(filter) || '*'; // separate functions from classes
		this.itemsFilter(filter); // send the result to filter the elements
	}

	// Getting parameters of active buttons
	getFilterParams(button, selector) {
		if (this.options['Filter type'] == 'radio' && !button.classList.contains('active')) {
			selector.forEach(elem => elem.classList.remove('active')); // remove the active class from all buttons
			button.classList.add('active'); // set the active class for the current button

			if (button.dataset.filter == '*') { return null; }

			return [button.dataset.filter].flatMap(item => item.replace(/\s/g, '').split(',')); // if there are several parameters in one, divide into separate
		}
		else if (this.options['Filter type'] == 'toggle') {
			button.classList.toggle('active'); // switch the current class

			let reset; // reset button
			selector.forEach(button => button.dataset.filter == '*' ? reset = button : null);

			// If there is an active reset button
			if (reset && reset.classList.contains('active')) {
				// Enable filter reset
				if (button.dataset.filter == '*') {
					// remove the active class from all buttons
					selector.forEach(elem => {
						if (elem.checked) { elem.checked = false; }
						elem.classList.remove('active');
					});

					button.classList.add('active'); // set the active class for the current button
					return null;
				}
				// Turn on the filter, cancel the reset button
				else { reset.classList.remove('active'); }
			}

			// Collecting the parameters of the included filters
			let params = [];

			selector.forEach(elem => {
				if (elem.classList.contains('active') && button.dataset.filter != '*') {
					params.push(elem.dataset.filter);
				}
			})
			// If there are several parameters in one, we divide them into separate ones. If there are no filters selected, return null
			return params.length > 0 ? params.flatMap(item => item.replace(/\s/g, '').split(',')) : null;
		}
	}

	// separate functions from classes, check for duplicates
	formatFilterValues(arr) {
		this.userFunctions = [];

		if (arr[0] == '*' || typeof arr == 'string' || arr.length == 0) { return '*'; }

		// select all functions, remove repetitions and not declared in the settings
		this.userFunctions = arr.filter(item => { return !item.includes(':not') && !item.includes('.'); });
		this.userFunctions = this.userFunctions.filter((item, pos) => {
			return this.userFunctions.indexOf(item) == pos && this.options['User functions'][item];
		}).sort();

		// select all classes, delete replays
		arr = arr.filter(item => { return item.includes(':not') || item.includes('.'); });
		arr = arr.filter((item, pos) => { return arr.indexOf(item) == pos; }).sort();

		if (arr.length == 0) { return null; } // if there are no classes left, return null

		return arr;
	}

	// combining the parameters of all groups into a single
	joinFilterGroups(obj) {
		if (Object.keys(obj).length == 0 || typeof obj == 'string') { return null; }

		let cls = [], func = [];

		// look for arrays with parameters and combine all classes into a single parameter
		for (let prop in obj) {
			if (Array.isArray(obj[prop]) && obj[prop].length != 0) {
				func = func.concat(obj[prop].filter(item => { return !item.includes(':not') && !item.includes('.'); }));
				cls = this.joinArr(cls, obj[prop]);
			}
		}
		let result = cls.concat(func);
		return result.length > 0 ? result : null;
	}

	// summation of elements of two arrays
	joinArr(arr1, arr2) {
		let result = [];

		arr2 = arr2.filter(item => { return item.includes(':not') || item.includes('.'); });

		if (arr1.length == 0) { result = arr2; }
		else if (arr2.length == 0) { result = arr1; }
		else if (arr1.length == 0 && arr2.length == 0) { result = []; }
		else {
			for (let item of arr1) { result = result.concat(arr2.map(el => item + el)); }
		}
		result = result.filter((item, pos) => result.indexOf(item) == pos).sort();
		return result;
	}

	itemsFilter(param) {
		let elems = document.querySelectorAll(`${this.options['Items container']} > *`);

		if (param == '*') {
			elems.forEach(item => {
				if (this.userFunctions.length != 0) {
					for (let func of this.userFunctions) {
						if (!this.options['User functions'][func](item)) { return; }
					}
					item.classList.add('show'); // if the item matches the requests of all user functions
				}
				else { item.classList.add('show'); }
			})
		}
		else if (Array.isArray(param)) {
			for (let item of param) {
				document.querySelectorAll(`${this.options['Items container']} > ${item}`).forEach(item => {
					if (this.userFunctions.length != 0) {
						for (let func of this.userFunctions) {
							if (!this.options['User functions'][func](item)) { return; }
						}
						item.classList.add('show'); // if the item matches the requests of all user functions
					}
					else { item.classList.add('show'); }
				})
			}
		}
		this.setStyles(elems);

		clearTimeout(this.timer);
		this.timer = setTimeout(() => this.clearStyles(elems), parseFloat(this.duration) * 1000);
	}

	setStyles(elems) {
		let count = 0; // reset count

		elems.forEach(elem => {
			elem.style.animationDuration = this.duration;

			if (elem.classList.contains('show')) {
				count++;
				elem.style.display = '';
			}
			else { elem.classList.add('hide'); }
		})
		this.setCount(count);
	}

	clearStyles(elems) {
		elems.forEach(elem => {
			elem.style.animationDuration = '';

			if (elem.classList.contains('hide')) { elem.style.display = 'none'; }

			elem.classList.remove('hide', 'show');
			if (elem.getAttribute('class') == '') { elem.removeAttribute('class'); }
			if (elem.getAttribute('style') == '') { elem.removeAttribute('style'); }
		})
	}

	setCount(curCount) {
		if (this.options['Count class'] == '') { return; }

		let count = document.querySelectorAll(`${this.options['Items container']} > *`).length;

		let countFormat = this.options['Format count'];
		countFormat = countFormat.replace('n', curCount == undefined ? count : curCount);
		countFormat = countFormat.replace('N', count);
		document.querySelector(this.options['Count class']).textContent = countFormat;
	}

	sort_init() {
		// if dropdown option
		if (this.options['Sort button type'] == 'list') {
			let sortButton = document.querySelector(this.options['Sort buttons class']);

			if (sortButton.classList.contains('init')) { return; }
			sortButton.classList.add('init');

			sortButton.addEventListener('change', () => {
				let selector, type,
						ascending = false;

				sortButton.querySelectorAll('[data-sort-by]').forEach(option => {
					if (option.selected) {
						if (option.dataset.sortBy == '*') {
							selector = '*';
							type = 'origin';
						}
						else {
							selector = option.dataset.sortBy.replace(/\s/g, '').split(',')[0];
							type = option.dataset.sortBy.replace(/\s/g, '').split(',')[1];

							if (option.dataset.sortAscending != undefined) { ascending = true; }
						}
					}
				})

				this.sortItems(null, selector, type, ascending);
			})
		}
		// if button
		else if (this.options['Sort button type'] == 'button') {
			document.querySelectorAll(this.options['Sort buttons class']).forEach(button => {
				if (button.classList.contains('init')) { return; }
				button.classList.add('init');

				let selector, type, ascending = false;

				if (button.dataset.sortBy == '*') {
					selector = '*';
					type = 'origin';
				}
				else {
					selector = button.dataset.sortBy.replace(/\s/g, '').split(',')[0];
					type = button.dataset.sortBy.replace(/\s/g, '').split(',')[1];

					if (button.dataset.sortAscending != undefined) { ascending = true; }
				}

				button.addEventListener('click', () => this.sortItems(button, selector, type, ascending));
			})
		}
	}

	/*
		button - current button
		selector - the content class inside the element or the class of the element itself
		type - 'number' for sort numbers, 'string' for sort strings or 'date' for sort by newness
		ascending - true (sort ascending) or false (sort descending)
	*/
	sortItems(button, selector, type, ascending) {
		let container = document.querySelector(this.options['Items container']),
				elems = document.querySelectorAll(`${this.options['Items container']} > *`),
				sortArr = Array.prototype.slice.call(elems);

		if (this.origin == undefined) { this.origin = Array.prototype.slice.call(elems); } // save the original positions of the elements

		if (button != null) {
			document.querySelectorAll(this.options['Sort buttons class']).forEach(elem => elem.classList.remove('active')); // remove the active class from all buttons
			button.classList.add('active'); // set the active class for the current button
		}

		switch(type) {
			case 'number':
				if (ascending) {
					sortArr.sort((a, b) => parseFloat(a.querySelector(selector).textContent) - parseFloat(b.querySelector(selector).textContent));
				}
				else {
					sortArr.sort((a, b) => parseFloat(b.querySelector(selector).textContent) - parseFloat(a.querySelector(selector).textContent));
				}
				break;

			case 'string':
				if (ascending) {
					sortArr.sort((a, b) => a.querySelector(selector).textContent > b.querySelector(selector).textContent ? 1 : -1);
				}
				else {
					sortArr.sort((a, b) => b.querySelector(selector).textContent > a.querySelector(selector).textContent ? 1 : -1);
				}
				break;

			case 'date':
				if (!this.options['User functions']['dateFormat']) { return; }

				if (ascending) {
					sortArr.sort((a, b) => new Date(this.options['User functions']['dateFormat'](a.querySelector(selector).textContent)) - new Date(this.options['User functions']['dateFormat'](b.querySelector(selector).textContent)));
				}
				else {
					sortArr.sort((a, b) => new Date(this.options['User functions']['dateFormat'](b.querySelector(selector).textContent)) - new Date(this.options['User functions']['dateFormat'](a.querySelector(selector).textContent)));
				}
				break;

			default:
				sortArr = this.origin;
				break;
		}

		elems.forEach(elem => container.removeChild(elem))
		sortArr.forEach(elem => {
			elem.style.animationDuration = this.duration;
			elem.style.display != 'none' ? elem.classList.add('show') : elem.classList.add('hide');
			container.appendChild(elem);
		})

		clearTimeout(this.timer);
		this.timer = setTimeout(() => this.clearStyles(elems), parseFloat(this.duration) * 1000);
	}

}