export type OpiconParams = {
  id?: number|string;
  set: string;
  name: string;
  size?: string|OpiconSize;
};
export enum OpiconSize {
  extraLarge,
  large,
  medium,
  small
}