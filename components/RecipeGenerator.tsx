"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const formSchema = z.object({
  carbs: z.number().min(0).max(1000),
  protein: z.number().min(0).max(1000),
  fat: z.number().min(0).max(1000),
  carbsDistribution: z.object({
    breakfast: z.number().min(0).max(100),
    lunch: z.number().min(0).max(100),
    dinner: z.number().min(0).max(100),
  }),
  proteinDistribution: z.object({
    breakfast: z.number().min(0).max(100),
    lunch: z.number().min(0).max(100),
    dinner: z.number().min(0).max(100),
  }),
  fatDistribution: z.object({
    breakfast: z.number().min(0).max(100),
    lunch: z.number().min(0).max(100),
    dinner: z.number().min(0).max(100),
  }),
});

type FoodItem = {
  name: string;
  servingSize: string;
  carbs: number;
  protein: number;
  fat: number;
  calories: number;
};

type Meal = {
  name: string;
  foods: FoodItem[];
};

type DailyMealPlan = {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  totalNutrition: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
  };
};

const foodDatabase: Record<string, FoodItem[]> = {
  breakfast: [
    { name: "Oatmeal", servingSize: "1 cup cooked", carbs: 27, protein: 6, fat: 3, calories: 158 },
    { name: "Eggs", servingSize: "2 large", carbs: 1, protein: 12, fat: 10, calories: 144 },
    { name: "Greek Yogurt", servingSize: "1 cup", carbs: 9, protein: 23, fat: 5, calories: 170 },
    { name: "Banana", servingSize: "1 medium", carbs: 27, protein: 1, fat: 0, calories: 105 },
    { name: "Whole Wheat Toast", servingSize: "2 slices", carbs: 24, protein: 8, fat: 2, calories: 138 },
    { name: "Peanut Butter", servingSize: "2 tbsp", carbs: 6, protein: 8, fat: 16, calories: 188 },
  ],
  lunch: [
    { name: "Grilled Chicken Breast", servingSize: "4 oz", carbs: 0, protein: 35, fat: 4, calories: 187 },
    { name: "Brown Rice", servingSize: "1 cup cooked", carbs: 45, protein: 5, fat: 2, calories: 216 },
    { name: "Mixed Salad Greens", servingSize: "2 cups", carbs: 2, protein: 1, fat: 0, calories: 10 },
    { name: "Olive Oil", servingSize: "1 tbsp", carbs: 0, protein: 0, fat: 14, calories: 119 },
    { name: "Quinoa", servingSize: "1 cup cooked", carbs: 39, protein: 8, fat: 4, calories: 222 },
    { name: "Salmon", servingSize: "4 oz", carbs: 0, protein: 23, fat: 11, calories: 206 },
  ],
  dinner: [
    { name: "Lean Beef", servingSize: "4 oz", carbs: 0, protein: 33, fat: 13, calories: 250 },
    { name: "Sweet Potato", servingSize: "1 medium", carbs: 24, protein: 2, fat: 0, calories: 103 },
    { name: "Broccoli", servingSize: "1 cup", carbs: 6, protein: 4, fat: 0, calories: 31 },
    { name: "Avocado", servingSize: "1/2 medium", carbs: 6, protein: 1, fat: 11, calories: 114 },
    { name: "Tofu", servingSize: "4 oz", carbs: 3, protein: 16, fat: 8, calories: 144 },
    { name: "Whole Wheat Pasta", servingSize: "1 cup cooked", carbs: 37, protein: 7, fat: 1, calories: 174 },
  ],
};

function selectFoodsForMeal(targetCarbs: number, targetProtein: number, targetFat: number, mealType: 'breakfast' | 'lunch' | 'dinner'): FoodItem[] {
  const foods: FoodItem[] = [];
  let currentCarbs = 0;
  let currentProtein = 0;
  let currentFat = 0;

  const options = [...foodDatabase[mealType]];

  while (currentCarbs < targetCarbs || currentProtein < targetProtein || currentFat < targetFat) {
    if (options.length === 0) break;

    const randomIndex = Math.floor(Math.random() * options.length);
    const selectedFood = options[randomIndex];

    if (currentCarbs + selectedFood.carbs <= targetCarbs * 1.1 &&
        currentProtein + selectedFood.protein <= targetProtein * 1.1 &&
        currentFat + selectedFood.fat <= targetFat * 1.1) {
      foods.push(selectedFood);
      currentCarbs += selectedFood.carbs;
      currentProtein += selectedFood.protein;
      currentFat += selectedFood.fat;
    }

    options.splice(randomIndex, 1);
  }

  return foods;
}

