import { execSync } from 'child_process'

const client = process.argv[2]
if (!client) {
  console.error('Specifica il cliente: pnpm run build:client client-a')
  process.exit(1)
}

// Build del core se necessario
execSync('pnpm run build:core', { stdio: 'inherit' })

// Build del cliente specifico 
execSync(`pnpm --filter @vue-hr-management-system/${client}-features build`, { stdio: 'inherit' })