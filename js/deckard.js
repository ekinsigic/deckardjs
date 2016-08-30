$.fn.deckard = function( options ) {
    // Defaults
    var settings = $.extend({
        items: '> *',
        deckStyle : 'open',
        cardWidth: this.css('width'),
        cardHeight: this.css('height'),
        padding : '20px',
        direction: 'horizontal',
        responsivity: 2,
        speed: 100,
        startFromCard: 1,
        escapeVelocity: 10,
        endless: false
    }, options );

    //global deckard object
    window.deckard = {
        deck: [],
        activeCard: settings.startFromCard,
        deckTranslate: 0,
        moving: false
    };
    //defining our variables
    var
        $deck = this,
        drag,
        $wrapper,
        cssDirections,
        velocity,
        lastTouchState,
        firstCardState,
        windowWidth = $(window).width(),
        windowHeight = $(window).height();

    //margins
    var deckMargin = {
        left: parseInt($deck.css('margin-left')),
        right: parseInt($deck.css('margin-right')),
        top: parseInt($deck.css('margin-top')),
        bottom: parseInt($deck.css('margin-bottom'))
    };
    var cardMargin = {
        left: parseFloat($deck.find(settings.items + ':nth-child(2)').css('margin-left')),
        right: parseFloat($deck.find(settings.items + ':nth-child(2)').css('margin-right')),
        top: parseFloat($deck.find(settings.items + ':nth-child(2)').css('margin-top')),
        bottom: parseFloat($deck.find(settings.items + ':nth-child(2)').css('margin-bottom'))
    };


    getCardMeasures();

    setDeckPosition();

    fillDeck();

    renderDeck();

    //events
    $deck.on('touchstart',$deck , function(e){
        holdDeck(e);
        $.event.trigger({
            type: 'deckPressed'
        });
        $deck.find('.activeCard').addClass('pressedCard');
    });
    $deck.on('touchmove',$deck , function(e){
        deckard.moving = true;
        dragDeck(e);
        $.event.trigger({
            type: "deckDragged"
        });
    });
    $deck.on('touchend',document, function(){
        releaseDeck();
        nestCard(deckard.activeCard - 1);
        $deck.find('.pressedCard').removeClass('pressedCard');
        $.event.trigger({
            type: 'deckRelieved'
        });
    });
    //INNER LIBRARY
    //function makeEndless() {
    //    deckard.deck.push(deckard.deck[0]);
    //    deckard.deck.shift();
    //    deckard.updateDeck();
    //}
    function fillDeck() {
        //filling our deck with predefined cards
        $deck.find(settings.items).each(function(i){
            var card = {
                el: $(this).clone(),
                id: i
            };
            card.el.attr('data-card-id',i);
            deckard.deck.push(card);
        });

    }
    function setDeckPosition() {
        //adding a relative position to our deck, without messing with the css defined positions
        var deckPosition = $deck.css('position');
        if (deckPosition === 'static') {
            deckPosition = 'relative'
        }
        $deck.css({
            'position': deckPosition
        });

    }
    function getCardMeasures() {
        //creating some kind of a ruler element to measure on the retina(or high-res) phone displays
        $('body').append('<div class="cardMeasures" style="position:fixed;top:0;left:0;height:'+settings.cardHeight+';width:'+settings.cardWidth+';">');
        var $cardMeasures = $('.cardMeasures');
        $cardMeasures.css({
            'position': 'fixed',
            'height' : settings.cardHeight,
            'width' : settings.cardWidth
        });

        //card measurements,
        settings.cardHeight = $cardMeasures.height();
        settings.cardWidth = $cardMeasures.width();
        //and removing the ruler from dom
        $cardMeasures.remove();

    }
    function renderDeck() {
        if (settings.deckStyle === 'open' ) {

            //emptied the deck
            $deck.html('');

            //put our wrapper in it
            $deck.append('<div class="deckWrapper">');
            $wrapper = $deck.find('.deckWrapper');
            $wrapper.css({
                'position': 'absolute',
                'webkit-user-select': 'none'
            });

            //define the layout for our deck and wrapper. And link it to an object dependant on the direction of our cards
            if (settings.direction === 'vertical') {
                $deck.css({
                    'width': settings.cardWidth + cardMargin.left + cardMargin.right,
                    'height': windowHeight,
                    'overflow-y' : 'hidden',
                    'margin-top':  '0',
                    'margin-bottom': '0',
                    'box-sizing': 'border-box',
                    'padding-top': deckMargin.top +'px',
                    'padding-bottom': deckMargin.bottom +'px'
                });
                $wrapper.css({
                    'height': ((settings.cardHeight + cardMargin.bottom + cardMargin.top ) * window.deckard.deck.length) + (windowHeight - settings.cardHeight),
                    'width': settings.cardWidth
                });
                cssDirections = {
                    axis: 'Y',
                    forwardDirection: 'bottom',
                    backwardDirection: 'top',
                    cardMeasures: 'cardHeight',
                    windowMeasure: windowHeight,
                    marginMeasure: (deckMargin.top + deckMargin.bottom),
                    wrapperMeasure: $wrapper.height()
                };
            }
            else {
                $deck.css({
                    'height': settings.cardHeight + cardMargin.top + cardMargin.bottom,
                    'width': windowWidth,
                    'overflow-x' : 'hidden',
                    'margin-left':  '0',
                    'margin-right': '0',
                    'box-sizing': 'border-box',
                    'padding-left': deckMargin.left +'px',
                    'padding-right': deckMargin.right +'px'
                });
                $wrapper.css({
                    'height': settings.cardHeight,
                    'width': ((settings.cardWidth + cardMargin.left + cardMargin.right) * window.deckard.deck.length) + (windowWidth - settings.cardWidth)
                });
                cssDirections = {
                    axis: 'X',
                    forwardDirection: 'right',
                    backwardDirection: 'left',
                    cardMeasures: 'cardWidth',
                    windowMeasure: windowWidth,
                    marginMeasure: (deckMargin.left + deckMargin.right),
                    wrapperMeasure: $wrapper.width()
                };
            }

            for (var i = 0; i < deckard.deck.length; i++) {
                var thisCard = deckard.deck[i].el;
                thisCard.css({
                    'display': 'inline-block',
                    'width' : settings.cardWidth + 'px',
                    'height' : settings.cardHeight + 'px'
                });
                thisCard.css('transform','none');
                thisCard.appendTo($wrapper);
                var thisCenter = $wrapper.find(settings.items + ':nth-child('+(i+1)+')').offset();
                thisCenter.left = thisCenter.left + (settings.cardWidth/2) - deckMargin.left;
                thisCenter.top = thisCenter.top + (settings.cardHeight/2) - deckMargin.top;
                window.deckard.deck[i].center = thisCenter
                thisCard.css('transform','');
            }
            $wrapper.find(settings.items + ':nth-child('+deckard.activeCard+')').addClass('activeCard');
            if (!deckard.moving) {
                deckard.currentPosition = getCardCoordinates(deckard.activeCard - 1);
            }
            $wrapper.css({
                'transform': 'translate'+cssDirections.axis+'('+deckard.currentPosition+'px)'
            });
        }
    }
    function holdDeck(e) {
        drag = 1;
        velocity = 0;
        lastTouchState = e.originalEvent.touches[0]['page'+cssDirections.axis];
        getWrapperOrigin(settings.direction);
        firstCardState = deckard.currentPosition;
    }
    function dragDeck(e) {
        getWrapperOrigin(settings.direction);
        var firstTouchState = e.originalEvent.touches[0]['page'+cssDirections.axis];
        velocity = firstTouchState - lastTouchState;
        var touchDif =  ( velocity * settings.responsivity ) / drag;

        if (touchDif > 0) {
            deckard.dragDirection = 'backward';
        } else {
            deckard.dragDirection = 'forward';
        }
        lastTouchState = e.originalEvent.touches[0]['page'+cssDirections.axis];
        var translate = deckard.currentPosition + touchDif;

        if ( (translate >= 0 && deckard.dragDirection === 'backward') || (  (-translate) >= (cssDirections.wrapperMeasure - cssDirections.windowMeasure)) && deckard.dragDirection === 'forward') {
            drag = drag*2;
        } else {
            drag = 1;
        }

        $wrapper.css('transform','translate'+cssDirections.axis+'('+ translate +'px)');
        $.event.trigger({
            type: "deckMoving"
        });
        getWrapperOrigin(settings.direction);
        getCardDistance();
        changeActiveCard(translate);
    }
    function releaseDeck() {
        if (Math.abs(velocity) > settings.escapeVelocity && $('.pressedCard').hasClass('activeCard') && deckard.moving !== 'nesting') {
            if (velocity > 0 && deckard.activeCard > 1) {
                deckard.activeCard = deckard.activeCard - 1;
            } else if (velocity < 0 && deckard.activeCard < deckard.deck.length) {
                deckard.activeCard = deckard.activeCard + 1;
            }
        }

    }
    function changeActiveCard(translate) {
        var proximities = [];
        for (var i = 0; i < deckard.deck.length; i++) {
            var center = deckard.deck[i].center;
            if ((center[cssDirections.backwardDirection] - (-translate) > 0 )) {
                var thisProximity = {
                    id: i,
                    distance: center[cssDirections.backwardDirection] - (-translate)
                };
                proximities.push(thisProximity);
            }
        }
        if (proximities.length > 0) {
            if (deckard.activeCard > (proximities[0].id + 1) ) {
                $.event.trigger({
                    type: 'previousCard'
                });
            } else if (deckard.activeCard < (proximities[0].id + 1)) {
                $.event.trigger({
                    type: 'nextCard'
                });
            }
            deckard.activeCard = (proximities[0].id + 1);



        } else {
            deckard.activeCard = window.deckard.deck.length;
        }
        $wrapper.find(settings.items + '').removeClass('activeCard nextCard previousCard');
        $wrapper.find(settings.items + ':nth-child('+deckard.activeCard+')').addClass('activeCard');
        $wrapper.find(settings.items + ':nth-child('+(deckard.activeCard - 1)+')').addClass('previousCard');
        $wrapper.find(settings.items + ':nth-child('+(deckard.activeCard + 1)+')').addClass('nextCard');
    }
    function nestCard(cardNumber) {
        $wrapper.css({
            'transition': 'all '+settings.speed+'ms'
        });
        deckard.moving = 'nesting';
        var pos = getCardCoordinates(cardNumber);
        setTimeout(function(){
            $wrapper.css('transform','translate'+cssDirections.axis+'('+ pos +'px)');
            changeActiveCard(pos);
            setTimeout(function(){
                $wrapper.css('transition','');
                deckard.moving = false;
                $.event.trigger({
                    type: 'deckNested'
                });
            },settings.speed)
        },2);
        //keep taking variables while freely animating
        var steps = settings.speed/16;
        var step = 1;
        var distanceInterval = setInterval(function(){
            if (step < steps) {
                getWrapperOrigin(settings.direction);
                getCardDistance();
                $.event.trigger({
                    type: "deckMoving"
                });
                step++;
            } else {
                clearInterval(distanceInterval);
            }
        },16);


        getWrapperOrigin(settings.direction);
    }
    function getCardCoordinates(cardNumber) {
        return -(deckard.deck[cardNumber].center[cssDirections.backwardDirection] - (settings[cssDirections.cardMeasures]/2));
    }
    function getCardDistance() {
        deckard.currentDistance = (-deckard.currentPosition) + getCardCoordinates(deckard.activeCard - 1);
        deckard.distanceRatio = deckard.currentDistance / ((cssDirections.windowMeasure - cssDirections.marginMeasure) /2 );
    }
    function getWrapperOrigin(originDirection) {
        var transformValues =  $wrapper.css('transform').split(',');
        if ( $wrapper.css('transform') === 'none') {
            var thisWrapperOrigin = {
                vertical: 0,
                horizontal: 0
            }
        } else {
            var thisWrapperOrigin = {
                vertical : parseFloat(transformValues[5]),
                horizontal: parseFloat(transformValues[4])
            };
        }
        deckard.currentPosition = thisWrapperOrigin[originDirection];
        deckard.positionRatio =  ((-(deckard.currentPosition) ) /  (cssDirections.wrapperMeasure - cssDirections.windowMeasure));
    }

    deckard.updateDeck = function() {
        getWrapperOrigin(settings.direction);
        for (var i = 0; i < deckard.deck.length; i++) {
            var thisCard = deckard.deck[i];
            if (typeof thisCard.id === 'undefined') {
                var newCard = {
                    center: 0,
                    el: thisCard
                };
                newCard.id = deckard.deck.length + i;
                newCard.el.attr('data-card-id', newCard.id);
                deckard.deck.splice(i, 1);
                deckard.deck.push(newCard);
            }
        }
        if (deckard.moving === 'nesting') {
            $(window).on('deckNested', document, function(){
                renderDeck();
            });
        } else {
            renderDeck();
        }
    }
};

