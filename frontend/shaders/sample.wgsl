struct Uniforms {
    width: f32,
    level: f32
};

struct VertexOutput {
    @builtin(position) Position: vec4<f32>,
    @location(0) fragUV: vec2<f32>,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var mipTexture: texture_2d<f32>;
@group(0) @binding(2) var mipSampler: sampler;

@vertex
fn vert_main(@location(0) position: vec2<f32>, @location(1) uv: vec2<f32>) -> VertexOutput {
    var output : VertexOutput;
    output.Position = vec4<f32>(position, 0.0, 1.0);
    output.fragUV = uv;
    return output;
}

@fragment
fn frag_main(@location(0) fragUV: vec2<f32>) -> @location(0) vec4<f32> {
    var sample = textureSample(mipTexture, mipSampler, fragUV);
    // Only the red window width and window level need to be calculated as texture is greyscale
    var grey = (sample.r - (uniforms.level + uniforms.width / 2)) / uniforms.width;
    return vec4(grey, grey, grey, 1);
}