import { TYPING_SELECTOR } from '../constants'

/** Check if event target is an input that should not trigger shortcuts */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof Element)) return false
  return target.matches(TYPING_SELECTOR)
}
