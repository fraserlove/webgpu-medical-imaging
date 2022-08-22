class Volume:

    def __init__(self, meta):
        self.size = [int(meta['Width']), int(meta['Height']),int(meta['Image_count'])]
        self.bitsPerVoxel = int(meta['Bits_per_voxel'])
        self.bytesPerLine = int(meta['Bytes_per_line'])
        self.format = meta['Pixel_Format']
        self.filename = meta['Filename']
        self.boundingBox = [ float(i) for i in meta['Bounding_box'][1:-1].split(',') ][:3]
        self.find_format()

    def find_format(self):
        if self.bitsPerVoxel == 8: self.textureFormat = 'r8unorm'
        elif self.bitsPerVoxel == 16: self.textureFormat = 'rg8unorm'
        else: raise Exception('Invalid pixel format for volume texture.')