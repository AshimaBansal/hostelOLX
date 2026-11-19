import { pool } from '../../database.js';

export function createProfileRepository(database = pool) {
  async function findProfileById(profileId) {
    const result = await database.query(
      `SELECT
         p.id,
         p.full_name AS "fullName",
         p.phone,
         COALESCE(p.program, p.academic_role) AS "program",
         p.academic_role AS "academicRole",
         p.hostel_name AS "hostel",
         p.hostel_name AS "hostelName",
         p.room_number AS "roomNo",
         p.room_number AS "roomNumber",
         p.avatar_url AS "avatarUrl",
         p.created_at AS "createdAt",
         p.updated_at AS "updatedAt",
         ai.email,
         COALESCE(pr.role, 'STUDENT') AS "role"
       FROM profiles p
       LEFT JOIN auth_identities ai ON ai.profile_id = p.id
       LEFT JOIN profile_roles pr ON pr.profile_id = p.id
       WHERE p.id = $1
       LIMIT 1`,
      [profileId]
    );

    return result.rows[0] ?? null;
  }

  async function updateProfile(profileId, fields = {}) {
    const sets = [];
    const values = [];
    let idx = 1;

    if (fields.fullName !== undefined) {
      sets.push(`full_name = $${idx++}`);
      values.push(fields.fullName.trim());
    }
    if (fields.phone !== undefined) {
      sets.push(`phone = $${idx++}`);
      values.push(fields.phone ? fields.phone.trim() : null);
    }
    if (fields.hostelName !== undefined || fields.hostel !== undefined) {
      const h = fields.hostelName ?? fields.hostel;
      sets.push(`hostel_name = $${idx++}`);
      values.push(h ? h.trim() : null);
    }
    if (fields.roomNumber !== undefined || fields.roomNo !== undefined) {
      const r = fields.roomNumber ?? fields.roomNo;
      sets.push(`room_number = $${idx++}`);
      values.push(r ? r.trim() : null);
    }
    if (fields.program !== undefined || fields.academicRole !== undefined) {
      const prog = fields.program ?? fields.academicRole;
      sets.push(`program = $${idx++}`);
      values.push(prog ? prog.trim() : null);
      sets.push(`academic_role = $${idx++}`);
      values.push(prog ? prog.trim() : null);
    }
    if (fields.avatarUrl !== undefined) {
      sets.push(`avatar_url = $${idx++}`);
      values.push(fields.avatarUrl ? fields.avatarUrl.trim() : null);
    }

    if (sets.length === 0) {
      return findProfileById(profileId);
    }

    sets.push(`updated_at = NOW()`);
    values.push(profileId);

    await database.query(
      `UPDATE profiles
       SET ${sets.join(', ')}
       WHERE id = $${idx}`,
      values
    );

    return findProfileById(profileId);
  }

  return {
    findProfileById,
    updateProfile,
  };
}

export const profileRepository = createProfileRepository();
