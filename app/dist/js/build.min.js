(function () {

    var searchInput = $('.search-input'),
        shortList = $('.search-list'),
        preloader = $('<div class="load"><div class="preloader"></div></div>'),
        requestsList = {                            //links for API request
            searchPeople: 'searchPeople?keyword',
            getPeopleDetail: 'getPeopleDetail?peopleID',
            getFilm: 'getFilm?filmID',
            getReviews: 'getReviews?filmID'

        },
        asideDesc = $('.aside-desc'),
        avatarBlock = $('.avatar-block'),
        actorInfo = $('.actor-info'),
        career = $('.career'),
        commentBlock = $('aside .comments');


    /**
     * AJAX request
     *
     * @param request
     * @param searchVal
     * @param callback
     */
    function getJson(request, searchVal, callback) {
        var url = 'http://api.kinopoisk.cf/' + requestsList[request] + '=' + searchVal;
        console.log(url);
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
        console.log(data);
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
            shortList.html('<p class="empty">Ничего не надено</p>')
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
        console.log(searchVal);
        if (searchVal.length >= 3) {
            shortList.addClass('show').append(preloader);
            timer = setTimeout(function () {
                getJson('searchPeople', searchVal, drawingSearchPeople);
            }, 1000);
        }
    });


    var personInfo = {};
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
                console.log(data);
                personInfo = data;

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

                //career.append(preloader);

                if (data.filmography) {
                    getNumArray(data.filmography);
                }


                if (data.gallery) {
                    getNumArray(data.gallery);
                }

                if (data.triviaData) {
                    getNumArray(data.triviaData);
                }

                if (data.generalFilms) {
                    getNumArray(data.generalFilms);
                }

                for (var j = 0; j < personDataArray.length; j++) {
                    //console.log(personDataArray[j]);
                    career.find('a[data-link-type="' + personDataArray[j] + '"] .count').html(getNumArray(data[personDataArray[j]]));
                }
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
        $mainList.html('').removeClass('trivia-data');

        if ($dataLink === 'filmography') {
            getFilmography(personInfo[$dataLink][0]);
        } else if ($dataLink === 'generalFilms') {
            console.log(personInfo[$dataLink]);
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
        console.log(obj);
        for (var i = 0; i < obj.length; i++) {
            $mainList.append('' +
                '<div class="film">' +
                '<a href="#" data-film-id="' + obj[i].filmID + '">' +
                '<img src="http://st.kp.yandex.net/images/film_big/' + obj[i].filmID + '.jpg" alt="">' +
                '</a>' +
                '</div>' +
                '');
        }
    }

    /**
     * Get General films list
     * @param obj
     */
    function getGeneralFilms(obj) {
        console.log(obj);
        for (var i = 0; i < obj.length; i++) {
            $mainList.append('' +
                '<div class="film">' +
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
        console.log(obj);
        for (var i = 0; i < obj.length; i++) {
            $mainList.append('' +
                '<div class="gallery">' +
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
        console.log(obj);
        for (var i = 0; i < obj.length; i++) {
            $mainList.addClass('trivia-data').append('' +
                '<p>' + obj[i] + '</p>' +
                '');
        }
    }


    $mainList.on('click', 'a', function (e) {
        e.preventDefault();
        var $this = $(this),
            $filmId = $this.data('film-id'),
            filmInfoColl = $('.list .film-info'),
            parentElem = $this.closest('.film'),
            leftOffset = parentElem.position().left,
            mainContentOffset = $mainList.position().left,
            result = getElementsPerRow(parentElem);


        getJson('getFilm', $filmId, function (data) {
            console.log(data);

            filmInfoColl.html('').hide();

            var infoToShow = '<div class="film-poster">' +
                '<img src="http://st.kp.yandex.net/images/' + data.posterURL.replace('90_', '360_') + '" alt="">' +
                '</div><div class="film-desc">' +
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
                '<div class="read-more">' +
                '<a class="read-more__link" href="#">Read full description</a>' +
                '</div>' +
                '</div>' +
                '<span class="arrow" style="left: ' + (leftOffset - mainContentOffset) + 'px"></span>' +
                '<span class="close-info"><i class="fa fa-times" aria-hidden="true"></i></span>';

            if (result.next().hasClass('film-info')) {
                result.next().html(infoToShow).show();
            } else {
                result.after('<div class="film-info film-info--short"></div>');
                result.next().html(infoToShow).show();
            }
            $('body').animate({scrollTop: parentElem.position().top}, 'slow');
        });


        getJson('getReviews', $filmId, function (data) {
            console.log(data);
            var reviewsList = data.reviews;

            if (reviewsList) {
                commentBlock.html('');
                for (var i = 0; i < 10; i++) {
                    commentBlock.append('' +
                        '<article class="' + reviewsList[i].reviewType + '">' +
                        '<header>' +
                        '<img src="http://st.kp.yandex.net/images/' + reviewsList[i].reviewAutorImageURL + '" alt="' + data.reviews[i].reviewAutor + '">' +
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
            if ($this.next()) {
                console.log($this.next());
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
     * Close Film Description
     */
    $mainList.on('click', '.close-info', function () {
        $(this).closest('.film-info').hide();
    });
})();