import { describe, expect, it, vi } from 'vitest';
import { KeyboardInputController, type KeyboardCallbacks } from '../src/input/keyboard-input-controller';

describe('KeyboardInputController', () => {
  it('reports Caps Lock state from keyboard events', () => {
    const callbacks: KeyboardCallbacks = { text: vi.fn(), space: vi.fn(), backspace: vi.fn(), escape: vi.fn(), activity: vi.fn(), capsLock: vi.fn() };
    const controller = new KeyboardInputController(callbacks);
    const event = new KeyboardEvent('keydown', { key: 'a' });
    Object.defineProperty(event, 'getModifierState', { value: (key: string) => key === 'CapsLock' });
    document.dispatchEvent(event);
    expect(callbacks.capsLock).toHaveBeenCalledWith(true);
    controller.destroy();
  });
});
