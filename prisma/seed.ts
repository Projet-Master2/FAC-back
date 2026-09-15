import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { Difficulty, MediaType, PrismaClient, ReactionType } from '../src/generated/prisma/client'

dotenv.config()
dotenv.config({ path: '.env.local', override: true })

type SeedUser = {
  email: string
  name: string
  pseudo: string
  bio: string
  avatar: string
}

type SeedRecipe = {
  title: string
  description: string
  difficulty: Difficulty
  prepTime: number
  cookTime: number
  servings: number
  estimatedCost: number
}

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required to run the seed script')
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: DATABASE_URL }),
} as never)

const usersSeed: SeedUser[] = [
  {
    email: 'alice.martin@fac.dev',
    name: 'Alice Martin',
    pseudo: 'alicecook',
    bio: 'Etudiante en droit, fan de recettes express.',
    avatar: 'https://i.pravatar.cc/300?img=1',
  },
  {
    email: 'thomas.bernard@fac.dev',
    name: 'Thomas Bernard',
    pseudo: 'tomfood',
    bio: 'Objectif: bien manger avec 5 euros.',
    avatar: 'https://i.pravatar.cc/300?img=2',
  },
  {
    email: 'sarah.lefevre@fac.dev',
    name: 'Sarah Lefevre',
    pseudo: 'sarahquickmeal',
    bio: 'Batch cooking du dimanche et lunchbox.',
    avatar: 'https://i.pravatar.cc/300?img=3',
  },
  {
    email: 'nicolas.robert@fac.dev',
    name: 'Nicolas Robert',
    pseudo: 'nico_pates',
    bio: 'Le roi des pates, sauces minute.',
    avatar: 'https://i.pravatar.cc/300?img=4',
  },
  {
    email: 'emma.richard@fac.dev',
    name: 'Emma Richard',
    pseudo: 'emmaveggie',
    bio: 'Cuisine veggie simple et gourmande.',
    avatar: 'https://i.pravatar.cc/300?img=5',
  },
  {
    email: 'hugo.petit@fac.dev',
    name: 'Hugo Petit',
    pseudo: 'hugokitchen',
    bio: 'Toujours a la recherche du meilleur ratio temps/prix.',
    avatar: 'https://i.pravatar.cc/300?img=6',
  },
  {
    email: 'lea.moreau@fac.dev',
    name: 'Lea Moreau',
    pseudo: 'lea_epices',
    bio: 'Epices, legumes et recettes qui claquent.',
    avatar: 'https://i.pravatar.cc/300?img=7',
  },
  {
    email: 'maxime.laurent@fac.dev',
    name: 'Maxime Laurent',
    pseudo: 'maxmealprep',
    bio: 'Meal prep de la semaine en 1h.',
    avatar: 'https://i.pravatar.cc/300?img=8',
  },
]

const tagsSeed = [
  { name: 'Rapide', slug: 'rapide' },
  { name: 'Petit budget', slug: 'petit-budget' },
  { name: 'Vegetarien', slug: 'vegetarien' },
  { name: 'Sans four', slug: 'sans-four' },
  { name: 'One pot', slug: 'one-pot' },
  { name: 'Pates', slug: 'pates' },
  { name: 'Riz', slug: 'riz' },
  { name: 'Salade', slug: 'salade' },
  { name: 'Poulet', slug: 'poulet' },
  { name: 'Meal prep', slug: 'meal-prep' },
]

const ingredientsSeed = [
  { name: 'pates', iconName: 'mdi:pasta' },
  { name: 'riz', iconName: 'mdi:rice' },
  { name: 'poulet', iconName: 'mdi:food-drumstick' },
  { name: 'oeuf', iconName: 'mdi:egg' },
  { name: 'tomate', iconName: 'mdi:food-apple-outline' },
  { name: 'oignon', iconName: 'mdi:onion' },
  { name: 'ail', iconName: 'mdi:garlic' },
  { name: 'carotte', iconName: 'mdi:carrot' },
  { name: 'courgette', iconName: 'mdi:food-variant' },
  { name: 'poivron', iconName: 'mdi:chili-mild' },
  { name: 'fromage rape', iconName: 'mdi:cheese' },
  { name: 'creme', iconName: 'mdi:cup' },
  { name: 'lait', iconName: 'mdi:bottle-tonic-plus' },
  { name: 'beurre', iconName: 'mdi:butterfly-outline' },
  { name: 'huile d olive', iconName: 'mdi:oil' },
  { name: 'thon', iconName: 'mdi:fish' },
  { name: 'mais', iconName: 'mdi:corn' },
  { name: 'lentilles', iconName: 'mdi:seed' },
  { name: 'pois chiches', iconName: 'mdi:seed-outline' },
  { name: 'epinards', iconName: 'mdi:leaf' },
]

