struct Uniforms {
    transform: mat4x4<f32>,
    lightDir: vec3<f32>,
    bbox: vec3<f32>,
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

// Algorithm - https://education.siggraph.org/static/HyperGraph/raytrace/rtinter3.htm
fn ray_box_intersection(bboxMin: vec3<f32>, bboxMax: vec3<f32>, pos: vec3<f32>, dir: vec3<f32>) -> vec2<f32> {
    var inv_dir = vec3<f32>(1 / dir.x, 1 / dir.y, 1 / dir.z);
    var bot = inv_dir * (bboxMin - pos);
    var top = inv_dir * (bboxMax - pos);
    var rmin = min(top, bot);
    var rmax = max(top, bot);
    var near = max(rmin.x, max(rmin.y, rmin.z));
    var far = min(rmax.x, min(rmax.y, rmax.z));
    return vec2<f32>(near, far);
}

fn intensity(sample: vec4<f32>) -> f32 {
    return sample.x * 256 + sample.y * 65280; // 0 to 2^16
}

fn normal(pos: vec3<f32>, size: vec3<f32>) -> vec3<f32> {
    var delta = vec3<f32>(0, 0, 0);
    delta.x = intensity(textureSample(volumeTexture, volumeSampler, pos + vec3<f32>(1 / size.x, 0, 0))) - intensity(textureSample(volumeTexture, volumeSampler, pos - vec3<f32>(1 / size.x, 0, 0)));
    delta.y = intensity(textureSample(volumeTexture, volumeSampler, pos + vec3<f32>(0, 1 / size.y, 0))) - intensity(textureSample(volumeTexture, volumeSampler, pos - vec3<f32>(0, 1 / size.y, 0)));
    delta.z = intensity(textureSample(volumeTexture, volumeSampler, pos + vec3<f32>(0, 0, 1 / size.z))) - intensity(textureSample(volumeTexture, volumeSampler, pos - vec3<f32>(0, 0, 1 / size.z)));
    return normalize(delta * vec3<f32>(f32(size.x) - 1.0 / 2.0 * uniforms.bbox.x, f32(size.y) - 1.0 / 2.0 * uniforms.bbox.y, f32(size.z) - 1.0 / 2.0 * uniforms.bbox.z));
}

@fragment
fn frag_main(@builtin(position) coord: vec4<f32>) -> @location(0) vec4<f32> {
    var size = vec3<f32>(textureDimensions(volumeTexture));
    var accColour = vec4<f32>(0, 0, 0, 0);

    var pos = uniforms.transform * vec4<f32>(coord.xy, 0, 1);
    var dir = uniforms.transform * vec4<f32>(0, 0, 1, 0);
    var intersect = ray_box_intersection(vec3<f32>(0, 0, 0), size, pos.xyz, dir.xyz);
    var near = i32(intersect.x);
    var far = i32(intersect.y);

    for (var k = max(0, near); k < far; k++) {
        var coords = pos.xyz + f32(k) * dir.xyz;
        // Scale down transformed coordinates to fit within 0->1 range
        coords = vec3<f32>(coords.x / size.x, coords.y / size.y, coords.z / size.z);
        var val = intensity(textureSample(volumeTexture, volumeSampler, coords));
        var transferCoords = vec2<i32>(i32(val) % i32(uniforms.transferWidth), i32(val) / i32(uniforms.transferWidth));
        var colour: vec4<f32> = textureLoad(transferTexture, transferCoords, 0);
        accColour.r += (1 - accColour.a) * colour.a * colour.r;
        accColour.g += (1 - accColour.a) * colour.a * colour.g;
        accColour.b += (1 - accColour.a) * colour.a * colour.b;
        accColour.a += (1 - accColour.a) * colour.a;

        // Shading
        var toLight = normalize(uniforms.lightDir);
        var lightColour = vec3<f32>(1, 1, 1);
        var shadingFactor = max(0, dot(toLight, normal(coords, size)));
        accColour.r *= shadingFactor;
        accColour.g *= shadingFactor;
        accColour.b *= shadingFactor;

        if (accColour.a >= 0.95) { break; }
    }

    return accColour;
 }