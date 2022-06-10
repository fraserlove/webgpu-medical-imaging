# WebGPU Client Side Rendering for DICOM images

Handles, displays and renders dicom image data in the browser using WebGPU to utilise parallel processing. A Flask server has been implemented to handle importing dicom images and converting the image data to a jpeg. Then these jpegs are served to the Node.js server where they can be rendered and image processing algorithms can be applied in parallel within the browser via WebGPU. Note that in order for this to work your browser must support WebGPU and have it enabled. To find out how to do this go to https://github.com/gpuweb/gpuweb/wiki/Implementation-Status.

## Setup
Make sure you have git, node.js and python installed. Furthermore place the DICOM dataset under a directory called `./testlib` with each DICOM series having its own folder numbered from 00001, 00002, etc. Make sure that the images are numbered in order as to date no sorting has been implemented to sort the DICOM images based on their slice number.

Download and install Python packages with pip:
```
pip install pydicom matplotlib pillow flask flask-cors
```
Next clone the repository, navigate into `node-server` and download and install the Node.js packages with npm:
```
npm install
```
Build the Node.js project using the following:
```
npm run build
```
Finally run both the Flask and Node.js server in two separate terminals with:
```
npm start
```
and
```
npm run start-flask
```
The flask server runs on port `1708` and the Node.js server runs on port `8080`. Only the Node.js server should be accessed, you can check that the application is running by going to `127.0.0.1:8080` in the browser.