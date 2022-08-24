import os, sys, xmltodict, json, struct, pydicom, numpy
from flask import Flask, render_template, Response, stream_with_context
from lib.volume import Volume
from lib.transfer_function import TransferFunction

class Server():

    def __init__(self):
        self.app = Flask(__name__)
        self.port = 8080
        self.res_path = os.path.realpath(os.path.join(os.path.dirname(__file__), '../', sys.argv[1]))
        self.volumes = []
        self.transfer_functions = []
        self.read_resources()

    def read_resources(self):
        filenames = sorted([f for f in os.listdir(self.res_path)])
        for filename in filenames:
            if filename.split('.')[-1] == 'xml':
                file = os.path.join(self.res_path, filename)
                meta = xmltodict.parse(open(file).read())
                if 'Volume_View' in meta: self.volumes.append(Volume.from_xml(meta['Volume_View']))
                elif 'Transfer_Function' in meta: self.transfer_functions.append(TransferFunction(meta['Transfer_Function']))

            if os.path.isdir(os.path.join(self.res_path, filename)):
                dcm_files = [f for f in os.listdir(os.path.join(self.res_path, filename)) if f.split('.')[-1] == 'dcm']
                if len(dcm_files) > 0:
                    dcm_file = os.path.join(self.res_path, filename, dcm_files[0])
                    self.volumes.append(Volume.from_dicom(pydicom.read_file(dcm_file), len(dcm_files), filename))

        self.setup();
        self.start();

    def setup(self):
        @self.app.route('/')
        def index():
            return render_template('index.html')

        @self.app.route('/volumes')
        def volumes():
            return json.dumps([vars(volume) for volume in self.volumes])

        @self.app.route('/transfer_functions')
        def transfer_functions():
            return json.dumps([vars(transfer_function) for transfer_function in self.transfer_functions])

        @self.app.route('/volume/<string:filename>')
        def send_volume(filename = None):
            for volume in self.volumes:
                if filename == volume.filename:
                    if os.path.isdir(os.path.join(self.res_path, filename)): return Response(stream_with_context(self.chunk_dicom(os.path.join(self.res_path, filename))))
                    else: return Response(stream_with_context(self.chunk_file(os.path.join(self.res_path, filename + '.raw'), volume.signed, volume.bitsPerVoxel)))

        @self.app.route('/transfer_function/<string:filename>')
        def send_transfer_function(filename = None):
            if filename in [transfer_function.filename for transfer_function in self.transfer_functions]:
                return Response(stream_with_context(self.chunk_file(os.path.join(self.res_path, filename), False, None)))

    def start(self):
        self.app.run(host='0.0.0.0', port=self.port)
        print('Server started at http://localhost:' + self.port)

    def chunk_dicom(self, path):
        for file in sorted([f for f in os.listdir(path) if f.split('.')[-1] == 'dcm']):
            meta = pydicom.read_file(os.path.join(path, file))
            rescaleSlope = 1 if meta.get('RescaleSlope') == None else meta.RescaleSlope
            rescaleIntercept = 0 if meta.get('RescaleIntercept') == None else meta.RescaleIntercept
            out = (rescaleSlope * meta.pixel_array + rescaleIntercept) + 2 ** 15 - rescaleIntercept
            yield out.astype(numpy.uint16).tobytes()

    def chunk_file(self, path, signed, bitsPerVoxel):
        CHUNK_SIZE = 2 ** 24
        with open(path, 'rb') as file:
            while True:
                binary = file.read(CHUNK_SIZE)
                if signed:
                    if bitsPerVoxel == 16: format_char = 'h'
                    elif bitsPerVoxel == 8: format_char = 'b'
                    signed = struct.unpack('{}{}'.format(len(binary) // 2, format_char), binary)
                    unsigned = [short + 2 ** 15 for short in signed]
                    binary = struct.pack('{}{}'.format(len(binary) // 2, format_char.upper()), *unsigned)
                if binary: yield binary
                else: break

if __name__ == '__main__':
    server = Server();

