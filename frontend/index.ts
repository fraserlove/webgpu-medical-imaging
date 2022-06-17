import * as  _ from 'lodash';
import { Volume } from './structures';
import { getShader } from './computeShader';

main()

const matrixSize = 16 * 4; // 4x4 matrix
const offset = 256; // transformationBindGroup offset must be 256-byte aligned
const uniformBufferSize = offset;
const windowSize = [512, 512];

async function main () {
  const volume = await new Volume();
  webGPU(volume);
}

async function webGPU (volume) {

  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();

  const canvas = document.createElement('canvas');
  canvas.width = windowSize[0];
  canvas.height = windowSize[1];
  const context = canvas.getContext('webgpu').configure({
    device: device,
    format: navigator.gpu.getPreferredCanvasFormat(),
    alphaMode: 'premultiplied'
  });

  // CREATE BUFFERS
  const transformationBuffer = device.createBuffer({
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // TEXTURE CREATION
  const canvasTexture = device.createTexture({
    size: [canvas.width, canvas.height],
    format: 'r8uint',
    usage: GPUTextureUsage.COPY_SRC | GPUTextureUsage.TEXTURE_BINDING,
    dimension: '2d'
  });

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
      {binding: 0, resource: {buffer: transformationBuffer}},
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