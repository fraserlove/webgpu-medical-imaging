export const projectionPlane = {
    vertexSize: 4 * 4, // Byte size of one vertex
    positionOffset: 0,
    UVOffset: 4 * 2,
    vertexCount: 6,

    vertices: new Float32Array([
        // Position and UV Coordinates
        1.0,  1.0,    1.0, 0.0,
        1.0, -1.0,    1.0, 1.0,
       -1.0, -1.0,    0.0, 1.0,
        1.0,  1.0,    1.0, 0.0,
       -1.0, -1.0,    0.0, 1.0,
       -1.0,  1.0,    0.0, 0.0
    ])
}