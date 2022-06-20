struct Uniforms {
    transformation: mat4x4<f32>,
    windowWidth: f32,
    windoeHeight: f32
};

 struct VertexOutput {
   @builtin(position) position: vec4<f32>,
   @location(0) vertColour: vec4<f32>
 }

  struct FragmentOutput {
   @builtin(frag_depth) depth: f32
 }

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var volumeTexture: texture_3d<u32>;
@group(0) @binding(2) var canvasTexture: texture_2d<u32>;
@group(0) @binding(3) var volumeSampler: sampler;

@vertex
fn vert_main(@builtin(vertex_index) vertex_idx: u32) -> VertexOutput {
    var result: VertexOutput;
    result.position = vec4<f32>(0, 0, 0, 0);
    return result;
}

@fragment
fn frag_main(@location(0) vertColour: vec4<f32>) -> @location(0) vec4<f32> {
    return vertColour;
}