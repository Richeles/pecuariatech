const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(process.cwd(), 'public', 'logo-base.png');
const outputDir = path.join(process.cwd(), 'public', 'icons');

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
if (!fs.existsSync(inputPath)) {
    console.error('❌ Arquivo não encontrado: public/logo-base.png');
    process.exit(1);
}

const sizes = [192, 512];

Promise.all(sizes.map(size =>
    sharp(inputPath)
        .resize(size, size)
        .toFile(path.join(outputDir, `icon-${size}.png`))
)).then(() => console.log('✅ Ícones PWA gerados com sucesso!'));
