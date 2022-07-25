# WebGPU Client Side Rendering for Medical Imaging

Handles, displays and renders medical imaging data in the browser using WebGPU to utilise parallel processing. With a backend written in Node.js the server deals with requests for imaging data and serves frontend WebGPU code to run in the clients browser. Currently the two rendering techniques avaliable is MPR and SVR rendering.

Note that in order for this to work your browser must support WebGPU and have it enabled. [More Info](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status) Currently only volumes with the pixel format grey16, grey16s, grey8 and grey8s are supported.

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
Run the backend Node.js server, specifiying the path to the volume and transfer function metadata `.xml` files (The corresponding raw data describing the volume and transfer functions must be stored in the same directory as their `.xml` counterparts):
```
npm start {path}/volume.xml {path}/transfer_function.tf1.xml
```
The Node.js server runs on port `8080` and can be accessed in the browser by going to `http://localhost:8080`.

## Controls and Keybindings
Once the application has loaded, you can left click and drag to rotate, right click and drag to pan, scroll vertically to 
zoom and scroll horizontally to cine. The left-right and up-down arrow keys are used to change the window level and window 
width values respectively. The number of samples can be varied using the `+` and `-` keys.
