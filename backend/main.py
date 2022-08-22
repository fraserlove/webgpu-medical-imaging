import os, sys, xmltodict, json, struct
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
        filenames = [f for f in os.listdir(self.res_path) if os.path.isfile(os.path.join(self.res_path, f))]
        for filename in filenames:
            if filename.split('.')[-1] == 'xml':
                file = os.path.join(self.res_path, filename)
                meta = xmltodict.parse(open(file).read())
                if 'Volume_View' in meta: self.volumes.append(Volume(meta['Volume_View']))
                elif 'Transfer_Function' in meta: self.transfer_functions.append(TransferFunction(meta['Transfer_Function']))
        self.setup();
        self.start();

    def setup(self):
        @self.app.route('/')
        def index():
            return render_template('index.html')

        @self.app.route('/volumes')
        def volumes():
            return json.dumps([volume.__dict__ for volume in self.volumes])

        @self.app.route('/transfer_functions')
        def transfer_functions():
            return json.dumps([transfer_function.__dict__ for transfer_function in self.transfer_functions])

        @self.app.route('/volume/<string:filename>')
        def send_volume(filename = None):
            for volume in self.volumes:
                if filename == volume.filename:
                    return Response(stream_with_context(self.chunk_file(os.path.join(self.res_path, filename), volume.format)))

        @self.app.route('/transfer_function/<string:filename>')
        def send_transfer_function(filename = None):
            if filename in [transfer_function.filename for transfer_function in self.transfer_functions]:
                return Response(stream_with_context(self.chunk_file(os.path.join(self.res_path, filename), '')))

    def start(self):
        self.app.run(host='0.0.0.0', port=self.port)
        print('Server started at http://localhost:' + self.port)

    def chunk_file(self, path, format):
        CHUNK_SIZE = 2 ** 24
        with open(path, 'rb') as file:
            while True:
                binary = file.read(CHUNK_SIZE)
                if format[-1] == 's':
                    if format[4:6] == '16': format_char = 'h'
                    elif format[4:6] == '8': format_char = 'b'
                    signed = struct.unpack('{}{}'.format(len(binary) // 2, format_char), binary)
                    unsigned = [short + 2 ** 15 for short in signed]
                    binary = struct.pack('{}H'.format(len(binary) // 2, format_char.upper()), *unsigned)
                if binary:
                    yield binary
                else:
                    break

if __name__ == '__main__':
    server = Server();

