const colorizeButton = document.getElementById('colorizeButton');
const dropZone = document.getElementById('dropZone');
const imageUploadInput = document.getElementById('imageUpload');
const progressBarContainer = document.querySelector('.progress-container');
const progressBar = document.getElementById('progressBar');
let currentFiles = []; // Array to keep track of current files

function showToast() {
    var toast = document.getElementById("toast");
    toast.classList.remove("hidden");
    setTimeout(function () { toast.classList.add("hidden"); }, 4000);
}

// Call this function when you want to show the toast
showToast();

function syncFilesWithInput() {
    const dataTransfer = new DataTransfer();
    currentFiles.forEach(file => dataTransfer.items.add(file));
    imageUploadInput.files = dataTransfer.files;
}

function removeFileAndThumbnail(index) {
    currentFiles.splice(index, 1); // Remove file from array
    syncFilesWithInput(); // Update file input
    updateThumbnails(); // Update thumbnails
}

function updateThumbnails() {
    const thumbnailsContainer = document.getElementById('thumbnails');
    thumbnailsContainer.innerHTML = '';
    currentFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function () {
                const thumbnail = document.createElement('div');
                thumbnail.className = 'thumbnail w-24 h-24 relative mr-2';
                thumbnail.innerHTML = `<img src="${img.src}" alt="Thumbnail" class="w-full h-full object-cover"><div class="close absolute top-0 right-0 bg-red-500 text-white rounded-full cursor-pointer" onclick="removeFileAndThumbnail(${index})"><i class="fas fa-times"></i></div>`;
                // Attach the event listener to the close button
                thumbnail.querySelector('.close').addEventListener('click', function () {
                    removeFileAndThumbnail(index);
                });

                thumbnailsContainer.appendChild(thumbnail);
            };
        };
        reader.readAsDataURL(file);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // Dark Mode Toggle Functionality
    document.getElementById('darkModeSwitch').addEventListener('change', function () {
        document.body.classList.toggle('dark-mode');
    });

    //on click of colorize button make progress bar visible
    colorizeButton.addEventListener('click', function () {
        progressBarContainer.style.display = 'block';
    });


    dropZone.addEventListener('click', function () {
        if (currentFiles.length === 0) {
            imageUploadInput.click();
        }
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    dropZone.addEventListener('dragenter', (e) => {
        e.preventDefault();
    });

    dropZone.addEventListener('dragleave', (e) => {
        // Optional: handle drag leave event
    });
    imageUploadInput.addEventListener('change', function () {
        currentFiles = Array.from(this.files);
        updateThumbnails();
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        currentFiles = Array.from(e.dataTransfer.files);
        syncFilesWithInput();
        updateThumbnails();
    });

    document.getElementById('uploadForm').addEventListener('submit', function (event) {
        event.preventDefault();
    
        // Get the selected colorizer model
        const colorizerModelSelect = document.getElementById('colorizerModel');
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
        formData.append('colorizer_model', colorizerModel);  // Pass the selected colorizer model
    
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
                }, 2000); // Fade out progress bar after 2 seconds
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
    });

    function displayProcessedImages(data) {
        const imageGrid = document.getElementById('imageGrid');
        const metrics = document.getElementById('metrics');
        imageGrid.innerHTML = '';
        metrics.innerHTML = `<p>Processing Time: ${data.processing_time.toFixed(2)} seconds</p>`;

        data.processed_images.forEach(imageUrl => {
            const imageCard = document.createElement('div');
            imageCard.className = 'image-card border border-gray-300 p-2 text-center';
            imageCard.innerHTML = `<img src="${imageUrl}" alt="Colorized Image" class="max-w-full h-auto"><div class="mt-2"><a href="${imageUrl}" download id="downloadButton">Download <i class="fa fa-download"></i></a></div>`;
            imageGrid.appendChild(imageCard);
        });
    }
});
