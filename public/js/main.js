// Основной JavaScript файл
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Bootstrap компонентов и другая логика
    console.log('Приложение загружено');
    
    // Фильтрация по группам
    const groupSelect = document.getElementById('group');
    if (groupSelect) {
        groupSelect.addEventListener('change', function() {
            const selectedGroup = this.value;
            const url = new URL(window.location.href);
            if (selectedGroup === 'Все группы') {
                url.searchParams.delete('group');
            } else {
                url.searchParams.set('group', selectedGroup);
            }
            window.location.href = url.toString();
        });
    }
});