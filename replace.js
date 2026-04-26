const fs = require('fs');
const path = require('path');
const dir = 'app/components/landing';
const targetString = 'import { useBrandTheme } from "@/components/providers/brand-theme-provider";';
const replacementString = 'const useBrandTheme = () => ({ currentTheme: { color: "#c084fc", label: "Varuna", name: "Varuna", description: "Vigil AI", id: "varuna", tailwindColor: "purple-400" } });';

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(targetString)) {
      content = content.replace(targetString, replacementString);
      fs.writeFileSync(filePath, content);
      console.log('Updated ' + file);
    }
  }
});
