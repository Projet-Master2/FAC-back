/**
 * Dictionnaire ingrédient (nom normalisé) → clé Iconify
 * Format : "nom-singulier-minuscules": "set:icon-name"
 * Référence : https://icon-sets.iconify.design
 */
export const INGREDIENT_ICONS: Record<string, string> = {
  // ── Légumes ──────────────────────────────────────────────────────────────
  tomate:            'noto:tomato',
  carotte:           'noto:carrot',
  oignon:            'noto:onion',
  'pomme de terre':  'noto:potato',
  patate:            'noto:potato',
  ail:               'noto:garlic',
  poivron:           'noto:bell-pepper',
  courgette:         'noto:cucumber',
  concombre:         'noto:cucumber',
  salade:            'noto:leafy-green',
  epinard:           'noto:leafy-green',
  laitue:            'noto:leafy-green',
  champignon:        'noto:mushroom',
  brocoli:           'noto:broccoli',
  avocat:            'noto:avocado',
  aubergine:         'noto:eggplant',
  mais:              'noto:ear-of-corn',
  'petit pois':      'noto:peas',
  haricot:           'noto:beans',
  'haricot vert':    'noto:beans',
  navet:             'noto:turnip',
  betterave:         'noto:beet-root',
  artichaut:         'noto:broccoli',
  asperge:           'noto:leafy-green',
  celeri:            'noto:leafy-green',
  fenouil:           'noto:leafy-green',
  poireau:           'noto:leek',
  citrouille:        'noto:jack-o-lantern',
  potiron:           'noto:jack-o-lantern',

  // ── Fruits ───────────────────────────────────────────────────────────────
  pomme:             'noto:red-apple',
  poire:             'noto:pear',
  banane:            'noto:banana',
  orange:            'noto:tangerine',
  mandarine:         'noto:tangerine',
  citron:            'noto:lemon',
  fraise:            'noto:strawberry',
  framboise:         'noto:strawberry',
  raisin:            'noto:grapes',
  peche:             'noto:peach',
  abricot:           'noto:peach',
  cerise:            'noto:cherries',
  melon:             'noto:melon',
  ananas:            'noto:pineapple',
  pastèque:          'noto:watermelon',
  pasteque:          'noto:watermelon',
  mangue:            'noto:mango',
  kiwi:              'noto:kiwi-fruit',
  figue:             'noto:grapes',
  prune:             'noto:purple-circle',

  // ── Viandes & protéines ──────────────────────────────────────────────────
  poulet:            'noto:poultry-leg',
  dinde:             'noto:poultry-leg',
  boeuf:             'noto:cut-of-meat',
  veau:              'noto:cut-of-meat',
  porc:              'noto:cut-of-meat',
  agneau:            'noto:cut-of-meat',
  bacon:             'noto:bacon',
  lardon:            'noto:bacon',
  jambon:            'noto:meat-on-bone',
  saucisse:          'noto:hot-dog',
  merguez:           'noto:hot-dog',
  thon:              'noto:fish',
  saumon:            'noto:fish',
  crevette:          'noto:shrimp',
  moule:             'noto:oyster',
  cabillaud:         'noto:fish',
  sardine:           'noto:fish',
  oeuf:              'noto:egg',
  tofu:              'noto:white-square-button',

  // ── Produits laitiers ────────────────────────────────────────────────────
  lait:              'noto:glass-of-milk',
  creme:             'noto:glass-of-milk',
  beurre:            'noto:butter',
  fromage:           'noto:cheese-wedge',
  parmesan:          'noto:cheese-wedge',
  mozzarella:        'noto:cheese-wedge',
  gruyere:           'noto:cheese-wedge',
  emmental:          'noto:cheese-wedge',
  yaourt:            'noto:glass-of-milk',
  'creme fraiche':     'noto:glass-of-milk',

  // ── Féculents & céréales ─────────────────────────────────────────────────
  riz:               'noto:cooked-rice',
  pate:              'noto:spaghetti',
  spaghetti:         'noto:spaghetti',
  tagliatelle:       'noto:spaghetti',
  penne:             'noto:spaghetti',
  farine:            'noto:bread',
  pain:              'noto:bread',
  brioche:           'noto:bread',
  baguette:          'noto:baguette-bread',
  quinoa:            'noto:cooked-rice',
  boulgour:          'noto:cooked-rice',
  lentille:          'noto:beans',
  'pois chiche':       'noto:beans',
  semoule:           'noto:cooked-rice',
  'flocon davoine':  'noto:bread',
  biscottes:         'noto:cookie',
  crackers:          'noto:cookie',

  // ── Condiments & sauces ──────────────────────────────────────────────────
  sel:               'noto:salt',
  poivre:            'noto:salt',
  huile:             'noto:olive',
  "huile d'olive":   'noto:olive',
  vinaigre:          'noto:jar',
  moutarde:          'noto:jar',
  ketchup:           'noto:tomato',
  mayonnaise:        'noto:jar',
  'sauce soja':      'noto:bottle-with-popping-cork',
  tabasco:           'noto:hot-pepper',
  sucre:             'fluent-emoji:sugar',
  miel:              'noto:honey-pot',
  sirop:             'noto:honey-pot',
  chocolat:          'noto:chocolate-bar',
  cacao:             'noto:chocolate-bar',
  nutella:           'noto:chocolate-bar',
  confiture:         'noto:jar',
  vanille:           'noto:herb',
  levure:            'noto:bread',

  // ── Herbes & épices ──────────────────────────────────────────────────────
  basilic:           'noto:herb',
  persil:            'noto:herb',
  coriandre:         'noto:herb',
  thym:              'noto:herb',
  romarin:           'noto:herb',
  menthe:            'noto:herb',
  laurier:           'noto:herb',
  estragon:          'noto:herb',
  ciboulette:        'noto:herb',
  curcuma:           'noto:herb',
  paprika:           'noto:hot-pepper',
  cumin:             'noto:herb',
  curry:             'noto:herb',
  cannelle:          'noto:herb',
  'piment doux':     'noto:hot-pepper',
  'piment fort':     'noto:hot-pepper',
  gingembre:         'noto:herb',
  muscade:           'noto:herb',
  clou:              'noto:herb',

  // ── Liquides ─────────────────────────────────────────────────────────────
  eau:               'noto:droplet',
  bouillon:          'noto:pot-of-food',
  'vin blanc':       'noto:wine-glass',
  'vin rouge':       'noto:wine-glass',
  vin:               'noto:wine-glass',
  biere:             'noto:beer-mug',
  jus:               'noto:beverage-box',
  "jus d'orange":    'noto:tangerine',

  // ── Fruits secs & oléagineux ─────────────────────────────────────────────
  noix:              'noto:walnut',
  amande:            'noto:chestnut',
  noisette:          'noto:chestnut',
  cacahuete:         'noto:peanuts',
  pistache:          'noto:chestnut',
  'noix de coco':      'noto:coconut',
  'raisin sec':        'noto:grapes',

  // ── Divers ───────────────────────────────────────────────────────────────
  'oeuf de poule':   'noto:egg',
  'levure chimique': 'noto:bread',
  'bicarbonate':     'noto:salt',
}

/**
 * Retourne la clé d'icône pour un nom d'ingrédient normalisé,
 * ou null si aucune correspondance n'est trouvée.
 */
export function getIngredientIcon(normalizedName: string): string | null {
  // Recherche exacte
  if (INGREDIENT_ICONS[normalizedName]) return INGREDIENT_ICONS[normalizedName]

  // Recherche partielle (contient un mot-clé du dictionnaire)
  for (const [key, icon] of Object.entries(INGREDIENT_ICONS)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) return icon
  }

  return null
}
