// Основной JavaScript файл
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Bootstrap компонентов и другая логика
    console.log('Приложение загружено');

    // Логика для отчётов - переключение между групповым и индивидуальным отчётом
    const reportTypeRadios = document.querySelectorAll('input[name="reportType"]');
    const reportGroupSelect = document.getElementById('report-group');
    const individualStudentSection = document.getElementById('individual-student-section');
    const reportStudentSelect = document.getElementById('report-student');

    if (reportTypeRadios.length > 0) {
        const updateReportType = () => {
            const selectedType = document.querySelector('input[name="reportType"]:checked')?.value;
            if (selectedType === 'individual') {
                individualStudentSection.style.display = 'block';
                // Загрузить студентов текущей группы
                if (reportGroupSelect) {
                    loadStudentsForGroup(reportGroupSelect.value);
                }
            } else {
                individualStudentSection.style.display = 'none';
                reportStudentSelect.innerHTML = '<option value="">-- Выберите студента --</option>';
            }
        };

        reportTypeRadios.forEach(radio => {
            radio.addEventListener('change', updateReportType);
        });

        // Загрузка студентов при смене группы
        if (reportGroupSelect) {
            reportGroupSelect.addEventListener('change', function() {
                const selectedType = document.querySelector('input[name="reportType"]:checked')?.value;
                if (selectedType === 'individual') {
                    loadStudentsForGroup(this.value);
                }
            });
        }
    }

    async function loadStudentsForGroup(groupName) {
        try {
            const response = await fetch(`/api/students-by-group?group=${encodeURIComponent(groupName)}`);
            const students = await response.json();
            
            reportStudentSelect.innerHTML = '<option value="">-- Выберите студента --</option>';
            students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.id;
                option.textContent = student.name;
                reportStudentSelect.appendChild(option);
            });
        } catch (err) {
            console.error('Ошибка при загрузке студентов:', err);
        }
    }
    
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
    const portfolioPanels = document.querySelectorAll('.portfolio-tab-panel');
    if (portfolioTabs.length > 0 && portfolioPanels.length > 0) {
        const setActiveTab = (tabValue) => {
            // Кнопки
            portfolioTabs.forEach(btn => {
                btn.classList.remove('active', 'bg-white');
                if (btn.dataset.tab === tabValue) {
                    btn.classList.add('active', 'bg-white');
                }
            });
            // Панели
            portfolioPanels.forEach(panel => {
                if (panel.dataset.panel === tabValue) {
                    panel.classList.remove('d-none');
                } else {
                    panel.classList.add('d-none');
                }
            });
        };

        // Активируем первую вкладку по умолчанию
        setActiveTab(portfolioTabs[0].dataset.tab);

        portfolioTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                setActiveTab(this.dataset.tab);
            });
        });
    }

    // Логика добавления студента
    const addStudentBtn = document.getElementById('addStudentBtn');
    const addStudentForm = document.getElementById('addStudentForm');
    const addStudentModal = document.getElementById('addStudentModal');

    if (addStudentBtn) {
        addStudentBtn.addEventListener('click', async function() {
            const name = document.getElementById('studentName').value.trim();
            const group = document.getElementById('studentGroup').value.trim();
            const a_student = document.getElementById('studentAStudent').checked;

            if (!name || !group) {
                alert('Заполните все обязательные поля');
                return;
            }

            try {
                const response = await fetch('/students/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name,
                        group,
                        a_student
                    })
                });

                if (response.ok) {
                    // Закрыть modal и перезагрузить страницу
                    const modal = bootstrap.Modal.getInstance(addStudentModal);
                    modal.hide();
                    window.location.reload();
                } else {
                    alert('Ошибка при добавлении студента');
                }
            } catch (err) {
                console.error('Ошибка:', err);
                alert('Ошибка при добавлении студента');
            }
        });
    }
    const achievementType = document.getElementById('achievementType');
    const academicExtra = document.getElementById('academic-extra-fields');
    const academicSubtype = document.getElementById('academicSubtype');
    const gradeFields = document.getElementById('academic-grade-fields');
    const olympFields = document.getElementById('academic-olympiad-fields');
    const programsFields = document.getElementById('academic-programs-fields');

    const scientificExtra = document.getElementById('scientific-extra-fields');
    const scientificSubtype = document.getElementById('scientificSubtype');
    const scientificContestFields = document.getElementById('scientific-contest-fields');
    const scientificPublicationFields = document.getElementById('scientific-publication-fields');
    const scientificReportFields = document.getElementById('scientific-report-fields');

    const creativeExtra = document.getElementById('creative-extra-fields');
    const sportsExtra = document.getElementById('sports-extra-fields');
    const sportsSubtype = document.getElementById('sportsSubtype');
    const sportsTitleFields = document.getElementById('sports-title-fields');
    const sportsCompetitionFields = document.getElementById('sports-competition-fields');
    const sportsPopularFields = document.getElementById('sports-popular-fields');

    const socialExtra = document.getElementById('social-extra-fields');
    const socialSubtype = document.getElementById('socialSubtype');
    const socialCountFields = document.getElementById('social-count-fields');

    const updateAcademicSubtype = () => {
        if (!academicSubtype) return;
        const subtype = academicSubtype.value;
        if (gradeFields) gradeFields.classList.toggle('d-none', subtype !== 'grade');
        if (olympFields) olympFields.classList.toggle('d-none', subtype !== 'olympiad');
        if (programsFields) programsFields.classList.toggle('d-none', subtype !== 'programs');
    };

    const updateScientificSubtype = () => {
        if (!scientificSubtype) return;
        const subtype = scientificSubtype.value;
        if (scientificContestFields) scientificContestFields.classList.toggle('d-none', subtype !== 'contest');
        if (scientificPublicationFields) scientificPublicationFields.classList.toggle('d-none', subtype !== 'publication');
        if (scientificReportFields) scientificReportFields.classList.toggle('d-none', subtype !== 'report');
    };

    const updateAchievementType = () => {
        if (!achievementType) return;
        const type = achievementType.value;
        const isAcademic = type === 'academic';
        const isScientific = type === 'scientific';
        const isCreative = type === 'creative';
        const isSports = type === 'sports';
        const isSocial = type === 'social';

        if (academicExtra) {
            academicExtra.classList.toggle('d-none', !isAcademic);
            if (isAcademic) updateAcademicSubtype();
        }
        if (scientificExtra) {
            scientificExtra.classList.toggle('d-none', !isScientific);
            if (isScientific) updateScientificSubtype();
        }
        if (creativeExtra) {
            creativeExtra.classList.toggle('d-none', !isCreative);
        }
        if (sportsExtra) {
            sportsExtra.classList.toggle('d-none', !isSports);
            if (isSports) updateSportsSubtype();
        }
        if (socialExtra) {
            socialExtra.classList.toggle('d-none', !isSocial);
            if (isSocial) updateSocialSubtype();
        }
    };

    const updateSportsSubtype = () => {
        if (!sportsSubtype) return;
        const subtype = sportsSubtype.value;
        // Звания
        if (sportsTitleFields)
            sportsTitleFields.classList.toggle('d-none', !(subtype === 'title_int' || subtype === 'title_team'));
        // Победитель чемпионата: только выбор чемпионата (sportsLevel)
        if (sportsCompetitionFields)
            sportsCompetitionFields.classList.toggle('d-none', subtype !== 'champion');
        // Популяризация: отдельное поле количества
        if (sportsPopularFields)
            sportsPopularFields.classList.toggle('d-none', subtype !== 'popularization');
        // Призёр (2–3 место): дополнительных полей не нужно, остаётся только выбор подтипа
    };

    const updateSocialSubtype = () => {
        if (!socialSubtype) return;
        const subtype = socialSubtype.value;
        // Количество имеет смысл только для культурных / лагерей (cultural_events)
        if (socialCountFields)
            socialCountFields.classList.toggle('d-none', subtype !== 'cultural');
    };

    if (achievementType) {
        updateAchievementType();
        achievementType.addEventListener('change', updateAchievementType);
    }

    if (academicSubtype) {
        academicSubtype.addEventListener('change', updateAcademicSubtype);
    }

    if (scientificSubtype) {
        scientificSubtype.addEventListener('change', updateScientificSubtype);
    }

    if (sportsSubtype) {
        sportsSubtype.addEventListener('change', updateSportsSubtype);
    }

    if (socialSubtype) {
        socialSubtype.addEventListener('change', updateSocialSubtype);
    }

    if (sportsSubtype) {
        sportsSubtype.addEventListener('change', updateSportsSubtype);
    }
});

// Обработчик удаления достижений
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-achievement')) {
        const achievementId = e.target.dataset.id;
        const studentId = window.studentId; // Предполагаем, что studentId передан в window

        if (confirm('Вы уверены, что хотите удалить это достижение?')) {
            fetch(`/portfolio/${studentId}/achievements/${achievementId}`, {
                method: 'DELETE',
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Перезагрузить страницу или обновить UI
                    window.location.reload();
                } else {
                    alert('Ошибка при удалении');
                }
            })
            .catch(err => {
                console.error('Ошибка:', err);
                alert('Ошибка при удалении');
            });
        }
    }
});

// Обработчик удаления студентов
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-student') || e.target.closest('.delete-student')) {
        const studentId = e.target.closest('.delete-student').dataset.id;
        if (confirm('Вы уверены, что хотите удалить этого студента?')) {
            fetch(`/students/${studentId}`, {
                method: 'DELETE',
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.reload();
                } else {
                    alert('Ошибка при удалении студента');
                }
            })
            .catch(err => {
                console.error('Ошибка:', err);
                alert('Ошибка при удалении студента');
            });
        }
    }
});