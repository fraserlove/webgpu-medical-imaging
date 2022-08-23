class Volume:

    def __init__(self, size, bitsPerVoxel, bytesPerLine, signed, filename, boundingBox):
        self.size = size
        self.bitsPerVoxel = bitsPerVoxel
        self.bytesPerLine = bytesPerLine
        self.signed = signed
        self.filename = filename
        self.boundingBox = boundingBox
        self.find_format()

    @classmethod
    def from_xml(cls, meta):
        size = [int(meta['Width']), int(meta['Height']), int(meta['Image_count'])]
        bitsPerVoxel = int(meta['Bits_per_voxel'])
        bytesPerLine = int(meta['Bytes_per_line'])
        signed = 1 if meta['Pixel_Format'][-1] == 's' else 0
        filename = meta['Filename']
        boundingBox = [ float(i) for i in meta['Bounding_box'][1:-1].split(',') ][:3]
        return cls(size, bitsPerVoxel, bytesPerLine, signed, filename, boundingBox)

    @classmethod
    def from_dicom(cls, meta, depth, filename):
        print(meta)
        size = [int(meta.Rows), int(meta.Columns), depth]
        bitsPerVoxel = meta.BitsAllocated
        bytesPerLine = size[0] * (bitsPerVoxel // 8)
        signed = meta.PixelRepresentation
        boundingBox = [size[0] - 1, size[1] - 1, size[2]] # * meta.PixelSpacing[0]]
        return cls(size, bitsPerVoxel, bytesPerLine, signed, filename, boundingBox)

    def find_format(self):
        if self.bitsPerVoxel == 8: self.textureFormat = 'r8unorm'
        elif self.bitsPerVoxel == 16: self.textureFormat = 'rg8unorm'
        else: raise Exception('Invalid pixel format for volume texture.')