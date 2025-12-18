import { getUser, getUserCredits } from '@/lib/actions/auth.actions';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Scan, Feather, FileText, Coins } from 'lucide-react';

export default async function DashboardPage() {
  const user = await getUser();
  const credits = await getUserCredits();
  const supabase = await createClient();

  const { data: archives, count: archiveCount } = await supabase
    .from('archives')
    .select('*', { count: 'exact', head: false })
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: poetry, count: poetryCount } = await supabase
    .from('poetry_generations')
    .select('*', { count: 'exact', head: false })
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          欢迎回来，{user?.profile?.nickname || user?.profile?.username || '用户'}
        </h1>
        <p className="text-gray-600 mt-2">开始您的古籍探索之旅</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">当前积分</p>
                <p className="text-2xl font-bold text-primary-600">{credits?.balance || 0}</p>
              </div>
              <Coins className="w-10 h-10 text-primary-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">古籍记录</p>
                <p className="text-2xl font-bold text-gray-900">{archiveCount || 0}</p>
              </div>
              <FileText className="w-10 h-10 text-gray-400 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">诗词创作</p>
                <p className="text-2xl font-bold text-gray-900">{poetryCount || 0}</p>
              </div>
              <Feather className="w-10 h-10 text-gray-400 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">累计消费</p>
                <p className="text-2xl font-bold text-gray-900">{credits?.total_spent || 0}</p>
              </div>
              <Coins className="w-10 h-10 text-gray-400 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Link href="/app/scanner">
          <Card className="hover:shadow-md transition cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <Scan className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">扫描古籍</h3>
                <p className="text-gray-600 text-sm">使用 AI 识别古籍文字</p>
                <p className="text-primary-600 text-sm mt-2">10 积分/次</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app/creator">
          <Card className="hover:shadow-md transition cursor-pointer">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <Feather className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">诗词创作</h3>
                <p className="text-gray-600 text-sm">AI 生成精美诗词</p>
                <p className="text-primary-600 text-sm mt-2">20 积分/次</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app/recharge">
          <Card className="hover:shadow-md transition cursor-pointer bg-primary-50 border-primary-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-200 rounded-full mb-4">
                  <Coins className="w-8 h-8 text-primary-700" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-primary-900">充值积分</h3>
                <p className="text-primary-700 text-sm">购买积分套餐</p>
                <p className="text-primary-600 text-sm mt-2 font-semibold">最低 $4.99</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {archives && archives.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">最近的古籍</h2>
              <Link href="/app/archives" className="text-primary-600 hover:text-primary-700 text-sm">
                查看全部
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {archives.map((archive) => (
                <Link
                  key={archive.id}
                  href={`/app/archives/${archive.id}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{archive.title}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(archive.created_at).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
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
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
