import { supabase } from '@/lib/supabase'
import { Sale } from '@/types'

/**
 * Calculate real-time remaining balance for a sale
 * Formula: Total Amount - (Initial Payment + Total Installment Payments)
 */
export async function calculateRemainingBalance(saleId: string, totalAmount: number): Promise<number> {
  try {
    // Get initial payment from sales table
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .select('initial_payment')
      .eq('id', saleId)
      .single()

    if (saleError) {
      console.error('Error fetching sale for balance calculation:', saleError)
      return totalAmount // Fallback to total amount if error
    }

    // Get installment payments from payments table
    const { data: payments, error } = await supabase
      .from('payments')
      .select('amount')
      .eq('sale_id', saleId)

    if (error) {
      console.error('Error fetching payments for balance calculation:', error)
      return totalAmount // Fallback to total amount if error
    }

    const initialPayment = saleData.initial_payment || 0
    const installmentPayments = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0
    const totalPaid = initialPayment + installmentPayments
    
    return Math.max(0, totalAmount - totalPaid)
  } catch (error) {
    console.error('Error calculating remaining balance:', error)
    return totalAmount // Fallback to total amount if error
  }
}

/**
 * Calculate real-time remaining balance for multiple sales
 * Formula: Total Amount - (Initial Payment + Total Installment Payments)
 * Returns sales with updated remaining_balance
 */
export async function calculateRemainingBalancesForSales(sales: Sale[]): Promise<Sale[]> {
  if (sales.length === 0) return []

  try {
    // Fetch all installment payments for all sales in one query
    const saleIds = sales.map(sale => sale.id)
    const { data: allPayments, error } = await supabase
      .from('payments')
      .select('sale_id, amount')
      .in('sale_id', saleIds)

    if (error) {
      console.error('Error fetching payments for balance calculation:', error)
      return sales // Return original sales if error
    }

    // Group installment payments by sale_id
    const installmentPaymentsBySale = (allPayments || []).reduce((acc, payment) => {
      if (!acc[payment.sale_id]) {
        acc[payment.sale_id] = 0
      }
      acc[payment.sale_id] += payment.amount
      return acc
    }, {} as Record<string, number>)

    // Calculate real-time remaining balance for each sale
    return sales.map(sale => {
      const initialPayment = sale.initial_payment || 0
      const installmentPayments = installmentPaymentsBySale[sale.id] || 0
      const totalPaid = initialPayment + installmentPayments
      
      return {
        ...sale,
        remaining_balance: Math.max(0, sale.total_amount - totalPaid)
      }
    })
  } catch (error) {
    console.error('Error calculating remaining balances:', error)
    return sales // Return original sales if error
  }
}

/**
 * Synchronously calculate remaining balance using already fetched data
 * Formula: Total Amount - (Initial Payment + Installment Payments)
 */
export function calculateRemainingBalanceSync(
  totalAmount: number, 
  initialPayment: number, 
  installmentPayments: { amount: number }[]
): number {
  const totalInstallmentPayments = installmentPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const totalPaid = initialPayment + totalInstallmentPayments
  return Math.max(0, totalAmount - totalPaid)
}