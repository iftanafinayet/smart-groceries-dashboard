/**
 * Sample data generator that mirrors the backend catalog in `scrapper-harga-pangan/seed_staples.js`.
 * This file is documentation-only for the dashboard side and helps designers/mock data stay aligned.
 */

const STAPLE_FOODS = [
  { name: 'Beras', unit: 'kg', basePrice: 12000, volatility: 0.1 },
  { name: 'Gula Pasir', unit: 'kg', basePrice: 14000, volatility: 0.1 },
  { name: 'Minyak Goreng & Mentega', unit: 'Liter', basePrice: 15500, volatility: 0.08 },
  { name: 'Daging Sapi & Daging Ayam', unit: 'kg', basePrice: 95000, volatility: 0.2 },
  { name: 'Telur Ayam', unit: 'kg', basePrice: 26000, volatility: 0.2 },
  { name: 'Susu', unit: 'Liter', basePrice: 18000, volatility: 0.1 },
  { name: 'Jagung', unit: 'kg', basePrice: 8000, volatility: 0.15 },
  { name: 'Minyak Tanah atau Gas ELPIJI', unit: 'Tabung', basePrice: 22000, volatility: 0.05 },
  { name: 'Garam Beriodium', unit: 'kg', basePrice: 5000, volatility: 0.05 },
]

const PROVINCES = [
  'DKI Jakarta',
  'Jawa Barat',
  'Jawa Timur',
  'Jawa Tengah',
  'Bali',
  'Banten',
]

const CITY_MAP = {
  'DKI Jakarta': ['Jakarta Pusat', 'Jakarta Utara', 'Jakarta Timur', 'Jakarta Selatan', 'Jakarta Barat'],
  'Jawa Barat': ['Bandung', 'Bekasi', 'Depok', 'Bogor', 'Cirebon'],
  'Jawa Timur': ['Surabaya', 'Malang', 'Kediri', 'Madiun', 'Banyuwangi'],
  'Jawa Tengah': ['Semarang', 'Solo', 'Magelang', 'Tegal', 'Pekalongan'],
  'Bali': ['Denpasar', 'Badung', 'Gianyar', 'Klungkung'],
  'Banten': ['Serang', 'Tangerang', 'Cilegon', 'Tangsel'],
}

async function seed() {
  console.log('Generating aligned mock records for dashboard review...')

  const reports = []

  for (const food of STAPLE_FOODS) {
    for (const province of PROVINCES) {
      const cities = CITY_MAP[province] || ['Umum']
      for (const city of cities) {
        for (let dayOffset = 0; dayOffset < 6; dayOffset += 1) {
          const date = new Date()
          date.setDate(date.getDate() - dayOffset * 3)

          const price = food.basePrice * (1 + (Math.random() * 2 - 1) * food.volatility)

          reports.push({
            komoditas: food.name,
            lokasi: `${city}, ${province}`,
            harga: Math.round(price / 50) * 50,
            tanggal: date.toISOString(),
            sumber: dayOffset % 4 === 0 ? 'user' : 'official',
            moderationStatus: dayOffset % 4 === 0 ? 'pending' : 'approved',
            verifications: Math.floor(Math.random() * 10),
            catatan: dayOffset % 4 === 0 ? 'Laporan user untuk moderasi admin.' : '',
          })
        }
      }
    }
  }

  console.log(`Generated ${reports.length} aligned mock reports.`)
  console.log('Use this shape when mocking frontend state or snapshot tests.')
}

seed().catch(console.error)