function generateMealPlan(values: z.infer<typeof formSchema>): DailyMealPlan {
  const totalCalories = values.carbs * 4 + values.protein * 4 + values.fat * 9;
  
  const breakfast: Meal = {
    name: "Breakfast",
    foods: selectFoodsForMeal(
      values.carbs * values.carbsDistribution.breakfast / 100,
      values.protein * values.proteinDistribution.breakfast / 100,
      values.fat * values.fatDistribution.breakfast / 100,
      'breakfast'
    ),
  };

  const lunch: Meal = {
    name: "Lunch",
    foods: selectFoodsForMeal(
      values.carbs * values.carbsDistribution.lunch / 100,
      values.protein * values.proteinDistribution.lunch / 100,
      values.fat * values.fatDistribution.lunch / 100,
      'lunch'
    ),
  };

  const dinner: Meal = {
    name: "Dinner",
    foods: selectFoodsForMeal(
      values.carbs * values.carbsDistribution.dinner / 100,
      values.protein * values.proteinDistribution.dinner / 100,
      values.fat * values.fatDistribution.dinner / 100,
      'dinner'
    ),
  };

  return {
    breakfast,
    lunch,
    dinner,
    totalNutrition: {
      calories: totalCalories,
      carbs: values.carbs,
      protein: values.protein,
      fat: values.fat,
    },
  };
}

export default function RecipeGenerator() {
  const [mealPlan, setMealPlan] = useState<DailyMealPlan | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      carbs: 0,
      protein: 0,
      fat: 0,
      carbsDistribution: { breakfast: 35, lunch: 35, dinner: 30 },
      proteinDistribution: { breakfast: 33, lunch: 33, dinner: 34 },
      fatDistribution: { breakfast: 35, lunch: 30, dinner: 35 },
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const plan = generateMealPlan(values);
    setMealPlan(plan);
    toast({
      title: "Meal Plan Generated",
      description: "Your custom meal plan has been created based on the provided macronutrients.",
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Enter Daily Macronutrients</CardTitle>
            <CardDescription>Provide the desired macronutrients in grams</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="carbs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carbohydrates (g)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormDescription>Enter the desired amount of carbohydrates in grams</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="protein"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein (g)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormDescription>Enter the desired amount of protein in grams</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fat (g)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormDescription>Enter the desired amount of fat in grams</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Tabs defaultValue="carbs">
                  <TabsList>
                    <TabsTrigger value="carbs">Carbs Distribution</TabsTrigger>
                    <TabsTrigger value="protein">Protein Distribution</TabsTrigger>
                    <TabsTrigger value="fat">Fat Distribution</TabsTrigger>
                  </TabsList>
                  <TabsContent value="carbs">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="carbsDistribution.breakfast"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Breakfast (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="carbsDistribution.lunch"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lunch (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="carbsDistribution.dinner"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dinner (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="protein">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="proteinDistribution.breakfast"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Breakfast (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="proteinDistribution.lunch"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lunch (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="proteinDistribution.dinner"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dinner (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="fat">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="fatDistribution.breakfast"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Breakfast (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="fatDistribution.lunch"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lunch (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="fatDistribution.dinner"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dinner (%)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                <Button type="submit">Generate Meal Plan</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Meal Plan</CardTitle>
            <CardDescription>Your custom meal plan based on the provided macronutrients</CardDescription>
          </CardHeader>
          <CardContent>
            {mealPlan ? (
              <div className="space-y-6">
                {['breakfast', 'lunch', 'dinner'].map((mealType) => (
                  <div key={mealType} className="space-y-2">
                    <h3 className="text-lg font-semibold capitalize">{mealType}</h3>
                    <ul className="list-disc pl-5">
                      {(mealPlan[mealType as keyof DailyMealPlan] as Meal).foods.map((food, index) => (
                        <li key={index}>
                          {food.name} - {food.servingSize} 
                          (Carbs: {food.carbs}g, Protein: {food.protein}g, Fat: {food.fat}g, Calories: {food.calories})
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div>
                  <h3 className="text-lg font-semibold">Total Daily Nutrition</h3>
                  <p>Calories: {mealPlan.totalNutrition.calories}</p>
                  <p>Carbs: {mealPlan.totalNutrition.carbs}g</p>
                  <p>Protein: {mealPlan.totalNutrition.protein}g</p>
                  <p>Fat: {mealPlan.totalNutrition.fat}g</p>
                </div>
              </div>
            ) : (
              <p>Enter macronutrients and click "Generate Meal Plan" to see your custom meal plan here.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
}