from flask import Flask, send_file
from flask_cors import CORS, cross_origin
from dicom_handler import load_series, array_to_jpeg

app = Flask(__name__)
cors = CORS(app)

@app.route('/image<int:n>.jpeg')
@cross_origin()
def image(n):
    return send_file(array_to_jpeg(vol[n]), mimetype='image/JPEG')

if __name__ == '__main__':
    vol = load_series(1, libpath = '../testlib/')
    # Could take some time to load in the series of dicom images before the server starts
    app.run(host='0.0.0.0', port=1708)