(() => {
  const reader = document.getElementById('mongol-reader');
  const controls = reader.querySelector('.views');
  const buttons = [...controls.querySelectorAll('button')];
  const panels = buttons.map(button => reader.querySelector('#' + button.getAttribute('aria-controls')));
  const status = reader.querySelector('#mongol-view-status');
  const legendButton = reader.querySelector('#mongol-legend-button');
  const expansionMap = reader.querySelector('#mongol-expansion-map');
  let active = 0;

  function select(index) {
    if (active === index) return;
    panels[active].hidden = true;
    panels[active].classList.remove('entering');
    buttons[active].setAttribute('aria-pressed', 'false');
    active = index;
    buttons[active].setAttribute('aria-pressed', 'true');
    panels[active].hidden = false;
    panels[active].classList.add('entering');
    status.textContent = '現在顯示：' + panels[active].querySelector('h5').innerText.replace(/\s+/g, '');
  }

  buttons.forEach((button, index) => button.addEventListener('click', () => select(index)));
  legendButton.addEventListener('click', () => {
    const visible = expansionMap.classList.toggle('legend-visible');
    legendButton.setAttribute('aria-pressed', String(visible));
    status.textContent = visible ? '已框出地圖左下方的年份圖例。' : '已關閉圖例標示。';
  });
  panels.slice(1).forEach(panel => { panel.hidden = true; });
  controls.hidden = false;
  legendButton.hidden = false;

  const viewer = reader.querySelector('#mongol-map-viewer');
  if (typeof viewer.showModal === 'function') {
    const pane = viewer.querySelector('.viewer-pane');
    const largeImage = reader.querySelector('#mongol-viewer-image');
    const viewerTitle = reader.querySelector('#mongol-viewer-title');
    const viewerStatus = reader.querySelector('#mongol-viewer-status');
    const smaller = reader.querySelector('#mongol-viewer-smaller');
    const larger = reader.querySelector('#mongol-viewer-larger');
    const levels = [1, 1.5, 2, 3, 4];
    let level = 0;
    let imageRatio = 1;
    let launcher = null;

    function updateViewer(keepCenter = false) {
      const x = (pane.scrollLeft + pane.clientWidth / 2) / Math.max(pane.scrollWidth, 1);
      const y = (pane.scrollTop + pane.clientHeight / 2) / Math.max(pane.scrollHeight, 1);
      // Use the visible pane's outer dimensions so new scrollbars do not change the fit scale.
      const fit = Math.min(pane.offsetWidth, pane.offsetHeight * imageRatio);
      pane.style.setProperty('--viewer-width', Math.max(1, Math.floor(fit * levels[level])) + 'px');
      if (keepCenter) {
        pane.scrollLeft = pane.scrollWidth * x - pane.clientWidth / 2;
        pane.scrollTop = pane.scrollHeight * y - pane.clientHeight / 2;
      } else {
        pane.scrollTo(0, 0);
      }
      smaller.disabled = level === 0;
      larger.disabled = level === levels.length - 1;
      viewerStatus.textContent = level ? '放大倍率：' + levels[level] + ' 倍' : '圖片大小：適合視窗';
    }

    reader.querySelectorAll('.view .full, .view .map-link').forEach(link => {
      link.classList.add('viewer-launch');
      link.setAttribute('aria-haspopup', 'dialog');
      if (link.classList.contains('full')) {
        if (link.closest('#mongol-time')) link.textContent = '在本頁查看完整時間軸';
        else if (link.closest('#mongol-expansion')) link.textContent = '放大原圖';
        else link.textContent = '在本頁放大';
      }
      link.addEventListener('click', event => {
        event.preventDefault();
        launcher = link;
        const image = link.closest('.sheet').querySelector('img');
        largeImage.alt = image ? image.alt : '蒙古擴張、汗國分支與中國朝代的共用刻度時間軸';
        imageRatio = image ? Number(image.getAttribute('width')) / Number(image.getAttribute('height')) : 1400 / 820;
        largeImage.src = link.href;
        viewerTitle.textContent = link.closest('.sheet').querySelector('.eyebrow').textContent.trim();
        level = 0;
        viewer.showModal();
        updateViewer();
      });
    });
    larger.addEventListener('click', () => { level++; updateViewer(true); if (larger.disabled) smaller.focus(); });
    smaller.addEventListener('click', () => { level--; updateViewer(true); if (smaller.disabled) larger.focus(); });
    reader.querySelector('#mongol-viewer-reset').addEventListener('click', () => { level = 0; updateViewer(); });
    reader.querySelector('#mongol-viewer-close').addEventListener('click', () => viewer.close());
    viewer.addEventListener('close', () => launcher?.focus({ preventScroll: true }));
    window.addEventListener('resize', () => { if (viewer.open) updateViewer(true); });
  }
})();
