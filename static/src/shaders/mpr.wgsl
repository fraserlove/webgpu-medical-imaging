struct Uniforms {
    width: f32,
    level: f32
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var mipTexture: texture_2d<f32>;

@vertex
fn vert_main(@location(0) position: vec2<f32>) -> @builtin(position) vec4<f32> {
    return vec4<f32>(position, 0.0, 1.0);
}

@fragment
fn frag_main(@builtin(position) coord: vec4<f32>) -> @location(0) vec4<f32> {
    var texel = textureLoad(mipTexture, vec2<i32>(coord.xy), 0);
    // Only the red window width and window level need to be calculated as texture is greyscale
    var grey = (texel.r - (uniforms.level + uniforms.width / 2)) / uniforms.width;
    return vec4(grey, grey, grey, 1);
}