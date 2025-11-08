import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filesToUpdate = [
  'src/pages/Transactions.jsx',
  'src/pages/Suppliers.jsx',
  'src/pages/Settings.jsx',
  'src/pages/Register.jsx',
  'src/pages/ProactiveAlerts.jsx',
  'src/pages/Login.jsx',
  'src/pages/Invoices.jsx',
  'src/pages/Insights.jsx',
  'src/pages/ElevenLabs.jsx',
  'src/pages/DataEntryDashboard.jsx',
  'src/pages/Credit.jsx',
  'src/pages/Clients.jsx',
  'src/pages/CashFlow.jsx',
  'src/pages/AdminDashboard.jsx',
  'src/components/RoleBasedRedirect.jsx'
];

filesToUpdate.forEach(filePath => {
  const fullPath = join(__dirname, filePath);
  
  if (existsSync(fullPath)) {
    let content = readFileSync(fullPath, 'utf8');
    const updatedContent = content.replace(
      /import\s*\{\s*base44\s*}\s*from\s*['"]@\/api\/base44Client['"]/g,
      'import base44 from "@/api/base44Client"'
    );
    
    if (content !== updatedContent) {
      writeFileSync(fullPath, updatedContent, 'utf8');
      console.log(`Updated: ${filePath}`);
    } else {
      console.log(`No changes needed: ${filePath}`);
    }
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log('Import updates completed!');
