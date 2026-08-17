(() => {
    const $ = id => document.getElementById(id);

    // Theme toggle
    const themeToggle = $('themeToggle');
    const savedTheme = localStorage.getItem('imagecompress-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('imagecompress-theme', next);
    });

    // Back to top
    const backToTop = $('backToTop');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const dropzone = $('dropzone');
    const fileInput = $('fileInput');
    const folderInput = $('folderInput');
    const pickFilesBtn = $('pickFilesBtn');
    const pickFolderBtn = $('pickFolderBtn');
    const selectedFilesEl = $('selectedFiles');
    const uploadSection = $('uploadSection');
    const settingsSection = $('settingsSection');
    const progressSection = $('progressSection');
    const resultsSection = $('resultsSection');
    const startBtn = $('startBtn');
    const downloadBtn = $('downloadBtn');
    const resetBtn = $('resetBtn');
    const progressBar = $('progressBar');
    const progressText = $('progressText');
    const resultsBody = $('resultsBody');
    const batchSummary = $('batchSummary');
    const customTarget = $('customTarget');
    const customSize = $('customSize');
    const customUnit = $('customUnit');

    let files = [];
    let fileRelativePaths = {};
    let sourceFolderName = '';
    let targetBytes = 512000;
    let zipBlob = null;

    pickFilesBtn.addEventListener('click', e => { e.stopPropagation(); fileInput.click(); });
    pickFolderBtn.addEventListener('click', e => { e.stopPropagation(); folderInput.click(); });

    dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', e => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', () => handleFiles(fileInput.files));
    folderInput.addEventListener('change', () => handleFolderFiles(folderInput.files));

    function handleFiles(fileList) {
        files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
        if (!files.length) return;
        fileRelativePaths = {};
        sourceFolderName = 'Foto';
        files.forEach(f => { fileRelativePaths[f.name] = f.name; });
        showSelectedCount();
    }

    function handleFolderFiles(fileList) {
        const allFiles = Array.from(fileList).filter(f => f.type.startsWith('image/'));
        if (!allFiles.length) return;
        files = allFiles;
        fileRelativePaths = {};
        sourceFolderName = 'Foto';
        allFiles.forEach(f => {
            const relPath = f.webkitRelativePath || f.name;
            fileRelativePaths[f.name] = relPath;
            const parts = relPath.split('/');
            if (parts.length > 1) sourceFolderName = parts[0];
        });
        showSelectedCount();
    }

    function showSelectedCount() {
        const info = sourceFolderName !== 'Foto' ? ` dari folder "${sourceFolderName}"` : '';
        selectedFilesEl.innerHTML = `
            <div class="file-info-inner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span><strong>${files.length} foto</strong> dipilih${info}</span>
            </div>`;
        uploadSection.classList.add('hidden');
        settingsSection.classList.remove('hidden');
        settingsSection.classList.add('fade-in');
    }

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const val = btn.dataset.size;
            if (val === 'custom') {
                customTarget.classList.remove('hidden');
                updateCustomTarget();
            } else {
                customTarget.classList.add('hidden');
                targetBytes = parseInt(val);
            }
        });
    });

    customSize.addEventListener('input', updateCustomTarget);
    customUnit.addEventListener('change', updateCustomTarget);

    function updateCustomTarget() {
        const size = parseInt(customSize.value) || 500;
        targetBytes = customUnit.value === 'MB' ? size * 1048576 : size * 1024;
    }

    startBtn.addEventListener('click', startCompression);

    async function startCompression() {
        if (!files.length) return;
        settingsSection.classList.add('hidden');
        progressSection.classList.remove('hidden');
        progressSection.classList.add('fade-in');
        resultsSection.classList.add('hidden');
        startBtn.disabled = true;

        const results = [];
        let totalOriginal = 0;
        let totalCompressed = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            progressText.textContent = `${i + 1} / ${files.length} foto`;
            progressBar.style.width = `${((i + 1) / files.length) * 100}%`;

            try {
                const result = await compressImage(file, targetBytes);
                totalOriginal += file.size;
                totalCompressed += result.size;
                results.push({
                    name: file.name,
                    relPath: fileRelativePaths[file.name] || file.name,
                    originalSize: file.size,
                    compressedSize: result.size,
                    blob: result.blob,
                    status: result.status
                });
            } catch {
                totalOriginal += file.size;
                results.push({
                    name: file.name,
                    relPath: fileRelativePaths[file.name] || file.name,
                    originalSize: file.size,
                    compressedSize: file.size,
                    blob: null,
                    status: 'Gagal'
                });
            }
        }

        showResults(results, totalOriginal, totalCompressed);
        startBtn.disabled = false;
    }

    function compressImage(file, target) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(url);

                if (file.size <= target) {
                    file.arrayBuffer().then(buf => {
                        resolve({ blob: new Blob([buf], { type: file.type }), size: file.size, status: 'Sudah sesuai' });
                    });
                    return;
                }

                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                canvas.getContext('2d').drawImage(img, 0, 0);

                if (file.type === 'image/png') {
                    canvas.toBlob(blob => {
                        resolve({ blob, size: blob.size, status: blob.size <= target ? 'Selesai' : 'Selesai (melebihi target)' });
                    }, 'image/png');
                    return;
                }

                let low = 1, high = 100, bestQ = -1, bestBlob = null;

                while (low <= high) {
                    const mid = Math.floor((low + high) / 2);
                    const blob = canvasToBlob(canvas, 'image/jpeg', mid / 100);
                    if (blob.size <= target) {
                        if (mid > bestQ) { bestQ = mid; bestBlob = blob; }
                        low = mid + 1;
                    } else {
                        high = mid - 1;
                    }
                }

                if (!bestBlob) {
                    bestBlob = canvasToBlob(canvas, 'image/jpeg', 0.05);
                    resolve({ blob: bestBlob, size: bestBlob.size, status: 'Selesai (melebihi target)' });
                } else {
                    resolve({ blob: bestBlob, size: bestBlob.size, status: 'Selesai' });
                }
            };

            img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Gagal')); };
            img.src = url;
        });
    }

    function canvasToBlob(canvas, type, quality) {
        const dataURL = canvas.toDataURL(type, quality);
        const bin = atob(dataURL.split(',')[1]);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        return new Blob([arr], { type });
    }

    downloadBtn.addEventListener('click', () => {
        if (!zipBlob && previewResults.length !== 1) return;
        // Single file: download directly without ZIP
        if (previewResults.length === 1) {
            const r = previewResults[0];
            saveAs(r.compressedBlob, r.name);
        } else {
            saveAs(zipBlob, 'ImageCompress_HaryantoLabs.zip');
        }
    });

    resetBtn.addEventListener('click', () => {
        files = []; fileRelativePaths = {}; sourceFolderName = '';
        fileInput.value = ''; folderInput.value = '';
        selectedFilesEl.innerHTML = '';
        uploadSection.classList.remove('hidden');
        settingsSection.classList.add('hidden');
        progressSection.classList.add('hidden');
        resultsSection.classList.add('hidden');
        progressBar.style.width = '0%';
        previewResults = [];
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ---- Preview Modal ----
    let previewResults = [];
    let previewIndex = 0;

    const previewModal = $('previewModal');
    const modalClose = $('modalClose');
    const prevImageBtn = $('prevImage');
    const nextImageBtn = $('nextImage');
    const modalCounter = $('modalCounter');
    const previewFileName = $('previewFileName');
    const previewBefore = $('previewBefore');
    const previewAfter = $('previewAfter');
    const previewSaving = $('previewSaving');
    const imgBefore = $('imgBefore');
    const imgAfter = $('imgAfter');
    const compareContainer = $('compareContainer');
    const compareBeforeEl = $('compareBefore');
    const compareSlider = $('compareSlider');

    function openPreview(index) {
        if (!previewResults.length) return;
        previewIndex = index;
        renderPreview();
        previewModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closePreview() {
        previewModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function renderPreview() {
        const r = previewResults[previewIndex];
        if (!r) return;

        previewFileName.textContent = r.name;
        previewBefore.textContent = fmt(r.originalSize);
        previewAfter.textContent = fmt(r.compressedSize);
        const saving = r.originalSize - r.compressedSize;
        const pct = r.originalSize > 0 ? Math.round((saving / r.originalSize) * 100) : 0;
        previewSaving.textContent = `-${pct}%`;
        modalCounter.textContent = `${previewIndex + 1} / ${previewResults.length}`;

        // Create object URLs
        if (imgBefore.src) URL.revokeObjectURL(imgBefore.src);
        if (imgAfter.src) URL.revokeObjectURL(imgAfter.src);

        imgBefore.src = URL.createObjectURL(r.originalBlob);
        imgAfter.src = URL.createObjectURL(r.compressedBlob);

        // Reset slider
        setSliderPos(50);
    }

    function setSliderPos(pct) {
        compareBeforeEl.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
        compareSlider.style.left = `${pct}%`;
    }

    // Slider drag
    let isDragging = false;

    function getSliderPct(e) {
        const rect = compareContainer.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let pct = ((clientX - rect.left) / rect.width) * 100;
        return Math.max(2, Math.min(98, pct));
    }

    compareContainer.addEventListener('mousedown', e => { isDragging = true; setSliderPos(getSliderPct(e)); });
    compareContainer.addEventListener('touchstart', e => { isDragging = true; setSliderPos(getSliderPct(e)); }, { passive: true });
    window.addEventListener('mousemove', e => { if (isDragging) setSliderPos(getSliderPct(e)); });
    window.addEventListener('touchmove', e => { if (isDragging) setSliderPos(getSliderPct(e)); }, { passive: true });
    window.addEventListener('mouseup', () => isDragging = false);
    window.addEventListener('touchend', () => isDragging = false);

    // Navigation
    prevImageBtn.addEventListener('click', () => {
        if (previewIndex > 0) { previewIndex--; renderPreview(); }
    });
    nextImageBtn.addEventListener('click', () => {
        if (previewIndex < previewResults.length - 1) { previewIndex++; renderPreview(); }
    });

    modalClose.addEventListener('click', closePreview);
    previewModal.addEventListener('click', e => { if (e.target === previewModal) closePreview(); });

    document.addEventListener('keydown', e => {
        if (!previewModal.classList.contains('active')) return;
        if (e.key === 'Escape') closePreview();
        if (e.key === 'ArrowLeft' && previewIndex > 0) { previewIndex--; renderPreview(); }
        if (e.key === 'ArrowRight' && previewIndex < previewResults.length - 1) { previewIndex++; renderPreview(); }
    });

    // Store results + add click handlers
    function showResults(results, totalOriginal, totalCompressed) {
        const resultsList = $('resultsList');
        previewResults = results.filter(r => r.blob).map(r => ({
            name: r.name,
            originalSize: r.originalSize,
            compressedSize: r.compressedSize,
            originalBlob: files.find(f => f.name === r.name),
            compressedBlob: r.blob
        }));

        progressSection.classList.add('hidden');
        resultsSection.classList.remove('hidden');
        resultsSection.classList.add('fade-in');
        resultsList.innerHTML = '';

        results.forEach((r, idx) => {
            const saving = r.originalSize - r.compressedSize;
            const pct = r.originalSize > 0 ? Math.round((saving / r.originalSize) * 100) : 0;
            const cls = r.status === 'Gagal' ? 'status-fail' : r.status === 'Sudah sesuai' ? 'status-skip' : 'status-ok';
            const card = document.createElement('div');
            card.className = 'result-card';
            card.innerHTML = `
                <span class="result-name">${esc(r.name)}</span>
                <span class="result-status"><span class="badge ${cls}">${r.status}</span></span>
                <div class="result-meta">
                    <span class="size-original">${fmt(r.originalSize)}</span>
                    <span class="arrow">&rarr;</span>
                    <span class="size-result">${fmt(r.compressedSize)}</span>
                    <span class="target">(${fmt(targetBytes)})</span>
                    ${r.status !== 'Gagal' ? `<span class="saving">-${pct}%</span>` : ''}
                </div>`;
            if (r.blob) {
                card.addEventListener('click', () => {
                    const previewIdx = previewResults.findIndex(p => p.name === r.name);
                    if (previewIdx >= 0) openPreview(previewIdx);
                });
            }
            resultsList.appendChild(card);
        });

        const saved = totalOriginal - totalCompressed;
        const pctAll = totalOriginal > 0 ? Math.round((saved / totalOriginal) * 100) : 0;
        batchSummary.innerHTML = `
            <div class="summary-item">
                <span class="summary-label">Ukuran Awal</span>
                <span class="summary-value">${fmt(totalOriginal)}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Ukuran Hasil</span>
                <span class="summary-value accent">${fmt(totalCompressed)}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Penghematan</span>
                <span class="summary-value success">${fmt(saved)}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Persentase</span>
                <span class="summary-value success">${pctAll}%</span>
            </div>`;

        zipBlob = null;
        const zip = new JSZip();
        const validResults = results.filter(r => r.blob);
        const folderName = sourceFolderName + '_Compressed';

        validResults.forEach(r => {
            const parts = r.relPath.split('/');
            if (parts.length > 1) { parts[0] = folderName; } else { parts.unshift(folderName); }
            zip.file(parts.join('/'), r.blob);
        });

        // Update download button text
        if (validResults.length === 1) {
            downloadBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Unduh File`;
        } else {
            downloadBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download ZIP`;
        }

        zip.generateAsync({ type: 'blob' }).then(blob => { zipBlob = blob; });
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    function fmt(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(2) + ' MB';
    }

    function esc(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }
})();
