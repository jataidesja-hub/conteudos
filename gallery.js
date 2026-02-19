const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzuMq9CeVI9SRlyxBmeKkLfZ5Yb1KQbkGDT8gh4gKy9C5bFS_1ACpVo3j-K5QmbVAeq1w/exec';

// Elements
const galleryGrid = document.getElementById('gallery-grid');
const galleryLoader = document.getElementById('gallery-loader');
const galleryEmpty = document.getElementById('gallery-empty');

// Modal
const mediaModal = document.getElementById('media-modal');
const modalBody = document.getElementById('modal-body');
const modalTitle = document.getElementById('modal-title');
const modalDate = document.getElementById('modal-date');
const modalDownload = document.getElementById('modal-download');
const modalClose = document.querySelector('.modal-close');

async function loadGallery() {
    galleryGrid.innerHTML = '';
    galleryLoader.classList.remove('hidden');
    galleryEmpty.classList.add('hidden');

    try {
        const response = await fetch(APPS_SCRIPT_URL);
        const result = await response.json();

        galleryLoader.classList.add('hidden');

        if (result.status === 'success' && result.data.length > 0) {
            result.data.forEach(item => {
                const card = document.createElement('div');
                card.className = 'gallery-item';

                const isVideo = item.type.includes('video');

                card.innerHTML = `
                    ${isVideo ?
                        `<video src="${item.url}"></video>` :
                        `<img src="${item.url}" alt="${item.name}">`
                    }
                    <div class="item-info">
                        <p>${item.name}</p>
                    </div>
                `;

                card.onclick = () => openModal(item);
                galleryGrid.appendChild(card);
            });
        } else {
            galleryEmpty.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Erro ao carregar galeria:', error);
        galleryLoader.classList.add('hidden');
        alert('Erro ao carregar galeria.');
    }
}

function openModal(item) {
    const isVideo = item.type.includes('video');
    modalBody.innerHTML = isVideo ?
        `<video src="${item.url}" controls autoplay></video>` :
        `<img src="${item.url}">`;

    modalTitle.innerText = item.name;
    modalDate.innerText = `Enviado em: ${new Date(item.date).toLocaleString('pt-BR')}`;
    modalDownload.href = item.url;

    mediaModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

modalClose.onclick = () => {
    mediaModal.classList.add('hidden');
    modalBody.innerHTML = '';
    document.body.style.overflow = 'auto';
};

// Initial load
loadGallery();
