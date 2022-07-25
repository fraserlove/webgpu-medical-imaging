struct Uniforms {
    transform: mat4x4<f32>,
    slabCentre: f32,
    noSamples: f32,
    transferWidth: f32
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var volumeTexture: texture_3d<f32>;
@group(0) @binding(2) var volumeSampler: sampler;
@group(0) @binding(3) var transferTexture: texture_2d<f32>;

@vertex
fn vert_main(@location(0) position: vec2<f32>) -> @builtin(position) vec4<f32> {
    return vec4<f32>(position, 0.0, 1.0);
}

@fragment
fn frag_main(@builtin(position) coord: vec4<f32>) -> @location(0) vec4<f32> {
    var size = vec3<f32>(textureDimensions(volumeTexture));
    var start = i32(uniforms.slabCentre - uniforms.noSamples / 2);
    var end = i32(uniforms.slabCentre + uniforms.noSamples / 2);

    var accColour = vec4<f32>(0.0, 0.0, 0.0, 0.0);

    for (var k = start; k < end; k++) {
        var transformed = uniforms.transform * vec4<f32>(coord.xy, f32(k), 1.0);
        // Scale down transformed coordinates to fit within 0->1 range
        var uvzCoords = vec3<f32>(transformed.x / size.x, transformed.y / size.y, transformed.z / size.z);
        var sample = textureSample(volumeTexture, volumeSampler, uvzCoords);
        var intensity = i32(sample.x * 65536); // 0 to 2^16
        var transferCoords = vec2<i32>(intensity % i32(uniforms.transferWidth), intensity / i32(uniforms.transferWidth));
        var colour: vec4<f32> = textureLoad(transferTexture, transferCoords, 0);
        // Check transformed coordinate is still inside bounds - removes texture clamp artefact
        if (transformed.x < size.x && transformed.x > 0 && transformed.y < size.y && transformed.y > 0 && transformed.z < size.z && transformed.z > 0) {
            accColour.r += (1.0 - accColour.a) * colour.a * colour.r;
            accColour.g += (1.0 - accColour.a) * colour.a * colour.g;
            accColour.b += (1.0 - accColour.a) * colour.a * colour.b;
            accColour.a += (1.0 - accColour.a) * colour.a;
            if (accColour.a >= 0.95) { break; }
        }
    }
    return accColour;
 }