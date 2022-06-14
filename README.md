# WebGPU Client Side Rendering for DICOM images

Handles, displays and renders dicom image data in the browser using WebGPU to utilise parallel processing. A Node.js server that provides WebGPU code for DICOM images where they can be rendered and image processing algorithms can be applied in parallel within the browser via WebGPU. Note that in order for this to work your browser must support WebGPU and have it enabled. [More Info](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status)

## Setup
Make sure you have git and node.js installed.

Next clone the repository and download and install the Node.js packages
```
git clone https://github.com/fraserlove/webgpu-rendering-dicom-images.git
cd webgpu-rendering-dicom-images
npm install
```
Build the frontend and backend then run the backend Node.js server with using the following:
```
npm start
```
The Node.js server runs on port `8080`.