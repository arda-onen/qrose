import { EventEmitter } from "events";

/** Tek süreç içinde panel SSE abonelerine anlık bildirim */
export const waiterCallBus = new EventEmitter();
waiterCallBus.setMaxListeners(300);

export function waiterChannel(menuId) {
  return `menu:${menuId}`;
}
