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

// Função para converter link do Drive em link direto ou para iframe
function getDirectLink(url, isVideo = false) {
    const fileIdMatch = url.match(/[-\w]{25,}/);
    if (!fileIdMatch) return url;
    const fileId = fileIdMatch[0];

    if (isVideo) {
        // Para vídeos no Google Drive, o iframe com /preview é o mais confiável
        return `https://drive.google.com/file/d/${fileId}/preview`;
    } else {
        // Link de thumbnail em alta resolução para imagens
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }
}

async function loadGallery() {
    galleryGrid.innerHTML = '';
    galleryLoader.classList.remove('hidden');
    galleryEmpty.classList.add('hidden');

    try {
        console.log('Buscando dados em:', APPS_SCRIPT_URL);
        const response = await fetch(APPS_SCRIPT_URL);

        if (!response.ok) {
            throw new Error(`Erro na resposta do servidor: ${response.status}`);
        }

        const result = await response.json();
        console.log('Resultado da galeria:', result);

        galleryLoader.classList.add('hidden');

        if (result.status === 'success' && result.data.length > 0) {
            result.data.forEach(item => {
                const card = document.createElement('div');
                card.className = 'gallery-item';

                const isVideo = item.type.includes('video');
                const directUrl = getDirectLink(item.url, isVideo);

                card.innerHTML = `
                    <div class="media-preview">
                        ${isVideo ?
                        `<div class="video-overlay"><svg viewBox="0 0 24 24"><path fill="white" d="M8 5v14l11-7z"/></svg></div>` :
                        ''
                    }
                        <img src="${isVideo ? getDirectLink(item.url, false) : directUrl}" alt="${item.name}">
                    </div>
                `;

                card.onclick = () => openModal({ ...item, directUrl });
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
    const mediaUrl = item.directUrl || getDirectLink(item.url, isVideo);

    modalBody.innerHTML = isVideo ?
        `<iframe src="${mediaUrl}" width="100%" height="400px" frameborder="0" allow="autoplay"></iframe>` :
        `<img src="${mediaUrl}">`;

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
