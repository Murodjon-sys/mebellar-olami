import sql from "@/app/api/utils/sql";

// Admin foydalanuvchisini yaratish
async function seedAdminUser() {
  try {
    // Avval mavjud admin foydalanuvchisini tekshirish
    const existingAdmin = await sql(
      'SELECT * FROM users WHERE email = $1 AND role = $2',
      ['admin@marhabomebellar.uz', 'admin']
    );

    if (existingAdmin.length > 0) {
      console.log('Admin foydalanuvchi allaqachon mavjud');
      return;
    }

    // Yangi admin foydalanuvchisini yaratish
    const result = await sql(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      ['Admin Foydalanuvchi', 'admin@marhabomebellar.uz', 'admin123', 'admin']
    );

    console.log('Admin foydalanuvchi muvaffaqiyatli yaratildi:', result[0]);
  } catch (error) {
    console.error('Admin foydalanuvchi yaratishda xatolik:', error);
  }
}

// Funksiyani chaqirish
seedAdminUser();