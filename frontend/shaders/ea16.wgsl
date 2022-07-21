struct Uniforms {
    transform: mat4x4<f32>,
    slabCentre: f32,
    noSamples: f32
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
    var colour: vec4<f32>;
    let noSamples = 1;
    let emmisiveColour = vec4<f32>(1, 1, 1, 1);
    var start = i32(uniforms.slabCentre - uniforms.noSamples / 2);
    var end = i32(uniforms.slabCentre + uniforms.noSamples / 2);
    //for (var k = 0; k < i32(size.z); k++) {
    for (var k = start; k < end; k++) {
        var transformed = uniforms.transform * vec4<f32>(coord.xy, f32(k), 1.0);
        // Scale down transformed coordinates to fit within 0->1 range
        var uvz_coords = vec3<f32>(transformed.x / size.x, transformed.y / size.y, transformed.z / size.z);
        // Check transformed coordinate is still inside bounds - removes texture clamp artefact
        if (transformed.x < size.x && transformed.x > 0 && transformed.y < size.y && transformed.y > 0 && transformed.z < size.z && transformed.z > 0) {
            var sample = textureSample(volumeTexture, volumeSampler, uvz_coords);
            // Intensity stored over 8-bit red and green channels
            var intensity = (sample.x + sample.y * 255) / 256;
            colour = intensity * emmisiveColour;
        }
    }
    return colour;
 }