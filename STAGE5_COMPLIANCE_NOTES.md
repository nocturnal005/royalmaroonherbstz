# Stage 5 Compliance & Wording Review Notes

This document contains notes on the preliminary health-claim wording review, data model updates, assumptions, and compliance-aware modifications implemented in **Stage 5: Product Catalogue & Compliance Fields**.

---

## 📋 Wording Changed

To avoid therapeutic, medicinal, or curative claims that could alter classification from "herbal wellness product" to "pharmaceutical drug," the following high-risk phrases were audited and revised:

| Original Wording | Updated Wording | Rationale |
| :--- | :--- | :--- |
| `"Immunity Boost"` | `"Winter Harvest Infusion"` | Removed physiological drug-like immune system claims. |
| `"Seasonal Defense Tea"` | `"Seasonal Wellness Blend"` | Removed "defense" terminology which implies active pathogen prevention. |
| `"stress reduction"` | `"relaxation ritual, quiet moments, and rest"` | Removed clinical anxiety/stress treatment implications. |
| `"support immune defenses"` | `"provide everyday wellness support during seasonal changes"` | Shifted from disease/defense terminology to everyday nutritional/wellness support. |
| `"Gut Health Vitality"` / `"optimal gut performance"` | `"Digestive Comfort Blend"` / `"everyday digestive comfort"` | Removed direct physiological treatment/gut-enhancement claims. |
| `"Soothing Topical Relief"` / `"soothe muscular tension"` | `"Soothing Topical Balm"` / `"A comforting botanical balm for massage and daily skin care"` | Shifted from pain-relief/healing claims to general massage and skin care. |
| `"clear mental fog and ground the nervous system"` | `"promote natural clarity and a sense of grounding"` | Replaced neurological treatment/cognitive alteration claims. |
| `"Therapeutic mineral bath salts"` | `"Relaxing mineral bath salts"` | "Therapeutic" is a restricted medical classification term. |
| `"Healing Balms"` (Filter Format Option) | `"Soothing Balms"` | Removed medicinal healing claim. |
| `"No remedies found..."` (Empty State) | `"No products found..."` | "Remedies" implies curative medical solution. |
| `"remedies handcrafted for holistic healing"` | `"formulas handcrafted for holistic well-being"` | Removed "remedies" and "healing" claims. |

---

## 🛠️ Product Fields Added

The product data model in [products.js](file:///d:/RM_Tanzania/src/data/products.js) has been expanded from simple marketing copy to a robust, compliance-aware structure. The added fields are:

1. `fullIngredients` (Array): Detailed, transparent botanical ingredient lists.
2. `usageInstructions` (String): Standard directions for preparing or applying the herbal formulas.
3. `servingGuidance` (String): Standard daily serving guidelines.
4. `warnings` (Array): Critical warnings regarding consumption (e.g. keep out of reach of children).
5. `contraindications` (Array): Specific physiological circumstances where use should be avoided (e.g. driving, auto-immune conditions).
6. `allergyWarning` (String): Specific warnings regarding shared equipment, bee products, or floral allergens.
7. `storageInstructions` (String): Instructions to preserve potency and stability.
8. `healthDisclaimer` (String): Visible product-specific wellness notice.
9. `suitableFor` (Array): Intended consumer profiles.
10. `notSuitableFor` (Array): Restricted consumer profiles.

---

## ⚠️ Remaining Wording Needing Client Approval

1. **Brand Name ("Nature's Alchemy")**:
   - While "alchemy" is historically associated with herbalism, the client should verify whether this implies mystical or unscientific medicinal transmutations to local TMDA inspectors.
2. **Product Names ("Calmness Tincture", "Digestive Blend")**:
   - Though softened, "Calmness" and "Digestive" still reference physiological states. If local inspectors require zero functional claims, these may need to be renamed to purely creative titles (e.g. "Evening Shamba Tincture" or "Kilimanjaro Harvest Bitter").
3. **Ingredient Highlights**:
   - Explicit callouts of "Valerian" and "Comfrey" may require specific TMDA warnings in Tanzania depending on final product classification.

---

## 💡 Assumptions Made

1. **Static Presentation Focus**:
   - Assumed that delivery rates, product catalogues, and compliance details remain entirely presentation-only. No live validation backend was introduced.
2. **Standard Localisation Boundaries**:
   - We assume the products will be sold as general dietary supplements or cosmetics, not licensed medicines.
3. **XSS & Data Sanitization Note**:
   - The current dynamic modal display relies on `innerHTML` rendering of product fields. Since the current data source is static, trusted mock data, this is acceptable for the presentation mockup. However, before live admin dashboards or backend databases are introduced (where external users could input raw strings), all product fields must be escaped or sanitized (e.g. using DOMPurify or custom escaping) to prevent cross-site scripting (XSS) injection risks.

---

## 🚨 Critical Reminders

> [!WARNING]
> **Regulatory and Legal Review Required**
> - This preliminary health-claim wording review **is not** a replacement for official regulatory approval. A qualified legal or regulatory counsel must review all final copy, labels, and product names before public deployment in Tanzania.

> [!IMPORTANT]
> **Mock Pricing Notice**
> - All product price values (e.g., `80000 TZS`, `70000 TZS`) are **placeholder/mock prices** for demonstration purposes only. They are pending final commercial validation and approval by the client.
