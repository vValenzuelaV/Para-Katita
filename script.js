document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    const modal = document.getElementById('image-modal');
    const fullImage = document.getElementById('full-image');
    const closeBtn = document.querySelector('.close-btn');

    // Directorio donde estarán las fotos
    const imageFolder = 'fotos/';
    let imageIndex = 1;

    // Función para cargar imágenes secuencialmente (1.jpg, 2.jpg, 3.jpg...)
    function loadNextImage() {
        const img = new Image();
        const imgPath = `${imageFolder}${imageIndex}.jpg`;

        // Si la imagen carga con éxito
        img.onload = function() {
            displayPhoto(imgPath, imageIndex);
            imageIndex++;
            loadNextImage(); // Intentar cargar la siguiente imagen
        };

        // Si falla (ej. llegamos a la última imagen y la siguiente no existe)
        img.onerror = function() {
            // También intentamos buscar formato .png por si acaso
            const imgPng = new Image();
            const imgPathPng = `${imageFolder}${imageIndex}.png`;
            
            imgPng.onload = function() {
                displayPhoto(imgPathPng, imageIndex);
                imageIndex++;
                loadNextImage();
            };

            imgPng.onerror = function() {
                console.log(`Carga de fotos finalizada. Se encontraron ${imageIndex - 1} fotos.`);
            };
            
            imgPng.src = imgPathPng;
        };

        img.src = imgPath;
    }

    // Iniciar la búsqueda y carga de imágenes
    loadNextImage();

    // Función para mostrar una foto en la galería
    function displayPhoto(photoUrl, index) {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        // Efecto cascada en la animación
        photoItem.style.animationDelay = `${(index % 10) * 0.1}s`;

        const img = document.createElement('img');
        img.src = photoUrl;
        img.alt = `Paisaje recuerdo ${index}`;

        // Añadir evento click para abrir en pantalla completa
        photoItem.addEventListener('click', () => {
            openModal(photoUrl);
        });

        photoItem.appendChild(img);
        gallery.appendChild(photoItem);
    }

    // Modal interacciones
    function openModal(src) {
        fullImage.src = src;
        modal.style.display = 'flex';
        void modal.offsetWidth; // Forzar reflujo para animación
    }

    closeBtn.addEventListener('click', () => closeModal());

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
    });

    function closeModal() {
        modal.style.display = 'none';
        setTimeout(() => {
            fullImage.src = ''; 
        }, 300);
    }
});
