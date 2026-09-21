-- Frame (Atelier Frame) Seed Data
-- Run this after running schema.sql

-- 1. Insert Initial Rooms
INSERT INTO public.rooms (id, name, slug, category, description, cover_image_url, is_private, members_count, active_count, is_featured)
VALUES
(
  'street-photography',
  'Street Photography',
  'street-photography',
  'Photography',
  'Curated visual forum for geometric framing, candid light studies, and everyday human movement. Strictly original 35mm & digital work.',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBciLOWFL5ZYR_89o0WU85NqPe75G6DBnAkC4kbU5qxsTHILVOjaejxSKBSkRvhnRij1NfizdFntL94sRpJ8v-4iPHgaYDNCWn4BHRH1IhEY-rdMb2Y8vmLjKrqgSyg-ZGSHuvRfYxlRS3BvieUgqPcPnthZkx0dzauIQmIrntrrSBXZguW0y_dXV96p-4NJCynjnKIn7CDX9EtxOfN9ubvGxeazNsa5pPrTjvM81adJZU2qvR8R8sl-a0dbi3MFzdZPG_UPWy6Aw',
  false,
  14200,
  82,
  true
),
(
  'home-cooking',
  'Home Cooking & Craft',
  'home-cooking',
  'Culinary',
  'Sourdough ferments, heirloom culinary recipes, slow food techniques, and rustic ceramic table settings.',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC-s_FMLrPkkyJa1qO39uedKD1W1YmXOBv4UqAo3_nQVy7T56O4tV9feYTKaokpvgl67mCZnUFzqzFt1whQogeFVZIW6smVtCSEjE0DH2NgpIVZnXJaV9S_sjnMgm97qoSaxjkdI2LC5nd1XBYnl3DiA692AO_Lrr8eYorYxySxvhiX4G5jK9lh1ekQqeUgKsev-afHQjQ3nUifHO5DMGmFtLbSg0p4DhyO5yZaS8vZ7B0YXZkQE2pge8Yo8C9ON5k--gdcWWQzcw',
  false,
  8900,
  45,
  false
),
(
  'nordic-ceramics',
  'Nordic Ceramics Studio',
  'nordic-ceramics',
  'Visual Arts',
  'Tactile stoneware, minimal glazes, reduction kiln firings, and sculptural balance.',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCMPgCDBQq3pP82BnHev0Vbx39riw0Dvp9ZG93Ql0B354lspPlD2vzqF7vkhtJQRukjc9Ntypz44QsRdN__7_3qOfZEkIztSF2tqxPqE_la9vh1fxHj5qGPYTbQTCIoPKLYhnm2_ws4KO_7nqjVn043H2KAYbEF1cPRX2vzAm3OBV9FVGeJ4yjVHfgJV5HLtUHELvb3QjpcA0ZiO8NLCv8mSfAabXgvkgPFpqdTUspq-kXkZyFpMSsBne_VrlrAQ7N1M9VmWFThpw',
  false,
  5300,
  29,
  false
)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Active Challenge
INSERT INTO public.challenges (id, room_id, title, subtitle, description, cover_image_url, closes_at, guidelines, entries_count)
VALUES
(
  'your-city-after-dark',
  'street-photography',
  'Your city after dark',
  'Street Photography Community',
  'Explore the mood, geometry, and hidden stories of nighttime in your neighbourhood. Emphasize low light, natural reflections, and nocturnal rhythms.',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDAm4H2_o_Tb95w40en9zcJ7TehQavWMU-zWjytN0EvBEr-7xxqFIBmIFevbqUf1ALTin7mNP3RBpZW5gfrPeGbOParILYu7v07AbiyfZ2kbMPF2M5726DqZ1DH5CD1A9MPvUc6LGThxnAa3Zyvzn92LQNeu4t7SpHls_GdyqFq2HONaAP5ZT9tZzjuZpMwrw1WDJsIjNTy-Pgq8BJGznhreQcxWzMOxpUBcnRbxTohUQ9hylYnLOcDLXNVFwwnPYJgn9Spki12nA',
  timezone('utc'::text, now() + interval '4 days'),
  '["Original work only", "Any camera format", "Include technical notes"]'::jsonb,
  348
)
ON CONFLICT (id) DO NOTHING;
