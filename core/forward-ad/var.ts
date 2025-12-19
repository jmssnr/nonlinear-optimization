export class Var {
  value: number;
  derivative: number;

  constructor(value: number, derivative: number = 0) {
    this.value = value;
    this.derivative = derivative;
  }

  add(other: Var): Var {
    return new Var(
      this.value + other.value,
      this.derivative + other.derivative,
    );
  }

  subtract(other: Var): Var {
    return new Var(
      this.value - other.value,
      this.derivative - other.derivative,
    );
  }

  multiply(other: Var): Var {
    return new Var(
      this.value * other.value,
      this.derivative * other.value + this.value * other.derivative,
    );
  }

  power(scalar: number): Var {
    return new Var(
      this.value ** scalar,
      scalar * this.value ** (scalar - 1) * this.derivative,
    );
  }

  exp(): Var {
    const expValue = Math.exp(this.value);
    return new Var(expValue, expValue * this.derivative);
  }
}
