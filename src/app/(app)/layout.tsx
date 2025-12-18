import { getUser, getUserCredits } from '@/lib/actions/auth.actions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Coins, LogOut, Settings, User, Scan, Feather, FileText } from 'lucide-react';
import { signOut } from '@/lib/actions/auth.actions';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  const credits = await getUserCredits();

  async function handleSignOut() {
    'use server';
    await signOut();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/app/dashboard" className="flex items-center space-x-2">
                <BookOpen className="w-8 h-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">古籍智能平台</span>
              </Link>

              <div className="hidden md:flex items-center space-x-6">
                <Link
                  href="/app/scanner"
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition"
                >
                  <Scan className="w-4 h-4" />
                  <span>扫描</span>
                </Link>
                <Link
                  href="/app/creator"
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition"
                >
                  <Feather className="w-4 h-4" />
                  <span>创作</span>
                </Link>
                <Link
                  href="/app/archives"
                  className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition"
                >
                  <FileText className="w-4 h-4" />
                  <span>我的古籍</span>
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/app/recharge"
                className="flex items-center space-x-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition"
              >
                <Coins className="w-5 h-5" />
                <span className="font-semibold">{credits?.balance || 0} 积分</span>
              </Link>

              <Link
                href="/app/account"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                <Settings className="w-5 h-5" />
              </Link>

              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}
