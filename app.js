'use strict';

// ─── Google Ads 전환 추적 ───────────────────────────────
const GOOGLE_ADS_CONVERSION = {
  // TODO: Google Ads 계정(651-167-5293)에서 전환 태그 발급 후 아래 값 교체
  sendTo: 'AW-CONVERSION_ID/CONVERSION_LABEL'
};

function fireConversion() {
  if (typeof gtag === 'function') {
    gtag('event', 'conversion', { 'send_to': GOOGLE_ADS_CONVERSION.sendTo });
  }
}

// ─── 파일 선택 표시 ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('fileAttachment');
  const fileName  = document.getElementById('fileName');
  if (fileInput && fileName) {
    fileInput.addEventListener('change', () => {
      const f = fileInput.files[0];
      if (f) {
        if (f.size > 10 * 1024 * 1024) {
          showToast('파일 크기는 10MB 이하만 가능합니다.', 'error');
          fileInput.value = '';
          fileName.textContent = '선택된 파일 없음 (최대 10MB)';
          return;
        }
        fileName.textContent = f.name;
      } else {
        fileName.textContent = '선택된 파일 없음 (최대 10MB)';
      }
    });

    // 파일 업로드 박스 클릭 시 파일 선택
    const wrapper = document.querySelector('.file-upload-wrapper');
    if (wrapper) {
      wrapper.addEventListener('click', () => fileInput.click());
    }
  }
});

// ─── 서비스 선택 → 폼 스크롤 ──────────────────────────
function selectService(serviceName) {
  const select = document.getElementById('serviceSelect');
  if (select) {
    select.value = serviceName;
  }
  const formSection = document.getElementById('quote-form');
  if (formSection) {
    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ─── 견적 폼 제출 ──────────────────────────────────────
function handleQuoteSubmit(event) {
  event.preventDefault();

  const companyName    = document.getElementById('companyName').value.trim();
  const contactPerson  = document.getElementById('contactPerson').value.trim();
  const contactPhone   = document.getElementById('contactPhone').value.trim();
  const contactEmail   = document.getElementById('contactEmail').value.trim();
  const serviceSelect  = document.getElementById('serviceSelect').value;
  const specsInput     = document.getElementById('specsInput').value.trim();
  const fileAttachment = document.getElementById('fileAttachment');

  if (!companyName || !contactPerson || !contactPhone || !contactEmail || !serviceSelect) {
    showToast('필수 항목을 모두 입력해 주세요.', 'error');
    return;
  }

  const phoneRegex = /^[\d\-+\s()]{8,20}$/;
  if (!phoneRegex.test(contactPhone)) {
    showToast('올바른 연락처 형식을 입력해 주세요.', 'error');
    return;
  }

  const submitBtn = event.target.querySelector('button[type="submit"]');
  const loading   = document.getElementById('loadingOverlay');

  submitBtn.disabled = true;
  submitBtn.textContent = '전송 중...';
  if (loading) loading.classList.add('active');

  // FormData 구성
  const formData = new FormData();
  formData.append('회사명_현장명', companyName);
  formData.append('담당자명', contactPerson);
  formData.append('연락처', contactPhone);
  formData.append('이메일', contactEmail);
  formData.append('가공_서비스', serviceSelect);
  formData.append('희망_규격_수량', specsInput || '(미입력)');
  formData.append('_subject', `[대흥정밀 견적문의] ${serviceSelect} - ${companyName}`);
  formData.append('_captcha', 'false');
  formData.append('_template', 'table');

  if (fileAttachment && fileAttachment.files[0]) {
    formData.append('attachment', fileAttachment.files[0]);
  }

  fetch('https://formsubmit.co/ajax/daeheungsteel@naver.com', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (loading) loading.classList.remove('active');
    if (response.ok) {
      fireConversion();
      showToast('견적 문의가 성공적으로 접수되었습니다!\n빠른 시간 내에 연락드리겠습니다.', 'success');
      event.target.reset();
      document.getElementById('fileName').textContent = '선택된 파일 없음 (최대 10MB)';
    } else {
      throw new Error('서버 응답 오류');
    }
  })
  .catch(error => {
    if (loading) loading.classList.remove('active');
    console.error('Submit error:', error);

    // Fallback: mailto
    fireConversion();
    const subject = encodeURIComponent(`[대흥정밀 견적문의] ${serviceSelect} - ${companyName}`);
    const body = encodeURIComponent(
      `회사명/현장명: ${companyName}\n담당자: ${contactPerson}\n연락처: ${contactPhone}\n이메일: ${contactEmail}\n가공 서비스: ${serviceSelect}\n규격/수량: ${specsInput || '미입력'}`
    );
    window.location.href = `mailto:daeheungsteel@naver.com?subject=${subject}&body=${body}`;
    showToast('직접 메일을 통해 견적을 보내드리겠습니다.', 'error');
  })
  .finally(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = '견적 문의 전송하기';
  });
}

// ─── 토스트 알림 ───────────────────────────────────────
function showToast(message, type = 'success') {
  let toast = document.getElementById('toastMsg');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastMsg';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast ${type}`;
  setTimeout(() => toast.classList.add('show'), 50);
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// ─── 헤더 스크롤 효과 ──────────────────────────────────
window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  if (header) {
    header.style.boxShadow = window.scrollY > 10
      ? '0 2px 20px rgba(0,0,0,0.3)'
      : 'none';
  }
});

// ─── 갤러리 탭 필터링 ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const tabs  = document.querySelectorAll('.gallery-tab');
  const items = document.querySelectorAll('.gallery-item');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // 탭 활성화
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const filter = tab.dataset.filter;

      // 아이템 필터링 (fade 효과를 위해 animation 재실행)
      items.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.classList.remove('hidden');
          item.style.animation = 'none';
          item.offsetHeight; // reflow
          item.style.animation = '';
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  // ─── 갤러리 모달 ──────────────────────────────────────
  const modal       = document.getElementById('galleryModal');
  const modalImg    = document.getElementById('galleryModalImg');
  const modalBadge  = document.getElementById('galleryModalBadge');
  const modalTitle  = document.getElementById('galleryModalTitle');
  const modalDesc   = document.getElementById('galleryModalDesc');
  const modalQuote  = document.getElementById('galleryModalQuoteBtn');
  const modalClose  = document.getElementById('galleryModalClose');
  const modalBackdrop = document.getElementById('galleryModalBackdrop');

  function openModal(item) {
    const img = item.querySelector('.gallery-thumb img');
    const badge = item.querySelector('.gallery-cat-badge');

    modalImg.src    = img ? img.src : '';
    modalImg.alt    = img ? img.alt : '';
    modalBadge.textContent = badge ? badge.textContent : '';
    modalTitle.textContent = item.dataset.title  || '';
    modalDesc.textContent  = item.dataset.desc   || '';

    const service = item.dataset.service || '';
    modalQuote.onclick = () => {
      closeModal();
      selectService(service);
    };

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // 갤러리 아이템 클릭 시 모달 열기
  items.forEach(item => {
    item.addEventListener('click', () => openModal(item));
  });

  // 닫기 버튼 및 배경 클릭
  if (modalClose)   modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  // ESC 키로 닫기
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
});
