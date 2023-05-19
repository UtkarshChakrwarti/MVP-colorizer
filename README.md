
---

# Image Colorization API

The Image Colorization API is a Flask application that allows users to upload black and white images and receive colorized versions in return. It utilizes deep learning models to perform the colorization process.

## Features

- Upload black and white images in common formats (e.g., JPG, JPEG, PNG).
- Colorize uploaded images using the Siggraph'17 model.
- Download the colorized images.
- Automatic removal of old colorized images to manage storage space.
- RESTful API endpoints for image upload and download.

## Installation

1. Clone the repository:

```shell
git clone https://github.com/your-username/image-colorization-api.git
```

2. Install the required dependencies using pip:

```shell
pip install -r requirements.txt
```

## Usage

1. Start the Flask application:

```shell
python app.py
```

2. Access the API at `http://localhost:5000` in your web browser or via API clients like Postman.

3. Upload a black and white image using the API endpoint `/` (root URL) as a `POST` request with the image file attached. The API will respond with the URL of the colorized image.

4. Download the colorized image by accessing the URL provided in the API response or by using the `/uploads/<filename>` endpoint as a `GET` request.

## Configuration

The application can be configured by modifying the options in the `config.py` file. Available configuration options include:

- `UPLOAD_FOLDER`: The directory where uploaded images and colorized images are stored.
- `ALLOWED_EXTENSIONS`: The allowed file extensions for image uploads.
- `MAX_IMAGES`: The maximum number of colorized images to keep before removing the oldest ones.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## Acknowledgements

This application is based on the following Github repository: [https://github.com/richzhang/colorization](https://github.com/richzhang/colorization).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Feel free to modify and expand upon this README file based on your specific project requirements. Include additional sections such as deployment instructions, API documentation, or examples of how to integrate the API into other applications.