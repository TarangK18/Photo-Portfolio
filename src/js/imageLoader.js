import imagesLoaded from 'imagesloaded';
import Masonry from 'masonry-layout';
import { format } from 'date-fns';

export class ImageLoader {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      itemSelector: '.gallery-item',
      columnWidth: '.gallery-sizer',
      percentPosition: true,
      gutter: 16,
      ...options
    };
    this.masonry = null;
    this.init();
  }

  init() {
    // Initialize Masonry but wait for all images to load
    imagesLoaded(this.container, () => {
      this.masonry = new Masonry(this.container, this.options);
    });
  }

  refresh() {
    if (this.masonry) {
      this.masonry.layout();
    }
  }

  static formatDate(date) {
    return format(new Date(date), 'dd/MM/yyyy');
  }
}