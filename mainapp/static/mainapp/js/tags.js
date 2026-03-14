document.addEventListener('DOMContentLoaded', function() {
    const tagInput = document.querySelector('.tag-input');
    if (!tagInput) return;

    // Загружаем существующие теги из JSON
    let existingTags = [];
    fetch('/tags/json/')
        .then(response => response.json())
        .then(data => {
            existingTags = data.map(tag => tag.name);
        })
        .catch(error => console.error('Ошибка загрузки тегов:', error));

    // Создаем контейнер для отображения тегов как chips
    const wrapper = document.createElement('div');
    wrapper.className = 'tag-chips-wrapper';
    tagInput.parentNode.insertBefore(wrapper, tagInput.nextSibling);

    // Функция для обновления отображения тегов
    function updateTagDisplay() {
        wrapper.innerHTML = '';
        const tags = tagInput.value.split(',').map(t => t.trim()).filter(t => t);
        
        tags.forEach(tag => {
            const chip = document.createElement('span');
            chip.className = 'tag-chip';
            chip.textContent = tag;
            
            const removeBtn = document.createElement('span');
            removeBtn.className = 'tag-remove';
            removeBtn.textContent = '×';
            removeBtn.onclick = function() {
                const currentTags = tagInput.value.split(',').map(t => t.trim()).filter(t => t);
                const index = currentTags.indexOf(tag);
                if (index > -1) {
                    currentTags.splice(index, 1);
                    tagInput.value = currentTags.join(', ');
                    updateTagDisplay();
                }
            };
            
            chip.appendChild(removeBtn);
            wrapper.appendChild(chip);
        });
    }

    // Обновляем отображение при изменении значения
    tagInput.addEventListener('input', updateTagDisplay);

    // Автодополнение
    const autocomplete = document.createElement('div');
    autocomplete.className = 'autocomplete-dropdown';
    autocomplete.style.position = 'absolute';
    autocomplete.style.background = 'white';
    autocomplete.style.border = '1px solid #ddd';
    autocomplete.style.borderTop = 'none';
    autocomplete.style.maxHeight = '200px';
    autocomplete.style.overflowY = 'auto';
    autocomplete.style.display = 'none';
    autocomplete.style.zIndex = '1000';
    
    const formGroup = tagInput.closest('.form-group') || tagInput.parentNode;
    formGroup.style.position = 'relative';
    formGroup.appendChild(autocomplete);

    tagInput.addEventListener('input', function() {
        const value = this.value.trim();
        if (!value) {
            autocomplete.style.display = 'none';
            return;
        }

        const lastPart = value.split(',').pop().trim();
        if (!lastPart) {
            autocomplete.style.display = 'none';
            return;
        }

        const matches = existingTags.filter(tag => 
            tag.toLowerCase().startsWith(lastPart.toLowerCase()) && 
            !value.split(',').map(t => t.trim()).includes(tag)
        );

        if (matches.length > 0) {
            autocomplete.innerHTML = matches.map(tag => 
                `<div class="autocomplete-item" data-tag="${tag}">${tag}</div>`
            ).join('');
            autocomplete.style.display = 'block';
            
            // Позиционируем под полем ввода
            const rect = tagInput.getBoundingClientRect();
            const formGroupRect = formGroup.getBoundingClientRect();
            autocomplete.style.width = rect.width + 'px';
            autocomplete.style.top = (rect.bottom - formGroupRect.top) + 'px';
            autocomplete.style.left = '0';
        } else {
            autocomplete.style.display = 'none';
        }
    });

    // Выбор тега из автодополнения
    autocomplete.addEventListener('click', function(e) {
        if (e.target.classList.contains('autocomplete-item')) {
            e.preventDefault();
            const selectedTag = e.target.getAttribute('data-tag');
            const currentTags = tagInput.value.split(',').map(t => t.trim()).filter(t => t);
            currentTags.push(selectedTag);
            tagInput.value = currentTags.join(', ');
            updateTagDisplay();
            autocomplete.style.display = 'none';
            tagInput.focus();
        }
    });

    // Скрытие автодополнения при клике вне его
    document.addEventListener('click', function(e) {
        if (!formGroup.contains(e.target)) {
            autocomplete.style.display = 'none';
        }
    });

    // Инициализация отображения при загрузке
    updateTagDisplay();
});