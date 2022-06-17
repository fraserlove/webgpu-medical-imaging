import * as  _ from 'lodash';
import { Volume } from './volume';
import { getShader } from './computeShader';

const windowWidth = 512;
const windowHeight = 512;

export const uniformData = new Float32Array([

  // Transformation matrix
  1.0, 0.0, 0.0, 0.0,
  0.0, 1.0, 0.0, 0.0,
  0.0, 0.0, 1.0, 0.0,
  0.0, 0.0, 0.0, 1.0,

  // Canvas width and height
  windowWidth, windowHeight
]);

async function main () {
  const volume = await new Volume();
  webGPU(volume);
}

async function webGPU (volume) {

  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();

  const canvas = document.createElement('canvas');
  canvas.width = windowWidth;
  canvas.height = windowHeight;

  const context = canvas.getContext('webgpu');
  context.configure({
    device: device,
    format: navigator.gpu.getPreferredCanvasFormat(),
    alphaMode: 'premultiplied',
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
  });

  // CREATE BUFFERS
  const uniformBuffer = device.createBuffer({
    size: uniformData.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  });

  // TEXTURE CREATION
  const canvasTexture = device.createTexture({
    size: [canvas.width, canvas.height],
    format: 'r8uint',
    usage: GPUTextureUsage.COPY_SRC | GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    dimension: '2d'
  });

  //const text = context.getCurrentTexture();
  //const textView = text.createView();

  const volumeTexture = device.createTexture({
    size: [volume.width, volume.height, volume.depth],
    format: volume.textureFormat,
    usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
    dimension: '3d'
  });

  const imageDataLayout = {
    offset: 0,
    bytesPerRow: volume.bytesPerLine,
    rowsPerImage: volume.height
  };

  device.queue.writeTexture({ texture: volumeTexture }, volume.data, imageDataLayout, volume.size());

  const sampler = device.createSampler({
    magFilter: 'linear',
    minFilter: 'linear'
  });

  // BINDING GROUP LAYOUT
  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: 'uniform'
        }
      } as GPUBindGroupLayoutEntry,
      {
        binding: 1,
        visibility: GPUShaderStage.COMPUTE,
        texture: {
          sampleType: volume.sampleType,
          viewDimension: '3d'
        }
      } as GPUBindGroupLayoutEntry,
      {
        binding: 2,
        visibility: GPUShaderStage.COMPUTE,
        texture: {
          sampleType: 'uint',
          viewDimension: '2d'
        }
      } as GPUBindGroupLayoutEntry,
      {
        binding: 3,
        visibility: GPUShaderStage.COMPUTE,
        sampler: {
          type: 'filtering'
        }
      } as GPUBindGroupLayoutEntry
    ]
  });


  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {binding: 0, resource: {buffer: uniformBuffer}},
      {binding: 1, resource: volumeTexture.createView()},
      {binding: 2, resource: canvasTexture.createView()},
      {binding: 3, resource: sampler}
    ]
  });

  const computePipeline = device.createComputePipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout]
    }),
    compute: {
        module: device.createShaderModule({ code: getShader(volume.channelFormat) }),
        entryPoint: 'main'
    }
  });

  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(computePipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatchWorkgroups(canvas.width, canvas.height);
  passEncoder.end();
  //commandEncoder.copyBufferToBuffer(gpuResultBuffer, 0, gpuReadBuffer, 0, array.byteLength);
  device.queue.submit([commandEncoder.finish()]);

  console.log(imageDataLayout);
  console.log(volume.size());
  console.log(volume.data.byteLength);
  console.log(canvas.getAttribute('width') + ' x ' + canvas.getAttribute('height'));
  
}

main()