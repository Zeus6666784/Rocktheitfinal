import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { env } from '../config/env.js';

// Idempotent admin provisioning from env vars. Never overwrites an existing
// admin password; never silently promotes a student to admin unless the env
// explicitly requests it via ADMIN_EMAIL matching an existing account that
// already has role admin (we only ensure role stays admin, not create).
export async function bootstrapAdmin() {
  const { adminName, adminEmail, adminPassword } = env;
  if (!adminEmail || !adminPassword) return;
  const lower = adminEmail.toLowerCase().trim();
  const existing = await User.findOne({ email: lower });
  if (existing) {
    // Only normalize role to admin if it was already admin (never promote).
    if (existing.role === 'admin') {
      if (adminName && existing.name !== adminName) {
        existing.name = adminName;
        await existing.save();
      }
    }
    return;
  }
  const hash = await bcrypt.hash(adminPassword, 10);
  await User.create({ name: adminName || 'Admin', email: lower, password: hash, role: 'admin' });
}