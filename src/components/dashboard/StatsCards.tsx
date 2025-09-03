import { DashboardStats } from '@/types'
import { formatCurrency } from '@/utils/helpers'
import {
  UsersIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

interface StatsCardsProps {
  stats: DashboardStats
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      name: 'Total Customers',
      value: stats.totalCustomers.toLocaleString(),
      icon: UsersIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: null,
    },
    {
      name: 'Total Sales',
      value: stats.totalSales.toLocaleString(),
      icon: ShoppingCartIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: null,
    },
    {
      name: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: CurrencyDollarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: null,
      subtitle: `Registration: ${formatCurrency(stats.registrationRevenue || 0)} + Payments: ${formatCurrency(stats.paymentsRevenue || 0)}`,
    },
    {
      name: 'Active Sales',
      value: stats.activeSales.toLocaleString(),
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: null,
    },
    {
      name: 'Completed Sales',
      value: stats.completedSales.toLocaleString(),
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: null,
    },
    {
      name: 'Pending Payments',
      value: formatCurrency(stats.pendingPayments),
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: null,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const IconComponent = card.icon
        return (
          <div key={card.name} className="card hover:shadow-medium transition-shadow duration-200">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {card.value}
                    </dd>
                    {card.subtitle && (
                      <dd className="text-xs text-gray-500 mt-1">
                        {card.subtitle}
                      </dd>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
