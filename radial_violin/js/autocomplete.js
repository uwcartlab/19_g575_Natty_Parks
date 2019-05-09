//source code from: https://www.w3schools.com/howto/howto_js_autocomplete.asp

$("div.autocomplete").html("\
  <form name = 'search'>\
    <div id = 'input'><input id='myInput' type='text' name='park' placeholder='Search for a Park'> </div>\
  </form>");



  var parks = [
  "Olympic National Park",
  "Acadia National Park",
  "Everglades National Park",
  "Great Smoky Mountains National Park",
  "Redwood National Park",
  "Shenandoah National Park",
  "Bryce Canyon National Park",
  "Yellowstone National Park",
  "Sequoia National Park",
  "Channel Islands National Park",
  "Canyonlands National Park",
  "Kings Canyon National Park",
  "Capitol Reef National Park",
  "Joshua Tree National Park",
  "Pinnacles National Park",
  "Death Valley National Park",
  "Lassen Volcanic National Park",
  "Badlands National Park",
  "Mount Rainier National Park",
  "Yosemite National Park",
  "Haleakala National Park",
  "Carlsbad Caverns National Park",
  "Zion National Park",
  "Crater Lake National Park",
  "Glacier National Park",
  "Saguaro National Park",
  "Grand Teton National Park",
  "Petrified Forest National Park",
  "Big Bend National Park",
  "Rocky Mountain National Park",
  "Arches National Park",
  "Grand Canyon National Park",
  "Mesa Verde National Park",
  "Virgin Islands National Park",
  "Hawai'i Volcanoes National Park",
  "Cuyahoga Valley National Park",
  "Glacier Bay National Park",
  "Denali National Park"
];

  //search & autocomplete feature
  //inp: what user has currently typed in
  //arr: the array of possible values
  function search(inp, arr) {
    var currentFocus;
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                if (inp.value != "") makeMap(inp.value);
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });

  }

window.onload(search(document.getElementById("myInput"), parks));