export const concernFilters = [
  ["all", "All Needs"],
  ["daily-wellness", "Daily Wellness"],
  ["active", "Active Lifestyle"],
  ["digestive", "Digestive Rituals"],
  ["seasonal", "Seasonal Well-being"],
  ["beauty", "Beauty & Grooming"]
];

// Botanicals nav sub-tabs -> product filter. Values map to product `format`
// (see ProductGrid), except 'spice' which matches spice categories.
export const botanicalFilters = [
  ["capsules", "Capsules"],
  ["powders", "Powder"],
  ["teas", "Leaves"],
  ["seeds", "Seeds"],
  ["spice", "Spice"],
  ["oils", "Oils"]
];

export const formatNames = {
  "capsules": "Capsules",
  "powders": "Powders",
  "teas": "Leaves & Teas",
  "seeds": "Seeds & Spices",
  "oils": "Oils",
  "body-care": "Body Care"
};

export function FilterDropdown() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentNeed = urlParams.get('need') || 'all';

  return `
    <div class="w-full flex justify-end items-center mb-8">
      <div class="relative w-full md:w-72">
        <label for="need-dropdown" class="sr-only">Shop By Need</label>
        <select id="need-dropdown" class="w-full appearance-none bg-surface/50 backdrop-blur-md border border-surface/50 text-primary font-label-md text-label-md px-6 py-4 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer hover:shadow-lg transition-shadow duration-300">
          ${concernFilters.map(([value, label]) => `<option value="${value}" ${value === currentNeed ? 'selected' : ''}>${label}</option>`).join("")}
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-primary">
          <span class="material-symbols-outlined">expand_more</span>
        </div>
      </div>
    </div>
  `;
}
