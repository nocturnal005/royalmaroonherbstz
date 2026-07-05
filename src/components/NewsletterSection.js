export function NewsletterSection() {
  return `
    <section class="py-24 px-margin-desktop bg-surface text-center">
      <div class="max-w-2xl mx-auto">
        <span class="material-symbols-outlined text-primary text-4xl mb-6" data-icon="auto_awesome">auto_awesome</span>
        <h2 class="font-headline-lg text-headline-lg text-primary mb-4">Join the Alchemist's Circle</h2>
        <p class="font-body-md text-body-md text-secondary mb-10">
          Receive seasonal ritual guides, early access to artisanal releases, and invitations to our herbalism workshops.
        </p>
        <form class="flex flex-col md:flex-row gap-0 max-w-lg mx-auto" onsubmit="event.preventDefault(); alert('Subscribed to rituals!');">
          <label for="newsletter-email" class="sr-only">Email Address</label>
          <input id="newsletter-email" required class="flex-grow bg-surface-container-low border-secondary-container text-primary font-label-md text-label-md focus:ring-0 focus:border-primary px-6 py-4 placeholder:text-secondary-fixed-dim" placeholder="Email Address" type="email"/>
          <button type="submit" class="bg-primary text-surface px-10 py-4 font-label-md text-label-md uppercase tracking-widest hover:bg-on-primary-container transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">Subscribe</button>
        </form>
      </div>
    </section>
  `;
}
