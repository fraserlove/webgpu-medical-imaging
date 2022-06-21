struct Uniforms {
    transformation: mat4x4<f32>
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var volumeTexture: texture_3d<f32>;
@group(0) @binding(2) var volumeSampler: sampler;

@vertex
fn vert_main() -> @builtin(position) vec4<f32> {
  return vec4<f32>(100.0, 100.0, 0.0, 1.0);
}

fn sample(volumeTexture: texture_3d<f32>, volumeSampler: sampler, position: vec3<f32>) -> vec4<f32> {
    var sample = textureSample(volumeTexture, volumeSampler, position);
    var normed = (sample.x + sample.y * 255) / 256;
    return vec4(normed, normed, normed, 1);
}

@fragment
fn frag_main(@builtin(position) coord_in: vec4<f32>) -> @location(0) vec4<f32> {
    return sample(volumeTexture, volumeSampler, vec3<f32>(coord_in.x, coord_in.y, coord_in.z));
}