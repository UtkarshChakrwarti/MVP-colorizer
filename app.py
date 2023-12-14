from flask import Flask, request, jsonify, send_from_directory, url_for, render_template
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import glob
import threading
import time
from PIL import Image
from colorizers import *

app = Flask(__name__, static_folder='static')
CORS(app, supports_credentials=True)

app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'jpg', 'jpeg', 'png'}
app.config['MAX_IMAGES'] = 10

colorizer_eccv16 = eccv16(pretrained=True).eval()
colorizer_siggraph17 = siggraph17(pretrained=True).eval()


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']



def process_image(file_path, colorizer):
    img = Image.open(file_path)

    # Check if the image is in PNG format
    if img.format == 'PNG':
        # Convert PNG to JPEG
        jpeg_path = os.path.splitext(file_path)[0] + '.jpg'
        img.convert('RGB').save(jpeg_path)
        file_path = jpeg_path

    # Continue with the rest of the processing
    img = load_img(file_path)
    (tens_l_orig, tens_l_rs) = preprocess_img(img, HW=(512, 512))

    if colorizer == colorizer_eccv16:
        # colorizer outputs 256x256 image, we resize to 512x512 to match input size!
        out_img_eccv16 = postprocess_tens(
            tens_l_orig, colorizer(tens_l_rs).cpu())

        filename = os.path.splitext(os.path.basename(file_path))[0]
        output_path_eccv16 = os.path.join(
            app.config['UPLOAD_FOLDER'], f'{filename}_colorized{os.path.splitext(file_path)[1]}')
        Image.fromarray((out_img_eccv16 * 255).astype(np.uint8)).save(output_path_eccv16)
        return output_path_eccv16

    out_img_siggraph17 = postprocess_tens(
        tens_l_orig, colorizer_siggraph17(tens_l_rs).cpu())

    filename = os.path.splitext(os.path.basename(file_path))[0]
    output_path_siggraph17 = os.path.join(
        app.config['UPLOAD_FOLDER'], f'{filename}_colorized{os.path.splitext(file_path)[1]}')
    Image.fromarray((out_img_siggraph17 * 255).astype(np.uint8)).save(output_path_siggraph17)

    return output_path_siggraph17


def remove_images():
    while True:
        time.sleep(420)
        images = glob.glob(os.path.join(app.config['UPLOAD_FOLDER'], '*'))
        if len(images) > app.config['MAX_IMAGES']:
            oldest_images = sorted(images, key=os.path.getctime)[
                :len(images) - app.config['MAX_IMAGES']]
            for image in oldest_images:
                os.remove(image)


def start_remove_images_thread():
    thread = threading.Thread(target=remove_images)
    thread.daemon = True
    thread.start()


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/upload', methods=['POST'])
# Inside the upload_file function in app.py
def upload_file():
    start_time = time.time()
    files = request.files.getlist("file")
    processed_images = []

    # Get the colorizer model from the user
    colorizer_model = request.form.get("colorizer_model")

    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)

            # Use the selected colorizer model
            if colorizer_model == "siggraph17":
                colorized_image_path = process_image(
                    file_path, colorizer_siggraph17)
            elif colorizer_model == "eccv16":
                colorized_image_path = process_image(
                    file_path, colorizer_eccv16)
            else:
                return jsonify({'error': 'Invalid colorizer model'})

            processed_images.append(
                url_for('download_file', filename=os.path.basename(colorized_image_path)))

    end_time = time.time()
    processing_time = end_time - start_time

    return jsonify({
        'processed_images': processed_images,
        'processing_time': processing_time
    })


@app.route('/uploads/<filename>')
def download_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


if __name__ == '__main__':
    start_remove_images_thread()
    app.run()
