(function () {

    var searchInput = $('.search-input'),
        shortList = $('.search-list'),
        preloader = $('<div class="load"><div class="preloader"></div></div>'),
        requestsList = {                            //links for API request
            searchPeople: 'searchPeople?keyword',
            getPeopleDetail: 'getPeopleDetail?peopleID',
            getFilm: 'getFilm?filmID'
        },
        asideDesc = $('.aside-desc'),
        avatarBlock = $('.avatar-block'),
        actorInfo = $('.actor-info'),
        career = $('.career');


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

                getNumArray(data.filmography);
                getNumArray(data.gallery);
                getNumArray(data.triviaData);
                getNumArray(data.generalFilms);


                for (var j = 0; j < personDataArray.length; j++) {
                    console.log(personDataArray[j]);
                    career.find('a[data-link-type="' + personDataArray[j] + '"] .count').html(getNumArray(data[personDataArray[j]]));
                }
            });
        }
    });


    var $filmsList = $('.films');
    $('.aside-list li a').click(function (e) {
        e.preventDefault();
        var $this = $(this),
            $dataLink = $this.data('link-type');

        console.log ($dataLink);
        console.log(personInfo[$dataLink]);

        $filmsList.append(preloader);
        $filmsList.html('');
        for (var i = 0; i < personInfo[$dataLink][0].length; i++) {
            //getJson('getFilm', personInfo[$data][0][i].filmID, function (data) {
            //    console.log(data);

            $filmsList.append('' +
                '<div class="film">' +
                '<a href="#" data-film-id="' + personInfo[$dataLink][0][i].filmID + '">' +
                '<img src="http://st.kp.yandex.net/images/film_big/' + personInfo[$dataLink][0][i].filmID + '.jpg" alt="">' +
                '</a>' +
                '</div>' +
                '');
            //})
        }
        avatarBlock.find('.load').remove();
    });


    $filmsList.on('click', 'a', function (e) {
        e.preventDefault();
        var $this = $(this),
            $filmId = $this.data('film-id');

        getElementsPerRow($this.closest('.film'));

    });

    function getElementsPerRow(elem) {
        console.log(elem);

        var $elemOffset = elem.offset().top;

        //for (var i = 0; i < 5; i++) {
        //    if (){
        //
        //    }
        //}


        console.log($elemOffset);
        console.log(elem.next().offset().top);




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


//function normalizeObj (data) {
//    if (list[0] instanceof Array) {
//        list.forEach(function (n) {
//            $counter += n.length;
//        });
//    } else {
//        $counter = list.length;
//    }
//    return $counter;
//}

})();