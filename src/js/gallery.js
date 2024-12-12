import { ImageLoader } from './imageLoader';
import { ImageModal } from './modal';

export class Gallery {
  constructor(container) {
    this.container = container;
    this.modal = new ImageModal();
    this.loader = new ImageLoader(container);
    this.init();
  }

  init() {
    this.container.addEventListener('click', (e) => {
      const item = e.target.closest('.gallery-item');
      if (item) {
        const imageData = {
          fullSize: item.dataset.fullsize,
          title: item.dataset.title,
          description: item.dataset.description,
          date: item.dataset.date
        };
        this.modal.open(imageData);
      }
    });

    window.addEventListener('resize', () => {
      this.loader.refresh();
    });
  }
}