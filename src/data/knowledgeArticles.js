// Maroon Knowledge Hub — journal articles, structured as research-poster panels.
// Content researched from current herbal/botanical literature; every reference
// is a real, verifiable source (PubMed/PMC/MDPI/Frontiers DOIs), Harvard style.
// Authored by Royal Maroon Herbs, dated across August 2026 (Weeks 1–5).
//
// Each article: title band + "At a glance" fact strip (family / compounds /
// use / evidence meter) + three labelled panels (Origin, Health Benefits,
// Evidence & Verified Potency) + a references panel. `illustration` is an
// AI-generated botanical plate (text-free); `image` (product photo) is a fallback.
// evidenceLevel: 1 = preliminary/contested, 2 = moderate, 3 = strong.
const ART = '/images/hub/';        // AI botanical illustrations
const IMG = '/images/products/royal-herbs/'; // product-photo fallback

export const articles = [
  {
    slug: 'moringa', herb: 'Moringa', latin: 'Moringa oleifera',
    title: 'The Miracle Tree, Weighed Honestly: What Moringa Really Delivers',
    author: 'Royal Maroon Herbs', date: '3 August 2026', week: 'Week 1',
    illustration: '/images/hub/moringa.jpg', photo: true, image: IMG + 'moringa-powder.jpg', shopSlug: 'moringa-powder', shopName: 'Moringa Powder',
    family: 'Moringaceae',
    compounds: 'Quercetin, glucosinolates, isothiocyanates',
    primaryUse: 'Nutrition & metabolic support',
    evidenceLevel: 1, evidenceLabel: 'Preliminary',
    sections: [
      { label: 'Origin & Traditional Use', body: `Native to the sub-Himalayan foothills of northwest India and now naturalised across the tropics, Moringa oleifera has been dubbed the "miracle tree" for good reason. For millennia its leaves, pods, seeds and roots have anchored Ayurvedic and traditional African pharmacopoeias, prescribed for everything from inflammation to malnutrition. Its enduring appeal rests on a genuinely dense phytochemical profile: flavonoids, glucosinolates, isothiocyanates, vitamins and a near-complete set of essential amino acids.` },
      { label: 'Benefits to Human Health', body: `Modern science broadly endorses this heritage. Reviews catalogue antioxidant, anti-inflammatory, antidiabetic, hepatoprotective and antimicrobial activity, largely attributed to quercetin, chlorogenic acid and the seed isothiocyanates. As a nutrient-dense food, moringa's value in addressing dietary deficiency is well supported and low-risk.` },
      { label: 'Evidence & Verified Potency', body: `Yet a critical eye is warranted. The overwhelming majority of evidence remains preclinical, drawn from cell and rodent models; robust, adequately powered human trials are scarce, and dosing, extract standardisation and long-term safety are poorly defined. Promising glucose- and lipid-lowering signals are real but preliminary. Treated as a nourishing food with therapeutic potential, rather than a proven cure, moringa is a credible botanical worth watching.` }
    ],
    references: [
      `Azlan, U.K., Mediani, A., Rohani, E.R., Tong, X., Han, R., Misnan, N.M., Jam, F.A., Bunawan, H., Sarian, M.N. and Hamezah, H.S. (2022) 'A comprehensive review with updated future perspectives on the ethnomedicinal and pharmacological aspects of Moringa oleifera', Molecules, 27(18), 5765. Available at: https://doi.org/10.3390/molecules27185765 (Accessed: 2026).`,
      `Camilleri, E. and Blundell, R. (2024) 'A comprehensive review of the phytochemicals, health benefits, pharmacological safety and medicinal prospects of Moringa oleifera', Heliyon, 10(6), e27807. Available at: https://doi.org/10.1016/j.heliyon.2024.e27807 (Accessed: 2026).`,
      `Divya, S., Pandey, V.K., Dixit, R., Rustagi, S., Suthar, T., Atuahene, D., Nagy, V., Ungai, D., Ahmed, A.E.M., Kovács, B. and Shaikh, A.M. (2024) 'Exploring the phytochemical, pharmacological and nutritional properties of Moringa oleifera: a comprehensive review', Nutrients, 16(19), 3423. Available at: https://doi.org/10.3390/nu16193423 (Accessed: 2026).`,
      `Crișan, D., Gavrilaș, L., Păltinean, R., Frumuzachi, O., Mocan, A. and Crișan, G. (2025) 'Effects of Moringa oleifera Lam. supplementation on cardiometabolic outcomes: a meta-analysis of randomized controlled trials with GRADE assessment', Nutrients, 17(22), 3501. Available at: https://doi.org/10.3390/nu17223501 (Accessed: 2026).`,
      `Leone, A., Di Lello, S., Bertoli, S., Ravasenghi, S., De Amicis, R., Menichetti, F., Fico, G., Santagostini, L., Mohamed-Iahdih, B., Saleh, S.M.L. and Battezzati, A. (2025) 'Moringa oleifera leaf powder enhances glycemic control in Sahrawi women with type 2 diabetes: findings from a 3-month unblinded randomized controlled trial', PharmaNutrition, 31, 100434. Available at: https://doi.org/10.1016/j.phanu.2025.100434 (Accessed: 2026).`
    ]
  },
  {
    slug: 'turmeric', herb: 'Turmeric', latin: 'Curcuma longa',
    title: 'Golden Root, Grounded Evidence: The Case For and Against Turmeric',
    author: 'Royal Maroon Herbs', date: '7 August 2026', week: 'Week 1',
    illustration: '/images/hub/turmeric.jpg', photo: true, image: IMG + 'turmeric-powder.jpg', shopSlug: 'turmeric-powder', shopName: 'Turmeric Powder',
    family: 'Zingiberaceae',
    compounds: 'Curcuminoids (curcumin)',
    primaryUse: 'Anti-inflammatory & metabolic',
    evidenceLevel: 3, evidenceLabel: 'Moderate–strong',
    sections: [
      { label: 'Origin & Traditional Use', body: `Turmeric, the golden rhizome of Curcuma longa, has coloured and medicated South Asian life for over four thousand years. A cornerstone of Ayurvedic and Siddha traditions, it was applied to wounds, joint pain and digestive complaints long before its chemistry was understood. That chemistry centres on the curcuminoids, a family of polyphenols dominated by curcumin, the pigment responsible for both its hue and much of its pharmacology.` },
      { label: 'Benefits to Human Health', body: `Curcumin is a genuinely versatile molecule, with documented anti-inflammatory, antioxidant and immunomodulatory actions. Here the human evidence is comparatively strong: controlled trials report reduced arthritis symptoms and lower inflammatory markers such as CRP, TNF-alpha and IL-6, plus favourable effects on blood glucose and lipids in metabolic disorders.` },
      { label: 'Evidence & Verified Potency', body: `The honest caveats matter. Curcumin is notoriously poorly absorbed, and many benefits depend on enhanced formulations or piperine co-administration. Trials are often small, short and methodologically uneven, so meta-analyses temper their conclusions accordingly. Evidence is robust for musculoskeletal and metabolic outcomes, but preliminary and mixed for cancer, neurocognitive and gastrointestinal claims.` }
    ],
    references: [
      `Panknin, T.M., Howe, C.L., Hauer, M., Bucchireddigari, B., Rossi, A.M. and Funk, J.L. (2023) 'Curcumin supplementation and human disease: a scoping review of clinical trials', International Journal of Molecular Sciences, 24(5), 4476. Available at: https://doi.org/10.3390/ijms24054476 (Accessed: 2026).`,
      `Zeng, L., Yang, T., Yang, K., Yu, G., Li, J., Xiang, W. and Chen, H. (2022) 'Efficacy and safety of curcumin and Curcuma longa extract in the treatment of arthritis: a systematic review and meta-analysis of randomized controlled trial', Frontiers in Immunology, 13, 891822. Available at: https://doi.org/10.3389/fimmu.2022.891822 (Accessed: 2026).`,
      `Fuloria, S., Mehta, J., Chandel, A., Sekar, M., Mat Rani, N.N., Begum, M.Y., Subramaniyan, V., Chidambaram, K., Thangavelu, L., Nordin, R., Wu, Y.S., Sathasivam, K.V., Lum, P.T., Meenakshi, D.U., Kumarasamy, V., Azad, A.K. and Fuloria, N.K. (2022) 'A comprehensive review on the therapeutic potential of Curcuma longa Linn. in relation to its major active constituent curcumin', Frontiers in Pharmacology, 13, 820806. Available at: https://doi.org/10.3389/fphar.2022.820806 (Accessed: 2026).`,
      `Pathomwichaiwat, T., Jinatongthai, P., Prommasut, N., Ampornwong, K., Rattanavipanon, W., Nathisuwan, S. and Thakkinstian, A. (2023) 'Effects of turmeric (Curcuma longa) supplementation on glucose metabolism in diabetes mellitus and metabolic syndrome: an umbrella review and updated meta-analysis', PLoS ONE, 18(7), e0288997. Available at: https://doi.org/10.1371/journal.pone.0288997 (Accessed: 2026).`,
      `Unhapipatpong, C., Julanon, N., Shantavasinkul, P.C., Polruang, N., Numthavaj, P. and Thakkinstian, A. (2025) 'An umbrella review of systematic reviews and meta-analyses of randomized controlled trials investigating the effect of curcumin supplementation on lipid profiles', Nutrition Reviews, 83(8), pp. 1520–1536. Available at: https://doi.org/10.1093/nutrit/nuaf012 (Accessed: 2026).`
    ]
  },
  {
    slug: 'ashwagandha', herb: 'Ashwagandha', latin: 'Withania somnifera',
    title: 'Ashwagandha (Withania somnifera): The Adaptogen Under Scientific Scrutiny',
    author: 'Royal Maroon Herbs', date: '10 August 2026', week: 'Week 2',
    illustration: '/images/hub/ashwagandha.jpg', photo: true, image: IMG + 'ashwagandha-capsules.jpg', shopSlug: 'ashwagandha-capsules', shopName: 'Ashwagandha Capsules',
    family: 'Solanaceae',
    compounds: 'Withanolides',
    primaryUse: 'Stress, sleep & recovery',
    evidenceLevel: 2, evidenceLabel: 'Moderate',
    sections: [
      { label: 'Origin & Traditional Use', body: `Ashwagandha (Withania somnifera), a member of the Solanaceae family, is a short, woody shrub native to the drier regions of India, North Africa and the Middle East. Its Sanskrit name, loosely rendered 'smell of horse', hints at both its earthy aroma and the vigour it was traditionally believed to confer. For more than three millennia it has anchored the Ayurvedic Rasayana category of rejuvenating tonics, prescribed as an 'adaptogen' to buffer the body against physical and mental strain.` },
      { label: 'Benefits to Human Health', body: `Contemporary interest centres on its steroidal lactones, the withanolides, which appear to modulate the hypothalamic-pituitary-adrenal axis. Human trials most consistently report reductions in perceived stress and serum cortisol, alongside secondary benefits for sleep quality, anxiety and, in some athletic cohorts, muscle strength and recovery.` },
      { label: 'Evidence & Verified Potency', body: `The evidence, while encouraging, warrants sober appraisal. Meta-analyses confirm a statistically significant effect on validated stress scales, yet they draw on small samples, heterogeneous extracts and frequently industry-funded designs, tempering confidence in the true effect size. Emerging hepatotoxicity signals also merit vigilance and standardised withanolide dosing.` }
    ],
    references: [
      `Speers, A.B., Cabey, K.A., Soumyanath, A. and Wright, K.M. (2021) 'Effects of Withania somnifera (Ashwagandha) on stress and the stress-related neuropsychiatric disorders anxiety, depression, and insomnia', Current Neuropharmacology, 19(9), pp. 1468–1495. Available at: https://doi.org/10.2174/1570159X19666210712151556 (Accessed: 2026).`,
      `Akhgarjand, C., Asoudeh, F., Bagheri, A., Kalantar, Z., Vahabi, Z., Shab-Bidar, S., Rezvani, H. and Djafarian, K. (2022) 'Does Ashwagandha supplementation have a beneficial effect on the management of anxiety and stress? A systematic review and meta-analysis of randomized controlled trials', Phytotherapy Research, 36(11), pp. 4115–4124. Available at: https://doi.org/10.1002/ptr.7598 (Accessed: 2026).`,
      `Bonilla, D.A., Moreno, Y., Gho, C., Petro, J.L., Odriozola-Martinez, A. and Kreider, R.B. (2021) 'Effects of Ashwagandha (Withania somnifera) on physical performance: systematic review and Bayesian meta-analysis', Journal of Functional Morphology and Kinesiology, 6(1), 20. Available at: https://doi.org/10.3390/jfmk6010020 (Accessed: 2026).`,
      `Arumugam, V., Vijayakumar, V., Balakrishnan, A., Bhandari, R.B., Boopalan, D., Ponnurangam, R., Sankaralingam Thirupathy, V. and Kuppusamy, M. (2024) 'Effects of Ashwagandha (Withania Somnifera) on stress and anxiety: a systematic review and meta-analysis', Explore, 20(6), 103062. Available at: https://doi.org/10.1016/j.explore.2024.103062 (Accessed: 2026).`,
      `Cheah, K.L., Norhayati, M.N., Husniati Yaacob, L. and Abdul Rahman, R. (2021) 'Effect of Ashwagandha (Withania somnifera) extract on sleep: a systematic review and meta-analysis', PLOS ONE, 16(9), e0257843. Available at: https://doi.org/10.1371/journal.pone.0257843 (Accessed: 2026).`
    ]
  },
  {
    slug: 'neem', herb: 'Neem', latin: 'Azadirachta indica',
    title: `Neem (Azadirachta indica): Interrogating the 'Curer of All Ailments'`,
    author: 'Royal Maroon Herbs', date: '14 August 2026', week: 'Week 2',
    illustration: '/images/hub/neem.jpg', photo: true, image: IMG + 'neem-powder.jpg', shopSlug: 'neem-powder', shopName: 'Neem Powder',
    family: 'Meliaceae',
    compounds: 'Azadirachtin, nimbin, nimbidin',
    primaryUse: 'Oral & skin care',
    evidenceLevel: 2, evidenceLabel: 'Moderate (dental)',
    sections: [
      { label: 'Origin & Traditional Use', body: `Neem (Azadirachta indica), a fast-growing evergreen of the Meliaceae family, is indigenous to the Indian subcontinent, where it has been cultivated and revered for millennia. Sanskrit texts style it 'Sarva Roga Nivarini', the curer of all ailments, and every part of the tree, from leaf and bark to seed oil and twig, features in Ayurvedic, Unani and Siddha practice for skin, dental and febrile complaints.` },
      { label: 'Benefits to Human Health', body: `Its therapeutic reputation rests on a dense phytochemistry, chiefly the limonoids azadirachtin, nimbin and nimbidin, complemented by flavonoids and phenolics. Investigations attribute antimicrobial, anti-inflammatory, antioxidant, antidiabetic and immunomodulatory actions to these constituents, with dental applications among the best documented.` },
      { label: 'Evidence & Verified Potency', body: `Yet the sweeping traditional claims outpace the clinical record. Much supporting data derive from in vitro and animal models; robust human trials remain comparatively scarce, though controlled dental studies show neem mouthrinse rivalling chlorhexidine for plaque and gingivitis control, a genuinely verified niche. Reported reproductive and hepatic toxicity at high intake demands defined safe dosing.` }
    ],
    references: [
      `Alzohairy, M.A. (2016) 'Therapeutics role of Azadirachta indica (Neem) and their active constituents in diseases prevention and treatment', Evidence-Based Complementary and Alternative Medicine, 2016, 7382506. Available at: https://doi.org/10.1155/2016/7382506 (Accessed: 2026).`,
      `Tufail, T., Bader Ul Ain, H., Ijaz, A., Nasir, M.A., Ikram, A., Noreen, S., Arshad, M.T. and Abdullahi, M.A. (2025) 'Neem (Azadirachta indica): a miracle herb; panacea for all ailments', Food Science & Nutrition, 13(9), e70820. Available at: https://doi.org/10.1002/fsn3.70820 (Accessed: 2026).`,
      `Chatterjee, A., Saluja, M., Singh, N. and Kandwal, A. (2011) 'To evaluate the antigingivitis and antiplaque effect of an Azadirachta indica (neem) mouthrinse on plaque induced gingivitis: a double-blind, randomized, controlled trial', Journal of Indian Society of Periodontology, 15(4), pp. 398–401. Available at: https://doi.org/10.4103/0972-124X.92578 (Accessed: 2026).`,
      `Wylie, M.R. and Merrell, D.S. (2022) 'The antimicrobial potential of the neem tree Azadirachta indica', Frontiers in Pharmacology, 13, 891535. Available at: https://doi.org/10.3389/fphar.2022.891535 (Accessed: 2026).`,
      `Ganvir, M.N., Parwani, S.R., Chaudhary, D.S., Parwani, R., Dadlani, H., Vikey, A.K., Kawadkar, K.P., Jaju, N.S., Armogida, N.G. and Spagnuolo, G. (2022) 'Comparative evaluation of Azadirachta indica (Neem) chip and soft tissue diode lasers as a supplement to phase I periodontal therapy in localized chronic moderate periodontitis: a randomized controlled clinical trial', International Journal of Dentistry, 2022, 6109040. Available at: https://doi.org/10.1155/2022/6109040 (Accessed: 2026).`
    ]
  },
  {
    slug: 'guava', herb: 'Guava Leaf', latin: 'Psidium guajava',
    title: 'Guava Leaf (Psidium guajava): From Tropical Folk Tea to Metabolic Ally',
    author: 'Royal Maroon Herbs', date: '17 August 2026', week: 'Week 3',
    illustration: '/images/hub/guava.jpg', photo: true, image: IMG + 'guava-leaves.jpg', shopSlug: 'guava-leaves', shopName: 'Guava Leaves',
    family: 'Myrtaceae',
    compounds: 'Quercetin, gallic acid, ellagitannins',
    primaryUse: 'Glycaemic & digestive support',
    evidenceLevel: 1, evidenceLabel: 'Preliminary',
    sections: [
      { label: 'Origin & Traditional Use', body: `Psidium guajava, a member of the Myrtaceae family native to tropical Central and South America, has travelled with human hands across Africa, Asia and the Pacific for centuries. Long before it entered the laboratory, its leaves were brewed as a folk tea and pressed into poultices. Gutiérrez, Mitchell and Solis (2008) document a strikingly consistent ethnobotanical record: leaf decoctions for diarrhoea and dysentery, wound washes, and infusions for coughs and diabetes across otherwise unconnected cultures.` },
      { label: 'Benefits to Human Health', body: `Modern interest centres on the leaf's dense phenolic chemistry, chiefly quercetin, gallic acid and ellagitannins. These constituents underpin antioxidant, anti-inflammatory and, most notably, anti-hyperglycaemic effects. Deguchi and Miyazaki (2010) show guava-leaf polyphenol inhibits alpha-glucosidase, blunting post-meal glucose spikes by roughly 20–37% in animal and human trials, alongside improved lipid markers.` },
      { label: 'Evidence & Verified Potency', body: `The evidence is promising but uneven. Luo et al. (2019) confirm potent radical-scavenging and glucose-lowering activity for leaf polysaccharides, yet most data derive from cell and rodent models. Human trials remain small, short and heterogeneous, so claims of clinical potency should stay measured until standardised extracts and adequately powered randomised trials arrive.` }
    ],
    references: [
      `Gutiérrez, R.M.P., Mitchell, S. and Solis, R.V. (2008) 'Psidium guajava: a review of its traditional uses, phytochemistry and pharmacology', Journal of Ethnopharmacology, 117(1), pp. 1–27. Available at: https://doi.org/10.1016/j.jep.2008.01.025 (Accessed: 2026).`,
      `Deguchi, Y. and Miyazaki, K. (2010) 'Anti-hyperglycemic and anti-hyperlipidemic effects of guava leaf extract', Nutrition & Metabolism, 7, 9. Available at: https://doi.org/10.1186/1743-7075-7-9 (Accessed: 2026).`,
      `Luo, Y., Peng, B., Wei, W., Tian, X. and Wu, Z. (2019) 'Antioxidant and anti-diabetic activities of polysaccharides from guava leaves', Molecules, 24(7), 1343. Available at: https://doi.org/10.3390/molecules24071343 (Accessed: 2026).`,
      `König, A., Schwarzinger, B., Stadlbauer, V., Lanzerstorfer, P., Iken, M., Schwarzinger, C., Kolb, P., Schwarzinger, S., Mörwald, K., Brunner, S., Höglinger, O., Weghuber, D. and Weghuber, J. (2019) 'Guava (Psidium guajava) fruit extract prepared by supercritical CO2 extraction inhibits intestinal glucose resorption in a double-blind, randomized clinical study', Nutrients, 11(7), 1512. Available at: https://doi.org/10.3390/nu11071512 (Accessed: 2026).`,
      `Kakuo, S., Fushimi, T., Kawasaki, K., Nakamura, J. and Ota, N. (2018) 'Effects of Psidium guajava Linn. leaf extract in Japanese subjects with knee pain: a randomized, double-blind, placebo-controlled, parallel pilot study', Aging Clinical and Experimental Research, 30(11), pp. 1391–1398. Available at: https://doi.org/10.1007/s40520-018-0953-6 (Accessed: 2026).`
    ]
  },
  {
    slug: 'fenugreek', herb: 'Fenugreek', latin: 'Trigonella foenum-graecum',
    title: 'Fenugreek (Trigonella foenum-graecum): An Ancient Seed Under Modern Scrutiny',
    author: 'Royal Maroon Herbs', date: '21 August 2026', week: 'Week 3',
    illustration: '/images/hub/fenugreek2.jpg', photo: true, illustration2: '/images/hub/fenugreek.jpg', image: IMG + 'fenugreek-powder.jpg', shopSlug: 'fenugreek-powder', shopName: 'Fenugreek Powder',
    family: 'Fabaceae',
    compounds: 'Galactomannan, 4-hydroxyisoleucine, saponins',
    primaryUse: 'Glycaemic support',
    evidenceLevel: 2, evidenceLabel: 'Moderate',
    sections: [
      { label: 'Origin & Traditional Use', body: `Trigonella foenum-graecum, a legume domesticated across the Mediterranean, Middle East and South Asia, has served as spice, forage and medicine for millennia. Its Latin name, 'Greek hay', hints at its long agricultural pedigree. In Ayurvedic and Unani traditions the aromatic seeds were prescribed for digestion, lactation and, persistently, for what we now call diabetes, a use that framed most contemporary research.` },
      { label: 'Benefits to Human Health', body: `The seed is rich in soluble galactomannan fibre, the amino acid 4-hydroxyisoleucine and steroidal saponins. Sarker et al. (2024) attribute its antidiabetic action to slowed carbohydrate digestion, reduced intestinal glucose absorption and stimulated insulin secretion, alongside modest lipid-lowering and appetite effects.` },
      { label: 'Evidence & Verified Potency', body: `How strong is the evidence? Neelakantan et al. (2014), pooling clinical trials, found meaningful reductions in fasting and post-load glucose and HbA1c, but cautioned that most trials were methodologically weak. Najdi et al. (2019) reinforce this humility: their small trial found only an insignificant glucose drop, though insulin and cholesterol ratios improved. Fenugreek is plausibly potent yet inconsistently proven.` }
    ],
    references: [
      `Neelakantan, N., Narayanan, M., de Souza, R.J. and van Dam, R.M. (2014) 'Effect of fenugreek (Trigonella foenum-graecum L.) intake on glycemia: a meta-analysis of clinical trials', Nutrition Journal, 13, 7. Available at: https://doi.org/10.1186/1475-2891-13-7 (Accessed: 2026).`,
      `Najdi, R.A., Hagras, M.M., Kamel, F.O. and Magadmi, R.M. (2019) 'A randomized controlled clinical trial evaluating the effect of Trigonella foenum-graecum (fenugreek) versus glibenclamide in patients with diabetes', African Health Sciences, 19(1), pp. 1594–1601. Available at: https://doi.org/10.4314/ahs.v19i1.34 (Accessed: 2026).`,
      `Sarker, D.K., Ray, P., Dutta, A.K., Rouf, R. and Uddin, S.J. (2024) 'Antidiabetic potential of fenugreek (Trigonella foenum-graecum): a magic herb for diabetes mellitus', Food Science & Nutrition, 12(10), pp. 7108–7136. Available at: https://doi.org/10.1002/fsn3.4440 (Accessed: 2026).`,
      `Kim, J., Noh, W., Kim, A., Choi, Y. and Kim, Y.S. (2023) 'The effect of fenugreek in type 2 diabetes and prediabetes: a systematic review and meta-analysis of randomized controlled trials', International Journal of Molecular Sciences, 24(18), 13999. Available at: https://doi.org/10.3390/ijms241813999 (Accessed: 2026).`,
      `Fakhr, L., Chehregosha, F., Zarezadeh, M., Chaboksafar, M. and Tarighat-Esfanjani, A. (2023) 'Effects of fenugreek supplementation on the components of metabolic syndrome: a systematic review and dose-response meta-analysis of randomized clinical trials', Pharmacological Research, 187, 106594. Available at: https://doi.org/10.1016/j.phrs.2022.106594 (Accessed: 2026).`
    ]
  },
  {
    slug: 'baobab', herb: 'Baobab', latin: 'Adansonia digitata',
    title: `Baobab (Adansonia digitata): Africa's Ancient Superfruit Under the Modern Lens`,
    author: 'Royal Maroon Herbs', date: '24 August 2026', week: 'Week 4',
    illustration: '/images/hub/baobab.jpg', photo: true, image: IMG + 'baobab-pulp.jpg', shopSlug: 'baobab-pulp', shopName: 'Baobab Pulp',
    family: 'Malvaceae',
    compounds: 'Fibre, vitamin C, procyanidins',
    primaryUse: 'Glycaemic & antioxidant',
    evidenceLevel: 2, evidenceLabel: 'Preliminary–moderate',
    sections: [
      { label: 'Origin & Traditional Use', body: `Revered across sub-Saharan Africa as the 'Tree of Life', the baobab (Adansonia digitata) has anchored traditional pharmacopoeias for millennia. Its dry, tangy fruit pulp was consumed for rehydration and used against fever, diarrhoea and dysentery, while bark and leaves served antipyretic and anti-inflammatory roles. This ethnomedicinal breadth reflects a genuinely nutrient-dense matrix rather than folklore alone.` },
      { label: 'Benefits to Human Health', body: `The fruit pulp is exceptionally rich in dietary fibre (roughly 80 g/100 g), vitamin C, potassium and iron, alongside polyphenols such as procyanidins, gallic acid and epicatechin. These constituents underpin measurable antioxidant, anti-inflammatory and metabolic activity, and plausibly explain baobab's traditional use for gut and febrile complaints as well as its emerging cardiometabolic interest.` },
      { label: 'Evidence & Verified Potency', body: `On potency, the strongest evidence concerns glycaemic control. Controlled human trials show baobab extract significantly blunts postprandial glucose and starch digestion, likely through polyphenol-mediated enzyme inhibition. This is encouraging but modest: studies are small, short and measure acute effects only, so claims of preventing diabetes remain premature. The antioxidant data, though consistent in vitro, do not yet translate into proven long-term clinical outcomes.` }
    ],
    references: [
      `Coe, S.A., Clegg, M., Armengol, M. and Ryan, L. (2013) 'The polyphenol-rich baobab fruit (Adansonia digitata L.) reduces starch digestion and glycemic response in humans', Nutrition Research, 33(11), pp. 888–896. Available at: https://doi.org/10.1016/j.nutres.2013.08.002 (Accessed: 2026).`,
      `Rita, K., Bernardo, M.A., Silva, M.L., Brito, J., Mesquita, M.F., Pintão, A.M. and Moncada, M. (2022) 'Adansonia digitata L. (Baobab Fruit) effect on postprandial glycemia in healthy adults: a randomized controlled trial', Nutrients, 14(2), 398. Available at: https://doi.org/10.3390/nu14020398 (Accessed: 2026).`,
      `Silva, M.L., Rita, K., Bernardo, M.A., de Mesquita, M.F., Pintão, A.M. and Moncada, M. (2023) 'Adansonia digitata L. (Baobab) bioactive compounds, biological activities, and the potential effect on glycemia: a narrative review', Nutrients, 15(9), 2170. Available at: https://doi.org/10.3390/nu15092170 (Accessed: 2026).`,
      `Evang, E.C., Habte, T.-Y., Owino, W.O. and Krawinkel, M.B. (2021) 'Can the supplementary consumption of baobab (Adansonia digitata L.) fruit pulp improve the hemoglobin levels and iron status of schoolchildren in Kenya? Findings of a randomized controlled intervention trial', European Journal of Nutrition, 60(5), pp. 2617–2629. Available at: https://doi.org/10.1007/s00394-020-02447-2 (Accessed: 2026).`,
      `Kamatou, G.P.P., Vermaak, I. and Viljoen, A.M. (2011) 'An updated review of Adansonia digitata: a commercially important African tree', South African Journal of Botany, 77(4), pp. 908–919. Available at: https://doi.org/10.1016/j.sajb.2011.08.010 (Accessed: 2026).`
    ]
  },
  {
    slug: 'gotu-kola', herb: 'Gotu Kola', latin: 'Centella asiatica',
    title: 'Gotu Kola (Centella asiatica): From Ayurvedic Longevity Herb to Neuroscience Candidate',
    author: 'Royal Maroon Herbs', date: '28 August 2026', week: 'Week 4',
    illustration: '/images/hub/gotu-kola.jpg', photo: true, image: IMG + 'gotu-kola-powder.jpg', shopSlug: 'gotu-kola-powder', shopName: 'Gotu Kola Powder',
    family: 'Apiaceae',
    compounds: 'Triterpenes (asiaticoside, madecassoside)',
    primaryUse: 'Wound healing & cognition',
    evidenceLevel: 2, evidenceLabel: 'Moderate (topical)',
    sections: [
      { label: 'Origin & Traditional Use', body: `Gotu kola (Centella asiatica), a creeping wetland herb of Asia and Africa, has been prized for centuries in Ayurvedic and traditional Chinese medicine as a 'brain tonic' and wound-healing plant. Traditional practitioners applied it for memory, longevity, skin regeneration and venous complaints — uses that modern phytochemistry has begun to rationalise rather than dismiss.` },
      { label: 'Benefits to Human Health', body: `Its activity is attributed chiefly to four triterpenes: asiaticoside, madecassoside, asiatic acid and madecassic acid. These compounds stimulate collagen synthesis and exert anti-inflammatory, antioxidant and anti-apoptotic effects, supporting both the herb's dermatological reputation and its neuroprotective interest in ageing and cognition.` },
      { label: 'Evidence & Verified Potency', body: `Regarding verified potency, the best-substantiated application is topical wound and scar healing, where triterpene fractions show reproducible collagen-promoting effects. Neuroprotective and cognitive claims are mechanistically plausible and supported by animal and preclinical data, but human evidence remains thin: reviews consistently flag few controlled trials, small samples and heterogeneous preparations. Enthusiasm should therefore be tempered with caution.` }
    ],
    references: [
      `Sabaragamuwa, R., Perera, C.O. and Fedrizzi, B. (2018) 'Centella asiatica (Gotu kola) as a neuroprotectant and its potential role in healthy ageing', Trends in Food Science & Technology, 79, pp. 88–97. Available at: https://doi.org/10.1016/j.tifs.2018.07.024 (Accessed: 2026).`,
      `Sun, B., Wu, L., Wu, Y., Zhang, C., Qin, L., Hayashi, M., Kudo, M., Gao, M. and Liu, T. (2020) 'Therapeutic potential of Centella asiatica and its triterpenes: a review', Frontiers in Pharmacology, 11, 568032. Available at: https://doi.org/10.3389/fphar.2020.568032 (Accessed: 2026).`,
      `Park, K.S. (2021) 'Pharmacological effects of Centella asiatica on skin diseases: evidence and possible mechanisms', Evidence-Based Complementary and Alternative Medicine, 2021, 5462633. Available at: https://doi.org/10.1155/2021/5462633 (Accessed: 2026).`,
      `Puttarak, P., Dilokthornsakul, P., Saokaew, S., Dhippayom, T., Kongkaew, C., Sruamsiri, R., Chuthaputti, A. and Chaiyakunapruk, N. (2017) 'Effects of Centella asiatica (L.) Urb. on cognitive function and mood related outcomes: a systematic review and meta-analysis', Scientific Reports, 7, 10646. Available at: https://doi.org/10.1038/s41598-017-09823-9 (Accessed: 2026).`,
      `Chong, N.J. and Aziz, Z. (2013) 'A systematic review of the efficacy of Centella asiatica for improvement of the signs and symptoms of chronic venous insufficiency', Evidence-Based Complementary and Alternative Medicine, 2013, 627182. Available at: https://doi.org/10.1155/2013/627182 (Accessed: 2026).`
    ]
  },
  {
    slug: 'holy-basil', herb: 'Holy Basil', latin: 'Ocimum sanctum',
    title: `Holy Basil (Tulsi): The 'Queen of Herbs' Between Ritual and Rigour`,
    author: 'Royal Maroon Herbs', date: '29 August 2026', week: 'Week 5',
    illustration: '/images/hub/holy-basil.jpg', photo: true, illustration2: '/images/hub/holy-basil-2.jpg', image: IMG + 'holy-basil-capsules.jpg', shopSlug: 'holy-basil-capsules', shopName: 'Holy Basil Capsules',
    family: 'Lamiaceae',
    compounds: 'Eugenol, ursolic acid, rosmarinic acid',
    primaryUse: 'Stress & metabolic support',
    evidenceLevel: 2, evidenceLabel: 'Moderate',
    sections: [
      { label: 'Origin & Traditional Use', body: `Revered across the Indian subcontinent as the 'Queen of Herbs', Holy Basil (Ocimum sanctum, syn. O. tenuiflorum) has been cultivated around temples and courtyards for more than three millennia. Ayurvedic and Siddha traditions class it as an adaptogen and rasayana, prescribing leaf infusions for respiratory complaints, fevers, and daily resilience. Its aromatic character owes much to eugenol, ursolic acid, and rosmarinic acid.` },
      { label: 'Benefits to Human Health', body: `Contemporary research links tulsi to lowered fasting glucose, improved lipid profiles, reduced perceived stress, and modest immunomodulatory and neurocognitive gains. These effects are biologically plausible, attributed to antioxidant and anti-inflammatory pathways alongside modulation of the hypothalamic-pituitary-adrenal axis.` },
      { label: 'Evidence & Verified Potency', body: `The evidence, however, deserves honest appraisal. A systematic review of 24 human trials found uniformly favourable outcomes and good tolerability, yet flagged small samples, heterogeneous preparations, and few double-blind designs (Jamshidi and Cohen, 2017). A stronger recent signal comes from a rigorous placebo-controlled trial reporting reduced stress and improved sleep with a standardised extract (Lopresti et al., 2022). Tulsi is promising and safe, but its reputation still outpaces definitive proof.` }
    ],
    references: [
      `Cohen, M.M. (2014) 'Tulsi - Ocimum sanctum: a herb for all reasons', Journal of Ayurveda and Integrative Medicine, 5(4), pp. 251–259. Available at: https://doi.org/10.4103/0975-9476.146554 (Accessed: 2026).`,
      `Jamshidi, N. and Cohen, M.M. (2017) 'The clinical efficacy and safety of Tulsi in humans: a systematic review of the literature', Evidence-Based Complementary and Alternative Medicine, 2017, 9217567. Available at: https://doi.org/10.1155/2017/9217567 (Accessed: 2026).`,
      `Lopresti, A.L., Smith, S.J., Metse, A.P. and Drummond, P.D. (2022) 'A randomized, double-blind, placebo-controlled trial investigating the effects of an Ocimum tenuiflorum (Holy Basil) extract (Holixer) on stress, mood, and sleep in adults experiencing stress', Frontiers in Nutrition, 9, 965130. Available at: https://doi.org/10.3389/fnut.2022.965130 (Accessed: 2026).`,
      `Mondal, S., Varma, S., Bamola, V.D., Naik, S.N., Mirdha, B.R., Padhi, M.M., Mehta, N. and Mahapatra, S.C. (2011) 'Double-blinded randomized controlled trial for immunomodulatory effects of Tulsi (Ocimum sanctum Linn.) leaf extract on healthy volunteers', Journal of Ethnopharmacology, 136(3), pp. 452–456. Available at: https://doi.org/10.1016/j.jep.2011.05.012 (Accessed: 2026).`,
      `Saxena, R.C., Singh, R., Kumar, P., Negi, M.P.S., Saxena, V.S., Geetharani, P., Allan, J.J. and Venkateshwarlu, K. (2012) 'Efficacy of an extract of Ocimum tenuiflorum (OciBest) in the management of general stress: a double-blind, placebo-controlled study', Evidence-Based Complementary and Alternative Medicine, 2012, 894509. Available at: https://doi.org/10.1155/2012/894509 (Accessed: 2026).`
    ]
  },
  {
    slug: 'cinnamon', herb: 'Cinnamon', latin: 'Cinnamomum verum',
    title: 'Cinnamon: Ancient Spice, Contested Metabolic Medicine',
    author: 'Royal Maroon Herbs', date: '31 August 2026', week: 'Week 5',
    illustration: '/images/hub/cinnamon.jpg', photo: true, illustration2: '/images/hub/cinnamon-2.jpg', image: IMG + 'cinnamon-bark.jpg', shopSlug: 'cinnamon-bark', shopName: 'Cinnamon Bark',
    family: 'Lauraceae',
    compounds: 'Cinnamaldehyde, procyanidins',
    primaryUse: 'Glycaemic support',
    evidenceLevel: 1, evidenceLabel: 'Contested',
    sections: [
      { label: 'Origin & Traditional Use', body: `Few botanicals have shaped trade and cuisine like cinnamon, the dried inner bark of Cinnamomum trees. 'True' or Ceylon cinnamon (C. verum, syn. C. zeylanicum) originates in Sri Lanka, while the more common cassia (C. cassia) dominates global markets. Prized since antiquity for embalming, flavouring, and traditional medicine, its bioactivity centres on cinnamaldehyde and polyphenolic procyanidins (Ranasinghe et al., 2013).` },
      { label: 'Benefits to Human Health', body: `Modern interest focuses on metabolic health: cinnamon has been studied for lowering fasting glucose, HbA1c, and serum lipids, with additional antimicrobial, antioxidant, and anti-inflammatory properties reported in preclinical work.` },
      { label: 'Evidence & Verified Potency', body: `Yet the clinical picture is genuinely contested. An influential meta-analysis found reductions in glucose and cholesterol but no significant effect on HbA1c, tempering enthusiasm (Allen et al., 2013). A later dose-response meta-analysis reported more favourable glycaemic effects, illustrating how heterogeneity, species, and dosing shift conclusions (Moridpour et al., 2024). A safety caveat matters: cassia is rich in coumarin, a hepatotoxin at high intake. Cinnamon is a plausible adjunct, not a proven therapy.` }
    ],
    references: [
      `Ranasinghe, P., Pigera, S., Premakumara, G.A.S., Galappaththy, P., Constantine, G.R. and Katulanda, P. (2013) 'Medicinal properties of "true" cinnamon (Cinnamomum zeylanicum): a systematic review', BMC Complementary and Alternative Medicine, 13, 275. Available at: https://doi.org/10.1186/1472-6882-13-275 (Accessed: 2026).`,
      `Allen, R.W., Schwartzman, E., Baker, W.L., Coleman, C.I. and Phung, O.J. (2013) 'Cinnamon use in type 2 diabetes: an updated systematic review and meta-analysis', Annals of Family Medicine, 11(5), pp. 452–459. Available at: https://doi.org/10.1370/afm.1517 (Accessed: 2026).`,
      `Moridpour, A.H., Kavyani, Z., Khosravi, S., Farmani, E., Daneshvar, M., Musazadeh, V. and Faghfouri, A.H. (2024) 'The effect of cinnamon supplementation on glycemic control in patients with type 2 diabetes mellitus: an updated systematic review and dose-response meta-analysis of randomized controlled trials', Phytotherapy Research, 38(1), pp. 117–130. Available at: https://doi.org/10.1002/ptr.8026 (Accessed: 2026).`,
      `Namazi, N., Khodamoradi, K., Khamechi, S.P., Heshmati, J., Ayati, M.H. and Larijani, B. (2019) 'The impact of cinnamon on anthropometric indices and glycemic status in patients with type 2 diabetes: a systematic review and meta-analysis of clinical trials', Complementary Therapies in Medicine, 43, pp. 92–101. Available at: https://doi.org/10.1016/j.ctim.2019.01.002 (Accessed: 2026).`,
      `Zhou, Q., Lei, X., Fu, S., Li, Z., Chen, Y., Long, C., Li, S. and Chen, Q. (2022) 'Efficacy of cinnamon supplementation on glycolipid metabolism in T2DM: a meta-analysis and systematic review', Frontiers in Physiology, 13, 960580. Available at: https://doi.org/10.3389/fphys.2022.960580 (Accessed: 2026).`
    ]
  }
];
