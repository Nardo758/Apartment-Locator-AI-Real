const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const ENTITY_FIXES = [
  ['\'\'','&apos;'], // single quote -> &apos;
  ['\\"','&quot;']  // escaped double quote -> &quot;
];

const filesToFix = [
  'src/components/GuestCheckoutModal.tsx',
  'src/components/trial/UpgradeModal.tsx',
  'src/pages/About.tsx',
  'src/pages/AuthModern.tsx',
  'src/pages/Billing.tsx',
  'src/pages/DataExport.tsx',
  'src/pages/GenerateOffer.tsx',
  'src/pages/Help.tsx',
  'src/pages/LandingFixed.tsx',
  'src/pages/LandingSSRSafe.tsx',
  'src/pages/MarketIntel.tsx',
  'src/pages/MarketIntelRevamped.tsx',
  'src/pages/NotFound.tsx',
  'src/pages/OffersMade.tsx',
  'src/pages/Pricing.tsx',
  'src/pages/ProgramAI.tsx',
  'src/pages/SavedProperties.tsx'
];

filesToFix.forEach(filePath => {
  const fullPath = join(process.cwd(), filePath);
  let content = readFileSync(fullPath, 'utf-8');

  ENTITY_FIXES.forEach(([find, replace]) => {
    content = content.replace(new RegExp(find, 'g'), replace);
  });

  writeFileSync(fullPath, content, 'utf-8');
  console.log(`✅ Fixed entities in ${filePath}`);
});
