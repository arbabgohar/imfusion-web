import { describe, it, expect } from 'vitest';
import { makeSpherePhantom, countVoxels } from './phantom';

const spec = { size: 64, radius: 20, inside: 1000, outside: 0 };

describe('Sphere phantom', () => {
  it('REQ-PH-001: volume has size^3 voxels', () => {
    expect(makeSpherePhantom(spec).length).toBe(64 ** 3);
  });

  it('REQ-PH-002: sphere voxel count is within 5% of 4/3*pi*r^3', () => {
    const n = countVoxels(makeSpherePhantom(spec), 1000);
    const expected = (4 / 3) * Math.PI * 20 ** 3;
    expect(Math.abs(n - expected) / expected).toBeLessThan(0.05);
  });

  it('REQ-PH-003: center is inside value, corner is background value', () => {
    const d = makeSpherePhantom(spec);
    const mid = 32;
    expect(d[mid + mid * 64 + mid * 64 * 64]).toBe(1000);
    expect(d[0]).toBe(0);
  });

  it('REQ-PH-004: only the two specified intensities appear', () => {
    const d = makeSpherePhantom(spec);
    expect(countVoxels(d, 1000) + countVoxels(d, 0)).toBe(d.length);
  });

  it('REQ-PH-005: generation is deterministic', () => {
    expect(makeSpherePhantom(spec)).toEqual(makeSpherePhantom(spec));
  });

  it('REQ-PH-006: invalid inputs are rejected', () => {
    expect(() => makeSpherePhantom({ ...spec, size: 0 })).toThrow();
    expect(() => makeSpherePhantom({ ...spec, size: 10.5 })).toThrow();
    expect(() => makeSpherePhantom({ ...spec, radius: 0 })).toThrow();
    expect(() => makeSpherePhantom({ ...spec, radius: -3 })).toThrow();
  });
});