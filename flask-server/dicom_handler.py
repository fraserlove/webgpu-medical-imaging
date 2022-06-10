import os, io
import matplotlib.pyplot as plt
from PIL import Image
from pydicom import dcmread

''' Loads a series of dicom images into a volume. '''
def load_series(series, libpath = './'):
    volume = []
    path = '{}/{:>05d}'.format(libpath, series)
    if not os.path.exists(path) or os.listdir(path) == 0:
        raise Exception('Cannot locate dataset, incorrect path to DICOM files provided')

    for file in os.listdir('{}/{:>05d}'.format(libpath, series)):
        dataset = dcmread('{}/{:>05d}/{}'.format(libpath, series, file))
        volume.append(dataset.pixel_array) # numpy.ndarray
    return volume

''' Converts numpy.ndarry data into a PNG image stored in memory. '''
def array_to_jpeg(array):
    img = Image.fromarray(array.astype('uint8')) # Convert numpy array to PIL image
    img_file = io.BytesIO() # Create a file in memory
    img.save(img_file, 'JPEG') # Writing image data to the PNG file in memory
    img_file.seek(0) # Read file from start
    return img_file

''' For testing to inspect dicom images. '''
def view_volume(volume, img_no):
    if img_no > len(volume) - 1:
        raise Exception('Image number {} does not exist, only {} images are present in the volume'.format(img_no, len(volume)))
    plt.imshow(volume[img_no], cmap="gray")
    plt.show()
