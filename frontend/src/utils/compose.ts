export function compose(...functions: Function[]) {
  if (functions.length === 0) {
    return <T>(arg: T) => arg;
  }

  if (functions.length === 1) {
    return functions[0];
  }

  return functions.reduce((a, b) => (...args: any) => a(b(...args)));
}

