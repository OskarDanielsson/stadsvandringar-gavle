$(function() {
$('#instructions').trigger('play');
});
(function (interact) {

    'use strict';
    var startPos = null;
    var transformProp;
    var correct = 0;
    var draggables = {
        "drag1" : false, 
        "drag2" : false, 
        "drag3" : false,
        "drag5" : false,
        "drag6" : false,
        "drag7" : false,
        "drag8" : false,
        "drag9" : false
    };
        
    interact.maxInteractions(Infinity);

    var startPos = null;

    interact('.draggable').draggable({
        inertia:true,
      snap: {
        targets: [startPos],
        range: Infinity,
        relativePoints: [ { x: 0.5, y: 0.5 } ],
        endOnly: true
      },
      onstart: function (event) {
          var rect = interact.getElementRect(event.target);

          // record center point when starting the very first a drag
          startPos = {
            x: rect.left + rect.width  / 2,
            y: rect.top  + rect.height / 2
          }

        event.interactable.draggable({
          snap: {
            targets: [startPos]
          }
        });
      },
      // call this function on every dragmove event
      onmove: function (event) {
        var target = event.target,
            // keep the dragged position in the data-x/data-y attributes
            x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
            y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        // translate the element
        target.style.webkitTransform =
        target.style.transform =
          'translate(' + x + 'px, ' + y + 'px)';

        // update the posiion attributes
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
        target.classList.add('getting--dragged');
      },
      onend: function (event) {
        event.target.classList.remove('getting--dragged')
      }
    });

    
    setupDropzone('#drop1', 'drag1');

    setupDropzone('#drop2', 'drag2');
    setupDropzone('#drop3', 'drag3');
    setupDropzone('#drop4', 'drag4');
    setupDropzone('#drop5', 'drag5');
    setupDropzone('#drop6', 'drag6');
    setupDropzone('#drop7', 'drag7');
    setupDropzone('#drop8', 'drag8');
    setupDropzone('#drop9', 'drag9'); 


    /**
     * Setup a given element as a dropzone.
     *
     * @param {HTMLElement|String} el
     * @param {String} accept
     */
    function setupDropzone(el, accept) {
        interact(el)
            .dropzone({accept: '.draggable',
                      overlap: 'center',
    ondropactivate: function (event) {
        
      },
      ondragenter: function (event) {
          console.log(event.target.classList.value);
          if ( !event.target.classList.value.includes("has-object") ){
              
        var draggableElement = event.relatedTarget,
            dropzoneElement  = event.target,
            dropRect         = interact.getElementRect(dropzoneElement),
            dropCenter       = {
              x: dropRect.left + dropRect.width  / 2,
              y: dropRect.top  + dropRect.height / 2
            };

        event.draggable.draggable({
          snap: {
            targets: [dropCenter]
          }
        });
          }
      },
      ondragleave: function (event) {
          
        //Oskar - kör droppedObject
        droppedObject(event.relatedTarget.id, accept ,false);  
  
        event.target.classList.remove('has-object-'+event.relatedTarget.id);
      },
      ondrop: function (event) {
          // Makes sure you can't drop two objects on the same dropzone
          event.target.classList.add("has-object-"+event.relatedTarget.id);
          droppedObject(event.relatedTarget.id, accept ,true);
        //event.relatedTarget.textContent = 'Dropped';
      },
      ondropdeactivate: function (event) {

      }
    });
    
  
               interact('.org-pos')
            .dropzone({accept: '.draggable',
                      overlap: 'center',
    ondropactivate: function (event) {},
      ondragenter: function (event) {
        var draggableElement = event.relatedTarget,
            dropzoneElement  = event.target,
            dropRect         = interact.getElementRect(dropzoneElement),
            dropCenter       = {
              x: dropRect.left + dropRect.width  / 2,
              y: dropRect.top  + dropRect.height / 2
            };

        event.draggable.draggable({
          snap: {
            targets: [dropCenter]
          }
        });

      },
      ondragleave: function (event) {},
      ondrop: function (event) {},
      ondropdeactivate: function (event) {

      }});
    
    
    function droppedObject( drag, accept ,bool ){
        
        if (!draggables[drag] && bool && drag === accept){
                    correct++;
                    console.log("moar",correct);
        } else if (draggables[drag] && !bool && drag === accept){
            correct--;
            console.log("less",correct);
        }
        draggables[drag] = bool;
        if (correct===9){
                parent.clearedInteraction();
        }
    }
    

    function addClass (element, className) {
        if (element.classList) {
            return element.classList.add(className);
        }
        else {
            element.className += ' ' + className;
        }
    }

    function removeClass (element, className) {
        if (element.classList) {
            return element.classList.remove(className);
        }
        else {
            element.className = element.className.replace(new RegExp(className + ' *', 'g'), '');
        }
    }

    interact(document).on('ready', function () {
        
        transformProp = 'transform' in document.body.style
            ? 'transform': 'webkitTransform' in document.body.style
            ? 'webkitTransform': 'mozTransform' in document.body.style
            ? 'mozTransform': 'oTransform' in document.body.style
            ? 'oTransform': 'msTransform' in document.body.style
            ? 'msTransform': null;
    });

    
    
    
    
    //temp 
    
    function getNodeIndex(node) {
    var index = 0;
    while ( (node = node.previousSibling) ) {
      if (node.nodeType != 3 || !/^\s*$/.test(node.data)) {
        index++;
      }
    }
    return index;
  }

  function eleHasClass(el, cls) {
    return el.className && new RegExp("(\\s|^)" + cls + "(\\s|$)").test(el.className);
  }
    
    
    }
    
    
    
}(window.interact));
