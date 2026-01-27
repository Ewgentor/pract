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

    const portfolioTabs = document.querySelectorAll('.portfolio-tab');
    if (portfolioTabs.length > 0) {
        if (portfolioTabs[0]) {
            portfolioTabs[0].classList.add('active', 'bg-white');
        }

        portfolioTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                portfolioTabs.forEach(btn => {
                    btn.classList.remove('active', 'bg-white');
                });
                
                this.classList.add('active', 'bg-white');
            });
        });
    }
});