class TransferFunction:

    def __init__(self, meta):
        self.noColours = int(meta['Size'])
        self.filename = meta['Filename']
        self.find_format(meta['Pixel_Format'])

    def find_format(self, pixel_format):
        if pixel_format == 'rgba32f': self.colourFormat = 'rgba32float'
        else: raise Exception('Invalid pixel format for transfer function texture.')