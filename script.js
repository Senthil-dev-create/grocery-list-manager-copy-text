document.addEventListener('DOMContentLoaded', () => {
    const createListForm = document.getElementById('createListForm');
    const addItemForm = document.getElementById('addItemForm');
    const homePage = document.getElementById('homePage');
    const createPage = document.getElementById('createPage');
    const selectPage = document.getElementById('selectPage');
    const listPage = document.getElementById('listPage');
    const listTitle = document.getElementById('listHeader');
    const homeNav = document.getElementById('homeNav');
    const createNav = document.getElementById('createNav');
    const selectListNav = document.getElementById('selectListNav');
    const listNav = document.getElementById('listNav');
    const existingListSelect = document.getElementById('existingListSelect');
    const deleteListButton = document.getElementById('deleteListButton');
    const backToHomeButton = document.getElementById('backToHomeButton');
    const copyListBtn = document.getElementById('copyListBtn');
    const pagination = document.getElementById('pagination');

    // Initialize the app by displaying the home page
    homePage.classList.remove('d-none');

    // Event listener for form submission to create a new list
    createListForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const listName = document.getElementById('listName').value.trim().toUpperCase();
        const dateCreated = new Date().toISOString().split('T')[0]; // Get date in YYYY-MM-DD format
        if (listName) {
            const lists = JSON.parse(localStorage.getItem('lists')) || {};
            lists[listName] = { dateCreated, items: [] };
            localStorage.setItem('lists', JSON.stringify(lists));
            alert(`List "${listName}" created successfully!`);
            createListForm.reset();
            populateExistingLists();
        }
    });

    // Event listener for selecting an existing list
    existingListSelect.addEventListener('change', () => {
        const selectedList = existingListSelect.value;
        if (selectedList) {
            localStorage.setItem('currentListName', selectedList);
            displayCurrentList();
        }
    });

    // Event listener for form submission to add an item to the list
    addItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const itemName = document.getElementById('itemName').value.trim().toUpperCase();
        const itemQuantity = document.getElementById('itemQuantity').value;
        const itemUnit = document.getElementById('itemUnit').value;
        const itemCategory = document.getElementById('itemCategory').value.toUpperCase();
        if (itemName && itemQuantity && itemCategory && itemUnit) {
            const currentListName = localStorage.getItem('currentListName');
            const lists = JSON.parse(localStorage.getItem('lists')) || {};
            if (currentListName && lists[currentListName]) {
                lists[currentListName].items.push({ name: itemName, quantity: itemQuantity, unit: itemUnit, category: itemCategory, checked: false });
                localStorage.setItem('lists', JSON.stringify(lists));
                alert(`Item "${itemName}" (${itemQuantity} ${itemUnit}) added successfully!`);
                displayCurrentList();
                addItemForm.reset();
            }
        }
    });

    // Function to populate existing lists in the select dropdown
    function populateExistingLists() {
        const lists = JSON.parse(localStorage.getItem('lists')) || {};
        existingListSelect.innerHTML = '<option value="" disabled selected>Select a list</option>';
        for (const listName in lists) {
            if (lists.hasOwnProperty(listName)) {
                const option = document.createElement('option');
                option.value = listName;
                option.textContent = listName;
                existingListSelect.appendChild(option);
            }
        }
    }

    // Function to display the current list
    function displayCurrentList() {
        const currentListName = localStorage.getItem('currentListName');
        if (!currentListName) return; // Ensure a list is selected
        listTitle.textContent = currentListName;
        const lists = JSON.parse(localStorage.getItem('lists')) || {};
        const currentList = lists[currentListName] ? lists[currentListName].items : [];
        const itemTableBody = document.querySelector('#itemTable tbody');
        itemTableBody.innerHTML = '';
        if (currentList.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="6" class="text-center">No items found</td>';
            itemTableBody.appendChild(row);
        } else {
            // Sort items so checked items are at the bottom
            currentList.sort((a, b) => a.checked - b.checked);
            currentList.forEach((item, index) => {
                const row = document.createElement('tr');
                row.classList.toggle('checked-item', item.checked); // Highlight checked items
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.unit}</td>
                    <td>${item.category}</td>
                    <td><button class="btn btn-danger btn-sm" onclick="removeItem('${currentListName}', ${index})"><i class="fas fa-trash-alt"></i></button></td>
                    <td><input type="checkbox" class="item-checkbox" data-list="${currentListName}" data-index="${index}" ${item.checked ? 'checked' : ''}></td>
                `;
                itemTableBody.appendChild(row);
            });
        }

        // Add event listeners to checkboxes
        const checkboxes = document.querySelectorAll('.item-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const listName = e.target.dataset.list;
                const index = e.target.dataset.index;
                toggleItemChecked(listName, index, e.target.checked);
            });
        });
    }

    // Function to toggle the checked status of an item
    function toggleItemChecked(listName, index, isChecked) {
        const lists = JSON.parse(localStorage.getItem('lists')) || {};
        lists[listName].items[index].checked = isChecked;
        localStorage.setItem('lists', JSON.stringify(lists));
        displayCurrentList();
    }

    // Function to remove an item from the list
    window.removeItem = function(listName, index) {
        const lists = JSON.parse(localStorage.getItem('lists')) || {};
        const currentList = lists[listName].items;
        currentList.splice(index, 1);
        localStorage.setItem('lists', JSON.stringify(lists));
        displayCurrentList();
    }

    // Event listener to navigate back to the home page
    backToHomeButton.addEventListener('click', () => {
        homePage.classList.remove('d-none');
        createPage.classList.add('d-none');
        selectPage.classList.add('d-none');
        listPage.classList.add('d-none');
    });

    // Event listeners for navbar links
    homeNav.addEventListener('click', () => {
        homePage.classList.remove('d-none');
        createPage.classList.add('d-none');
        selectPage.classList.add('d-none');
        listPage.classList.add('d-none');
    });

    createNav.addEventListener('click', () => {
        homePage.classList.add('d-none');
        createPage.classList.remove('d-none');
        selectPage.classList.add('d-none');
        listPage.classList.add('d-none');
    });

    selectListNav.addEventListener('click', () => {
        homePage.classList.add('d-none');
        createPage.classList.add('d-none');
        selectPage.classList.remove('d-none');
        listPage.classList.add('d-none');
    });

    listNav.addEventListener('click', () => {
        homePage.classList.add('d-none');
        createPage.classList.add('d-none');
        selectPage.classList.add('d-none');
        listPage.classList.remove('d-none');
        displayCurrentList(); // Ensure the list is updated when viewing current list
        displayPagination();
    });

    // Event listener to copy the list to the clipboard
    copyListBtn.addEventListener('click', () => {
        const itemTableBody = document.querySelector('#itemTable tbody');
        const range = document.createRange();
        range.selectNode(itemTableBody);
        window.getSelection().removeAllRanges(); // clear current selection
        window.getSelection().addRange(range); // to select text
        try {
            document.execCommand('copy');
            alert('List copied to clipboard!');
        } catch (err) {
            alert('Failed to copy!');
        }
        window.getSelection().removeAllRanges(); // to deselect
    });

    // Function to delete a list
    deleteListButton.addEventListener('click', () => {
        const selectedList = existingListSelect.value;
        if (selectedList) {
            const lists = JSON.parse(localStorage.getItem('lists')) || {};
            delete lists[selectedList];
            localStorage.setItem('lists', JSON.stringify(lists));
            alert(`List "${selectedList}" deleted successfully!`);
            populateExistingLists();
            if (localStorage.getItem('currentListName') === selectedList) {
                localStorage.removeItem('currentListName');
                homePage.classList
                              .remove('d-none');
            }
        }
    });

    // Function to display the pagination
    function displayPagination() {
        const lists = JSON.parse(localStorage.getItem('lists')) || {};
        const dates = [...new Set(Object.values(lists).map(list => list.dateCreated))];
        pagination.innerHTML = '';
        dates.forEach((date, index) => {
            const pageButton = document.createElement('button');
            pageButton.textContent = `Page ${index + 1} (${date})`;
            pageButton.classList.add('btn', 'btn-secondary', 'mr-2');
            pageButton.addEventListener('click', () => displayListsByDate(date));
            pagination.appendChild(pageButton);
        });
    }

    // Function to display lists by date
    function displayListsByDate(date) {
        const lists = JSON.parse(localStorage.getItem('lists')) || {};
        const listsByDate = Object.entries(lists).filter(([name, list]) => list.dateCreated === date);
        const itemTableBody = document.querySelector('#itemTable tbody');
        itemTableBody.innerHTML = '';
        listsByDate.forEach(([name, list]) => {
            const headerRow = document.createElement('tr');
            headerRow.innerHTML = `<td colspan="6" class="text-center bg-primary text-white">${name}</td>`;
            itemTableBody.appendChild(headerRow);
            list.items.forEach((item, index) => {
                const row = document.createElement('tr');
                row.classList.toggle('checked-item', item.checked); // Highlight checked items
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.unit}</td>
                    <td>${item.category}</td>
                    <td><button class="btn btn-danger btn-sm" onclick="removeItem('${name}', ${index})"><i class="fas fa-trash-alt"></i></button></td>
                    <td><input type="checkbox" class="item-checkbox" data-list="${name}" data-index="${index}" ${item.checked ? 'checked' : ''}></td>
                `;
                itemTableBody.appendChild(row);
            });
        });

        // Add event listeners to checkboxes
        const checkboxes = document.querySelectorAll('.item-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const listName = e.target.dataset.list;
                const index = e.target.dataset.index;
                toggleItemChecked(listName, index, e.target.checked);
            });
        });
    }

    // Initialize the app by displaying existing lists and current list if it exists
    populateExistingLists();
    if (localStorage.getItem('currentListName')) {
        displayCurrentList();
    }
});
