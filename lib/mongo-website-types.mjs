// Small provider-neutral value types keep historical timestamp precision and
// existing repository field transforms without loading Firebase at runtime.
export class Timestamp {
  constructor(seconds, nanoseconds) {
    if (!Number.isInteger(seconds) || seconds < -62135596800 || seconds > 253402300799) throw new Error('Timestamp seconds out of range');
    if (!Number.isInteger(nanoseconds) || nanoseconds < 0 || nanoseconds >= 1000000000) throw new Error('Timestamp nanoseconds out of range');
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }
  static now() { return Timestamp.fromMillis(Date.now()); }
  static fromDate(date) { return Timestamp.fromMillis(date.getTime()); }
  static fromMillis(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    return new Timestamp(seconds, Math.floor((milliseconds - seconds * 1000) * 1000000));
  }
  // Match the previous server SDK's Date rounding and integer-millisecond API.
  toDate() { return new Date(this.seconds * 1000 + Math.round(this.nanoseconds / 1000000)); }
  toMillis() { return this.seconds * 1000 + Math.floor(this.nanoseconds / 1000000); }
  isEqual(other) { return !!other && this.seconds === other.seconds && this.nanoseconds === other.nanoseconds; }
  valueOf() { return `${String(this.seconds + 62135596800).padStart(12, '0')}.${String(this.nanoseconds).padStart(9, '0')}`; }
  toJSON() { return { seconds: this.seconds, nanoseconds: this.nanoseconds }; }
}

export class GeoPoint {
  constructor(latitude, longitude) {
    if (!Number.isFinite(latitude) || Math.abs(latitude) > 90 || !Number.isFinite(longitude) || Math.abs(longitude) > 180) throw new Error('Invalid geographic coordinates');
    this.latitude = latitude;
    this.longitude = longitude;
  }
  isEqual(other) { return !!other && this.latitude === other.latitude && this.longitude === other.longitude; }
  toJSON() { return { latitude: this.latitude, longitude: this.longitude }; }
}

export class VectorValue {
  constructor(values) {
    if (!Array.isArray(values) || values.some(value => typeof value !== 'number')) throw new Error('Vector must contain numbers');
    this.values = [...values];
  }
  toArray() { return [...this.values]; }
  isEqual(other) { const values = other?.toArray?.(); return Array.isArray(values) && values.length === this.values.length && values.every((value, index) => Object.is(value, this.values[index])); }
}

class ServerTimestampTransform {}
class DeleteTransform {}
class NumericIncrementTransform { constructor(operand) { this.operand = operand; } }
const serverTimestamp = new ServerTimestampTransform();
const deleteField = new DeleteTransform();
export function fieldTransformKind(value) {
  if (value instanceof ServerTimestampTransform) return 'timestamp';
  if (value instanceof DeleteTransform) return 'delete';
  if (value instanceof NumericIncrementTransform) return 'increment';
  return null;
}
export class FieldValue {
  static serverTimestamp() { return serverTimestamp; }
  static delete() { return deleteField; }
  static increment(operand) {
    if (typeof operand !== 'number') throw new Error('Increment operand must be numeric');
    return new NumericIncrementTransform(operand);
  }
  static vector(values) { return new VectorValue(values); }
}
