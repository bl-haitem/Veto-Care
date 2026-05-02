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
  en_attente: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  confirme: { label: 'Confirmé', className: 'bg-green-100 text-green-800 border-green-200' },
  annule: { label: 'Annulé', className: 'bg-red-100 text-red-800 border-red-200' },
  termine: { label: 'Terminé', className: 'bg-blue-100 text-blue-800 border-blue-200' },
}

export const vetStatusConfig = {
  pending: { label: 'En vérification', className: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approuvé', className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Refusé', className: 'bg-red-100 text-red-800' },
}

export const TIME_SLOTS = []
for (let h = 8; h <= 16; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`)
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`)
}
TIME_SLOTS.push('17:00')
