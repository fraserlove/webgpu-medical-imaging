struct Uniforms {
    transformation: mat4x4<f32>,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var volumeTexture: texture_3d<f32>;
@group(0) @binding(2) var mipTexture: texture_storage_2d<rgba16float, write>;

@compute
@workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) globalID: vec3<u32>) {
    var size: vec3<i32> = textureDimensions(volumeTexture);
    var maxIntensity: f32 = 0; // Only dealing with unsigned integers
    let pixelCoord: vec2<i32> = vec2<i32>(i32(globalID.x), i32(globalID.y));
    
    for (var k: i32 = 0; k < size.z; k++) {
        var pixel: vec4<f32> = textureLoad(volumeTexture, vec3<i32>(pixelCoord, k), 0);
        // Intensity stored over 8-bit red and green channels
        var intensity = (pixel.x + pixel.y * 255) / 256;
        if (intensity > maxIntensity) {
            maxIntensity = intensity;
        }
    }
    textureStore(mipTexture, pixelCoord, vec4<f32>(maxIntensity, maxIntensity, maxIntensity, 1));
 }