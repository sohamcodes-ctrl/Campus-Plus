/**
 * Base ValueObject class enforcing structural equality and immutability.
 * Value objects have no conceptual identity; they describe characteristics of things.
 */

export abstract class ValueObject<TProps extends Record<string, unknown> | unknown> {
  protected readonly props: Readonly<TProps>;

  constructor(props: TProps) {
    this.props = Object.freeze(props);
  }

  public equals(other?: ValueObject<TProps>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (other.props === undefined) {
      return false;
    }
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }

  public get value(): TProps {
    return this.props;
  }
}
