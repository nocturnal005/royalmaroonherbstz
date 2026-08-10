// Privacy Policy — statutory notice under the Personal Data Protection Act, 2022
// (Tanzania) and the Personal Data Protection (Personal Data Collection and
// Processing) Regulations, 2023. Content is written to match what the site and
// backend actually do: checkout collects name/phone/email/region/notes; card
// details never reach our servers (hosted gateway checkout); there are no
// analytics or advertising scripts; the cart is in-memory only (no cookies or
// localStorage); audit_logs records request IP addresses.
//
// Uses the storefront design system (Lora headlines / Plus Jakarta body,
// maroon-green palette) in a single-column reading measure for legibility.

const EFFECTIVE_DATE = '10 August 2026';

const SECTIONS = [
  {
    id: 'who-we-are',
    title: '1. Who we are',
    body: `
      <p>Royal Maroon Herbs ("Royal Maroon Herbs", "we", "us" or "our") is a business registered in the United Republic of Tanzania, trading in herbal and botanical wellness products through our website at royalmaroonherbstz.com and our retail shops in Dar es Salaam and Zanzibar.</p>
      <p>For the purposes of the Personal Data Protection Act, 2022 and the regulations made under it, Royal Maroon Herbs is the <strong>data controller</strong> responsible for the personal data described in this policy.</p>
      <ul>
        <li><strong>Registered address:</strong> Palm Village, Mikocheni B &ndash; Mwai Kibaki Road, Kinondoni District, Dar es Salaam, Tanzania</li>
        <li><strong>Company registration number:</strong> [Company Registration Number]</li>
        <li><strong>Taxpayer Identification Number (TIN):</strong> [TIN]</li>
        <li><strong>Contact for privacy matters:</strong> <a href="mailto:sales@royalmaroonherbstz.com">sales@royalmaroonherbstz.com</a></li>
        <li><strong>Telephone:</strong> +255 793 306 987 &middot; +255 776 908 735</li>
      </ul>
    `
  },
  {
    id: 'scope',
    title: '2. Scope of this policy',
    body: `
      <p>This policy explains how we collect, use, share, store and protect personal data when you:</p>
      <ul>
        <li>visit or place an order through royalmaroonherbstz.com;</li>
        <li>contact us by email, telephone or WhatsApp, including wholesale enquiries; or</li>
        <li>purchase from, or contact, our Dar es Salaam or Zanzibar shops.</li>
      </ul>
      <p>It does not apply to the personal data of our employees and contractors, which is covered by a separate internal notice, nor to third-party websites that we link to.</p>
    `
  },
  {
    id: 'what-we-collect',
    title: '3. Personal data we collect',
    body: `
      <h3>3.1 Information you give us</h3>
      <ul>
        <li><strong>Order details:</strong> your full name, mobile telephone number, email address, delivery region and any delivery instructions you choose to enter (for example directions or a house description).</li>
        <li><strong>Purchase records:</strong> the products ordered, quantities, order value and delivery charge.</li>
        <li><strong>Wholesale enquiries:</strong> your business or buyer name, contact details, requested products and quantities, and delivery location, submitted through our wholesale form, by email or over WhatsApp.</li>
        <li><strong>Correspondence:</strong> the content of messages you send us and our replies.</li>
      </ul>

      <h3>3.2 Information collected automatically</h3>
      <ul>
        <li><strong>Technical and security records:</strong> when a payment or checkout request is made, our systems record the internet protocol (IP) address the request came from, together with the date, time and outcome of the action. These records exist to detect fraud, investigate errors and maintain an audit trail.</li>
      </ul>
      <p>Our website does <strong>not</strong> use advertising cookies, analytics scripts, tracking pixels or third-party profiling tools. See section&nbsp;8 for details.</p>

      <h3>3.3 Payment information we do not collect</h3>
      <p>We do <strong>not</strong> collect, process or store your card number, card security code (CVV) or mobile money PIN. Card payments are completed on a secure payment page hosted by our licensed payment provider, and mobile money payments are authorised by you directly on your own handset. Our systems receive only a payment reference, the amount, the payment method, and whether the payment succeeded or failed.</p>
    `
  },
  {
    id: 'sensitive-data',
    title: '4. Health and other sensitive information',
    body: `
      <p>We sell herbal and botanical products. We do <strong>not</strong> ask for, and do not require, information about your health, medical history, conditions or treatments in order to sell to you, and we ask that you do not enter such information into free-text fields such as delivery instructions, or send it to us by message.</p>
      <p>We recognise that a record of the products a person has purchased may, in some circumstances, allow inferences to be drawn about their health or wellbeing. We therefore treat purchase records as confidential, restrict internal access to them, and do not use them to build health profiles, to categorise you by inferred condition, or for targeted advertising.</p>
      <p>Where you nonetheless volunteer health-related information to us, we will process it only so far as necessary to respond to you, and will not retain it longer than needed for that purpose.</p>
    `
  },
  {
    id: 'how-we-use',
    title: '5. How we use your personal data, and our lawful basis',
    body: `
      <p>We process personal data only where we have a lawful basis to do so:</p>
      <table>
        <thead>
          <tr><th scope="col">Purpose</th><th scope="col">Lawful basis</th></tr>
        </thead>
        <tbody>
          <tr><td>Creating your order, taking payment and confirming the transaction</td><td>Performance of a contract with you</td></tr>
          <tr><td>Preparing, dispatching and delivering your order, including passing your name, telephone number and delivery details to a courier</td><td>Performance of a contract with you</td></tr>
          <tr><td>Responding to enquiries, wholesale requests, and customer support</td><td>Performance of a contract, or our legitimate interest in answering the people who contact us</td></tr>
          <tr><td>Detecting and preventing fraudulent or duplicate transactions, and maintaining security and audit records</td><td>Our legitimate interest in protecting our customers and our business</td></tr>
          <tr><td>Keeping accounting, tax and transaction records</td><td>Compliance with a legal obligation</td></tr>
          <tr><td>Sending marketing or newsletter communications</td><td>Your consent, given separately and withdrawable at any time</td></tr>
          <tr><td>Establishing, exercising or defending legal claims</td><td>Compliance with a legal obligation, or our legitimate interest</td></tr>
        </tbody>
      </table>
      <p>We do not make marketing consent a condition of buying from us. If you consent to marketing, you may withdraw that consent at any time by contacting us, and we will stop sending such communications.</p>
    `
  },
  {
    id: 'sharing',
    title: '6. Who we share your personal data with',
    body: `
      <p>We do not sell your personal data, and we do not share it with third parties for their own marketing purposes. We share it only with the following categories of recipient, and only to the extent necessary:</p>
      <ul>
        <li><strong>Payment providers.</strong> AzamPay, our licensed payment gateway partner, processes payments on our behalf and receives the transaction details necessary to do so, including the amount and, for mobile money payments, the mobile number you are paying from. Card payments are processed through AzamPay's card-processing partner, CoralCommerce Limited, which operates the secure payment page on which you enter your card details.</li>
        <li><strong>Delivery and courier partners.</strong> They receive the recipient name, telephone number, delivery region and delivery instructions needed to complete the delivery.</li>
        <li><strong>Technology and hosting providers.</strong> Providers who host our website, store our data, and supply our business email and messaging services, acting on our instructions.</li>
        <li><strong>Messaging platforms.</strong> Where you choose to contact us via WhatsApp, your message and telephone number are handled by that platform under its own terms and privacy practices.</li>
        <li><strong>Professional advisers.</strong> Accountants, auditors and lawyers, where they need access to provide their services to us.</li>
        <li><strong>Public authorities.</strong> Where we are required to disclose information by law, by a court, or by a competent regulator.</li>
      </ul>
      <p>Where a third party processes personal data on our behalf, we require it to act only on our instructions and to apply appropriate security measures.</p>
    `
  },
  {
    id: 'transfers',
    title: '7. Transfers outside Tanzania',
    body: `
      <p>Some of the service providers we rely on store or process data on servers located outside the United Republic of Tanzania. This includes our website hosting, business email and messaging platforms, and the card-processing infrastructure operated by CoralCommerce Limited, a company registered in England and Wales.</p>
      <p>Where personal data is transferred outside Tanzania, we take steps to ensure it continues to receive an appropriate level of protection, including by using providers who apply recognised security and data protection standards, and by putting contractual protections in place with them. Such transfers are made only where permitted under the Personal Data Protection Act, 2022 and the regulations made under it.</p>
      <p>You may contact us using the details in section&nbsp;1 to ask for further information about transfers relating to your data.</p>
    `
  },
  {
    id: 'cookies',
    title: '8. Cookies and local storage',
    body: `
      <p>Our website does not set advertising or analytics cookies, and does not use tracking pixels or third-party profiling scripts.</p>
      <p>Your shopping cart is held only in your browser's memory for the duration of your visit. It is not written to cookies, local storage or our servers, and it is discarded when you close the tab.</p>
      <p>If we introduce cookies or similar technologies that are not strictly necessary for the website to function, we will inform you and obtain your consent before they are used.</p>
    `
  },
  {
    id: 'retention',
    title: '9. How long we keep your personal data',
    body: `
      <p>We keep personal data only for as long as we need it:</p>
      <ul>
        <li><strong>Completed orders and transaction records:</strong> retained for the period required by Tanzanian tax and accounting law, and then deleted or anonymised.</li>
        <li><strong>Checkout sessions that were started but not completed:</strong> deleted within twelve (12) months.</li>
        <li><strong>Enquiries and correspondence:</strong> retained for up to twenty-four (24) months after the matter is closed, unless a longer period is needed for a legal claim.</li>
        <li><strong>Security and audit records, including IP addresses:</strong> retained for up to twelve (12) months.</li>
        <li><strong>Marketing contact details:</strong> retained until you withdraw consent or ask us to stop.</li>
      </ul>
      <p>Where we are required to retain information for longer by law, or to establish, exercise or defend a legal claim, we will keep it for that period and no longer.</p>
    `
  },
  {
    id: 'security',
    title: '10. How we protect your personal data',
    body: `
      <p>We apply technical and organisational measures appropriate to the risk, including:</p>
      <ul>
        <li>encrypted transmission of data between your browser and our website;</li>
        <li>restricting access to order and customer records to authorised personnel who need it;</li>
        <li>redacting sensitive values, such as telephone numbers and payment identifiers, from our internal system logs;</li>
        <li>not storing card numbers, card security codes or mobile money PINs on our systems at any time; and</li>
        <li>keeping audit records of actions taken on orders and payments.</li>
      </ul>
      <p>While we take these measures seriously, no method of transmission or storage is completely secure, and we cannot guarantee absolute security. If a personal data breach occurs that is likely to affect you, we will notify the Personal Data Protection Commission and, where required, you, without undue delay.</p>
    `
  },
  {
    id: 'your-rights',
    title: '11. Your rights',
    body: `
      <p>Subject to the conditions and exceptions in the Personal Data Protection Act, 2022, you have the right to:</p>
      <ul>
        <li><strong>Be informed</strong> about how we collect and use your personal data;</li>
        <li><strong>Access</strong> the personal data we hold about you;</li>
        <li><strong>Rectify</strong> personal data that is inaccurate or incomplete;</li>
        <li><strong>Erase</strong> personal data where we no longer have a valid reason to keep it;</li>
        <li><strong>Restrict</strong> or <strong>object to</strong> our processing in certain circumstances;</li>
        <li><strong>Withdraw consent</strong> at any time, where our processing is based on consent; and</li>
        <li><strong>Lodge a complaint</strong> with the Personal Data Protection Commission.</li>
      </ul>
      <p>Withdrawing consent does not affect the lawfulness of processing carried out before the withdrawal.</p>
    `
  },
  {
    id: 'exercising-rights',
    title: '12. How to exercise your rights',
    body: `
      <p>To exercise any of the rights in section&nbsp;11, contact us at <a href="mailto:sales@royalmaroonherbstz.com">sales@royalmaroonherbstz.com</a> or on the telephone numbers in section&nbsp;1.</p>
      <p>To protect your information, we will take reasonable steps to verify your identity before acting on a request &mdash; for example by asking you to confirm details of an order you placed. We may decline to disclose personal data where we cannot satisfy ourselves of the requester's identity.</p>
      <p>We will respond within the period required by law. There is no charge for making a request, although we may charge a reasonable fee, or decline to act, where a request is manifestly unfounded or excessive, and we will explain our reasons if we do so.</p>
    `
  },
  {
    id: 'children',
    title: '13. Children',
    body: `
      <p>Our website and products are intended for adults. We do not knowingly collect personal data from children under the age of eighteen (18), and our services are not directed at them.</p>
      <p>If we become aware that we have collected personal data from a child without appropriate consent from a parent or guardian, we will delete it. If you believe a child has provided us with personal data, please contact us using the details in section&nbsp;1.</p>
    `
  },
  {
    id: 'third-party-links',
    title: '14. Links to other websites',
    body: `
      <p>Our website contains links to third-party sites and social media platforms, including Facebook, Instagram, TikTok and YouTube. Following those links takes you to services operated by other organisations.</p>
      <p>We are not responsible for the content, security or privacy practices of those services. We encourage you to read the privacy policy of any website you visit from ours.</p>
    `
  },
  {
    id: 'automated-decisions',
    title: '15. Automated decision-making',
    body: `
      <p>We do not carry out automated decision-making, including profiling, that produces legal effects concerning you or similarly significantly affects you.</p>
    `
  },
  {
    id: 'changes',
    title: '16. Changes to this policy',
    body: `
      <p>We may update this policy from time to time to reflect changes in our practices, our service providers, or the law. The date at the top of this page shows when it was last updated.</p>
      <p>Where a change materially affects how we use your personal data, we will take reasonable steps to bring it to your attention before it takes effect, including by notice on this website and, where appropriate, by email.</p>
    `
  },
  {
    id: 'complaints',
    title: '17. Contact and complaints',
    body: `
      <p>If you have a question or concern about how we handle your personal data, please contact us first at <a href="mailto:sales@royalmaroonherbstz.com">sales@royalmaroonherbstz.com</a>. We take complaints seriously and will investigate and respond to you.</p>
      <p>If you are not satisfied with our response, you have the right to lodge a complaint with the <strong>Personal Data Protection Commission</strong> of the United Republic of Tanzania.</p>
      <p>This policy is governed by the laws of the United Republic of Tanzania.</p>
    `
  }
];

