// Script d'extraction BookPreview/FlipPDFPlusPro vers PDF
// À exécuter dans la console du navigateur

(async function() {
    console.log('Starting extraction...');
    
    const baseUrl = 'https://magazine.psynapse.fr/m32/files/page/';
    const maxTotalPages = 200;
    const delayBetweenDownloads = 500;
    
    async function downloadImage(pageNum) {
        try {
            const url = `${baseUrl}${pageNum}.jpg?2025-10-06165714`;
            const response = await fetch(url);
            if (!response.ok) {
                console.log(`❌ Page ${pageNum} not found (status: ${response.status})`);
                return null;
            }
            const blob = await response.blob();
            return await createImageBitmap(blob);
        } catch (error) {
            console.error(`❌ Error downloading page ${pageNum}:`, error);
            return null;
        }
    }
    
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    console.log('Page count detection...');
    let maxPage = 1;
    for (let i = 1; i <= maxTotalPages; i++) {
        const url = `${baseUrl}${i}.jpg?2025-10-06165714`;
        try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                maxPage = i;
            } else {
                break;
            }
        } catch {
            break;
        }
        if (i % 10 === 0) console.log(`   Checked up to page ${i}...`);
        await wait(50);
    }
    
    console.log(`Total pages detected: ${maxPage}`);
    
    console.log('Downloading images...');
    const images = [];
    
    for (let i = 1; i <= maxPage; i++) {
        console.log(`   Downloading page ${i}/${maxPage}...`);
        const img = await downloadImage(i);
        if (img) {
            images.push(img);
        }
        await wait(delayBetweenDownloads);
    }
    
    console.log(`Images downloaded: ${images.length}`);
    
    console.log('Loading jsPDF library...');
    if (!window.jspdf) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        document.head.appendChild(script);
        await new Promise(resolve => script.onload = resolve);
    }
    
    const { jsPDF } = window.jspdf;
    
    console.log('Creating PDF...');
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [images[0].width, images[0].height]
    });
    
    for (let i = 0; i < images.length; i++) {
        console.log(`   Adding page ${i + 1}/${images.length} to PDF...`);
        
        const canvas = document.createElement('canvas');
        canvas.width = images[i].width;
        canvas.height = images[i].height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(images[i], 0, 0);
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        if (i > 0) {
            pdf.addPage([images[i].width, images[i].height]);
        }
        
        pdf.addImage(imgData, 'JPEG', 0, 0, images[i].width, images[i].height);
    }
    
    const filename = `magazine_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
    
    console.log(`✅ PDF created and saved as ${filename}`);
})();
