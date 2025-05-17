
import { SiteSettings } from '@/types/siteSettings';

export const defaultSettings: Partial<SiteSettings> = {
  siteName: 'Shalom Job Center',
  logo: '/lovable-uploads/840dfb44-1c4f-4475-9321-7f361be73327.png',
  primaryColor: '#FFD700', // Gold color
  secondaryColor: '#1F2937', // Dark slate gray
  footer: {
    contact: 'Contactez-nous pour toutes demandes.',
    about: 'Shalom Job Center est une plateforme dédiée à l\'accompagnement des candidats et des recruteurs au Togo.',
    terms: 'En utilisant notre service, vous acceptez nos conditions d\'utilisation.',
    policy: 'Nous respectons votre vie privée conformément à la réglementation en vigueur.'
  },
  socialLinks: {
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com'
  },
  reservationSettings: {
    minStay: 1,
    maxStay: 30,
    advanceBookingDays: 90,
    instantBooking: true
  },
  companyInfo: {
    address: '123 Rue de la Paix, Lomé, Togo',
    phone: '+228 22 22 22 22',
    email: 'contact@shalomjobcenter.com',
    registrationNumber: 'SJC-2023-001',
    mapLocation: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.1213490673164!2d1.2268675749243504!3d6.240536027534348!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1023e1c113baa68d%3A0x18c2cc26e6dc902f!2sLom%C3%A9%2C%20Togo!5e0!3m2!1sfr!2sfr!4v1687704354784!5m2!1sfr!2sfr'
  },
  siteDescription: 'Trouvez les meilleures opportunités d\'emploi au Togo et dans toute l\'Afrique de l\'Ouest.',
  adminEmail: 'admin@shalomjobcenter.com',
  supportEmail: 'support@shalomjobcenter.com',
  phoneNumber: '+228 22 22 22 22',
  address: '123 Rue de la Paix, Lomé, Togo',
  fontFamily: 'Inter, sans-serif',
  borderRadius: 'medium',
  darkMode: false,
  defaultLanguage: 'fr',
  defaultCurrency: 'XOF',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  timezone: 'Africa/Lome',
  maxFileSize: 5,
  allowedFileTypes: 'jpg,jpeg,png,pdf,doc,docx',
  imageCompression: 'medium',
  watermarkEnabled: false,
  watermarkOpacity: 0.3,
  currency: 'XOF',
  testMode: true,
  commissionRate: 5,
  minWithdrawalAmount: 10000,
  facebookUrl: 'https://facebook.com',
  twitterUrl: 'https://twitter.com',
  instagramUrl: 'https://instagram.com',
  linkedinUrl: 'https://linkedin.com',
  youtubeUrl: 'https://youtube.com',
  enableSocialLogin: true,
  enableSocialSharing: true,
  notificationSettings: {
    emailNotifications: true,
    newContactFormAlert: true,
    contactFormEmailTemplate: 'Bonjour Admin, \n\nVous avez reçu un nouveau message de contact de la part de {{name}}. \n\nEmail: {{email}} \nSujet: {{subject}} \nMessage: {{message}} \n\nCordialement, \nVotre système de notification automatique'
  }
};
