let images = [...document.querySelectorAll('.card__image--lazy')];

const options = {
    rootMargin: '0px 0px 200px 0px'
};

function onIntersection(imageEntities) {
    imageEntities.forEach(image => {
        if (image.isIntersecting) {
            observer.unobserve(image.target);
            image.target.src = image.target.dataset.src;
        }
    });
}

let observer = new IntersectionObserver(onIntersection, options);

images.forEach(image => observer.observe(image));