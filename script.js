document.addEventListener('DOMContentLoaded', () => {
    const fileUpload = document.getElementById('file-upload');
    const gallery = document.getElementById('gallery');
    const modal = document.getElementById('image-modal');
    const fullImage = document.getElementById('full-image');
    const closeBtn = document.querySelector('.close-btn');

    // Configuración de IndexedDB para guardar fotos localmente
    const dbName = 'AnuarioPrimaveraDB';
    const storeName = 'photos';
    let db;

    const request = indexedDB.open(dbName, 1);

    request.onerror = (event) => {
        console.error('Error al abrir la base de datos local:', event.target.error);
    };

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        // Crear un almacén de objetos (tabla) para las fotos
        db.createObjectStore(storeName, { autoIncrement: true });
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        // Cargar las fotos guardadas previamente al iniciar la página
        loadPhotos();
    };

    // Función para guardar una foto en la base de datos
    function savePhoto(dataUrl) {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        store.add(dataUrl);
    }

    // Función para cargar todas las fotos desde la base de datos
    function loadPhotos() {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.openCursor();
        let index = 0;

        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                // Mostrar la foto en la galería
                displayPhoto(cursor.value, index++);
                cursor.continue();
            }
        };
    }

    // Función para mostrar una foto en la galería
    function displayPhoto(photoUrl, index) {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        // Añadir un pequeño retraso a la animación basado en el índice (máx 10 para no tardar mucho)
        photoItem.style.animationDelay = `${(index % 10) * 0.1}s`;

        const img = document.createElement('img');
        img.src = photoUrl;
        img.alt = `Recuerdo hermoso`;

        // Añadir evento click para abrir en pantalla completa
        photoItem.addEventListener('click', () => {
            openModal(photoUrl);
        });

        // Crear y añadir botón para eliminar la foto (Opcional, pero útil)
        const deleteBtn = document.createElement('div');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.style.position = 'absolute';
        deleteBtn.style.top = '15px';
        deleteBtn.style.right = '15px';
        deleteBtn.style.background = 'rgba(255,255,255,0.7)';
        deleteBtn.style.padding = '5px';
        deleteBtn.style.borderRadius = '50%';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.opacity = '0';
        deleteBtn.style.transition = 'opacity 0.3s';
        
        photoItem.addEventListener('mouseenter', () => deleteBtn.style.opacity = '1');
        photoItem.addEventListener('mouseleave', () => deleteBtn.style.opacity = '0');

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que se abra el modal
            deletePhoto(photoUrl, photoItem);
        });

        photoItem.appendChild(img);
        photoItem.appendChild(deleteBtn);
        gallery.appendChild(photoItem);
    }

    // Función para eliminar una foto específica
    function deletePhoto(photoUrl, photoElement) {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.openCursor();

        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                if (cursor.value === photoUrl) {
                    cursor.delete();
                    photoElement.remove(); // Elimina el elemento de la pantalla
                    return; // Terminamos de buscar
                }
                cursor.continue();
            }
        };
    }

    // Manejar la subida de nuevos archivos
    fileUpload.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);

        files.forEach((file) => {
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();

            reader.onload = (event) => {
                const photoUrl = event.target.result;
                
                // 1. Guardar en la base de datos local
                savePhoto(photoUrl);
                
                // 2. Mostrar inmediatamente en la galería
                displayPhoto(photoUrl, gallery.children.length);
            };

            // Convertir la imagen a Base64 para guardarla
            reader.readAsDataURL(file);
        });

        // Limpiar el input para permitir subir las mismas fotos de nuevo si es necesario
        this.value = '';
    });

    // Función para abrir el modal
    function openModal(src) {
        fullImage.src = src;
        modal.style.display = 'flex';
        // Forzar un reflujo para que la animación se reinicie si es necesario
        void modal.offsetWidth; 
    }

    // Cerrar modal al hacer clic en la X
    closeBtn.addEventListener('click', () => {
        closeModal();
    });

    // Cerrar modal al hacer clic fuera de la imagen
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Cerrar modal con la tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });

    function closeModal() {
        modal.style.display = 'none';
        setTimeout(() => {
            fullImage.src = ''; // Limpiar la imagen para ahorrar memoria
        }, 300);
    }
});
