struct Uniforms {
    transform: mat4x4<f32>,
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
        var sample = textureSample(volumeTexture, volumeSampler, coords);
        var intensity = i32(sample.x * 65536); // 0 to 2^16
        var transferCoords = vec2<i32>(intensity % i32(uniforms.transferWidth), intensity / i32(uniforms.transferWidth));
        var colour: vec4<f32> = textureLoad(transferTexture, transferCoords, 0);
        accColour.r += (1.0 - accColour.a) * colour.a * colour.r;
        accColour.g += (1.0 - accColour.a) * colour.a * colour.g;
        accColour.b += (1.0 - accColour.a) * colour.a * colour.b;
        accColour.a += (1.0 - accColour.a) * colour.a;
        if (accColour.a >= 0.95) { break; }
    }
    return accColour;
 }