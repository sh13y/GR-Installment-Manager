import { supabase } from '@/lib/supabase'
import { Sale } from '@/types'

/**
 * Calculate real-time remaining balance for a sale
 * Formula: Total Amount - Total Payments from payments table
 */
export async function calculateRemainingBalance(saleId: string, totalAmount: number): Promise<number> {
  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('amount')
      .eq('sale_id', saleId)

    if (error) {
      console.error('Error fetching payments for balance calculation:', error)
      return totalAmount // Fallback to total amount if error
    }

    const totalPayments = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0
    return Math.max(0, totalAmount - totalPayments)
  } catch (error) {
    console.error('Error calculating remaining balance:', error)
    return totalAmount // Fallback to total amount if error
  }
}

/**
 * Calculate real-time remaining balance for multiple sales
 * Returns sales with updated remaining_balance
 */
export async function calculateRemainingBalancesForSales(sales: Sale[]): Promise<Sale[]> {
  if (sales.length === 0) return []

  try {
    // Fetch all payments for all sales in one query
    const saleIds = sales.map(sale => sale.id)
    const { data: allPayments, error } = await supabase
      .from('payments')
      .select('sale_id, amount')
      .in('sale_id', saleIds)

    if (error) {
      console.error('Error fetching payments for balance calculation:', error)
      return sales // Return original sales if error
    }

    // Group payments by sale_id
    const paymentsBySale = (allPayments || []).reduce((acc, payment) => {
      if (!acc[payment.sale_id]) {
        acc[payment.sale_id] = 0
      }
      acc[payment.sale_id] += payment.amount
      return acc
    }, {} as Record<string, number>)

    // Calculate real-time remaining balance for each sale
    return sales.map(sale => ({
      ...sale,
      remaining_balance: Math.max(0, sale.total_amount - (paymentsBySale[sale.id] || 0))
    }))
  } catch (error) {
    console.error('Error calculating remaining balances:', error)
    return sales // Return original sales if error
  }
}

/**
 * Synchronously calculate remaining balance using already fetched payments
 */
export function calculateRemainingBalanceSync(totalAmount: number, payments: { amount: number }[]): number {
  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0)
  return Math.max(0, totalAmount - totalPayments)
}