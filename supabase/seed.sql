-- Seed data for MyShop

insert into categories (name, slug, description, image_url, sort_order) values
  ('เสื้อผ้า', 'clothing', 'เสื้อผ้าแฟชั่นทุกสไตล์', 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80', 1),
  ('อิเล็กทรอนิกส์', 'electronics', 'แกดเจ็ตและอุปกรณ์ไอที', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80', 2),
  ('ของใช้ในบ้าน', 'home', 'ของแต่งบ้านและเครื่องใช้', 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&q=80', 3),
  ('ความงาม', 'beauty', 'เครื่องสำอางและสกินแคร์', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80', 4)
on conflict (slug) do nothing;

-- Products (linked to categories by slug)
insert into products (category_id, name, slug, description, price, compare_at_price, sku, stock_quantity, images, is_featured)
select c.id, p.name, p.slug, p.description, p.price, p.compare_at_price, p.sku, p.stock_quantity, p.images, p.is_featured
from (values
  ('clothing', 'เสื้อยืดคอตตอนพรีเมียม', 'premium-cotton-tshirt', 'เสื้อยืดผ้าคอตตอน 100% นุ่มสบาย', 390, 590, 'CLO-001', 25, array['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'], true),
  ('electronics', 'หูฟังไร้สาย Bluetooth', 'wireless-bluetooth-headphones', 'หูฟังไร้สายเสียงคมชัด แบตอึด 30 ชม.', 1290, 1990, 'ELE-001', 12, array['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'], true),
  ('home', 'แก้วเซรามิกสไตล์มินิมอล', 'minimal-ceramic-mug', 'แก้วเซรามิกดีไซน์เรียบง่าย 350ml', 250, null, 'HOM-001', 40, array['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80'], false),
  ('beauty', 'เซรั่มบำรุงผิวหน้า', 'face-serum', 'เซรั่มวิตามินซี ช่วยให้ผิวกระจ่างใส', 690, 890, 'BEA-001', 15, array['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80'], true)
) as p(cat_slug, name, slug, description, price, compare_at_price, sku, stock_quantity, images, is_featured)
join categories c on c.slug = p.cat_slug
on conflict (slug) do nothing;