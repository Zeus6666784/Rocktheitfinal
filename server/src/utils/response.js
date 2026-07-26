// Standard envelope: { success, data } or { success: false, error: { code, message } }.
export const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });

export const fail = (res, status, code, message) =>
  res.status(status).json({ success: false, error: { code, message } });
