
# MVP Colorizer (Smritink)

## Introduction
MVP Colorizer (Smritink) is a Flask-based web application designed for colorizing black and white images using advanced deep learning models. The latest version includes user interface enhancements and improved colorization techniques, making it more efficient and user-friendly.

## Features
- **Enhanced User Interface**: A more intuitive and responsive design for easy uploading and downloading of images.
- **Support for Common Image Formats**: Users can upload images in JPG, JPEG, and PNG formats.
- **Improved Colorization Algorithm**: Utilizes the Siggraph'17 model for more accurate and vibrant colorization.
- **Interactive Web Interface**: Users can easily navigate through the application to upload and view colorized images.

## Getting Started
### Requirements
- Python 3.x
- Flask
- Additional Python libraries as listed in `requirements.txt`

### Installation and Setup
1. Clone the repository to your local machine.
2. Install the required Python libraries using `pip install -r requirements.txt`.
3. Run the Flask application with `python app.py`.

## Usage
### Uploading Images
- Navigate to the web interface.
- Click on the upload section and select a black and white image.
- Submit the image for colorization.

### Downloading Images
- After colorization, the image will be displayed on the web interface.
- Click the download link to save the colorized image.


## API Reference for MVP Colorizer

The MVP Colorizer Flask application offers a simple API for uploading black and white images and receiving colorized versions in return. Below are the details of the available endpoints.

## Endpoints

### 1. Home Page
- **URL**: `/`
- **Method**: `GET`
- **Description**: Serves the home page of the application.
- **Response**: HTML content of `index.html`.

### 2. Upload Image
- **URL**: `/upload`
- **Method**: `POST`
- **Description**: Receives one or more black and white images from the user, processes them, and returns paths for the colorized images.
- **Data Params**: 
  - `file`: The image file(s) to be uploaded. Must be in `jpg`, `jpeg`, or `png` format.
- **Success Response**:
  - **Code**: 200 
  - **Content**: JSON containing:
    - `processed_images`: List of URLs for downloading the colorized images.
    - `processing_time`: Time taken to process the images.
- **Error Response**:
  - **Code**: 400 BAD REQUEST
  - **Content**: Error message.

### 3. Download Image
- **URL**: `/uploads/<filename>`
- **Method**: `GET`
- **Description**: Allows downloading of a colorized image.
- **URL Params**:
  - **Required**: `filename` - Name of the file to be downloaded.
- **Success Response**:
  - **Code**: 200
  - **Content**: The requested image file.
- **Error Response**:
  - **Code**: 404 NOT FOUND
  - **Content**: Error message if the file is not found.

## Additional Information
- The application uses the `colorizers` package to process the images.
- Images are temporarily stored in an `uploads` folder and are automatically deleted after a certain threshold to manage storage.
- The server starts a background thread (`start_remove_images_thread`) to remove old images from the server.


## Contributing
Contributions to MVP Colorizer are welcome. Please feel free to suggest features, report bugs, or submit pull requests via GitHub.

## License
This project is released under the [MIT License](LICENSE.md).

## Acknowledgements
Special thanks to the contributors and the open-source community for the support and resources that made this project possible.
