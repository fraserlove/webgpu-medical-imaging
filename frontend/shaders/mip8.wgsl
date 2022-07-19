struct Uniforms {
    transform: mat4x4<f32>
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var volumeTexture: texture_3d<f32>;
@group(0) @binding(2) var volumeSampler: sampler;

@vertex
fn vert_main(@location(0) position: vec2<f32>) -> @builtin(position) vec4<f32> {
    return vec4<f32>(position, 0.0, 1.0);
}

@fragment
fn frag_main(@builtin(position) coord: vec4<f32>) -> @location(0) vec4<f32> {
    var size = vec3<f32>(textureDimensions(volumeTexture));
    var maxIntensity: f32 = 0; // Only dealing with unsigned integers
    for (var k = 0; k < i32(size.z); k++) {
        var transformed = uniforms.transform * vec4<f32>(coord.xy, f32(k), 1.0);
        // Scale down transformed coordinates to fit within 0->1 range
        var uvz_coords = vec3<f32>(transformed.x / size.x, transformed.y / size.y, transformed.z / size.z);
        var sample = textureSample(volumeTexture, volumeSampler, uvz_coords);
        // Check transformed coordinate is still inside bounds - removes texture clamp artefact
        if (transformed.x < size.x && transformed.x > 0 && transformed.y < size.y && transformed.y > 0 && transformed.z < size.z && transformed.z > 0) {
            // Intensity stored over 8-bit red and green channels
            var intensity = texel.x;
            if (intensity > maxIntensity) {
                maxIntensity = intensity;
            }
        }
    }
    return vec4<f32>(maxIntensity, maxIntensity, maxIntensity, 1);
 }