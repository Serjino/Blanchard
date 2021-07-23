import { artWorkers } from './js/objects.js';

document.addEventListener('DOMContentLoaded', async function () {

    window.addEventListener('load', function () {

        // These functions is placed here to optimize page loading. All information is descripted below

        // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        fillTheCatalogWithArtWorkers(artWorkers);

        // Gallery Swiper setup 
        const gallerySwiper = new Swiper('.gallery__container', {
            direction: 'horizontal',
            loop: false,
            pagination: {
                el: '.section-gallery__swiper__pagination',
                type: 'fraction',
            },
            slidesPerView: 6,
            spaceBetween: 50,
            slidesPerGroup: 6,
            navigation: {
                nextEl: '.section-gallery__swiper-nav__btn-next',
                prevEl: '.section-gallery__swiper-nav__btn-prev',
            },
            scrollbar: {
                el: '.swiper-scrollbar',
            },
        });

        // Publications Swiper setup 

        const publicationsSwiper = new Swiper('.section-publications__swiper-container', {
            direction: 'horizontal',
            loop: false,
            pagination: {
                el: '.section-publications__swiper__pagination',
                type: 'fraction',
            },
            slidesPerView: 3,
            spaceBetween: 50,
            slidesPerGroup: 3,
            navigation: {
                nextEl: '.section-publications__swiper-nav__btn-next',
                prevEl: '.section-publications__swiper-nav__btn-prev',
            },
            scrollbar: {
                el: '.swiper-scrollbar',
            },
        });

        // Publications Swiper setup 

        const partnersSwiper = new Swiper('.partners__swiper', {
            direction: 'horizontal',
            loop: false,
            pagination: {
                el: '.section-publications__swiper__pagination',
                type: 'fraction',
            },
            slidesPerView: 3,
            spaceBetween: 50,
            slidesPerGroup: 3,
            navigation: {
                nextEl: '.partners__btn-next',
                prevEl: '.partners__btn-prev',
            },
            scrollbar: {
                el: '.swiper-scrollbar',
            },
        });
        
        // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

        // Tippy.js setup
        tippy('.tooltip_1', {
            content: 'Пример современных тенденций - современная методология разработки',
            theme: 'purple',
            maxWidth: 264,
        });

        tippy('.tooltip_2', {
            content: 'Приятно, граждане, наблюдать, как сделанные на базе аналитики выводы вызывают у вас эмоции',
            theme: 'purple',
            maxWidth: 264,
        });

        tippy('.tooltip_3', {
            content: 'В стремлении повысить качество ',
            theme: 'purple',
            maxWidth: 264,
        });

        // ==============================

        // Choices.js (custom select) additional features

        let choices = document.getElementsByClassName('choices');

        function choicesPluginInit(CSSClass) {
            let elements = document.querySelectorAll(CSSClass);
            elements.forEach(el =>
                new Choices(el, {
                    searchEnabled: false,
                    itemSelectText: '',
                    placeholder: true,
                    renderSelectedChoices: 'always',
                    shouldSort: false,
                })
            );
        }

        function eraseEqualValuesFromChoicesPlugin(choiceMainWrapper) {
            let selectOptions = choiceMainWrapper.getElementsByClassName('choices__item--choice');
            for (let selectOption of selectOptions) {
                selectOption.classList.remove('is-highlighted', 'is-selected');
                if (choiceMainWrapper.querySelector('select').textContent == selectOption.textContent) {
                    selectOption.remove();
                };
            }
        }

        // ==============================

        // Choices.js (custom select) setup

        choicesPluginInit('.nav-select__select');
        choicesPluginInit('.filter__select');
        let simpleBar = null;
        for (let choice of choices) {
            choice.addEventListener('click', function () {
                eraseEqualValuesFromChoicesPlugin(choice);
            });
        }

        // ==============================

        // SimpleBar setup

        document.addEventListener('mousedown', function (e) {
            if (e.target.classList.contains('choices__item') || !e.target.classList.contains('choices__item--single')) {
                if (simpleBar != null) {
                    simpleBar.unMount();
                }
                simpleBar = null;
            };
        });

        document.addEventListener('click', function (e) {

            if (e.target.classList.contains('choices__item') || e.target.classList.contains('choices__list--single')) {
                if (simpleBar == null || simpleBar == undefined) {
                    simpleBar = new SimpleBar(e.target.closest('.choices').getElementsByClassName('choices__list')[2], {
                        scrollbarMaxSize: '28',
                    });
                }
            }
        });

        // ==============================

        // Create unordered list in the Catalog section and fill it with art workers, using object artWorkers from 'object.js'

        function fillTheCatalogWithArtWorkers(artWorkers) {
            let accordionItems = document.getElementsByClassName('art-periods__item');

            for (let accordionItem of accordionItems) {
                let artWorkerPeriod = accordionItem.getElementsByClassName('art-periods__item-heading')[0].textContent;
                let artWorkersForPeriod = artWorkers.filter(artWorker => artWorker.period == artWorkerPeriod);

                for (let i = 0; i < artWorkersForPeriod.length; i++) {
                    let artWorkersList = accordionItem.getElementsByClassName('artworkers-list')[0];

                    let artWorkerLink = document.createElement('a');
                    artWorkerLink.classList.add('artworkers-list__link');
                    artWorkerLink.textContent = artWorkersForPeriod[i].name;
                    artWorkerLink.href = '##';
                    artWorkerLink.addEventListener('click', function () {
                        let artWorkerLinks = document.getElementsByClassName('artworkers-list__link');
                        for (let link of artWorkerLinks) {
                            link.classList.remove('artworkers-list__link--active');
                        }
                        this.classList.add('artworkers-list__link--active');
                    })

                    let artWorkerListItem = document.createElement('li');
                    artWorkerListItem.classList.add('artworkers-list__item');

                    artWorkerListItem.append(artWorkerLink);
                    artWorkersList.append(artWorkerListItem);
                }
            }
        }

        // WikiAPI features, that get data with picture, birth/death date and main description (1st paragraph) from Wiki

        async function searchWikiPage(searchValue) {
            var url = "https://ru.wikipedia.org/w/api.php";

            var params = {
                action: "opensearch",
                search: searchValue,
                limit: "1",
                namespace: "0",
                format: "json",
            };

            url = url + "?origin=*";
            Object.keys(params).forEach(function (key) { url += "&" + key + "=" + params[key]; });
            let page;
            await fetch(url)
                .then(function (response) { return response.json(); })
                .then(function (response) {
                    page = response[1][0];
                })

            return page;
        };

        async function getTextFromWikiPage(page) {
            const url = "https://ru.wikipedia.org/w/api.php?" +
                new URLSearchParams({
                    origin: "*",
                    action: "parse",
                    page: page,
                    format: "json",
                    disablestylededuplication: true,
                    disableeditsection: true,
                    prop: 'text',
                });

            try {
                const req = await fetch(url);
                const json = await req.json();
                const text = json.parse.text['*'];
                return text;
            } catch (e) {
                console.error(e);
            }

        }

        function getBirthDate(wikiText) {
            let rowsWithData = wikiText.getElementsByTagName('tr');
            for (let row of rowsWithData) {
                if (row.textContent.includes('Дата') && row.textContent.includes('рождения')) {
                    let birthDate = row.getElementsByTagName('td')[0].textContent;
                    birthDate = birthDate.replace(/\(.+\)/, '').replace(/\[.+\]/, '').replace('ок.', ['около']);
                    if (!birthDate.includes('неизвестно')) {
                        birthDate += ' г.'
                    }
                    return birthDate;
                }
            }
        }

        function getDeathDate(wikiText) {
            let rowsWithData = wikiText.getElementsByTagName('tr');
            for (let row of rowsWithData) {
                if (row.textContent.includes('Дата') && row.textContent.includes('смерти')) {
                    let deathDate = row.getElementsByTagName('td')[0].textContent;
                    deathDate = deathDate.replace(/\(.+\)/, '').replace(/\[.+\]/, '').replace('ок.', ['около']);
                    if (!deathDate.includes('неизвестно')) {
                        deathDate += ' г.'
                    }
                    return deathDate;
                }
            }
        }

        async function getMainImg(wikiText, classForImg) {
            let images = wikiText.getElementsByTagName('img');
            let mainIMG;
            for (let image of images) {
                if (image.width > 200) {
                    mainIMG = image;
                    break;
                }
                else {
                    let noIMG = document.createElement('div');
                    noIMG.classList.add('art-worker__no-img');
                    noIMG.textContent = 'Нет изображения в хорошем качестве :(';
                    mainIMG = noIMG;
                }
            }
            mainIMG.classList.add(classForImg);
            return mainIMG;
        }

        // ==============================

        // Gathering data from wiki into bundle, which is ready to use

        async function fillWithWikiContent(searchQuery, classForText, classForBirthDate, classForDeathDate, classForImage) {
            let textEl = document.getElementsByClassName(classForText)[0];
            textEl.innerHTML = await getTextFromWikiPage(await searchWikiPage(searchQuery));

            let mainImageWrapper = document.getElementsByClassName(classForImage)[0];
            mainImageWrapper.innerHTML = '';
            mainImageWrapper.append(await getMainImg(textEl, 'art-worker__photo'));

            let birthDateEl = document.getElementsByClassName(classForBirthDate)[0];
            birthDateEl.textContent = await getBirthDate(textEl);
            let deathDateEl = document.getElementsByClassName(classForDeathDate)[0];
            deathDateEl.textContent = await getDeathDate(textEl);

            let firstParagraph = textEl.getElementsByTagName('p')[0].textContent;
            textEl.textContent = firstParagraph;

        }

        // ============================================

        // Render bundled Wiki Info about art worker by click

        document.body.addEventListener('click', async function renderArtWorkerWikiOnfo(e) {
            if (e.target.classList.contains('artworkers-list__link')) {
                let artWorkerEl = document.getElementsByClassName('art-worker')[0];
                artWorkerEl.classList.add('loading');
                let searchQuery = e.target.textContent;
                await fillWithWikiContent(searchQuery, 'art-worker__description', 'art-worker__bearth-date', 'art-worker__death-date', 'art-worker__photo-wrapper');
                let artWorkerName = document.getElementsByClassName('art-worker__heading')[0];
                artWorkerName.textContent = e.target.textContent;
                loadedTimeout = setTimeout(function () {
                    artWorkerEl.classList.remove('loading');
                }, 200)
                artWorkerEl.classList.remove('loading');
            }
        });

        // ============================================

        // 1. Catalog section accordion setup

        $("#accordion").accordion({
            active: 0,
            collapsible: true,
            heightStyle: "content",
            animate: 500,
        });

        // ============================================

        // 1.1. Accordion style customization

        let accItemHeadings = document.getElementsByClassName('art-periods__item-heading');
        let accordionLastItem = accItemHeadings.length - 1;
        let accordionDescriptions = document.getElementsByClassName('artworkers-list-wrapper');
        let accordionLastDescription = accordionDescriptions.length - 1;
        accItemHeadings[accordionLastItem].style.borderBottom = '1px solid #CACACA';
        accordionDescriptions[accordionLastDescription].classList.add('artworkers-list-wrapper_not-bordered');


        // 1.2. UI effects
        for (let i = 0; i < accItemHeadings.length; i++) {

            accItemHeadings[i].addEventListener('mouseover', function () {
                if (!this.classList.contains('ui-state-active')) {
                    this.style.borderColor = 'var(--btn-purple)';
                    if (i == accItemHeadings.length - 2) {
                        accItemHeadings[i + 1].style.borderTop = '1px solid var(--btn-purple)';
                    }
                    else {
                        accItemHeadings[i + 1].style.borderColor = 'var(--btn-purple)';
                    }
                }
            });
            accItemHeadings[i].addEventListener('mouseout', function () {
                if (!this.classList.contains('ui-state-active')) {
                    this.style.borderColor = '#CACACA';
                    accItemHeadings[i + 1].style.borderColor = '#CACACA';
                }
            });
            accItemHeadings[i].addEventListener('mousedown', function (e) {
                e.preventDefault();
                this.classList.remove('ui-state-focus');
                if (!this.classList.contains('ui-state-active')) {
                    for (let i = 0; i < accItemHeadings.length; i++) {
                        accItemHeadings[i].style.borderColor = '#CACACA';
                    }
                    this.style.borderColor = 'var(--btn-purple)';
                }
            });
        }

         // ============================================

        // Show/hide elements with class 'event'. Dropdown
        let allEventsBtn = document.getElementById('allEventsBtn');
        let events = document.getElementsByClassName('event');

        allEventsBtn.addEventListener('click', function () {
            for (let event of events) {
                event.classList.toggle('event--shown');
            };
            if (events[0].classList.contains('event--shown')) {
                events[3].classList.add('scrolled-to');
                events[3].scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
            else {
                events[0].classList.add('scrolled-to');
                events[0].scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        });

        // ============================================

        // Yandex Map setup
        ymaps.ready(init);
        function init() {
            var myMap = new ymaps.Map("map", {
                center: [55.758468, 37.601088],
                zoom: 15,
                controls: [],
            });
            var myPlacemark = new ymaps.Placemark([55.758468, 37.601088], {}, {
                iconLayout: 'default#image',
                iconImageHref: './img/sections/contacts/map-icon.svg',
                iconImageSize: [30, 42],
                iconImageOffset: [-3, -42]
            });
            myMap.geoObjects.add(myPlacemark);
            var geolocationControl = new ymaps.control.GeolocationControl({
                options: {
                    noPlacemark: true,
                    position: {
                        top: 420,
                        right: 20,
                    }
                }
            });
            var zoomControl = new ymaps.control.ZoomControl({
                options: {
                    size: "small",
                    position: {
                        top: 330,
                        right: 20,
                    }
                }
            });
            myMap.controls.add(zoomControl);
            myMap.controls.add(geolocationControl);
        }

        // Choose language UI
        let chooseLangBtns = document.getElementsByClassName('choose-lang__btn');
        let chooseLangBtnsActive = document.getElementsByClassName('choose-lang__btn--active');

        for (let chooseLangBtn of chooseLangBtns) {
            chooseLangBtn.addEventListener('click', function () {
                if (!this.classList.contains('choose-lang__btn--active')) {
                    for (let chooseLangBtnActive of chooseLangBtnsActive) {
                        chooseLangBtnActive.classList.remove('choose-lang__btn--active');
                    }
                    this.classList.add('choose-lang__btn--active');

                }

            });
        }
        // ============================================

        // Order feedback call from tools. Validity, Masks, etc.
        let inputTel = document.getElementsByClassName('order-call-form__input_tel')[0]

        $(inputTel).mask(`+7 (999) 999-99-99`, {
            autoclear: false,
        });

        let telValidRegex = /\+7\040\([0-9]{3}\)\040[0-9]{3}-[0-9]{2}-[0-9]{2}/;
        let telUnvalidNoticeText = 'Введите телефон в формате +7(999)999-99-99';

        let nameValidRegex = /^([А-Яа-яЁё\-]{2,})$/;
        let nameUnvalidNoticeText = 'Только русские буквы и/или тире. Не менее 2х символов';

        let orderCallForm = document.getElementsByClassName('order-call-form')[0];
        let nameInput = document.getElementsByClassName('order-call-form__input_name')[0];
        let telInput = document.getElementsByClassName('order-call-form__input_tel')[0];

        function checkValidity(regexp, inputEl, unvalidNoticeText) {
            if ((!regexp.test(inputEl.value) || inputEl.value == '') && !inputEl.classList.contains('order-call-form__input--unvalid')) {
                let unvalidNotice = document.createElement('span');
                unvalidNotice.classList.add('unvalid-notice');
                unvalidNotice.textContent = unvalidNoticeText;
                inputEl.classList.add('order-call-form__input--unvalid');
                inputEl.before(unvalidNotice);
                return false;
            }
            else if (regexp.test(inputEl.value) && inputEl.closest('div').getElementsByClassName('unvalid-notice')[0]) {
                let inputWrapper = inputEl.closest('div');
                let unvalidNotice = inputWrapper.getElementsByClassName('unvalid-notice')[0];
                inputEl.classList.remove('order-call-form__input--unvalid');
                unvalidNotice.remove();
                return true;
            }
        }

        telInput.addEventListener('keyup', function () {
            checkValidity(telValidRegex, this, telUnvalidNoticeText);
        });

        nameInput.addEventListener('keyup', function () {
            checkValidity(nameValidRegex, this, nameUnvalidNoticeText);
        });

        orderCallForm.addEventListener('submit', function (e) {

            checkValidity(nameValidRegex, nameInput, nameUnvalidNoticeText);
            checkValidity(telValidRegex, telInput, telUnvalidNoticeText);


            if (this.getElementsByClassName('unvalid-notice').length == 0) {
                this.submit();
            }
            else {
                e.preventDefault();
            }
        })

        document.addEventListener('mousedown', function (e) {
            if (!e.target.closest('form')) {
                e.target.blur();
            }
        })

        document.addEventListener('mouseup', function (e) {
            if (!e.target.closest('form')) {
                e.target.blur();
            }
        })

        // Adding class by focus to the submit btn in the contacts form
        let submitBtn = document.getElementsByClassName('order-call-form__btn')[0];

        submitBtn.addEventListener('focusin', function () {
            submitBtn.closest('div').classList.add('submit-btn-wrapper--focused');
        })

        submitBtn.addEventListener('blur', function () {
            submitBtn.closest('div').classList.remove('submit-btn-wrapper--focused');
        })

        submitBtn.addEventListener('click', function () {
            this.blur();
            submitBtn.closest('div').classList.remove('submit-btn-wrapper--focused');
        })

        document.body.style.opacity = '1';

    })


});