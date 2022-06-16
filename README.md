# WebGPU Client Side Rendering for Medical Imaging

Handles, displays and renders medical imaging data in the browser using WebGPU to utilise parallel processing. With a backend written in Node.js the server deals with requests for imaging data and serves frontend WebGPU code to run in the clients browser. Note that in order for this to work your browser must support WebGPU and have it enabled. [More Info](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status)

## Install and Usage
Make sure you have git and node.js installed.

Clone the repository and download and install the Node.js packages:
```
git clone https://github.com/fraserlove/webgpu-rendering-dicom-images.git
cd webgpu-rendering-medical-imaging
npm install
```
Build the frontend and backend of the application:
```
npm build
```
Run the backend Node.js server, specifiying the path to the volume metadata `.xml` file (The corresponding raw data describing the volume must be stored in the same directory):
```
npm start path/to/xml/file.xml
```
The Node.js server runs on port `8080`.