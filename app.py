from flask import Flask, request, send_from_directory, url_for
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import glob
import threading
import time
import matplotlib.pyplot as plt
from colorizers import *

app = Flask(__name__, static_folder='static')
CORS(app, supports_credentials=True)  # Enable CORS for all routes

# debug mode
app.debug = False

app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'jpg', 'jpeg', 'png'}
app.config['MAX_IMAGES'] = 100

colorizer_siggraph17 = siggraph17(pretrained=True).eval()
if torch.cuda.is_available():
    colorizer_siggraph17.cuda()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def process_image(file_path):
    img = load_img(file_path)
    (tens_l_orig, tens_l_rs) = preprocess_img(img, HW=(512, 512))
    if torch.cuda.is_available():
        tens_l_rs = tens_l_rs.cuda()

    out_img_siggraph17 = postprocess_tens(tens_l_orig, colorizer_siggraph17(tens_l_rs).cpu())

    # Save the colorized images
    filename = os.path.splitext(os.path.basename(file_path))[0]
    output_path_siggraph17 = os.path.join(app.config['UPLOAD_FOLDER'], f'{filename}_siggraph17.png')

    plt.imsave(output_path_siggraph17, out_img_siggraph17)

    return output_path_siggraph17

def remove_images():
    while True:
        time.sleep(420)  # Sleep for 7 minutes

        # Remove images if the number exceeds the limit
        images = glob.glob(os.path.join(app.config['UPLOAD_FOLDER'], '*.png'))
        if len(images) > app.config['MAX_IMAGES']:
            oldest_images = sorted(images, key=os.path.getctime)[:len(images) - app.config['MAX_IMAGES']]
            for image in oldest_images:
                os.remove(image)

def start_remove_images_thread():
    thread = threading.Timer(420.0, remove_images)
    thread.daemon = True
    thread.start()

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        # Check if the POST request has a file part
        if 'file' not in request.files:
            return 'No file selected'

        file = request.files['file']

        # Check if the file is empty
        if file.filename == '':
            return 'No file selected'

        # Check if the file is allowed
        if not allowed_file(file.filename):
            return 'Invalid file format'

        # Save the uploaded file
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Process the uploaded image
        colorized_image_siggraph17 = process_image(file_path)

        # Return the URL of the colorized image
        return {'colorized_image_url': url_for('download_file', filename=os.path.basename(colorized_image_siggraph17))}

    return 'Welcome to the Image Colorization API'

@app.route('/uploads/<path:filename>', methods=['GET'])
def download_file(filename):
    uploads = os.path.join(app.root_path, app.config['UPLOAD_FOLDER'])
    return send_from_directory(uploads, filename, as_attachment=True)

if __name__ == '__main__':
    app.run()
