// Configuração - O usuário deve preencher este URL após publicar o Apps Script
const APPS_SCRIPT_URL = ''; 

const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const previewContainer = document.getElementById('preview-container');
const fileList = document.getElementById('file-list');
const uploadBtn = document.getElementById('upload-btn');
const cancelBtn = document.getElementById('cancel-btn');
const statusContainer = document.getElementById('status-container');
const progressFill = document.getElementById('progress-fill');
const statusText = document.getElementById('status-text');
const statusPercent = document.getElementById('status-percent');

let selectedFiles = [];

// Drag & Drop events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.add('active'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.remove('active'), false);
});

dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

fileInput.addEventListener('change', function() {
    handleFiles(this.files);
});

function handleFiles(files) {
    const newFiles = Array.from(files);
    selectedFiles = [...selectedFiles, ...newFiles];
    updatePreview();
}

function updatePreview() {
    fileList.innerHTML = '';
    
    if (selectedFiles.length > 0) {
        previewContainer.classList.remove('hidden');
        dropArea.classList.add('hidden');
    } else {
        previewContainer.classList.add('hidden');
        dropArea.classList.remove('hidden');
    }

    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        const item = document.createElement('div');
        item.className = 'file-item';
        
        if (file.type.startsWith('image/')) {
            reader.onload = (e) => {
                item.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}">
                    <span class="file-name">${file.name}</span>
                `;
            };
            reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
            item.innerHTML = `
                <video src="${URL.createObjectURL(file)}"></video>
                <span class="file-name">${file.name}</span>
            `;
        }
        
        fileList.appendChild(item);
    });
}

cancelBtn.addEventListener('click', () => {
    selectedFiles = [];
    updatePreview();
});

uploadBtn.addEventListener('click', async () => {
    if (!APPS_SCRIPT_URL) {
        showToast('Por favor, configure o URL do Apps Script primeiro.', 'error');
        return;
    }

    uploadBtn.disabled = true;
    cancelBtn.disabled = true;
    statusContainer.classList.remove('hidden');
    
    let successCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const progress = ((i / selectedFiles.length) * 100).toFixed(0);
        
        updateStatus(`Enviando ${file.name}...`, progress);

        try {
            const base64 = await fileToBase64(file);
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Apps Script requires no-cors for simple POST or it will fail preflight
                body: JSON.stringify({
                    name: file.name,
                    type: file.type,
                    base64: base64.split(',')[1]
                })
            });

            // Note: with 'no-cors', we can't check response.ok or JSON results
            // We assume success if no error is thrown
            successCount++;
        } catch (error) {
            console.error('Erro no upload:', error);
        }

        const finalProgress = (((i + 1) / selectedFiles.length) * 100).toFixed(0);
        updateStatus(`Finalizando...`, finalProgress);
    }

    showToast(`${successCount} arquivos enviados com sucesso!`);
    
    setTimeout(() => {
        selectedFiles = [];
        updatePreview();
        statusContainer.classList.add('hidden');
        uploadBtn.disabled = false;
        cancelBtn.disabled = false;
    }, 2000);
});

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function updateStatus(text, percent) {
    statusText.innerText = text;
    statusPercent.innerText = `${percent}%`;
    progressFill.style.width = `${percent}%`;
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}
