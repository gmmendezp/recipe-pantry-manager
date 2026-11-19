import {
  type ParsedPantryItemInput,
  pantryItemInputSchema,
} from '#/features/pantry/pantry.schema';
import {
  type ParsedRecipeInput,
  recipeInputSchema,
} from '#/features/recipes/recipes.schema';
import { importedDemoRecipes } from './demo-recipes.server';

export type DemoRecipeSeed = {
  key: string;
  recipe: ParsedRecipeInput;
  tags: string[];
};

function defineRecipe(
  key: string,
  tags: string[],
  input: unknown,
): DemoRecipeSeed {
  return {
    key,
    recipe: recipeInputSchema.parse(input),
    tags,
  };
}

function getImportedRecipe(index: number) {
  const recipe = importedDemoRecipes[index];

  if (!recipe) {
    throw new Error(`Missing imported demo recipe at index ${index}.`);
  }

  return recipe;
}

export const demoPantryItems: ParsedPantryItemInput[] = pantryItemInputSchema
  .array()
  .parse([
    {
      category: 'Grains',
      name: 'Rice',
      notes: '',
      quantity: '2',
      unit: 'cups',
    },
    {
      category: 'Legumes',
      name: 'Brown lentils',
      notes: '',
      quantity: '2',
      unit: 'cups',
    },
    {
      category: 'Baking',
      name: 'Flour',
      notes: '',
      quantity: '1',
      unit: 'kg',
    },
    {
      category: 'Dairy & Eggs',
      name: 'Eggs',
      notes: '',
      quantity: '8',
      unit: '',
    },
    {
      category: 'Dairy & Eggs',
      name: 'Milk',
      notes: '',
      quantity: '1',
      unit: 'litre',
    },
    {
      category: 'Oils',
      name: 'Olive oil',
      notes: '',
      quantity: '500',
      unit: 'ml',
    },
    {
      category: 'Canned Goods',
      name: 'Canned tomatoes',
      notes: '',
      quantity: '4',
      unit: 'cans',
    },
    {
      category: 'Canned Goods',
      name: 'Vegetable broth',
      notes: '',
      quantity: '1',
      unit: 'carton',
    },
    {
      category: 'Produce',
      name: 'Garlic',
      notes: '',
      quantity: '1',
      unit: 'bulb',
    },
    {
      category: 'Produce',
      name: 'Yellow onions',
      notes: '',
      quantity: '3',
      unit: '',
    },
    {
      category: 'Produce',
      name: 'Carrots',
      notes: '',
      quantity: '4',
      unit: '',
    },
    {
      category: 'Produce',
      name: 'Lemons',
      notes: '',
      quantity: '2',
      unit: '',
    },
    {
      category: 'Spices',
      name: 'Ground cumin',
      notes: '',
      quantity: '1',
      unit: 'jar',
    },
    {
      category: 'Spices',
      name: 'Smoked paprika',
      notes: '',
      quantity: '1',
      unit: 'jar',
    },
  ]);

const vegetableFriedRice = defineRecipe(
  'vegetable-fried-rice',
  ['Quick', 'Dinner'],
  {
    cookTime: 15,
    description: 'A quick weeknight meal made with rice, eggs, and vegetables.',
    imageUrl: '',
    ingredients: [
      {
        category: 'Grains',
        name: 'Rice',
        quantity: '2',
        rawText: '2 cups cooked rice',
        unit: 'cups',
      },
      {
        category: 'Dairy & Eggs',
        name: 'Eggs',
        quantity: '2',
        rawText: '2 eggs',
        unit: '',
      },
      {
        category: 'Produce',
        name: 'Garlic',
        quantity: '2',
        rawText: '2 cloves garlic',
        unit: 'cloves',
      },
      {
        category: 'Frozen',
        name: 'Frozen peas',
        quantity: '1',
        rawText: '1 cup frozen peas',
        unit: 'cup',
      },
      {
        category: 'Condiments',
        name: 'Soy sauce',
        quantity: '2',
        rawText: '2 tablespoons soy sauce',
        unit: 'tablespoons',
      },
    ],
    prepTime: 10,
    servings: 4,
    sourceUrl: '',
    steps: [
      { instruction: 'Warm a large skillet over medium heat.' },
      { instruction: 'Cook the eggs, then transfer them to a plate.' },
      { instruction: 'Cook the garlic and peas, then add the rice.' },
      { instruction: 'Stir in the eggs and soy sauce and serve.' },
    ],
    title: 'Vegetable Fried Rice',
  },
);

