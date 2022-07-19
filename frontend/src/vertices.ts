export const projectionPlane = {
    vertexSize: 4 * 2, // Byte size of one vertex
    positionOffset: 0,
    vertexCount: 6,

    vertices: new Float32Array([
        // Position coordinates
        1.0,  1.0,
        1.0, -1.0,
       -1.0, -1.0,
        1.0,  1.0,
       -1.0, -1.0,
       -1.0,  1.0,
    ])
}