import React from 'react';
import { Building2, User, GraduationCap, Mail, Briefcase, Heart, Award, BookOpen } from 'lucide-react';

interface AboutPageProps {
  isEnglish: boolean;
}

const AboutPage: React.FC<AboutPageProps> = ({ isEnglish }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-4 md:py-8">
      <div className="text-center mb-4 md:mb-8">
        <h2 className="text-lg md:text-3xl font-semibold text-gray-900 mb-2 md:mb-4">
          {isEnglish ? 'About Us' : '關於我們'}
        </h2>
        <p className="text-xs md:text-base text-gray-600 max-w-2xl mx-auto">
          {isEnglish 
            ? 'Dedicated to preserving and modernizing classical Chinese literature through innovative technology.'
            : '致力於通過創新技術保護和現代化古典中文文學。'
          }
        </p>
      </div>

      {/* Company Information */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-8 mb-4 md:mb-8">
        <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-6">
          <Building2 className="w-4 h-4 md:w-6 md:h-6 text-indigo-600" />
          <h3 className="text-sm md:text-xl font-semibold text-gray-900">
            {isEnglish ? 'Company Information' : '公司信息'}
          </h3>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg md:rounded-xl p-3 md:p-6 border border-indigo-100">
          <h4 className="text-sm md:text-2xl font-semibold text-indigo-900 mb-2 md:mb-4 text-center">
            深圳峻铄博士文化传播有限公司
          </h4>
          <p className="text-indigo-700 text-center text-xs md:text-lg">
            {isEnglish 
              ? 'Shenzhen Junshuo PhD Cultural Communication Co., Ltd.'
              : '專業從事文化傳播與技術創新的企業'
            }
          </p>
        </div>
      </div>

      {/* Chief Developer Information */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-8 mb-4 md:mb-8">
        <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-6">
          <User className="w-4 h-4 md:w-6 md:h-6 text-purple-600" />
          <h3 className="text-sm md:text-xl font-semibold text-gray-900">
            {isEnglish ? 'Chief Developer' : '首席開發者'}
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-8">
          {/* Developer Profile */}
          <div className="space-y-3 md:space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-2 md:mb-4">
                <img
                  src="/developer-profile.jpg"
                  alt="劉峻鑠"
                  className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover border-2 md:border-4 border-purple-200 shadow-lg"
                />
              </div>
              <h4 className="text-base md:text-2xl font-semibold text-gray-900 mb-1 md:mb-2">劉峻鑠</h4>
              <p className="text-xs md:text-base text-gray-600">
                {isEnglish ? 'Liu Junshuo' : '博士 / 首席開發者'}
              </p>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg md:rounded-xl p-3 md:p-4 border border-green-200">
              <div className="flex items-center space-x-2 md:space-x-3">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                <div>
                  <h5 className="text-xs md:text-base font-semibold text-green-900 mb-0.5 md:mb-1">
                    {isEnglish ? 'Contact' : '聯繫方式'}
                  </h5>
                  <a
                    href="mailto:liujunshuo1987@gmail.com"
                    className="text-xs md:text-base text-green-700 hover:text-green-800 transition-colors"
                  >
                    liujunshuo1987@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Academic & Professional Background */}
          <div className="space-y-3 md:space-y-4">
            {/* Education */}
            <div className="border border-gray-200 rounded-lg md:rounded-xl p-3 md:p-4">
              <div className="flex items-center space-x-2 md:space-x-3 mb-2 md:mb-3">
                <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                <h5 className="text-xs md:text-base font-semibold text-blue-900">
                  {isEnglish ? 'Education' : '學術背景'}
                </h5>
              </div>
              <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
                <div className="flex items-start space-x-1.5 md:space-x-2">
                  <Award className="w-3 h-3 md:w-4 md:h-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">中山大學中國古文獻學博士</p>
                    <p className="text-gray-600">
                      {isEnglish ? 'PhD in Chinese Ancient Literature, Sun Yat-sen University' : '中山大學古文獻研究所'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Experience */}
            <div className="border border-gray-200 rounded-lg md:rounded-xl p-3 md:p-4">
              <div className="flex items-center space-x-2 md:space-x-3 mb-2 md:mb-3">
                <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                <h5 className="text-xs md:text-base font-semibold text-orange-900">
                  {isEnglish ? 'Professional Experience' : '職業經歷'}
                </h5>
              </div>
              <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
                <div className="flex items-start space-x-1.5 md:space-x-2">
                  <Heart className="w-3 h-3 md:w-4 md:h-4 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {isEnglish ? 'Self-employed Media Professional / Media Planner' : '自雇媒體人 / 傳媒策劃'}
                    </p>
                    <p className="text-gray-600">
                      {isEnglish 
                        ? 'Specializing in art & culture and health application development & investment'
                        : '從事藝術文化/大健康方向應用開發&投資'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl md:rounded-2xl p-4 md:p-8">
        <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-6">
          <BookOpen className="w-4 h-4 md:w-6 md:h-6 text-amber-600" />
          <h3 className="text-sm md:text-xl font-semibold text-amber-900">
            {isEnglish ? 'Our Mission' : '我們的使命'}
          </h3>
        </div>
        <div className="text-center">
          <p className="text-xs md:text-lg text-amber-800 leading-relaxed mb-2 md:mb-4">
            {isEnglish 
              ? 'Bridging the gap between ancient wisdom and modern technology, we strive to make classical Chinese literature accessible to everyone through innovative AI-powered tools.'
              : '連接古代智慧與現代科技，我們致力於通過創新的AI工具讓古典中文文學為每個人所接觸。'
            }
          </p>
          <div className="text-base md:text-2xl font-serif text-amber-900">
            傳承文化，創新未來
          </div>
          <div className="text-xs md:text-sm text-amber-700 mt-1 md:mt-2 italic">
            {isEnglish ? 'Preserving Culture, Innovating the Future' : 'Preserving Culture, Innovating the Future'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;