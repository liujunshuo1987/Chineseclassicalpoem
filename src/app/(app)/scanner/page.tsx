import { Card, CardContent } from '@/components/ui/Card';
import { Scan } from 'lucide-react';

export default function ScannerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">扫描古籍</h1>

      <Card>
        <CardContent className="py-16 text-center">
          <Scan className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">扫描功能正在开发中</h3>
          <p className="text-gray-600">
            完整的扫描功能将在后续版本中提供
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