function tocItem(s) {
  return `<li><a class="hover:text-primary transition-colors" href="#${s.id}">${s.title}</a></li>`;
}

function section(s) {
  return `
    <section id="${s.id}" class="scroll-mt-28 pt-10 first:pt-0">
      <h2 class="font-headline-md text-headline-md text-primary mb-4">${s.title}</h2>
      <div class="legal-prose">${s.body}</div>
    </section>`;
}

export function PrivacyPolicy() {
  return `
    <article class="bg-surface">

      <!-- Title band -->
      <header class="w-full bg-primary-container px-margin-mobile md:px-margin-desktop py-16 md:py-20">
        <div class="max-w-3xl mx-auto">
          <span class="block font-label-md text-label-md uppercase tracking-[0.25em] text-tertiary-fixed mb-4">Legal</span>
          <h1 class="font-headline-lg text-headline-lg text-on-primary dark:text-primary-fixed mb-4">Privacy Policy</h1>
          <p class="font-body-md text-body-md text-on-primary-container opacity-80">
            How Royal Maroon Herbs collects, uses and protects your personal data, in accordance with the
            Personal Data Protection Act, 2022 of the United Republic of Tanzania.
          </p>
          <p class="font-label-sm text-label-sm uppercase tracking-wider text-tertiary-fixed mt-6">
            Effective ${EFFECTIVE_DATE}
          </p>
        </div>
      </header>

      <div class="px-margin-mobile md:px-margin-desktop py-12 md:py-16">
        <div class="max-w-3xl mx-auto">

          <!-- Contents -->
          <nav aria-label="Contents" class="mb-12 p-6 md:p-8 bg-surface-container-low border border-surface-container-high">
            <h2 class="font-label-md text-label-md uppercase tracking-wider text-on-tertiary-container mb-4">Contents</h2>
            <ol class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 font-body-md text-body-md text-on-surface-variant">
              ${SECTIONS.map(tocItem).join('')}
            </ol>
          </nav>

          ${SECTIONS.map(section).join('')}

        </div>
      </div>
    </article>
  `;
}
