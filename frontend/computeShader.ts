export function getShader(channelFormat) {
    return `
    @group(0) @binding(0) var<uniform> transformation: mat4x4<f32>;
    @group(0) @binding(1) var volumeTexture: texture_3d<${channelFormat}>;
    @group(0) @binding(2) var canvasTexture: texture_2d<u32>;
    @group(0) @binding(3) var volumeSampler: sampler;
    
    @compute
    @workgroup_size(1)
    fn main() {
    }
    `;
}