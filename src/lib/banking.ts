export interface BankingDetails {
  bank: string
  accountHolder: string
  accountNumber: string
  branchCode: string
  accountType: string
}

// Real CW Electronics account. Branch 198765 is Nedbank's universal branch
// code. Override any field via the VITE_BANK_* env vars without a code change.
export const BANKING_DETAILS: BankingDetails = {
  bank:          import.meta.env.VITE_BANK_NAME           ?? 'Nedbank',
  accountHolder: import.meta.env.VITE_BANK_ACCOUNT_HOLDER ?? 'Swiftop Trading (Pty) Ltd',
  accountNumber: import.meta.env.VITE_BANK_ACCOUNT_NUMBER ?? '1334154554',
  branchCode:    import.meta.env.VITE_BANK_BRANCH_CODE    ?? '198765',
  accountType:   import.meta.env.VITE_BANK_ACCOUNT_TYPE   ?? 'Current',
}
