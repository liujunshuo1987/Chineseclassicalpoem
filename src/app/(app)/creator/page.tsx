import { Card, CardContent } from '@/components/ui/Card';
import { Feather } from 'lucide-react';

export default function CreatorPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">诗词创作</h1>

      <Card>
        <CardContent className="py-16 text-center">
          <Feather className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">创作功能正在开发中</h3>
          <p className="text-gray-600">
            完整的诗词创作功能将在后续版本中提供
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
