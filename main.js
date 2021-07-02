import { artWorkers } from './js/objects.js';

document.addEventListener('DOMContentLoaded', async function () {

    window.addEventListener('load', function () {

        let selects = document.querySelectorAll('.nav-select__select');
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
            // console.log(choiceMainWrapper.querySelector('select'));
            for (let selectOption of selectOptions) {
                selectOption.classList.remove('is-highlighted', 'is-selected');
                if (choiceMainWrapper.querySelector('select').textContent == selectOption.textContent) {
                    selectOption.remove();
                };
            }
        }

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
                        // this.closest('.artworkers-list__item').classList.add('artworkers-list__item--active');
                        this.classList.add('artworkers-list__link--active');
                    })

                    let artWorkerListItem = document.createElement('li');
                    artWorkerListItem.classList.add('artworkers-list__item');

                    artWorkerListItem.append(artWorkerLink);
                    artWorkersList.append(artWorkerListItem);
                }
            }
        }

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
                    // console.log(response[1][0]);
                    page = response[1][0];
                })
                .catch(function (error) { console.log(error); });

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
                // console.log(text);
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
                    // birthDate = birthDate.replace(/\[.+\]/, '');
                    if (!birthDate.includes('неизвестно')) {
                        birthDate += ' г.'
                        // console.log(birthDate);

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
                    // deathDate = deathDate.replace(/\[.+\]/, '');
                    if (!deathDate.includes('неизвестно')) {
                        deathDate += ' г.'
                        // console.log(deathDate);

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

        document.body.addEventListener('click', async function (e) {
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


        choicesPluginInit('.nav-select__select');
        choicesPluginInit('.filter__select');
        let simpleBar = null;
        for (let choice of choices) {
            choice.addEventListener('click', function () {
                eraseEqualValuesFromChoicesPlugin(choice);
            });
        }

        // SimpleBar init

        document.addEventListener('mousedown', function (e) {
            console.log(e.target);
            if (e.target.classList.contains('choices__item') || !e.target.classList.contains('choices__item--single')) {
                console.log(simpleBar);
                if (simpleBar != null) {
                    simpleBar.unMount();
                }
                
                simpleBar = null;
                console.log(simpleBar);
            };

        })


        document.addEventListener('click', function (e) {
            console.log(e.target);
           
            if (e.target.classList.contains('choices__item') || e.target.classList.contains('choices__list--single')) {
                console.log('m');
                if (simpleBar == null || simpleBar == undefined) {
                    simpleBar = new SimpleBar(e.target.closest('.choices').getElementsByClassName('choices__list')[2], {
                        scrollbarMaxSize: '28',
                    });
                }
    
                // simpleBar.recalculate();
            }
            // else if (simpleBar != null) {
            //     if (simpleBar != 'undefined') {
            //         simpleBar.recalculate();
            //     }
            //     simpleBar.unMount();
            // }

        })



        // for (let choice of choices) {
        //     choice.addEventListener('mousedown', function () {

        //         // this.getElementsByClassName('choices__list')[2].setAttribute('data-simplebar', "init");
        //         new SimpleBar(this.getElementsByClassName('choices__list')[2], {
        //             // forceVisible: 'y',
        //             scrollbarMaxSize: '28',
        //         });
        //         console.log(this.getElementsByClassName('choices__list')[2]);

        //     });
        // }



        // blurByMousedown('main-offer__link');
        // blurByMousedown('choices');
        // blurByMousedown('ui');
        // blurByMousedown('link_purple');

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


        // 1. Accordion setup

        $("#accordion").accordion({
            active: 0,
            collapsible: true,
            heightStyle: "content",
            animate: 500,
        });

        // 1.1. Accordion style customization

        let accItemHeadings = document.getElementsByClassName('art-periods__item-heading');
        let accordionLastItem = accItemHeadings.length - 1;
        let accordionDescriptions = document.getElementsByClassName('artworkers-list-wrapper');
        let accordionLastDescription = accordionDescriptions.length - 1;
        accItemHeadings[accordionLastItem].style.borderBottom = '1px solid #CACACA';
        accordionDescriptions[accordionLastDescription].classList.add('artworkers-list-wrapper_not-bordered');


        // 1.2. UI effects
        // console.log(accItemHeadings);
        for (let i = 0; i < accItemHeadings.length; i++) {
            console.log(accItemHeadings[i]);

            accItemHeadings[i].addEventListener('mouseover', function () {
                // let nextEl = i+1;
                // let prevEl = i-1;
                if (!this.classList.contains('ui-state-active')) {
                    this.style.borderColor = 'var(--btn-purple)';
                    if (i == accItemHeadings.length - 2) {
                        accItemHeadings[i + 1].style.borderTop = '1px solid var(--btn-purple)';
                    }
                    else {
                        accItemHeadings[i + 1].style.borderColor = 'var(--btn-purple)';
                    }
                }
                // else if (accItemHeadings[i-1].classList.contains('ui-state-active')) {
                //     accItemHeadings[i+1].style.borderColor = 'var(--btn-purple)'; 
                // }
            });
            accItemHeadings[i].addEventListener('mouseout', function () {
                if (!this.classList.contains('ui-state-active')) {
                    // this.classList.remove('art-periods__item-heading--hover');
                    this.style.borderColor = '#CACACA';
                    accItemHeadings[i + 1].style.borderColor = '#CACACA';
                }
            });
            accItemHeadings[i].addEventListener('mousedown', function (e) {
                e.preventDefault();
                // this.classList.add('art-periods__item-heading--hover');
                // accItemHeadings[i+1].classList.remove('art-periods__item-heading--hover');
                this.classList.remove('ui-state-focus');
                if (!this.classList.contains('ui-state-active')) {
                    for (let i = 0; i < accItemHeadings.length; i++) {
                        accItemHeadings[i].style.borderColor = '#CACACA';
                    }
                    this.style.borderColor = 'var(--btn-purple)';
                    // accItemHeadings[i+1].style.borderColor = 'var(--btn-purple)';

                }
                // else {
                //     accItemHeadings[i+1].style.borderColor = 'var(--btn-purple)';
                // }

            });
        }

        // blurByMousedown('art-periods__item-heading');

        //====== 

        // All events functionality
        let allEventsBtn = document.getElementById('allEventsBtn');
        let eventsWrapper = document.getElementsByClassName('events')[0];
        let eventsWrapperHeight = eventsWrapper.offsetHeight;
        let events = document.getElementsByClassName('event');
        console.log(events.length);
        let eventToScroll
        if (events.length > 3) {
            eventToScroll = events[3];
        }
        eventsWrapper.classList.add('events--all-hidden');
        allEventsBtn.addEventListener('click', function () {
            if (eventsWrapper.classList.contains('events--all-hidden')) {
                eventsWrapper.classList.remove('events--all-hidden');
                eventToScroll.scrollIntoView({
                    behavior: 'smooth',
                    block: "start",
                    // inline: "start",
                })
                eventsWrapper.style.height = `${eventsWrapperHeight}px`;

            }
            else {
                eventsWrapper.scrollIntoView({
                    behavior: 'smooth',
                    block: "start",
                    // inline: "start",
                });
                eventsWrapper.style.height = `auto`;
                eventsWrapper.classList.add('events--all-hidden');

            }

            console.log(eventsWrapper.offsetHeight);
        })

        // Map setup



        ymaps.ready(init);
        function init() {

            var myMap = new ymaps.Map("map", {
                center: [55.758468, 37.601088],
                zoom: 15,
                controls: [],
            });

            //   {
            //     'zoomControl': {
            //         float: 'none',
            //         position: {
            //             right: 20,
            //             top: 100,
            //         }
            //     }
            // }

            var myPlacemark = new ymaps.Placemark([55.758468, 37.601088], {}, {
                iconLayout: 'default#image',
                iconImageHref: './img/sections/contacts/map-icon.svg',
                iconImageSize: [30, 42],
                iconImageOffset: [-3, -42]
            });

            myMap.geoObjects.add(myPlacemark);

            //   myMap.controls.add('geolocationControl', {
            //     float: 'none',
            //     position: {
            //         right: 20,
            //         top: 100,
            //     }
            // });

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


        // Tooltip event 
        let tooltips = document.getElementsByClassName('tooltip');

        for (let tooltip of tooltips) {
            tooltip.addEventListener('click', function () {
                this.classList.toggle('tooltip--active');
            })
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

        // Order feedback call

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
                console.log(inputWrapper);
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
            console.log(this);

            checkValidity(nameValidRegex, nameInput, nameUnvalidNoticeText);
            checkValidity(telValidRegex, telInput, telUnvalidNoticeText);

            console.log(this.getElementsByClassName('unvalid-notice'))

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

    // Contacts Form Btn Focus Event
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

    // submitBtn.addEventListener('mousedown', function (e) {
    //     e.preventDefault;
    //     submitBtn.blur();
    //     submitBtn.closest('div').classList.remove('submit-btn-wrapper--focused');
    // })

        fillTheCatalogWithArtWorkers(artWorkers);

        document.body.style.opacity = '1';

    })


});