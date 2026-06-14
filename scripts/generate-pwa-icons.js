const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configurações
const inputImage = path.join(process.cwd(), 'public', 'pecuariatech.png');
const outputDir = path.join(process.cwd(), 'public', 'icons');

// Tamanhos padrão para PWA (incluindo maskable)
const sizes = [
    { size: 72, purpose: 'any' },
    { size: 96, purpose: 'any' },
    { size: 128, purpose: 'any' },
    { size: 144, purpose: 'any' },
    { size: 152, purpose: 'any' },
    { size: 192, purpose: 'any' },
    { size: 384, purpose: 'any' },
    { size: 512, purpose: 'any' },
    { size: 192, purpose: 'maskable', padding: 0.2 }, // com 20% de padding
    { size: 512, purpose: 'maskable', padding: 0.2 }
];

// Cria diretório de saída
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Verifica imagem de entrada
if (!fs.existsSync(inputImage)) {
    console.error('❌ Imagem não encontrada:', inputImage);
    process.exit(1);
}

console.log('🔧 Gerando ícones PWA...');

async function generateIcons() {
    for (const item of sizes) {
        const outputFile = path.join(outputDir, `icon-${item.size}-${item.purpose}.png`);
        let image = sharp(inputImage);
        
        // Redimensiona mantendo proporção e preenchendo o quadrado
        if (item.purpose === 'maskable') {
            // Aplica padding (área segura) – 20% de espaço vazio ao redor
            const padding = item.padding || 0.2;
            const finalSize = item.size;
            const contentSize = Math.round(finalSize * (1 - padding * 2));
            const offset = Math.round((finalSize - contentSize) / 2);
            
            image = image
                .resize(contentSize, contentSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .extend({
                    top: offset,
                    bottom: offset,
                    left: offset,
                    right: offset,
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                });
        } else {
            image = image.resize(item.size, item.size, { fit: 'cover' });
        }
        
        await image.toFile(outputFile);
        console.log(`✅ Gerado: ${path.basename(outputFile)}`);
    }
    console.log('🎉 Todos os ícones gerados com sucesso!');
}

generateIcons().catch(err => console.error('Erro:', err));
