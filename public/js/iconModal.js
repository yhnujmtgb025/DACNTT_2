
// handle modal card

var modal = document.getElementById("myModal"); // Get the modal card
var btn = document.getElementsByClassName("action-icon"); // Get the button that opens the modal
var span = document.getElementsByClassName("cancelList")[0]; // Get the <span> element that closes the modal
// When the user clicks the button, open the modal card
for(var i = 0; i < btn.length; i++) {
  (function(index) {
    btn[index].addEventListener("click", function(e) {
      modal.style.display = "block";
     })
  })(i);
}
// When the user clicks on button cancle the modal
span.onclick = function() {
  modal.style.display = "none";
}


// handle modal profile
var myProfile = document.getElementById("modalProfile");    // modal icon profile
const coverPro = document.querySelector('.coverPro');
var btnIcon = document.getElementById("iconProfile");  // icon profile
var nav = document.getElementById("navColor");  // nav 
var feed = document.getElementById("Newfeed");  // card
var rightCard = document.getElementById("rightCard");  // right card
var t = 0;
var c = 0;

// click icon profile, open modal 
btnIcon.addEventListener("click", function(e) {
  if(coverPro.classList.contains('show')){
    myProfile.classList.remove('show')
  }else{
    myProfile.classList.add('show') 
  }
},true)


 // When the user clicks anywhere outside of the modal or body, close it
window.onclick = function(event) {
  if (event.target == modal || event.target == document.body || event.target == nav) {
    nav.style.zIndex= "1";
    feed.style.zIndex = "0";
    modal.style.display = "none";
    myProfile.classList.remove('show')
  }
}

// handle textarea card
const messageEle =  document.getElementsByClassName('textComment');
const btnOpa = document.getElementsByClassName("btnOpacity")

for(var i = 0; i < messageEle.length; i++) {
  (function(index) {
  
    messageEle[index].addEventListener("input", function(e) {
        const target = e.target;

        // Get the `maxlength` attribute
        const maxLength = target.getAttribute('maxlength');
          
        // Count the current number of characters
        const currentLength = target.value.length;

        for (var j= 0; j < btnOpa.length; ++j) {
          if(currentLength > 0){
            btnOpa[index].style.opacity = "1";
          }else{
            btnOpa[index].style.opacity = "0.3";
          }
         
        }

    
     })
  })(i);
}



// fill color icon nav
const home = document.getElementById("house")
const plan = document.getElementById("plan")
const compass = document.getElementById("compass")
const heart = document.getElementById("heart")





