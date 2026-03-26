export type TransactionVisual = {
  icon: string
  wrapperClass: string
  badgeClass?: string
}

export const DEFAULT_INCOME_VISUAL: TransactionVisual = {
  icon: 'heroicons:banknotes-20-solid',
  wrapperClass: 'bg-[#DCFCE7] text-[#16A34A]',
  badgeClass: 'bg-[#DCFCE7] text-[#16A34A]'
}

export const DEFAULT_EXPENSE_VISUAL: TransactionVisual = {
  icon: 'heroicons:credit-card-20-solid',
  wrapperClass: 'bg-[#FEE2E2] text-[#EF4444]',
  badgeClass: 'bg-[#FEE2E2] text-[#EF4444]'
}

export const CATEGORY_VISUAL_MAP: Record<string, TransactionVisual> = {
  Gaji: {
    icon: 'heroicons:building-library-20-solid',
    wrapperClass: 'bg-[#DCFCE7] text-[#16A34A]',
    badgeClass: 'bg-[#DCFCE7] text-[#16A34A]'
  },
  Bonus: {
    icon: 'heroicons:gift-20-solid',
    wrapperClass: 'bg-[#DCFCE7] text-[#16A34A]',
    badgeClass: 'bg-[#DCFCE7] text-[#16A34A]'
  },
  Freelance: {
    icon: 'heroicons:briefcase-20-solid',
    wrapperClass: 'bg-[#DCFCE7] text-[#16A34A]',
    badgeClass: 'bg-[#DCFCE7] text-[#16A34A]'
  },
  Penjualan: {
    icon: 'heroicons:shopping-cart-20-solid',
    wrapperClass: 'bg-[#DCFCE7] text-[#16A34A]',
    badgeClass: 'bg-[#DCFCE7] text-[#16A34A]'
  },
  Investasi: {
    icon: 'heroicons:chart-bar-20-solid',
    wrapperClass: 'bg-[#DCFCE7] text-[#16A34A]',
    badgeClass: 'bg-[#DCFCE7] text-[#16A34A]'
  },
  Makan: {
    icon: 'lucide:utensils-crossed',
    wrapperClass: 'bg-[#DBEAFE] text-[#2563EB]',
    badgeClass: 'bg-[#DBEAFE] text-[#2563EB]'
  },
  Transportasi: {
    icon: 'heroicons:truck-20-solid',
    wrapperClass: 'bg-[#FFEDD5] text-[#F97316]',
    badgeClass: 'bg-[#FFEDD5] text-[#F97316]'
  },
  Tagihan: {
    icon: 'heroicons:home-20-solid',
    wrapperClass: 'bg-[#FEF3C7] text-[#D97706]',
    badgeClass: 'bg-[#FEF3C7] text-[#D97706]'
  },
  Internet: {
    icon: 'heroicons:wifi-20-solid',
    wrapperClass: 'bg-[#E0F2FE] text-[#0284C7]',
    badgeClass: 'bg-[#E0F2FE] text-[#0284C7]'
  },
  Belanja: {
    icon: 'heroicons:shopping-bag-20-solid',
    wrapperClass: 'bg-[#F3E8FF] text-[#9333EA]',
    badgeClass: 'bg-[#F3E8FF] text-[#9333EA]'
  },
  Hiburan: {
    icon: 'heroicons:film-20-solid',
    wrapperClass: 'bg-[#FCE7F3] text-[#DB2777]',
    badgeClass: 'bg-[#FCE7F3] text-[#DB2777]'
  }
}
