import { pool } from "../db/pool.js";
import { waiterCallBus, waiterChannel } from "./waiterCallBus.js";

export async function fetchPendingCallsForMenu(menuId) {
  const r = await pool.query(
    `SELECT wc.id, wc.table_id, wc.requested_at, mt.label AS table_label
     FROM waiter_calls wc
     INNER JOIN menu_tables mt ON mt.id = wc.table_id
     WHERE wc.menu_id = $1 AND wc.resolved_at IS NULL
     ORDER BY wc.requested_at ASC`,
    [menuId]
  );
  return r.rows.map((row) => ({
    id: row.id,
    table_id: row.table_id,
    table_label: row.table_label,
    requested_at: row.requested_at
  }));
}

export async function broadcastWaiterCalls(menuId) {
  const calls = await fetchPendingCallsForMenu(menuId);
  waiterCallBus.emit(waiterChannel(menuId), { type: "snapshot", calls });
}
