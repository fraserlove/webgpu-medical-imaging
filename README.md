# WebGPU Client Side Rendering for Medical Imaging

A WebGPU rendering application to display 3D medical imaging data in the browser. This application investigates and showcases the viability of the new WebGPU framework in client-side rendering of 3D medical imaging.

With a backend written in Node.js the server deals with requests for imaging data and serves frontend WebGPU code to run in the browser. The two rendering techniques implemented is Multi-Planar Reformatting (MPR) rendering (using Maximum Intensity Projection) and Shaded Volume Rendering (SVR) (using Blinn-Phong lighting). The application provides numerous parameters to vary the output render, and options to create an arbitrary number of renderers.

Note that in order for this to work your browser must [support WebGPU](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status) and have it enabled.

## Install and Usage
Make sure you have git and node.js installed.

Clone the repository and download and install the Node.js packages:
```
git clone ...
cd webgpu-rendering-medical-imaging
npm install
```
Build the frontend and backend of the application:
```
npm run build
```
Start the backend Node.js server, specifiying the path to the volume and transfer function metadata files:
```
npm start {path-to-resources}/
```
The Node.js server runs on port `8080` and can be accessed in the browser by going to `http://localhost:8080`. The application should load with options to add a renderer in the bottom right of the browser window.

## Controls and Keybindings
Once the application has loaded, you can left click and drag to rotate, right click and drag to pan, scroll vertically to 
zoom and scroll horizontally to cine. The direction of the light source in the SVR renderer can be updated using `Shift` and dragging with the left mouse button. A GUI is provided to change other render specific variables.

## Notes
- Due to the way volumes and transfer functions have been implemented, each volume and transfer function must have a unique filename as this is used to identify individual volumes and transfer functions.

- The `.xml` and `.raw`/`.tf1` files for volumes and transfer functions must have the same filename and be placed under the same directory in order to be loaded correctly.

- Note that only volumes with the pixel format `grey16`, `grey16s`, `grey8` and `grey8s` are supported.