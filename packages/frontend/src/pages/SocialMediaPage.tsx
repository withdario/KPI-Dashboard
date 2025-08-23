import DashboardLayout from '@/components/DashboardLayout';
import DashboardGrid from '@/components/DashboardGrid';
import DashboardWidget from '@/components/DashboardWidget';
import { Share2, Users, Heart, MessageCircle, Eye, TrendingUp, DollarSign, Target, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

const SocialMediaPage = () => {
  const socialPlatforms = [
    { name: 'Facebook', icon: Facebook, followers: '12.5K', growth: '+8.2%', engagement: '4.8%' },
    { name: 'Instagram', icon: Instagram, followers: '8.9K', growth: '+12.1%', engagement: '6.2%' },
    { name: 'Twitter', icon: Twitter, followers: '5.2K', growth: '+3.4%', engagement: '2.9%' },
    { name: 'LinkedIn', icon: Linkedin, followers: '3.1K', growth: '+15.7%', engagement: '8.1%' }
  ];

  const adCampaigns = [
    { name: 'Q4 Brand Awareness', platform: 'Facebook', spend: '$2,450', impressions: '125K', clicks: '3.2K', ctr: '2.56%', cpc: '$0.77' },
    { name: 'Product Launch', platform: 'Instagram', spend: '$1,890', impressions: '89K', clicks: '2.8K', ctr: '3.15%', cpc: '$0.68' },
    { name: 'Lead Generation', platform: 'LinkedIn', spend: '$3,200', impressions: '45K', clicks: '1.2K', ctr: '2.67%', cpc: '$2.67' },
    { name: 'Retargeting', platform: 'Facebook', spend: '$1,650', impressions: '67K', clicks: '1.8K', ctr: '2.69%', cpc: '$0.92' }
  ];

  const recentPosts = [
    { platform: 'Instagram', content: 'New product showcase with behind-the-scenes', likes: 234, comments: 18, shares: 12, reach: '8.2K' },
    { platform: 'Facebook', content: 'Customer success story featuring our solution', likes: 156, comments: 23, shares: 8, reach: '12.1K' },
    { platform: 'LinkedIn', content: 'Industry insights and thought leadership', likes: 89, comments: 15, shares: 34, reach: '5.7K' },
    { platform: 'Twitter', content: 'Quick tips for business optimization', likes: 67, comments: 12, shares: 19, reach: '3.2K' }
  ];

  return (
    <DashboardLayout
      title="Social Media Dashboard"
      subtitle="Track social media performance, engagement metrics, and advertisement ROI"
    >
      <DashboardGrid cols={12} gap="lg">
        {/* Social Media Overview */}
        <DashboardGrid.Item colSpan={12}>
          <DashboardWidget
            title="Social Media Overview"
            subtitle="Key metrics across all platforms"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-blue-600 mb-2">
                  <Users className="h-8 w-8 mx-auto" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">29.7K</div>
                <div className="text-sm text-gray-600 mb-1">Total Followers</div>
                <div className="text-xs text-green-600">+9.8% this month</div>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-pink-600 mb-2">
                  <Heart className="h-8 w-8 mx-auto" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">546</div>
                <div className="text-sm text-gray-600 mb-1">Total Likes</div>
                <div className="text-xs text-green-600">+12.3% this week</div>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-green-600 mb-2">
                  <MessageCircle className="h-8 w-8 mx-auto" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">68</div>
                <div className="text-sm text-gray-600 mb-1">Total Comments</div>
                <div className="text-xs text-green-600">+8.7% this week</div>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-purple-600 mb-2">
                  <Eye className="h-8 w-8 mx-auto" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">29.2K</div>
                <div className="text-sm text-gray-600 mb-1">Total Reach</div>
                <div className="text-xs text-green-600">+15.2% this month</div>
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Platform Performance */}
        <DashboardGrid.Item colSpan={8}>
          <DashboardWidget
            title="Platform Performance"
            subtitle="Detailed metrics by social media platform"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Followers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Growth
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Engagement
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {socialPlatforms.map((platform, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                              <platform.icon className="h-4 w-4 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {platform.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {platform.followers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {platform.growth}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {platform.engagement}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Engagement Trends */}
        <DashboardGrid.Item colSpan={4}>
          <DashboardWidget
            title="Engagement Trends"
            subtitle="Weekly engagement performance"
          >
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 mb-2">
                  <TrendingUp className="h-10 w-10 mx-auto" />
                </div>
                <p className="text-gray-500">Engagement trends chart</p>
                <p className="text-sm text-gray-400">Chart component will be implemented</p>
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Advertisement Performance */}
        <DashboardGrid.Item colSpan={12}>
          <DashboardWidget
            title="Advertisement Performance"
            subtitle="Paid advertising campaigns and ROI metrics"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Spend
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Impressions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CTR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CPC
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {adCampaigns.map((campaign, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {campaign.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded bg-gray-100 flex items-center justify-center mr-2">
                            <Target className="h-3 w-3 text-gray-600" />
                          </div>
                          {campaign.platform}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.spend}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.impressions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.clicks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.ctr}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {campaign.cpc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Recent Posts Performance */}
        <DashboardGrid.Item colSpan={8}>
          <DashboardWidget
            title="Recent Posts Performance"
            subtitle="Latest social media posts and engagement metrics"
          >
            <div className="space-y-4">
              {recentPosts.map((post, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Share2 className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{post.platform}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{post.reach} reach</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{post.content}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Share2 className="h-4 w-4" />
                      <span>{post.shares}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>

        {/* Ad Spend Overview */}
        <DashboardGrid.Item colSpan={4}>
          <DashboardWidget
            title="Ad Spend Overview"
            subtitle="Total advertising investment and performance"
          >
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-blue-600 mb-2">
                  <DollarSign className="h-8 w-8 mx-auto" />
                </div>
                <div className="text-2xl font-bold text-blue-900 mb-1">$9,190</div>
                <div className="text-sm text-blue-700">Total Ad Spend</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-green-600 mb-2">
                  <TrendingUp className="h-8 w-8 mx-auto" />
                </div>
                <div className="text-2xl font-bold text-green-900 mb-1">326K</div>
                <div className="text-sm text-green-700">Total Impressions</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-purple-600 mb-2">
                  <Target className="h-8 w-8 mx-auto" />
                </div>
                <div className="text-2xl font-bold text-purple-900 mb-1">9.0K</div>
                <div className="text-sm text-purple-700">Total Clicks</div>
              </div>
            </div>
          </DashboardWidget>
        </DashboardGrid.Item>
      </DashboardGrid>
    </DashboardLayout>
  );
};

export default SocialMediaPage;
