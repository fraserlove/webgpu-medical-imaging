// Move this compute shader into a another shader, with the code being in the fragment part of it.
// Vertex part of shader should be the same as in shader.wgsl (just standard code). From the fragment part output the colour and save
// into a 2d output texture bound to the output of the fragment shader. Then use this 2d texture as an input to the other
// shader. So two separate render pipelines, rewrite this shader into a fragment shader, this shader writes to a texture pixel
// by pixel via the fragment shader for the other shader to take and display on the screen.

struct Uniforms {
    transform: mat4x4<f32>
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var volumeTexture: texture_3d<f32>;

@vertex
fn vert_main(@location(0) position: vec2<f32>) -> @builtin(position) vec4<f32> {
    return vec4<f32>(position, 0.0, 1.0);
}

@fragment
fn frag_main(@builtin(position) coord: vec4<f32>) -> @location(0) vec4<f32> {
    var size = textureDimensions(volumeTexture);
    var maxIntensity: f32 = 0; // Only dealing with unsigned integers
    for (var k = 0; k < size.z; k++) {
        var transformed = vec4<i32>(uniforms.transform * vec4<f32>(coord.xy, f32(k), 1.0));
        // Check transformed coordinate is still inside bounds - removes texture clamp artefact
        if (transformed.x < size.x && transformed.x > 0 && transformed.y < size.y && transformed.y > 0 && transformed.z < size.z && transformed.z > 0) {
            var texel: vec4<f32> = textureLoad(volumeTexture, transformed.xyz, 0);
            // Intensity stored over 8-bit red and green channels
            var intensity: f32 = (texel.x + texel.y * 255) / 256;
            if (intensity > maxIntensity) {
                maxIntensity = intensity;
            }
        }
    }
    return vec4<f32>(maxIntensity, maxIntensity, maxIntensity, 1);
 }