const recipesSeed: SeedRecipe[] = [
  {
    title: 'Pates creme ail et poulet',
    description: 'Un classique ultra simple avec une sauce cremeuse et un poulet dore.',
    difficulty: Difficulty.EASY,
    prepTime: 12,
    cookTime: 15,
    servings: 2,
    estimatedCost: 3.8,
  },
  {
    title: 'Riz saute aux legumes',
    description: 'Riz saute facon campus, legumes croquants et sauce maison.',
    difficulty: Difficulty.EASY,
    prepTime: 15,
    cookTime: 12,
    servings: 3,
    estimatedCost: 2.9,
  },
  {
    title: 'Salade meal prep thon mais',
    description: 'Une salade fraiche, proteinee et parfaite a emporter.',
    difficulty: Difficulty.EASY,
    prepTime: 10,
    cookTime: 0,
    servings: 2,
    estimatedCost: 2.4,
  },
  {
    title: 'One pot pates tomate epinards',
    description: 'Tout cuit dans la meme casserole pour gagner du temps.',
    difficulty: Difficulty.MEDIUM,
    prepTime: 10,
    cookTime: 18,
    servings: 3,
    estimatedCost: 2.7,
  },
  {
    title: 'Lentilles epicees express',
    description: 'Recette veggie riche en proteines et tres economique.',
    difficulty: Difficulty.EASY,
    prepTime: 8,
    cookTime: 20,
    servings: 4,
    estimatedCost: 1.9,
  },
  {
    title: 'Omelette garnie campus',
    description: 'Omelette complete avec legumes et fromage, prete en 10 minutes.',
    difficulty: Difficulty.EASY,
    prepTime: 6,
    cookTime: 6,
    servings: 1,
    estimatedCost: 2.2,
  },
  {
    title: 'Bowl poulet riz sauce creme',
    description: 'Bowl reconfortant avec riz, poulet et sauce legere.',
    difficulty: Difficulty.MEDIUM,
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    estimatedCost: 4.1,
  },
  {
    title: 'Poelee courgette carotte ail',
    description: 'Poelee veggie rapide a servir avec du riz ou des pates.',
    difficulty: Difficulty.EASY,
    prepTime: 10,
    cookTime: 12,
    servings: 2,
    estimatedCost: 2.1,
  },
  {
    title: 'Gratin rapide sans four facon poele',
    description: 'Version etudiante sans four, croustillante et fondante.',
    difficulty: Difficulty.HARD,
    prepTime: 18,
    cookTime: 20,
    servings: 3,
    estimatedCost: 3.6,
  },
  {
    title: 'Pois chiches tomate paprika',
    description: 'Plat vegan express aux epices douces et texture fondante.',
    difficulty: Difficulty.EASY,
    prepTime: 8,
    cookTime: 14,
    servings: 3,
    estimatedCost: 2.3,
  },
]

const commentSamples = [
  'Incroyable, je refais ce soir.',
  'Super simple et vraiment bon.',
  'Nickel pour la fin de mois.',
  'Top recette, ajoute un peu plus d ail et c est parfait.',
  'Validée par mes colocs.',
  'Tres bon rapport temps/prix.',
  'Je recommande en meal prep.',
  'Texture parfaite, merci pour la recette.',
]

const stepSamples = [
  'Prepare tous les ingredients et coupe les legumes.',
  'Fais revenir l oignon et l ail dans une poele chaude.',
  'Ajoute l ingredient principal puis assaisonne selon ton gout.',
  'Verse un peu d eau ou de creme, puis laisse mijoter quelques minutes.',
  'Ajuste la cuisson, goute et sers bien chaud.',
]

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickMany<T>(items: T[], min: number, max: number): T[] {
  const count = randomInt(min, max)
  const pool = [...items]
  const selected: T[] = []

  for (let i = 0; i < count && pool.length > 0; i += 1) {
    const index = randomInt(0, pool.length - 1)
    const item = pool[index]
    if (item) selected.push(item)
    pool.splice(index, 1)
  }

  return selected
}

async function clearDatabase() {
  await prisma.reaction.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.rating.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.recipeStep.deleteMany()
  await prisma.recipeIngredient.deleteMany()
  await prisma.recipeTag.deleteMany()
  await prisma.recipeMedia.deleteMany()
  await prisma.recipe.deleteMany()
  await prisma.passwordResetToken.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.ingredient.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.user.deleteMany()
}

