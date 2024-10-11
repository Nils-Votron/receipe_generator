import RecipeGenerator from '@/components/RecipeGenerator';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Recipe Generator</h1>
      <RecipeGenerator />
    </div>
  );
}