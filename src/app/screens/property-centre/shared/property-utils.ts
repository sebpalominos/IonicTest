export namespace PropertyUtils {
  export function moneyShortener(value: number) {
    if (value >= 1000000) {
      return `${(value/1000000).toFixed(2)}m`;
    }
    if (value > 1000) {
      return `${(value/1000).toFixed()}k`;
    }
    return value;
  };
}