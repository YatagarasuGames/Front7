document.addEventListener('DOMContentLoaded', () => {
  // Элементы интерфейса
  const noteInput = document.getElementById('note-input');
  const addButton = document.getElementById('add-button');
  const notesList = document.getElementById('notes-list');
  const offlineStatus = document.getElementById('offline-status');
  
  // Проверка онлайн-статуса
  function updateOnlineStatus() {
    if (navigator.onLine) {
      offlineStatus.style.display = 'none';
    } else {
      offlineStatus.style.display = 'block';
    }
  }
  
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
  
  // Регистрация Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful');
        })
        .catch(err => {
          console.log('ServiceWorker registration failed: ', err);
        });
    });
  }
  
  // Загрузка заметок из localStorage
  function loadNotes() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    renderNotes(notes);
  }
  
  // Отображение заметок
  function renderNotes(notes) {
    notesList.innerHTML = '';
    
    notes.forEach((note, index) => {
      const noteElement = document.createElement('div');
      noteElement.className = 'note-item';
      noteElement.innerHTML = `
        <button class="delete-button" data-index="${index}">×</button>
        <div class="note-text" data-index="${index}">${note.text}</div>
        <div class="note-date">${new Date(note.date).toLocaleString()}</div>
      `;
      notesList.appendChild(noteElement);
    });
    
    // Обработчики для кнопок удаления
    document.querySelectorAll('.delete-button').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = e.target.getAttribute('data-index');
        deleteNote(index);
      });
    });
    
    // Обработчики для редактирования заметок
    document.querySelectorAll('.note-text').forEach(noteText => {
      noteText.addEventListener('click', (e) => {
        const index = e.currentTarget.getAttribute('data-index');
        editNote(index);
      });
    });
  }
  
  // Добавление новой заметки
  function addNote() {
    const text = noteInput.value.trim();
    if (text) {
      const notes = JSON.parse(localStorage.getItem('notes')) || [];
      const newNote = {
        text: text,
        date: new Date().toISOString()
      };
      
      notes.unshift(newNote);
      localStorage.setItem('notes', JSON.stringify(notes));
      
      noteInput.value = '';
      renderNotes(notes);
    }
  }
  
  // Удаление заметки
  function deleteNote(index) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(notes));
    renderNotes(notes);
  }
  
  // Редактирование заметки
  function editNote(index) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const note = notes[index];
    
    const noteElement = document.querySelector(`.note-text[data-index="${index}"]`).parentElement;
    noteElement.classList.add('editing');
    
    noteElement.innerHTML = `
      <textarea class="edit-textarea">${note.text}</textarea>
      <div class="note-date">${new Date(note.date).toLocaleString()}</div>
      <div class="edit-buttons">
        <button class="save-button" data-index="${index}">Сохранить</button>
        <button class="cancel-button" data-index="${index}">Отмена</button>
      </div>
    `;
    
    const textarea = noteElement.querySelector('.edit-textarea');
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    
    // Обработчик сохранения
    noteElement.querySelector('.save-button').addEventListener('click', (e) => {
      e.stopPropagation();
      const newText = textarea.value.trim();
      if (newText) {
        notes[index].text = newText;
        notes[index].date = new Date().toISOString();
        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes(notes);
      }
    });
    
    // Обработчик отмены
    noteElement.querySelector('.cancel-button').addEventListener('click', (e) => {
      e.stopPropagation();
      renderNotes(notes);
    });
    
    // Сохранение по Ctrl+Enter
    textarea.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        notes[index].text = textarea.value.trim();
        notes[index].date = new Date().toISOString();
        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes(notes);
      }
    });
  }
  
  // Обработчики событий
  addButton.addEventListener('click', addNote);
  noteInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addNote();
    }
  });
  
  // Первоначальная загрузка заметок
  loadNotes();
});