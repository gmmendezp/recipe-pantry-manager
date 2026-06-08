class ResizeObserverStub implements ResizeObserver {
  disconnect() {}

  observe() {}

  unobserve() {}
}

globalThis.ResizeObserver ??= ResizeObserverStub;
