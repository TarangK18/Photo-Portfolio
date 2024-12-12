export class ImageModal {
  constructor() {
    this.modal = null;
    this.currentImage = null;
    this.init();
  }

  init() {
    this.createModal();
    this.bindEvents();
  }

  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'image-modal hidden';
    this.modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <button class="modal-close">&times;</button>
        <img src="" alt="" class="modal-image">
        <div class="modal-info">
          <h3 class="modal-title"></h3>
          <p class="modal-description"></p>
          <p class="modal-date"></p>
        </div>
      </div>
    `;
    document.body.appendChild(this.modal);
  }

  bindEvents() {
    this.modal.querySelector('.modal-close').addEventListener('click', () => this.close());
    this.modal.querySelector('.modal-overlay').addEventListener('click', () => this.close());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  open(imageData) {
    this.currentImage = imageData;
    const modalImg = this.modal.querySelector('.modal-image');
    const title = this.modal.querySelector('.modal-title');
    const description = this.modal.querySelector('.modal-description');
    const date = this.modal.querySelector('.modal-date');

    modalImg.src = imageData.fullSize;
    modalImg.alt = imageData.title;
    title.textContent = imageData.title;
    description.textContent = imageData.description;
    date.textContent = imageData.date;

    this.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modal.classList.add('hidden');
    document.body.style.overflow = '';
    this.currentImage = null;
  }
}