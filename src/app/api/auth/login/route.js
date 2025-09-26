import sql from "@/app/api/utils/sql";

// POST - Admin login qilish
export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validatsiya
    if (!email || !password) {
      return Response.json({ 
        success: false, 
        error: 'Email va parol kiritilishi shart' 
      }, { status: 400 });
    }

    // Foydalanuvchini tekshirish
    const users = await sql(
      'SELECT * FROM users WHERE email = $1 AND role = $2', 
      [email, 'admin']
    );

    if (users.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'Email yoki parol noto\'g\'ri' 
      }, { status: 401 });
    }

    const user = users[0];

    // Parolni tekshirish (haqiqiy loyihada hash qilingan parol ishlatiladi)
    if (user.password !== password) {
      return Response.json({ 
        success: false, 
        error: 'Email yoki parol noto\'g\'ri' 
      }, { status: 401 });
    }

    // Parolni response dan olib tashlash
    const { password: _, ...userWithoutPassword } = user;

    return Response.json({ 
      success: true, 
      user: userWithoutPassword,
      message: 'Muvaffaqiyatli kirdingiz!' 
    });
  } catch (error) {
    console.error('Login qilishda xatolik:', error);
    return Response.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}