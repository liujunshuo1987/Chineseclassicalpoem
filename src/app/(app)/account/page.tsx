import { getUser, getUserCredits } from '@/lib/actions/auth.actions';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { User, Coins, History } from 'lucide-react';

export default async function AccountPage() {
  const user = await getUser();
  const credits = await getUserCredits();
  const supabase = await createClient();

  const { data: transactions } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const { data: orders } = await supabase
    .from('payment_orders')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">账户设置</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold flex items-center">
              <User className="w-5 h-5 mr-2" />
              个人信息
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">邮箱</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">用户名</p>
                <p className="font-medium">{user?.profile?.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">角色</p>
                <p className="font-medium">
                  {user?.profile?.role === 'admin' ? '管理员' : '普通用户'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold flex items-center">
              <Coins className="w-5 h-5 mr-2" />
              积分统计
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">当前余额</p>
                <p className="text-2xl font-bold text-primary-600">{credits?.balance || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">累计获得</p>
                <p className="font-medium">{credits?.total_earned || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">累计消费</p>
                <p className="font-medium">{credits?.total_spent || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold flex items-center">
              <History className="w-5 h-5 mr-2" />
              购买记录
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {orders && orders.length > 0 ? (
                orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="text-sm">
                    <p className="font-medium">+{order.credits + order.bonus_credits} 积分</p>
                    <p className="text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">暂无购买记录</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">最近交易</h2>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">时间</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">类型</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">说明</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">金额</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">余额</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(tx.created_at).toLocaleString('zh-CN')}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          tx.type === 'purchase' ? 'bg-green-100 text-green-800' :
                          tx.type === 'bonus' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {tx.type === 'purchase' ? '购买' :
                           tx.type === 'bonus' ? '赠送' :
                           tx.type === 'ocr' ? 'OCR' :
                           tx.type === 'analysis' ? '分析' :
                           tx.type === 'poetry' ? '诗词' :
                           tx.type === 'annotation' ? '注释' : tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{tx.description}</td>
                      <td className={`py-3 px-4 text-sm text-right font-medium ${
                        tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900">
                        {tx.balance_after}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">暂无交易记录</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
