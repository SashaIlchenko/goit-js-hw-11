import { Notify } from "notiflix";
import axios from 'axios';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const formEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const buttonEl = document.querySelector('.load-more');
const axios = require('axios');

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '32769599-757710318235c73590b6be352';
let page = 1;
let limit = 40;

formEl.addEventListener('submit', onFormSubmit);
buttonEl.addEventListener("click", onLoad);

function onFormSubmit(evt) {
  evt.preventDefault();
  const typeName = formEl[0].value;
  localStorage.setItem('name', typeName);
  if (!typeName.length) {

    Notify.failure("Sorry, there are no images matching your search query.Please try again.");

  } else {
    getImages(typeName, page = 1).then(images => createMarkup(images))
      .catch(error => console.log(error));
  }
  galleryEl.innerHTML = '';
};

async function getImages(name, page) {
  try {
    const images = await axios.get(`${BASE_URL}?key=${API_KEY}&q=${name}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${limit}&page=${page}`);
    return images.data;
  } catch (err) {
    console.error(err);
  }
};

function createMarkup(obj) {
  if (obj.hits.length) {
    const markup = obj.hits.map((
      {
        webformatURL,
        largeImageURL,
        tags,
        views,
        likes,
        downloads,
        comments,
      }) => `<div class="photo-card">
  <a class='img-link' href="${largeImageURL}" ><img src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
  <div class="info">
    <p class="info-item">
      <b>Likes:</b>${likes}
    </p>
    <p class="info-item">
      <b>Views:</b>${views}
    </p>
    <p class="info-item">
      <b>Comments:</b>${comments}
    </p>
    <p class="info-item">
      <b>Downloads:</b>${downloads}
    </p>
  </div>
</div>`).join('');
    galleryEl.insertAdjacentHTML("beforeend", markup);
    buttonEl.hidden = false;
    if (page < 2) {
      Notify.success(`Hooray! We found ${obj.totalHits} images.`);
    } else {
      slowlyScroll();
    }
  }
  else {
    buttonEl.hidden = true;
    Notify.failure("Sorry, there are no images matching your search query.Please try again.");
    galleryEl.innerHTML = '';
  }
  createLightbox();
};

async function onLoad() {
  const data = await getImages(localStorage.getItem('name'), page + 1);
  page += 1;
  createMarkup(data);
  if (page > data.totalHits / limit) {
    buttonEl.hidden = true;
    Notify.failure("We're sorry, but you've reached the end of search results.")
  }
}

function createLightbox() {
  const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: "alt",
    captionDelay: 250,
    close: true
  });
  lightbox.refresh();
}

function slowlyScroll() {
  const { height: cardHeight } = galleryEl.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: "smooth",
  });
}