struct Uniforms {
    transformation: mat4x4<f32>
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var mipTexture: texture_2d<f32>;
@group(0) @binding(2) var mipSampler: sampler;

@vertex
fn vert_main() -> @builtin(position) vec4<f32> {
  return vec4<f32>(100.0, 100.0, 0.0, 1.0);
}

@fragment
fn frag_main(@builtin(position) coord_in: vec4<f32>) -> @location(0) vec4<f32> {
    return textureSample(mipTexture, mipSampler, vec2<f32>(coord_in.x, coord_in.y));
}