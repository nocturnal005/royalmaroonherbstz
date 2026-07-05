import bcrypt from 'bcryptjs';
import db from '../config/database.js';

function seedAdmins() {
  console.log('Seeding preview admin accounts...');
  try {
    db.prepare('DELETE FROM admin_users').run();
    
    const salt = bcrypt.genSaltSync(12);
    const superHash = bcrypt.hashSync('Admin123!', salt);
    const editorHash = bcrypt.hashSync('Editor123!', salt);
    const viewerHash = bcrypt.hashSync('Viewer123!', salt);

    db.prepare(`
      INSERT INTO admin_users (id, username, email, password_hash, role, is_active)
      VALUES ('usr_super', 'super_admin', 'super@naturesalchemy.co', ?, 'admin', 1)
    `).run(superHash);

    db.prepare(`
      INSERT INTO admin_users (id, username, email, password_hash, role, is_active)
      VALUES ('usr_editor', 'editor_user', 'editor@naturesalchemy.co', ?, 'editor', 1)
    `).run(editorHash);

    db.prepare(`
      INSERT INTO admin_users (id, username, email, password_hash, role, is_active)
      VALUES ('usr_viewer', 'viewer_user', 'viewer@naturesalchemy.co', ?, 'viewer', 1)
    `).run(viewerHash);

    console.log('✓ Seeding complete:');
    console.log('  - super_admin / Admin123!');
    console.log('  - editor_user / Editor123!');
    console.log('  - viewer_user / Viewer123!');
  } catch (err) {
    console.error('✗ Error seeding admin accounts:', err.message);
  }
}

seedAdmins();