async function seed() {
  const passwordHash = await bcrypt.hash('password123', 12)

  await clearDatabase()

  const users = [] as Array<{ id: string; email: string; pseudo: string | null }>
  for (const user of usersSeed) {
    const created = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        pseudo: user.pseudo,
        bio: user.bio,
        avatar: user.avatar,
        password: passwordHash,
      },
      select: { id: true, email: true, pseudo: true },
    })
    users.push(created)
  }

  const tags = [] as Array<{ id: string; slug: string }>
  for (const tag of tagsSeed) {
    const created = await prisma.tag.create({
      data: tag,
      select: { id: true, slug: true },
    })
    tags.push(created)
  }

  const ingredients = [] as Array<{ id: string; name: string }>
  for (const ingredient of ingredientsSeed) {
    const created = await prisma.ingredient.create({
      data: ingredient,
      select: { id: true, name: true },
    })
    ingredients.push(created)
  }

  const recipeIds: string[] = []
  const commentIds: string[] = []

  for (let i = 0; i < recipesSeed.length; i += 1) {
    const base = recipesSeed[i]
    const author = users[i % users.length]
    if (!base || !author) continue

    const recipe = await prisma.recipe.create({
      data: {
        ...base,
        authorId: author.id,
        published: true,
      },
      select: { id: true },
    })

    recipeIds.push(recipe.id)

    const steps = pickMany(stepSamples, 3, 5)
    for (let stepIndex = 0; stepIndex < steps.length; stepIndex += 1) {
      const stepDescription = steps[stepIndex]
      if (!stepDescription) continue

      await prisma.recipeStep.create({
        data: {
          recipeId: recipe.id,
          order: stepIndex,
          description: stepDescription,
        },
      })
    }

    const recipeIngredients = pickMany(ingredients, 4, 7)
    for (const ingredient of recipeIngredients) {
      await prisma.recipeIngredient.create({
        data: {
          recipeId: recipe.id,
          ingredientId: ingredient.id,
          quantity: randomInt(1, 6),
          unit: ['g', 'ml', 'piece', 'c. a soupe'][randomInt(0, 3)] || 'g',
        },
      })
    }

    const recipeTags = pickMany(tags, 1, 3)
    for (const tag of recipeTags) {
      await prisma.recipeTag.create({
        data: {
          recipeId: recipe.id,
          tagId: tag.id,
        },
      })
    }

    await prisma.recipeMedia.create({
      data: {
        recipeId: recipe.id,
        type: MediaType.IMAGE,
        order: 0,
        url: `https://picsum.photos/seed/fac-recipe-${i + 1}/1200/800.webp`,
      },
    })

    const commentsToCreate = randomInt(1, 5)
    for (let c = 0; c < commentsToCreate; c += 1) {
      const commenter = users[randomInt(0, users.length - 1)]
      if (!commenter) continue

      const comment = await prisma.comment.create({
        data: {
          recipeId: recipe.id,
          userId: commenter.id,
          content: commentSamples[randomInt(0, commentSamples.length - 1)] || 'Super recette.',
        },
        select: { id: true },
      })

      commentIds.push(comment.id)
    }
  }

  const ratingPairs = new Set<string>()
  const favoritePairs = new Set<string>()

  for (const recipeId of recipeIds) {
    const raters = pickMany(users, 3, users.length)
    for (const rater of raters) {
      const key = `${rater.id}:${recipeId}`
      if (ratingPairs.has(key)) continue
      ratingPairs.add(key)

      await prisma.rating.create({
        data: {
          userId: rater.id,
          recipeId,
          score: randomInt(2, 5),
        },
      })
    }

    const fans = pickMany(users, 2, Math.max(2, users.length - 1))
    for (const fan of fans) {
      const key = `${fan.id}:${recipeId}`
      if (favoritePairs.has(key)) continue
      favoritePairs.add(key)

      await prisma.favorite.create({
        data: {
          userId: fan.id,
          recipeId,
        },
      })
    }
  }

  const recipeReactionKeys = new Set<string>()
  const commentReactionKeys = new Set<string>()

  for (const recipeId of recipeIds) {
    const reactors = pickMany(users, 2, users.length)
    for (const reactor of reactors) {
      const types = pickMany([ReactionType.LIKE, ReactionType.LOVE, ReactionType.YUM], 1, 2)
      for (const type of types) {
        const key = `${reactor.id}:${recipeId}:${type}`
        if (recipeReactionKeys.has(key)) continue
        recipeReactionKeys.add(key)

        await prisma.reaction.create({
          data: {
            userId: reactor.id,
            recipeId,
            type,
          },
        })
      }
    }
  }

  for (const commentId of commentIds) {
    const reactors = pickMany(users, 1, 3)
    for (const reactor of reactors) {
      const type = [ReactionType.LIKE, ReactionType.LOVE, ReactionType.YUM][randomInt(0, 2)]
      if (!type) continue

      const key = `${reactor.id}:${commentId}:${type}`
      if (commentReactionKeys.has(key)) continue
      commentReactionKeys.add(key)

      await prisma.reaction.create({
        data: {
          userId: reactor.id,
          commentId,
          type,
        },
      })
    }
  }

  console.log('Seed finished successfully')
  console.log(`Users: ${users.length}`)
  console.log(`Recipes: ${recipeIds.length}`)
  console.log(`Comments: ${commentIds.length}`)
}

seed()
  .catch((error) => {
    console.error('Seed failed', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
