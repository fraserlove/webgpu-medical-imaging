struct Uniforms {
    transformation: mat4x4<f32>
};

struct VertexInput {
    @location(0) position: vec4<f32>,
    @location(1) uvw: vec3<f32>
}

struct VertexOutput {
    @builtin(position) position: vec4<f32>,

    @location(0) fragUVW: vec3<f32>,
    @location(1) fragPosition: vec4<f32>
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var volumeTexture: texture_3d<u32>;
@group(0) @binding(2) var volumeSampler: sampler;

@vertex
fn vert_main(input: VertexInput) -> VertexOutput {
    var result: VertexOutput;
    result.position = uniforms.transformation * input.position;
    result.fragUVW = input.uvw;
    result.fragPosition = 0.5 * (input.position + vec4<f32>(1.0, 1.0, 1.0, 1.0));
    return result;
}

@fragment
fn frag_main(@location(0) fragUVW: vec3<f32>, @location(1) fragPosition: vec4<f32>) -> @location(0) vec4<f32> {
    return textureSample(volumeTexture, volumeSampler, fragUVW) * fragPosition;
}