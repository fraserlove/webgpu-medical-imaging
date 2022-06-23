struct Uniforms {
    transformation: mat4x4<f32>,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var volumeTexture: texture_3d<f32>;
@group(0) @binding(2) var mipTexture: texture_storage_2d<rgba16float, write>;

@compute
@workgroup_size(1)
fn main() {
    for(var i: i32 = 0; i < 512; i++) {
        for(var j: i32 = 0; j < 512; j++) {
            var pixel: vec4<f32> = textureLoad(volumeTexture, vec3<i32>(i, j, 1), 0);
            textureStore(mipTexture, vec2<i32>(i, j), pixel);
        }
    }
    //var size: vec3<i32> = textureDimensions(volumeTexture);
    //for(var i: i32 = 0; i < size.x; i++) {
    //    for (var j: i32 = 0; j < size.y; j++) {
    //        var max: f32 = -1e32;
    //        for (var k: i32 = 0; k < size.z; k++) {
    //            var pixel: vec4<f32> = textureLoad(volumeTexture, vec3<i32>(i, j, k), 0);
    //            var val = (pixel.x + pixel.y * 255) / 256;
    //            if (val > max) {
    //                max = val;
    //            }
    //        }
    //        textureStore(mipTexture, vec2<i32>(i, j), vec4<f32>(max, max, max, 1));
    //    }
    //}
 }