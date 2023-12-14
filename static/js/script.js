const colorizeButton = document.getElementById('colorizeButton');
const dropZone = document.getElementById('dropZone');
const imageUploadInput = document.getElementById('imageUpload');
const progressBarContainer = document.querySelector('.progress-container');
const progressBar = document.getElementById('progressBar');
const thumbnailsContainer = document.getElementById('thumbnails');
const darkModeSwitch = document.getElementById('darkModeSwitch');
const uploadForm = document.getElementById('uploadForm');
const colorizerModelSelect = document.getElementById('colorizerModel');

let currentFiles = []; // Array to keep track of current files

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 4000);
}

function changeThemeColorBasedOnSystemPreference() {
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeSwitch.checked = prefersDarkScheme.matches;
    document.body.classList.toggle('dark-mode', prefersDarkScheme.matches);
}

function syncFilesWithInput() {
    const dataTransfer = new DataTransfer();
    currentFiles.forEach(file => dataTransfer.items.add(file));
    imageUploadInput.files = dataTransfer.files;
}

function removeFileAndThumbnail(index) {
    currentFiles.splice(index, 1);
    syncFilesWithInput();
    updateThumbnails();
}

function createThumbnail(file, index) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.src = e.target.result;
        img.onload = function () {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'thumbnail w-24 h-24 relative mr-2';
            thumbnail.innerHTML = `<img src="${img.src}" alt="Thumbnail" class="w-full h-full object-cover"><div class="close absolute top-0 right-0 bg-red-500 text-white rounded-full cursor-pointer" data-index="${index}"><i class="fas fa-times"></i></div>`;
            thumbnailsContainer.appendChild(thumbnail);
        };
    };
    reader.readAsDataURL(file);
}

function updateThumbnails() {
    thumbnailsContainer.innerHTML = '';
    currentFiles.forEach((file, index) => {
        createThumbnail(file, index);
    });
}

function handleFileInput() {
    currentFiles = Array.from(this.files);
    updateThumbnails();
}

function handleDrop(e) {
    e.preventDefault();
    currentFiles = Array.from(e.dataTransfer.files);
    syncFilesWithInput();
    updateThumbnails();
}

function handleFormSubmit(event) {
    event.preventDefault();

    const colorizerModel = colorizerModelSelect.options[colorizerModelSelect.selectedIndex].value;
    const imageFiles = imageUploadInput.files;
    const numImages = imageFiles.length;
    const totalProcessingTime = 20 * numImages;
    let progress = 0;

    colorizeButton.disabled = true;
    progressBarContainer.style.display = 'block';
    progressBar.style.width = '0%';

    let interval = setInterval(function () {
        progress += 100 / (totalProcessingTime / 0.5);
        if (progress >= 85) {
            clearInterval(interval);
        }
        progressBar.style.width = progress + '%';
    }, 500);

    let formData = new FormData();
    formData.append('colorizer_model', colorizerModel);

    for (let i = 0; i < imageFiles.length; i++) {
        formData.append('file', imageFiles[i]);
    }

    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            clearInterval(interval);
            progressBar.style.width = '100%';
            setTimeout(() => {
                progressBar.style.width = '0%';
            }, 2000);
            progressBarContainer.style.display = 'none';
            displayProcessedImages(data);
            colorizeButton.disabled = false;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while processing the images.');
            clearInterval(interval);

            progressBar.style.width = '0%';
            progressBarContainer.style.display = 'none';
            colorizeButton.disabled = false;
        });
}

function displayProcessedImages(data) {
    const imageGrid = document.getElementById('imageGrid');
    const metrics = document.getElementById('metrics');
    imageGrid.innerHTML = '';
    metrics.innerHTML = `<p>Processing Time: ${data.processing_time.toFixed(2)} seconds</p><br>`;

    data.processed_images.forEach(imageUrl => {
        const imageCard = document.createElement('div');
        imageCard.className = 'image-card border border-gray-300 p-2 text-center';
        imageCard.innerHTML = `<img src="${imageUrl}" alt="Colorized Image" class="max-w-full h-auto"><div class="mt-2">
        <a href="${imageUrl}" download id="downloadButton"> Download <i class="fa fa-download"></i></a></div>`;
        imageGrid.appendChild(imageCard);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    changeThemeColorBasedOnSystemPreference();
    setTimeout(showToast, 1000);

    darkModeSwitch.addEventListener('change', function () {
        document.body.classList.toggle('dark-mode');
    });

    colorizeButton.addEventListener('click', function () {
        progressBarContainer.style.display = 'block';
    });

    dropZone.addEventListener('click', function () {
        if (currentFiles.length === 0) {
            imageUploadInput.click();
        }
    });

    dropZone.addEventListener('dragover', e => e.preventDefault());
    dropZone.addEventListener('dragenter', () => { /* Optional: handle drag enter event */ });
    dropZone.addEventListener('dragleave', () => { /* Optional: handle drag leave event */ });

    imageUploadInput.addEventListener('change', handleFileInput);
    dropZone.addEventListener('drop', handleDrop);

    uploadForm.addEventListener('submit', handleFormSubmit);
});

thumbnailsContainer.addEventListener('click', function (e) {
    const closeButton = e.target.closest('.close');
    if (closeButton) {
        const index = closeButton.getAttribute('data-index');
        removeFileAndThumbnail(index);
    }
});
