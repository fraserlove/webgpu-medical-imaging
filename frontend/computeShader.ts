export function getShader(channelFormat) {
    return `

    struct Uniforms {
        transformation: mat4x4<f32>,
        windowWidth: f32,
        windoeHeight: f32
    };

    @group(0) @binding(0) var<uniform> uniforms: Uniforms;
    @group(0) @binding(1) var volumeTexture: texture_3d<${channelFormat}>;
    @group(0) @binding(2) var canvasTexture: texture_2d<u32>;
    @group(0) @binding(3) var volumeSampler: sampler;
    
    @compute
    @workgroup_size(1)
    fn main() {
        var x: vec4<f32> = uniforms.transformation * vec4<f32>(1.0, 1.0, 1.0, 1.0);
    }
    `;
}