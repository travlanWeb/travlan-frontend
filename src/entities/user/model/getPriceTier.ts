export function getPriceTier(
    totalBudgetWon: number,
    cheapThreshold: number,
    premiumThreshold: number
): '저렴' | '일반' | '프리미엄' {
    const budgetInManwon = totalBudgetWon / 10000
    if (budgetInManwon < cheapThreshold) return '저렴'
    if (budgetInManwon > premiumThreshold) return '프리미엄'
    return '일반'
}