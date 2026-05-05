export const WILAYAS = [
  "01 - Adrar", "02 - Chlef", "03 - Laghouat", "04 - Oum El Bouaghi", "05 - Batna",
  "06 - Béjaïa", "07 - Biskra", "08 - Béchar", "09 - Blida", "10 - Bouira",
  "11 - Tamanrasset", "12 - Tébessa", "13 - Tlemcen", "14 - Tiaret", "15 - Tizi Ouzou",
  "16 - Alger", "17 - Djelfa", "18 - Jijel", "19 - Sétif", "20 - Saïda",
  "21 - Skikda", "22 - Sidi Bel Abbès", "23 - Annaba", "24 - Guelma", "25 - Constantine",
  "26 - Médéa", "27 - Mostaganem", "28 - M'Sila", "29 - Mascara", "30 - Ouargla",
  "31 - Oran", "32 - El Bayadh", "33 - Illizi", "34 - Bordj Bou Arréridj", "35 - Boumerdès",
  "36 - El Tarf", "37 - Tindouf", "38 - Tissemsilt", "39 - El Oued", "40 - Khenchela",
  "41 - Souk Ahras", "42 - Tipaza", "43 - Mila", "44 - Aïn Defla", "45 - Naâma",
  "46 - Aïn Témouchent", "47 - Ghardaïa", "48 - Relizane", "49 - El M'Ghair",
  "50 - El Meniaa", "51 - Ouled Djellal", "52 - Bordj Badji Mokhtar", "53 - Béni Abbès",
  "54 - Timimoun", "55 - Touggourt", "56 - Djanet", "57 - In Salah", "58 - In Guezzam"
]

export const rdvStatusConfig = {
  pending: { label: 'En attente', className: 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]' },
  confirmed: { label: 'Confirmé', className: 'bg-[#d1fae5] text-[#065f46] border-[#a7f3d0]' },
  cancelled: { label: 'Annulé', className: 'bg-[#fee2e2] text-[#991b1b] border-[#fecaca]' },
  done: { label: 'Terminé', className: 'bg-[#e0f2fe] text-[#075985] border-[#bae6fd]' },
}

export const vetStatusConfig = {
  pending: { label: 'En vérification', className: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approuvé', className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Refusé', className: 'bg-red-100 text-red-800' },
}

export const TIME_SLOTS = []
for (let h = 8; h <= 19; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`)
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`)
}
TIME_SLOTS.push('20:00')

export const SPECIES = ['Chien', 'Chat', 'Lapin', 'Hamster', 'Oiseau', 'Cheval', 'Poisson', 'Mouton', 'Vache', 'Chèvre', 'Autre']

export const speciesImages = {
  'chien': 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&auto=format&fit=crop',
  'chat': 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&auto=format&fit=crop',
  'lapin': 'https://images.unsplash.com/photo-1452857297128-d9c29adba80b?w=600&auto=format&fit=crop',
  'hamster': 'https://images.unsplash.com/photo-1681566904795-0d0a8822bc29?w=600&auto=format&fit=crop',
  'oiseau': 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=600&auto=format&fit=crop',
  'cheval': 'https://images.unsplash.com/photo-1534773728080-33d31da27ae5?w=600&auto=format&fit=crop',
  'poisson': 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&auto=format&fit=crop',
  'mouton': 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=600&auto=format&fit=crop',
  'vache': 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=600&auto=format&fit=crop',
  'chèvre': 'https://images.unsplash.com/photo-1533318087102-b3ad366ed041?w=600&auto=format&fit=crop',
  'autre': 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&auto=format&fit=crop',
}

export const getSpeciesImage = (speciesName) => {
  if (!speciesName) return speciesImages['autre']
  // normalize: remove accents for matching + lowercase
  const normalized = speciesName.trim().toLowerCase()
  return speciesImages[normalized] || speciesImages['autre']
}
