export interface SpherePhantomSpec {
    size: number;     // cube edge length in voxels
    radius: number;   // sphere radius in voxels
    inside: number;   // intensity inside the sphere
    outside: number;  // background intensity
  }
  
  export function makeSpherePhantom(spec: SpherePhantomSpec): Float32Array {
    const { size, radius, inside, outside } = spec;
    if (!Number.isInteger(size) || size < 1) throw new Error('size must be a positive integer');
    if (!(radius > 0)) throw new Error('radius must be greater than 0');
  
    const data = new Float32Array(size * size * size).fill(outside);
    const c = (size - 1) / 2;
    const r2 = radius * radius;
    for (let z = 0; z < size; z++) {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const d2 = (x - c) ** 2 + (y - c) ** 2 + (z - c) ** 2;
          if (d2 <= r2) data[x + y * size + z * size * size] = inside;
        }
      }
    }
    return data;
  }
  
  export function countVoxels(data: Float32Array, value: number): number {
    let n = 0;
    for (let i = 0; i < data.length; i++) if (data[i] === value) n++;
    return n;
  }