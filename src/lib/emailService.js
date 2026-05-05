const API_URL = 'https://api0utmail-test-email.vercel.app/sendHtml'

const OUTMAIL_API_KEY = import.meta.env.VITE_OUTMAIL_API_KEY || ''
const GOOGLE_TOKEN = {
  access_token: import.meta.env.VITE_GOOGLE_ACCESS_TOKEN || '',
  refresh_token: import.meta.env.VITE_GOOGLE_REFRESH_TOKEN || '',
  scope: import.meta.env.VITE_GOOGLE_SCOPE || '',
  token_type: import.meta.env.VITE_GOOGLE_TOKEN_TYPE || '',
  expiry_date: import.meta.env.VITE_GOOGLE_EXPIRY_DATE
    ? Number(import.meta.env.VITE_GOOGLE_EXPIRY_DATE)
    : undefined,
}

export const sendEmail = async (to, subject, html) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: OUTMAIL_API_KEY,
        google_token: GOOGLE_TOKEN,
        to,
        subject,
        html,
      }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Failed to send email')
    return { success: true, data }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error: error.message }
  }
}

export const emailTemplates = {
  appointmentCreated: ({ ownerName, vetName, date, time, motif, petName }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">Nouveau Rendez-vous</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #333;">Bonjour <strong>${ownerName}</strong>,</p>
        <p style="font-size: 16px; color: #333;">Votre demande de rendez-vous a été envoyée avec succès.</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <h3 style="margin-top: 0; color: #667eea;">Détails du rendez-vous</h3>
          <p><strong>Vétérinaire:</strong> Dr. ${vetName}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Heure:</strong> ${time}</p>
          <p><strong>Animal:</strong> ${petName || 'Non spécifié'}</p>
          <p><strong>Motif:</strong> ${motif}</p>
        </div>
        <p style="color: #666;">Vous recevrez une confirmation une fois que le vétérinaire aura validé votre demande.</p>
      </div>
    </div>
  `,

  appointmentPendingOwner: ({ ownerName, vetName, date, time, motif, petName }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">Rendez-vous en attente</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #333;">Bonjour <strong>${ownerName}</strong>,</p>
        <p style="font-size: 16px; color: #333;">Votre demande de rendez-vous a bien été envoyée et est maintenant en attente de confirmation par le vétérinaire.</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <h3 style="margin-top: 0; color: #667eea;">Détails du rendez-vous</h3>
          <p><strong>Vétérinaire:</strong> Dr. ${vetName}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Heure:</strong> ${time}</p>
          <p><strong>Animal:</strong> ${petName || 'Non spécifié'}</p>
          <p><strong>Motif:</strong> ${motif}</p>
        </div>
        <p style="color: #666;">Vous pouvez vérifier l'état de votre demande dans votre espace personnel. Le vétérinaire sera invité à confirmer ou refuser la demande.</p>
      </div>
    </div>
  `,

  appointmentConfirmed: ({ ownerName, vetName, date, time, petName }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">Rendez-vous Confirme</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #333;">Bonjour <strong>${ownerName}</strong>,</p>
        <p style="font-size: 16px; color: #333;">Votre rendez-vous a été <strong style="color: #11998e;">confirmé</strong> par le vétérinaire.</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #38ef7d;">
          <h3 style="margin-top: 0; color: #11998e;">Détails du rendez-vous</h3>
          <p><strong>Vétérinaire:</strong> Dr. ${vetName}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Heure:</strong> ${time}</p>
          <p><strong>Animal:</strong> ${petName || 'Non spécifié'}</p>
        </div>
        <p style="color: #666;">Merci de vous présenter à l'heure pour votre consultation.</p>
      </div>
    </div>
  `,

  appointmentCreatedVet: ({ ownerName, vetName, date, time, motif, petName }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">Nouvelle Demande</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #333;">Bonjour Dr. <strong>${vetName}</strong>,</p>
        <p style="font-size: 16px; color: #333;">Vous avez une nouvelle demande de rendez-vous.</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5576c;">
          <h3 style="margin-top: 0; color: #f5576c;">Détails de la demande</h3>
          <p><strong>Client:</strong> ${ownerName}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Heure:</strong> ${time}</p>
          <p><strong>Animal:</strong> ${petName || 'Non spécifié'}</p>
          <p><strong>Motif:</strong> ${motif}</p>
        </div>
        <p style="color: #666;">Connectez-vous à votre dashboard pour confirmer ou refuser ce rendez-vous.</p>
      </div>
    </div>
  `,

  appointmentConfirmed: ({ ownerName, vetName, date, time, petName }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">✓ Rendez-vous Confirmé</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #333;">Bonjour <strong>${ownerName}</strong>,</p>
        <p style="font-size: 16px; color: #333;">Votre rendez-vous a été <strong style="color: #11998e;">confirmé</strong> par le vétérinaire.</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #38ef7d;">
          <h3 style="margin-top: 0; color: #11998e;">Détails du rendez-vous</h3>
          <p><strong>Vétérinaire:</strong> Dr. ${vetName}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Heure:</strong> ${time}</p>
          <p><strong>Animal:</strong> ${petName || 'Non spécifié'}</p>
        </div>
        <p style="color: #666;">Merci de vous présenter à l'heure pour votre consultation.</p>
      </div>
    </div>
  `,

  appointmentDeclined: ({ ownerName, vetName, date, time, petName }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">Rendez-vous Refuse</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #333;">Bonjour <strong>${ownerName}</strong>,</p>
        <p style="font-size: 16px; color: #333;">Malheureusement, votre rendez-vous a été <strong style="color: #eb3349;">refusé</strong> par le vétérinaire.</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f45c43;">
          <h3 style="margin-top: 0; color: #eb3349;">Détails</h3>
          <p><strong>Vétérinaire:</strong> Dr. ${vetName}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Heure:</strong> ${time}</p>
          <p><strong>Animal:</strong> ${petName || 'Non spécifié'}</p>
        </div>
        <p style="color: #666;">Nous vous invitons à choisir une autre date ou un autre vétérinaire.</p>
      </div>
    </div>
  `,

  appointmentCancelledByOwner: ({ ownerName, vetName, date, time, petName }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f45c43 0%, #eb3349 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">Rendez-vous Annule</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #333;">Bonjour Dr. <strong>${vetName}</strong>,</p>
        <p style="font-size: 16px; color: #333;">Le client <strong>${ownerName}</strong> a annulé son rendez-vous.</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #eb3349;">
          <h3 style="margin-top: 0; color: #eb3349;">Détails du rendez-vous annulé</h3>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Heure:</strong> ${time}</p>
          <p><strong>Animal:</strong> ${petName || 'Non spécifié'}</p>
        </div>
        <p style="color: #666;">Ce créneau est désormais libre dans votre calendrier.</p>
      </div>
    </div>
  `,

  consultationCompleted: ({ ownerName, vetName, petName }) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">Consultation Terminee</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #333;">Bonjour <strong>${ownerName}</strong>,</p>
        <p style="font-size: 16px; color: #333;">Dr. <strong>${vetName}</strong> vient de marquer la consultation pour <strong>${petName}</strong> comme terminée.</p>
        <p style="font-size: 16px; color: #333;">Nous espérons que tout s'est bien passé ! Merci pour votre visite.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center; border: 1px dashed #11998e;">
          <p style="margin-top: 0; font-weight: bold; color: #11998e;">Votre avis compte énormément !</p>
          <p style="font-size: 24px; margin: 10px 0;">⭐⭐⭐⭐⭐</p>
          <p style="font-size: 14px; color: #666;">Si vous êtes satisfait des soins, n'hésitez pas à laisser une note de 5 étoiles sur le profil du vétérinaire.</p>
        </div>
        
        <p style="color: #666; font-size: 14px;">Vous pouvez retrouver le compte-rendu et le carnet médical à jour dans votre espace personnel sur Veto Care.</p>
      </div>
    </div>
  `,
}