const tomatoPasta = defineRecipe('tomato-pasta', ['Italian', 'Dinner'], {
  cookTime: 20,
  description: 'A simple tomato pasta finished with basil and parmesan.',
  imageUrl: '',
  ingredients: [
    {
      category: 'Grains',
      name: 'Spaghetti',
      quantity: '250',
      rawText: '250 g spaghetti',
      unit: 'g',
    },
    {
      category: 'Canned Goods',
      name: 'Canned tomatoes',
      quantity: '1',
      rawText: '1 can tomatoes',
      unit: 'can',
    },
    {
      category: 'Produce',
      name: 'Garlic',
      quantity: '2',
      rawText: '2 cloves garlic',
      unit: 'cloves',
    },
    {
      category: 'Oils',
      name: 'Olive oil',
      quantity: '1',
      rawText: '1 tablespoon olive oil',
      unit: 'tablespoon',
    },
    {
      category: 'Produce',
      name: 'Fresh basil',
      quantity: '1',
      rawText: '1 handful fresh basil',
      unit: 'handful',
    },
    {
      category: 'Dairy & Eggs',
      name: 'Parmesan',
      quantity: '50',
      rawText: '50 g parmesan',
      unit: 'g',
    },
  ],
  prepTime: 10,
  servings: 4,
  sourceUrl: '',
  steps: [
    { instruction: 'Cook the spaghetti until al dente.' },
    { instruction: 'Gently cook the garlic in the olive oil.' },
    { instruction: 'Add the tomatoes and simmer until slightly thickened.' },
    { instruction: 'Toss with the pasta, basil, and parmesan.' },
  ],
  title: 'Tomato Pasta',
});

const pancakes = defineRecipe('pancakes', ['Breakfast', 'Quick'], {
  cookTime: 10,
  description: 'Light pancakes for an easy breakfast or weekend brunch.',
  imageUrl: '',
  ingredients: [
    {
      category: 'Baking',
      name: 'Flour',
      quantity: '2',
      rawText: '2 cups flour',
      unit: 'cups',
    },
    {
      category: 'Dairy & Eggs',
      name: 'Eggs',
      quantity: '2',
      rawText: '2 eggs',
      unit: '',
    },
    {
      category: 'Dairy & Eggs',
      name: 'Milk',
      quantity: '1.5',
      rawText: '1½ cups milk',
      unit: 'cups',
    },
    {
      category: 'Baking',
      name: 'Baking powder',
      quantity: '2',
      rawText: '2 teaspoons baking powder',
      unit: 'teaspoons',
    },
    {
      category: 'Condiments',
      name: 'Maple syrup',
      quantity: '',
      rawText: 'Maple syrup, for serving',
      unit: '',
    },
  ],
  prepTime: 10,
  servings: 4,
  sourceUrl: '',
  steps: [
    { instruction: 'Whisk the flour and baking powder together.' },
    { instruction: 'Whisk the eggs and milk in a separate bowl.' },
    { instruction: 'Combine the wet and dry ingredients.' },
    { instruction: 'Cook the pancakes and serve with maple syrup.' },
  ],
  title: 'Pancakes',
});

const importedRecipes: DemoRecipeSeed[] = [
  {
    key: 'imported-lentil-soup',
    recipe: getImportedRecipe(0),
    tags: ['Imported', 'Soup', 'Vegan'],
  },
  {
    key: 'imported-shakshuka',
    recipe: getImportedRecipe(1),
    tags: ['Imported', 'Breakfast', 'Vegetarian'],
  },
];

export const demoRecipes: DemoRecipeSeed[] = [
  vegetableFriedRice,
  tomatoPasta,
  pancakes,
  ...importedRecipes,
];

export const demoGroceryList = {
  checkedItemNames: ['Soy sauce'],
  sourceRecipeKeys: ['vegetable-fried-rice', 'tomato-pasta', 'pancakes'],
  title: 'Demo Weekly Shop',
} as const;
