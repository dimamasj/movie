(function () {

    var mainWrap = $('.main-wrap'),
        mainBlock = $('main'),
        searchInput = $('.search-input'),
        shortList = $('.search-list'),
        preloader = $('<div class="load"><div class="preloader"></div></div>'),
        requestsList = {                            //links for API request
            searchPeople: 'searchPeople?keyword',
            getPeopleDetail: 'getPeopleDetail?peopleID',
            getFilm: 'getFilm?filmID',
            getReviews: 'getReviews?filmID',
            getGallery: 'getGallery?filmID',
            searchFilms: 'searchFilms?keyword'

        },
        asideDesc = $('.aside-desc'),
        avatarBlock = $('.avatar-block'),
        actorInfo = $('.actor-info'),
        career = $('.career'),
        commentBlock = $('aside .comments'),
        personInfo = {};    //info about selected person

    /**
     * Show Short Search List on Focus
     */
    searchInput.focus(function () {
        if (searchInput.val().length >= 3) {
            shortList.addClass('show');
        }
    });

    searchInput.blur(function () {
        if (searchInput.val().length < 3) {
            shortList.removeClass('show');
            mainWrap.addClass('enter-search');
            $('#header').addClass('search-form');
            shortList.html('');
        }
    });

    /**
     * AJAX request
     *
     * @param request
     * @param searchVal
     * @param callback
     */
    function getJson(request, searchVal, callback) {
        var url = 'http://api.kinopoisk.cf/' + requestsList[request] + '=' + searchVal;
        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'json',
            success: callback
        });
    }

    /**
     * Draving People Short List
     * @param data
     */
    function drawingSearchPeople(data) {
        if (data !== null && data.searchPeople) {
            shortList.html("");
            for (var i = 0; i < data.searchPeople.length; i++) {
                shortList.append('' +
                    '<li class="search-list__item" data-person-id="' + data.searchPeople[i].id + '" data-person-name="' + data.searchPeople[i].nameRU + '">' +
                    '<a class="search-list__link" href="#">' +
                    '<img class="short-search-img" src="http://st.kp.yandex.net/images/' + data.searchPeople[i].posterURL + '" alt="' + data.searchPeople[i].nameEN + '">' +
                    '<h4 class="search-title">' + data.searchPeople[i].nameEN + '<span class="search-en-title">' + data.searchPeople[i].nameRU + '</span></h4>' +
                    '</a>' +
                    '</li>');
            }
        } else {
            shortList.html('<p class="empty">Ничего не найдено</p>')
        }
    }

    /**
     * People search
     */
    var timer;
    searchInput.on("paste keyup", function () {
        window.clearTimeout(timer);
        var $this = $(this),
            searchVal = $this.val().replace(' ', ',');
        if (searchVal.length >= 3) {
            shortList.addClass('show').append(preloader);
            timer = setTimeout(function () {
                getJson('searchPeople', searchVal, drawingSearchPeople);
            }, 1000);
        }
    });


    function initPage() {
        mainWrap.removeClass('enter-search');
        $('#header').removeClass('search-form');
        setTimeout(function () {
            mainBlock.find('.load').remove();
            asideDesc.fadeIn('slow');
            $('.main-content').fadeIn('slow');
            $('aside').delay(1000).animate({'opacity': 1});
        }, 1000);
    }


    shortList.on('click', 'li', function () {
        var $this = $(this),
            selectedPersonId = $this.data('person-id'),
            selectedPersonName = $this.data('person-name'),
            professionList = $('.profession-list'),
            personDataArray = ['filmography', 'generalFilms', 'gallery', 'triviaData'];
        if (selectedPersonId) {
            avatarBlock.append(preloader);
            shortList.removeClass('show');

            getJson('getPeopleDetail', selectedPersonId, function (data) {
                personInfo = data;
                if (mainWrap.hasClass('enter-search')) {
                    initPage();
                }

                avatarBlock.find('img').attr('src', 'http://st.kp.yandex.net/images/' + data.posterURL.replace('90_', '360_'));
                avatarBlock.find('h1').html(selectedPersonName);
                avatarBlock.find('.load').remove();
                actorInfo.append(preloader);

                var professionArray = data.profession.split(', ');
                actorInfo.find('.birthday .text').html(data.birthday + '<i class="age">(' + data.age + ')</i>');
                actorInfo.find('.growth .text').html(data.growth);
                actorInfo.find('.sex .text').html(data.sex);
                actorInfo.find(professionList).html("");
                for (var i = 0; i < professionArray.length; i++) {
                    actorInfo.find(professionList).append('<li>' + professionArray[i] + '</li>');
                }
                actorInfo.find('.load').remove();

                for (var j = 0; j < personDataArray.length; j++) {
                    if (data[personDataArray[j]]) {
                        career.find('a[data-link-type="' + personDataArray[j] + '"] .count').html(getNumArray(data[personDataArray[j]]));
                    } else {
                        career.find('a[data-link-type="' + personDataArray[j] + '"] .count').html('0');
                    }
                }

                $mainList.html('').removeClass('trivia-data col-3');
                getFilmography(personInfo.filmography[0]);
                $('.aside-list li').removeClass('active');
                $('.aside-list li:first-child').addClass('active');
            });
        }
    });


    var $mainList = $('.list');
    $('.aside-list li a').click(function (e) {
        e.preventDefault();
        var $this = $(this),
            $dataLink = $this.data('link-type');

        $('.aside-list li').removeClass('active');
        $this.parent().addClass('active');

        $mainList.append(preloader);
        $mainList.html('').removeClass('trivia-data col-3');

        if ($dataLink === 'filmography') {
            getFilmography(personInfo[$dataLink][0]);
        } else if ($dataLink === 'generalFilms') {
            getGeneralFilms(personInfo[$dataLink]);
        } else if ($dataLink === 'gallery') {
            getGallery(personInfo[$dataLink]);
        } else if ($dataLink === 'triviaData') {
            getTriviaData(personInfo[$dataLink]);
        }
        $mainList.find('.load').remove();
    });


    /**
     * Get filmography list
     * @param obj
     */
    function getFilmography(obj) {
        var colClass = '',
            resultToShow = '';
        if (obj.length < 10) {
            colClass = 'col-3'
        }

        for (var i = 0; i < obj.length; i++) {
            resultToShow += '<div class="film" style="background-image: url(http://st.kp.yandex.net/images/film_big/' + obj[i].filmID + '.jpg)">' +
                '<a href="#" data-film-id="' + obj[i].filmID + '">' +
                '<img src="http://st.kp.yandex.net/images/film_big/' + obj[i].filmID + '.jpg" alt="">' +
                '</a>' +
                '</div>';
        }

        $mainList.addClass(colClass).html('').append(resultToShow);
        $mainList.find('img').each(function () {
            chekingLoadImg($(this));
        });
    }


    /**
     * Get General films list
     * @param obj
     */
    function getGeneralFilms(obj) {
        var colClass;
        if (obj.length < 10) {
            colClass = 'col-3'
        }
        for (var i = 0; i < obj.length; i++) {
            $mainList.addClass(colClass).append('' +
                '<div class="film" style="background-image: url(http://st.kp.yandex.net/images/film_big/' + obj[i].filmID + '.jpg)">' +
                '<a href="#" data-film-id="' + obj[i].filmID + '">' +
                '<img src="http://st.kp.yandex.net/images/film_big/' + obj[i].filmID + '.jpg" alt="">' +
                '</a>' +
                '</div>' +
                '');
        }
    }

    /**
     * Get gallery about actor
     * @param obj
     */
    function getGallery(obj) {
        for (var i = 0; i < obj.length; i++) {
            $mainList.append('' +
                '<div class="gallery" style="background-image: url(http://st.kp.yandex.net/images/film_big/' + obj[i].preview + '.jpg)">' +
                '<a href="#" data-gallery-item="http://st.kp.yandex.net/images/' + obj[i].preview + '">' +
                '<img src="http://st.kp.yandex.net/images/' + obj[i].preview + '" alt="">' +
                '</a>' +
                '</div>' +
                '');
        }
    }

    /**
     * Get trivia data about actor
     * @param obj
     */
    function getTriviaData(obj) {
        for (var i = 0; i < obj.length; i++) {
            $mainList.addClass('trivia-data').append('' +
                '<p>' + obj[i] + '</p>' +
                '');
        }
    }


    $mainList.on('click', '.film a', function (e) {
        e.preventDefault();
        var $this = $(this),
            $filmId = $this.data('film-id'),
            filmInfoColl = $('.list .film-info'),
            parentElem = $this.closest('.film'),
            leftOffset = parentElem.position().left,
            parentElemWidth = parentElem.width(),
            mainContentOffset = $mainList.position().left,
            result = getElementsPerRow(parentElem);

        $this.parent().append(preloader);

        getJson('getFilm', $filmId, function (data) {
            filmInfoColl.html('').hide();
            var img = '';
            if (data.posterURL) {
                img = 'http://st.kp.yandex.net/images/' + data.posterURL.replace('90_', '360_');
            } else {
                img = 'http://st.kp.yandex.net/images/movies/poster_none.png';
            }

            var infoToShow = '<div class="film-poster">' +
                '<img src="' + img + '" alt="">' +
                '</div><div class="film-desc">' +
                '<h3 class="h3">' + data.nameEN + '</h3>' +
                '<ul class="film-desc__list">' +
                '<li><span class="desc-title">Year: </span><span class="desc-text">' + data.year + '</span></li>' +
                '<li><span class="desc-title">Country: </span><span class="desc-text">' + data.country + '</span></li>' +
                '<li><span class="desc-title">Slogan: </span><span class="desc-text">' + data.slogan + '</span>' +
                '</li>' +
                '<li><span class="desc-title">Genre: </span><span class="desc-text">' + data.genre + '</span></li>' +
                '<li><span class="desc-title">Rating: </span><span class="desc-text">' + data.ratingData.rating + '</span></li>' +
                '<li><span class="desc-title">Film length: </span><span class="desc-text">' + data.filmLength + '</span></li>' +
                '</ul>' +
                '<p class="description">' + data.description + '</p>' +
                '</div>' +
                '<span class="arrow" style="left: ' + (leftOffset - mainContentOffset + parentElemWidth / 2) + 'px"></span>' +
                '<span class="close-info"><i class="fa fa-times" aria-hidden="true"></i></span>';

            if (result.next().hasClass('film-info')) {
                result.next().html(infoToShow).show();
            } else {
                result.after('<div class="film-info film-info--short"></div>');
                result.next().html(infoToShow).show();
            }
            $('body').animate({scrollTop: parentElem.position().top}, 'slow');

            $this.parent().find('.load').remove();
        });


        getJson('getReviews', $filmId, function (data) {
            var reviewsList = data.reviews,
                reviewLength = 10;
            if (reviewsList.length < reviewLength) {
                reviewLength = reviewsList.length;
            }
            commentBlock.html('');
            if (reviewsList) {
                for (var i = 0; i < reviewLength; i++) {
                    commentBlock.append('' +
                        '<article class="' + reviewsList[i].reviewType + '">' +
                        '<header>' +
                        '<div class="avatar" style="background-image: url(http://st.kp.yandex.net/images/' + reviewsList[i].reviewAutorImageURL + ')">' +
                        '<img src="http://st.kp.yandex.net/images/' + reviewsList[i].reviewAutorImageURL + '" alt="' + data.reviews[i].reviewAutor + '">' +
                        '</div>' +
                        '<h4>' + reviewsList[i].reviewAutor + '</h4>' +
                        '</header>' +
                        '<p>' + reviewsList[i].reviewDescription + '</p>' +
                        '<footer>' + reviewsList[i].reviewData + '</footer>' +
                        '</article>')
                }
            } else {
                commentBlock.html('No reviews');
            }
        })
    });


    function getElementsPerRow(elem) {
        var $this = elem;
        var $elemOffset = $this.offset().top;
        for (var i = 1; i < 5; i++) {
            if ($this.next().hasClass('film')) {
                if ($this.next().offset().top === $elemOffset) {
                    $this = $this.next();
                }
                else {
                    return $this;
                }
            } else {
                return $this;
            }
        }
    }


    /**
     * Counter
     * @param list
     * @returns {number}
     */
    var $counter = 0;

    function getNumArray(list) {
        if (list[0] instanceof Array) {
            list.forEach(function (n) {
                $counter += n.length;
            });
        } else {
            $counter = list.length;
        }
        return $counter;
    }

    /**
     * Cheking if img has loaded from API server
     * @param el
     * @returns {*}
     */
    function chekingLoadImg(el) {
        el.on('error', function () {
            el.attr('src', 'http://st.kp.yandex.net/images/movies/poster_none.png');
            el.closest('.film').addClass('empty-img').css('background-image', 'url(http://st.kp.yandex.net/images/movies/poster_none.png)')
        });
    }

    /**
     * Close Film Description
     */
    $mainList.on('click', '.close-info', function () {
        $(this).closest('.film-info').hide();
    });


    /**
     * Full screen gallery
     */
    var fullScreenWrap = $('.full-screen');

    $mainList.on('click', '.gallery a', function (e) {
        e.preventDefault();
        var $this = $(this),
            $imgToShow = $this.data('gallery-item');
        fullScreenWrap.addClass('active').find('img').attr('src', $imgToShow)

    });

    fullScreenWrap.click(function () {
        $(this).removeClass('active');
    })


})();