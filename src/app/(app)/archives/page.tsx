import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/Card';
import { FileText } from 'lucide-react';
import Link from 'next/link';

export default async function ArchivesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: archives } = await supabase
    .from('archives')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">我的古籍</h1>

      {!archives || archives.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无古籍记录</h3>
            <p className="text-gray-600 mb-6">
              开始扫描您的第一本古籍吧
            </p>
            <Link
              href="/app/scanner"
              className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              开始扫描
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archives.map((archive) => (
            <Card key={archive.id} className="hover:shadow-md transition">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{archive.title}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {new Date(archive.created_at).toLocaleDateString('zh-CN')}
                </p>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  archive.status === 'completed' ? 'bg-green-100 text-green-800' :
                  archive.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  archive.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {archive.status === 'completed' ? '已完成' :
                   archive.status === 'processing' ? '处理中' :
                   archive.status === 'failed' ? '失败' : '上传中'}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
