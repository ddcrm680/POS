let isServiceDown = false;
let listeners: ((v: boolean) => void)[] = [];

export function setServiceDown(value: boolean) {
  isServiceDown = value;
  listeners.forEach(fn => fn(isServiceDown));
}

export function subscribeServiceDown(fn: (v: boolean) => void) {
  listeners.push(fn);
  fn(isServiceDown);
  return () => {
    listeners = listeners.filter(l => l !== fn);
  };
}
