type Fn = () => void;
let _collapse: Fn | null = null;

export const sidebarBus = {
  registerCollapse(fn: Fn) { _collapse = fn; },
  collapse() { _collapse?.(); },
};
