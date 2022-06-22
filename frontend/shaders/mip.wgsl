struct Uniforms {
    test: f32
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var volumeTexture: texture_3d<f32>;
@group(0) @binding(2) var mipTexture: texture_storage_2d<rgba8unorm, write>;

@compute
@workgroup_size(64)
fn main() {
    for(var i: i32 = 0; i < 100; i++) {
        for(var j: i32 = 0; j < 100; j++) {
            // Should create a 100 x 100 red square
            textureStore(mipTexture, vec2<i32>(i, j), vec4<f32>(255, 0, 0, 255));
        }
    }
    //var size: vec3<i32> = textureDimensions(volumeTexture);
    //for(var i: i32 = 0; i < size.x; i++) {
    //    for (var j: i32 = 0; j < size.y; j++) {
    //        var max: f32 = -1e32;
    //        for (var k: i32 = 0; k < size.z; k++) {
    //            var pixel: vec4<f32> = textureLoad(volumeTexture, vec3<i32>(i, j, k), 0);
    //            if (pixel.x > max) {
    //                max = pixel.x;
    //            }
    //        }
    //        textureStore(mipTexture, vec2<i32>(i, j), vec4<f32>(max, max, max, 1));
    //    }
    //}
 }