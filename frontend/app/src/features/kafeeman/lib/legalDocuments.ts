export type LegalDocumentId = 'terms-of-use' | 'terms-and-conditions' | 'privacy-policy';

export type LegalSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LegalDocument = {
  id: LegalDocumentId;
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: LegalSection[];
};

const COMPANY = 'Kafe Eman Sdn. Bhd.';
const APP = 'Kafe Eman';
const SUPPORT_EMAIL = 'legal@kafeeman.my';
const PRIVACY_EMAIL = 'privacy@kafeeman.my';

export const LEGAL_DOCUMENTS: Record<LegalDocumentId, LegalDocument> = {
  'terms-of-use': {
    id: 'terms-of-use',
    title: 'Terms of Use',
    subtitle: 'Rules for using the Kafe Eman mobile application',
    lastUpdated: '28 June 2025',
    sections: [
      {
        title: '1. Agreement',
        paragraphs: [
          `These Terms of Use ("Terms") govern your access to and use of the ${APP} mobile application and related services (collectively, the "Service") operated by ${COMPANY} ("we", "us", or "our"), registered in Malaysia.`,
          'By creating an account, placing an order, or otherwise using the Service, you confirm that you have read, understood, and agree to be bound by these Terms, our Terms & Conditions (for purchases), and our Privacy Policy. If you do not agree, please do not use the Service.',
        ],
      },
      {
        title: '2. Eligibility',
        paragraphs: [
          'You must be at least 18 years of age, or the age of legal majority in your jurisdiction, to create an account and place orders for products that may contain caffeine or require payment.',
          'If you use the Service on behalf of a business or another person, you represent that you have authority to bind that entity or individual to these Terms.',
        ],
      },
      {
        title: '3. Your account',
        paragraphs: [
          'You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.',
          'You agree to provide accurate, current, and complete information during registration and to update your profile when details change.',
          'We may suspend or terminate accounts that violate these Terms, engage in fraud or abuse, or pose a risk to other users or our operations.',
        ],
        bullets: [
          'Do not share your password or OTP codes with anyone.',
          'Notify us immediately if you suspect unauthorised access.',
          'One personal account per individual unless we approve otherwise.',
        ],
      },
      {
        title: '4. Acceptable use',
        paragraphs: [
          'You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to:',
        ],
        bullets: [
          'Misuse promotions, loyalty points, or referral programmes.',
          'Submit false orders, chargebacks, or fraudulent payment information.',
          'Harass staff, riders, or other customers via in-app chat or support channels.',
          'Reverse engineer, scrape, or interfere with the Service or its infrastructure.',
          'Use the Service in any way that could harm Kafe Eman’s reputation or operations.',
        ],
      },
      {
        title: '5. Orders & payments',
        paragraphs: [
          'Product availability, pricing, and branch hours are displayed in the app and may change without prior notice. Final prices, fees, and applicable taxes are confirmed at checkout.',
          'Payment is processed through supported methods (including Touch ’n Go eWallet, card, and online banking where available). You authorise us to charge your selected payment method for completed orders.',
          'Detailed rules for ordering, cancellation, refunds, and delivery are set out in our Terms & Conditions.',
        ],
      },
      {
        title: '6. Loyalty & rewards',
        paragraphs: [
          'Points, tiers, and promotional offers are discretionary benefits subject to programme rules displayed in the app. We may modify, suspend, or discontinue rewards with reasonable notice where required by law.',
          'Points have no cash value, are non-transferable, and may expire as stated in the Rewards section.',
        ],
      },
      {
        title: '7. Intellectual property',
        paragraphs: [
          `All content in the Service—including logos, menus, photographs, text, and software—is owned by or licensed to ${COMPANY} and protected by applicable intellectual property laws.`,
          'You receive a limited, non-exclusive, revocable licence to use the app for personal, non-commercial ordering. You may not copy, modify, or distribute our content without written consent.',
        ],
      },
      {
        title: '8. Disclaimers',
        paragraphs: [
          'The Service is provided on an "as is" and "as available" basis. While we strive for accuracy, we do not warrant that menu information, estimated delivery times, or live tracking will be uninterrupted or error-free.',
          'Coffee and food products may contain allergens. Please review item descriptions and contact the branch if you have dietary requirements.',
        ],
      },
      {
        title: '9. Limitation of liability',
        paragraphs: [
          `To the fullest extent permitted by Malaysian law, ${COMPANY} shall not be liable for indirect, incidental, or consequential damages arising from your use of the Service.`,
          'Our total liability for any claim relating to the Service shall not exceed the amount you paid to us for the order giving rise to the claim in the preceding three (3) months.',
        ],
      },
      {
        title: '10. Changes & contact',
        paragraphs: [
          'We may update these Terms from time to time. Material changes will be notified in-app or by email where appropriate. Continued use after the effective date constitutes acceptance.',
          `Questions about these Terms: ${SUPPORT_EMAIL}.`,
        ],
      },
    ],
  },

  'terms-and-conditions': {
    id: 'terms-and-conditions',
    title: 'Terms & Conditions',
    subtitle: 'Purchase, delivery, pickup, and cancellation policy',
    lastUpdated: '28 June 2025',
    sections: [
      {
        title: '1. Scope',
        paragraphs: [
          `These Terms & Conditions ("T&C") apply to all orders placed through the ${APP} app for pickup or delivery from participating Kafe Eman branches in Malaysia.`,
          'These T&C supplement our Terms of Use and Privacy Policy. In the event of conflict regarding an order, these T&C prevail for purchase-related matters.',
        ],
      },
      {
        title: '2. Placing an order',
        paragraphs: [
          'An order is an offer to purchase. We confirm acceptance when you receive an order confirmation in the app and/or the branch begins preparing your order.',
          'You are responsible for verifying branch location, order type (pickup or delivery), items, customisation (sugar, ice), delivery address, and payment method before submitting payment.',
          'Order notes are requests only; we will accommodate them where reasonably possible but cannot guarantee special instructions.',
        ],
      },
      {
        title: '3. Pricing & fees',
        paragraphs: [
          'All prices are listed in Malaysian Ringgit (RM) unless stated otherwise. Applicable promotions, voucher codes, and loyalty point redemptions are applied at checkout according to their stated conditions.',
          'Delivery orders may incur a delivery fee displayed before payment. Minimum spend requirements for promos or free delivery are shown at checkout.',
          'We reserve the right to correct pricing errors before order acceptance and to cancel orders affected by manifest errors.',
        ],
      },
      {
        title: '4. Pickup orders',
        paragraphs: [
          'For pickup, please arrive at the selected branch within a reasonable time after your order is marked ready. Items not collected within the branch’s holding period may be discarded without refund, except where required by law.',
          'Valid photo identification may be requested for large orders or age-restricted products where applicable.',
        ],
      },
      {
        title: '5. Delivery orders',
        paragraphs: [
          'Delivery is available within designated service areas around participating branches. Estimated arrival times are indicative and may vary due to traffic, weather, or order volume.',
          'Live GPS tracking is provided for convenience when you grant location permission. Tracking shows rider progress along the delivery route and does not guarantee exact arrival time.',
          'You must provide a complete, accessible delivery address and be available to receive the order. Repeated failed delivery attempts may result in cancellation without refund of delivery fees.',
        ],
      },
      {
        title: '6. Cancellations & refunds',
        paragraphs: [
          'You may cancel an active order from the app only while it is in early preparation (typically before a rider is dispatched). Once preparation is advanced or the rider is en route, cancellation may no longer be available.',
          'If we cancel your order due to unavailability, branch closure, or operational issues, you will receive a full refund to your original payment method or app wallet where applicable.',
          'Refunds for quality concerns must be reported promptly via Help Center with your order reference. We may request photos or additional information to assess claims.',
        ],
        bullets: [
          'Redeemed loyalty points are refunded if an eligible cancellation is approved.',
          'Promotional discounts are not reinstated if an order is cancelled after application.',
          'Refund processing times depend on your payment provider (typically 3–14 business days).',
        ],
      },
      {
        title: '7. Promotions & vouchers',
        paragraphs: [
          'Promo codes are subject to validity dates, minimum spend, branch eligibility, and product exclusions stated in the offer.',
          'Only one promotional code may apply per order unless explicitly stated. We may void orders that abuse promotional mechanics.',
        ],
      },
      {
        title: '8. Loyalty points',
        paragraphs: [
          'Points are earned on qualifying spend as displayed in the app (typically 1 point per RM 1, subject to programme rules). Redemption value (e.g. 100 points = RM 1 off) is shown at checkout.',
          'Points are credited after order completion. Adjustments may be made for cancellations, refunds, or suspected misuse.',
        ],
      },
      {
        title: '9. Product quality & allergens',
        paragraphs: [
          'We prepare beverages and food to high standards. If you receive an incorrect or unsatisfactory item, contact us within 24 hours of delivery or pickup.',
          'Menu items may contain milk, nuts, gluten, soy, and other allergens. Customers with severe allergies should exercise caution and contact the branch directly before ordering.',
        ],
      },
      {
        title: '10. Governing law',
        paragraphs: [
          'These T&C are governed by the laws of Malaysia. Disputes shall be subject to the exclusive jurisdiction of the courts of Malaysia, without prejudice to your statutory consumer rights.',
          `Order-related enquiries: ${SUPPORT_EMAIL} or in-app Help Center.`,
        ],
      },
    ],
  },

  'privacy-policy': {
    id: 'privacy-policy',
    title: 'Privacy Policy',
    subtitle: 'How we collect, use, and protect your personal data',
    lastUpdated: '28 June 2025',
    sections: [
      {
        title: '1. Introduction',
        paragraphs: [
          `${COMPANY} ("Kafe Eman", "we", "us") respects your privacy and is committed to protecting personal data in accordance with the Personal Data Protection Act 2010 (PDPA) of Malaysia and applicable guidelines.`,
          'This Privacy Policy explains what information we collect when you use the Kafe Eman mobile app, why we collect it, how we use and share it, and the choices available to you.',
        ],
      },
      {
        title: '2. Data we collect',
        paragraphs: ['We may collect the following categories of personal data:'],
        bullets: [
          'Identity & contact: name, email address, phone number, profile photo (if provided).',
          'Account & authentication: login identifiers, encrypted credentials managed via our authentication provider.',
          'Order & payment: order history, branch, delivery address, payment method type, transaction references (we do not store full card numbers).',
          'Location: GPS coordinates when you grant permission—for live delivery tracking and showing your position on the map.',
          'Device & usage: app version, device type, crash logs, and interaction data to improve performance.',
          'Communications: messages with riders or support, feedback, and notification preferences.',
        ],
      },
      {
        title: '3. How we use your data',
        paragraphs: ['We process personal data for legitimate purposes including:'],
        bullets: [
          'Processing and fulfilling your orders (pickup and delivery).',
          'Providing live order tracking, rider coordination, and customer support.',
          'Managing loyalty points, rewards, and promotional offers.',
          'Sending transactional notifications (order status, delivery updates).',
          'Securing the app, preventing fraud, and enforcing our terms.',
          'Complying with legal, tax, and regulatory obligations.',
          'Improving menus, branches, and app features through aggregated analytics.',
        ],
      },
      {
        title: '4. Location information',
        paragraphs: [
          'When you allow location access, we use precise GPS data to display your position on the delivery map, calculate routes, and improve delivery accuracy. You may deny or revoke permission at any time in your device Settings; some features (such as live map centreing) will be limited without location access.',
          'We do not use location data for unrelated advertising. Location is processed only while you use relevant features or during active delivery tracking, as permitted by your device settings.',
        ],
      },
      {
        title: '5. Legal basis & consent',
        paragraphs: [
          'We rely on your consent, contractual necessity (to perform your order), legitimate interests (security and service improvement), and legal obligation as applicable under PDPA.',
          'You may withdraw consent for optional processing (such as marketing) without affecting the lawfulness of processing based on consent before withdrawal.',
        ],
      },
      {
        title: '6. Sharing & disclosure',
        paragraphs: [
          'We do not sell your personal data. We may share information with:',
        ],
        bullets: [
          'Branch staff and delivery partners—to fulfil your order.',
          'Payment processors (e.g. Touch ’n Go, card networks)—to process payments securely.',
          'Cloud infrastructure & authentication providers—to host data and manage secure sign-in.',
          'Professional advisers and authorities—where required by law or to protect rights and safety.',
        ],
      },
      {
        title: '7. Data retention',
        paragraphs: [
          'We retain personal data only as long as necessary for the purposes described above, including order records for accounting and legal compliance (typically up to seven years where required), and account data while your account remains active.',
          'Anonymised or aggregated data may be retained indefinitely for analytics.',
        ],
      },
      {
        title: '8. Security',
        paragraphs: [
          'We implement appropriate technical and organisational measures—including encryption in transit, access controls, and secure cloud hosting—to protect personal data against unauthorised access, loss, or misuse.',
          'No method of transmission over the internet is completely secure. Please use a strong password and keep your device updated.',
        ],
      },
      {
        title: '9. Your rights (PDPA)',
        paragraphs: [
          'Subject to PDPA and applicable law, you may have the right to request access to and correction of your personal data, withdraw consent for optional processing, request limitation or deletion where legally applicable, and lodge a complaint with the relevant Malaysian authority.',
          `To exercise these rights, contact ${PRIVACY_EMAIL}. We may need to verify your identity before responding.`,
        ],
        bullets: [
          'Access and obtain a copy of personal data we hold about you.',
          'Correct inaccurate or incomplete information.',
          'Withdraw marketing consent at any time.',
          'Request deletion where retention is no longer necessary or lawful.',
        ],
      },
      {
        title: '10. Children',
        paragraphs: [
          'The Service is not directed at children under 13. We do not knowingly collect personal data from children without parental consent. Contact us if you believe a child has provided data without authorisation.',
        ],
      },
      {
        title: '11. International transfers',
        paragraphs: [
          'Your data may be processed on secure servers located outside Malaysia (for example, cloud hosting). Where this occurs, we ensure appropriate safeguards consistent with PDPA requirements.',
        ],
      },
      {
        title: '12. Updates & contact',
        paragraphs: [
          'We may update this Privacy Policy periodically. The "Last updated" date at the top will change, and significant updates may be notified in-app.',
          `Data protection enquiries: ${PRIVACY_EMAIL}. General support: help@kafeeman.my.`,
        ],
      },
    ],
  },
};

export function getLegalDocument(id: LegalDocumentId): LegalDocument {
  return LEGAL_DOCUMENTS[id];
}

export const LEGAL_LINKS: { id: LegalDocumentId; label: string }[] = [
  { id: 'terms-of-use', label: 'Terms of Use' },
  { id: 'terms-and-conditions', label: 'Terms & Conditions' },
  { id: 'privacy-policy', label: 'Privacy Policy' },
];
