import sql from "@/app/api/utils/sql";

// GET - Sharhlarni olish
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    let query = `
      SELECT r.*, p.name as product_name 
      FROM reviews r
      LEFT JOIN products p ON r.product_id = p.id
      ORDER BY r.created_at DESC
    `;
    const params = [];

    if (productId) {
      query = `
        SELECT r.*, p.name as product_name 
        FROM reviews r
        LEFT JOIN products p ON r.product_id = p.id
        WHERE r.product_id = $1
        ORDER BY r.created_at DESC
      `;
      params.push(productId);
    }

    const reviews = await sql(query, params);
    
    return Response.json({ success: true, reviews });
  } catch (error) {
    console.error('Sharhlarni olishda xatolik:', error);
    return Response.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}

// POST - Yangi sharh qo'shish
export async function POST(request) {
  try {
    const { customer_name, product_id, rating, comment } = await request.json();

    // Validatsiya
    if (!customer_name || !product_id || !rating) {
      return Response.json({ 
        success: false, 
        error: 'Majburiy maydonlar to\'ldirilmagan' 
      }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return Response.json({ 
        success: false, 
        error: 'Baho 1 dan 5 gacha bo\'lishi kerak' 
      }, { status: 400 });
    }

    // Mahsulotning mavjudligini tekshirish
    const products = await sql('SELECT id FROM products WHERE id = $1', [product_id]);
    if (products.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'Mahsulot topilmadi' 
      }, { status: 404 });
    }

    const result = await sql(`
      INSERT INTO reviews (customer_name, product_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [customer_name, product_id, rating, comment]);

    return Response.json({ 
      success: true, 
      review: result[0],
      message: 'Sharh muvaffaqiyatli qo\'shildi!' 
    });
  } catch (error) {
    console.error('Sharh qo\'shishda xatolik:', error);
    return Response.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}