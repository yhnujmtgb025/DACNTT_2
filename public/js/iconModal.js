
// handle modal card
var modal = document.getElementById("myModal"); // Get the modal card
var modCon = document.getElementById("modCon"); // Get the id modal content 
var btn = document.getElementsByClassName("action-icon"); // Get the button that opens the modal
var span = document.getElementsByClassName("cancelList")[0]; // Get the <span> element that closes the modal

// When the user clicks the button, open the modal card
for(var i = 0; i < btn.length; i++) {
  (function(index) {
    btn[index].addEventListener("click", function(e) {
      modal.style.display = "block";
      modCon.style.display = "block";
      modal.style.opacity = "1";
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
var idContain = document.getElementById("idContain")

// click icon profile, open modal 
btnIcon.addEventListener("click", function(e) {
  if(coverPro.classList.contains('show')){
    myProfile.classList.remove('show')
  }else{
    myProfile.classList.add('show') 
    modal.style.display = "block";
    modal.style.opacity = "0";
    modCon.style.display = "none"
  }
},true)


 // When the user clicks anywhere outside of the modal or body, close it
window.onclick = function(event) {
  if (event.target == modal || event.target == nav ) {

    modal.style.display = "none";
    myProfile.classList.remove('show')
    modCon.style.display = "none"
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

$('.topnav-right a').click(function() {
  var id = $(this).attr("id")
  console.log("id "+id)
  if(id=="a1"){
    $("#t1").attr("d","M45.5 48H30.1c-.8 0-1.5-.7-1.5-1.5V34.2c0-2.6-2.1-4.6-4.6-4.6s-4.6 2.1-4.6 4.6v12.3c0 .8-.7 1.5-1.5 1.5H2.5c-.8 0-1.5-.7-1.5-1.5V23c0-.4.2-.8.4-1.1L22.9.4c.6-.6 1.6-.6 2.1 0l21.5 21.5c.3.3.4.7.4 1.1v23.5c.1.8-.6 1.5-1.4 1.5z")
    $("#t2").attr("d","M 47.8 3.8 c -0.3 -0.5 -0.8 -0.8 -1.3 -0.8 h -45 C 0.9 3.1 0.3 3.5 0.1 4 S 0 5.2 0.4 5.7 l 15.9 15.6 l 5.5 22.6 c 0.1 0.6 0.6 1 1.2 1.1 h 0.2 c 0.5 0 1 -0.3 1.3 -0.7 l 23.2 -39 c 0.4 -0.4 0.4 -1 0.1 -1.5 Z M 5.2 6.1 h 35.5 L 18 18.7 L 5.2 6.1 Z m 18.7 33.6 l -4.4 -18.4 L 42.4 8.6 L 23.9 39.7 Z")
    $("#t3").attr("d","M 24 0 C 10.8 0 0 10.8 0 24 s 10.8 24 24 24 s 24 -10.8 24 -24 S 37.2 0 24 0 Z m 0 45 C 12.4 45 3 35.6 3 24 S 12.4 3 24 3 s 21 9.4 21 21 s -9.4 21 -21 21 Z m 10.2 -33.2 l -14.8 7 c -0.3 0.1 -0.6 0.4 -0.7 0.7 l -7 14.8 c -0.3 0.6 -0.2 1.3 0.3 1.7 c 0.3 0.3 0.7 0.4 1.1 0.4 c 0.2 0 0.4 0 0.6 -0.1 l 14.8 -7 c 0.3 -0.1 0.6 -0.4 0.7 -0.7 l 7 -14.8 c 0.3 -0.6 0.2 -1.3 -0.3 -1.7 c -0.4 -0.5 -1.1 -0.6 -1.7 -0.3 Z m -7.4 15 l -5.5 -5.5 l 10.5 -5 l -5 10.5 Z")
    $("#t4").attr("d","M 34.6 6.1 c 5.7 0 10.4 5.2 10.4 11.5 c 0 6.8 -5.9 11 -11.5 16 S 25 41.3 24 41.9 c -1.1 -0.7 -4.7 -4 -9.5 -8.3 c -5.7 -5 -11.5 -9.2 -11.5 -16 C 3 11.3 7.7 6.1 13.4 6.1 c 4.2 0 6.5 2 8.1 4.3 c 1.9 2.6 2.2 3.9 2.5 3.9 c 0.3 0 0.6 -1.3 2.5 -3.9 c 1.6 -2.3 3.9 -4.3 8.1 -4.3 m 0 -3 c -4.5 0 -7.9 1.8 -10.6 5.6 c -2.7 -3.7 -6.1 -5.5 -10.6 -5.5 C 6 3.1 0 9.6 0 17.6 c 0 7.3 5.4 12 10.6 16.5 c 0.6 0.5 1.3 1.1 1.9 1.7 l 2.3 2 c 4.4 3.9 6.6 5.9 7.6 6.5 c 0.5 0.3 1.1 0.5 1.6 0.5 c 0.6 0 1.1 -0.2 1.6 -0.5 c 1 -0.6 2.8 -2.2 7.8 -6.8 l 2 -1.8 c 0.7 -0.6 1.3 -1.2 2 -1.7 C 42.7 29.6 48 25 48 17.6 c 0 -8 -6 -14.5 -13.4 -14.5 Z")
  }
  else if(id=="a2"){
    $("#t2").attr("d", "M 47.8 3.8 c -0.3 -0.5 -0.8 -0.8 -1.3 -0.8 h -45 C 0.9 3.1 0.3 3.5 0.1 4 S 0 5.2 0.4 5.7 l 13.2 13 c 0.5 0.4 1.1 0.6 1.7 0.3 l 16.6 -8 c 0.7 -0.3 1.6 -0.1 2 0.5 c 0.4 0.7 0.2 1.6 -0.5 2 l -15.6 9.9 c -0.5 0.3 -0.8 1 -0.7 1.6 l 4.6 19 c 0.1 0.6 0.6 1 1.2 1.1 h 0.2 c 0.5 0 1 -0.3 1.3 -0.7 l 23.2 -39 c 0.5 -0.5 0.5 -1.1 0.2 -1.6 Z");
    $("#t1").attr("d","M 45.3 48 H 30 c -0.8 0 -1.5 -0.7 -1.5 -1.5 V 34.2 c 0 -2.6 -2 -4.6 -4.6 -4.6 s -4.6 2 -4.6 4.6 v 12.3 c 0 0.8 -0.7 1.5 -1.5 1.5 H 2.5 c -0.8 0 -1.5 -0.7 -1.5 -1.5 V 23 c 0 -0.4 0.2 -0.8 0.4 -1.1 L 22.9 0.4 c 0.6 -0.6 1.5 -0.6 2.1 0 l 21.5 21.5 c 0.4 0.4 0.6 1.1 0.3 1.6 c 0 0.1 -0.1 0.1 -0.1 0.2 v 22.8 c 0.1 0.8 -0.6 1.5 -1.4 1.5 Z m -13.8 -3 h 12.3 V 23.4 L 24 3.6 l -20 20 V 45 h 12.3 V 34.2 c 0 -4.3 3.3 -7.6 7.6 -7.6 s 7.6 3.3 7.6 7.6 V 45 Z")
    $("#t3").attr("d","M 24 0 C 10.8 0 0 10.8 0 24 s 10.8 24 24 24 s 24 -10.8 24 -24 S 37.2 0 24 0 Z m 0 45 C 12.4 45 3 35.6 3 24 S 12.4 3 24 3 s 21 9.4 21 21 s -9.4 21 -21 21 Z m 10.2 -33.2 l -14.8 7 c -0.3 0.1 -0.6 0.4 -0.7 0.7 l -7 14.8 c -0.3 0.6 -0.2 1.3 0.3 1.7 c 0.3 0.3 0.7 0.4 1.1 0.4 c 0.2 0 0.4 0 0.6 -0.1 l 14.8 -7 c 0.3 -0.1 0.6 -0.4 0.7 -0.7 l 7 -14.8 c 0.3 -0.6 0.2 -1.3 -0.3 -1.7 c -0.4 -0.5 -1.1 -0.6 -1.7 -0.3 Z m -7.4 15 l -5.5 -5.5 l 10.5 -5 l -5 10.5 Z")
    $("#t4").attr("d","M 34.6 6.1 c 5.7 0 10.4 5.2 10.4 11.5 c 0 6.8 -5.9 11 -11.5 16 S 25 41.3 24 41.9 c -1.1 -0.7 -4.7 -4 -9.5 -8.3 c -5.7 -5 -11.5 -9.2 -11.5 -16 C 3 11.3 7.7 6.1 13.4 6.1 c 4.2 0 6.5 2 8.1 4.3 c 1.9 2.6 2.2 3.9 2.5 3.9 c 0.3 0 0.6 -1.3 2.5 -3.9 c 1.6 -2.3 3.9 -4.3 8.1 -4.3 m 0 -3 c -4.5 0 -7.9 1.8 -10.6 5.6 c -2.7 -3.7 -6.1 -5.5 -10.6 -5.5 C 6 3.1 0 9.6 0 17.6 c 0 7.3 5.4 12 10.6 16.5 c 0.6 0.5 1.3 1.1 1.9 1.7 l 2.3 2 c 4.4 3.9 6.6 5.9 7.6 6.5 c 0.5 0.3 1.1 0.5 1.6 0.5 c 0.6 0 1.1 -0.2 1.6 -0.5 c 1 -0.6 2.8 -2.2 7.8 -6.8 l 2 -1.8 c 0.7 -0.6 1.3 -1.2 2 -1.7 C 42.7 29.6 48 25 48 17.6 c 0 -8 -6 -14.5 -13.4 -14.5 Z")
  }else if(id=="a3"){
    $("#t3").attr("d","M 24 0 C 10.8 0 0 10.8 0 24 s 10.8 24 24 24 s 24 -10.8 24 -24 S 37.2 0 24 0 Z m 12.2 13.8 l -7 14.8 c -0.1 0.3 -0.4 0.6 -0.7 0.7 l -14.8 7 c -0.2 0.1 -0.4 0.1 -0.6 0.1 c -0.4 0 -0.8 -0.2 -1.1 -0.4 c -0.4 -0.4 -0.6 -1.1 -0.3 -1.7 l 7 -14.8 c 0.1 -0.3 0.4 -0.6 0.7 -0.7 l 14.8 -7 c 0.6 -0.3 1.3 -0.2 1.7 0.3 c 0.5 0.4 0.6 1.1 0.3 1.7 Z m -15 7.4 l -5 10.5 l 10.5 -5 l -5.5 -5.5 Z")
    $("#t1").attr("d","M 45.3 48 H 30 c -0.8 0 -1.5 -0.7 -1.5 -1.5 V 34.2 c 0 -2.6 -2 -4.6 -4.6 -4.6 s -4.6 2 -4.6 4.6 v 12.3 c 0 0.8 -0.7 1.5 -1.5 1.5 H 2.5 c -0.8 0 -1.5 -0.7 -1.5 -1.5 V 23 c 0 -0.4 0.2 -0.8 0.4 -1.1 L 22.9 0.4 c 0.6 -0.6 1.5 -0.6 2.1 0 l 21.5 21.5 c 0.4 0.4 0.6 1.1 0.3 1.6 c 0 0.1 -0.1 0.1 -0.1 0.2 v 22.8 c 0.1 0.8 -0.6 1.5 -1.4 1.5 Z m -13.8 -3 h 12.3 V 23.4 L 24 3.6 l -20 20 V 45 h 12.3 V 34.2 c 0 -4.3 3.3 -7.6 7.6 -7.6 s 7.6 3.3 7.6 7.6 V 45 Z")
    $("#t2").attr("d","M 47.8 3.8 c -0.3 -0.5 -0.8 -0.8 -1.3 -0.8 h -45 C 0.9 3.1 0.3 3.5 0.1 4 S 0 5.2 0.4 5.7 l 15.9 15.6 l 5.5 22.6 c 0.1 0.6 0.6 1 1.2 1.1 h 0.2 c 0.5 0 1 -0.3 1.3 -0.7 l 23.2 -39 c 0.4 -0.4 0.4 -1 0.1 -1.5 Z M 5.2 6.1 h 35.5 L 18 18.7 L 5.2 6.1 Z m 18.7 33.6 l -4.4 -18.4 L 42.4 8.6 L 23.9 39.7 Z")
    $("#t4").attr("d","M 34.6 6.1 c 5.7 0 10.4 5.2 10.4 11.5 c 0 6.8 -5.9 11 -11.5 16 S 25 41.3 24 41.9 c -1.1 -0.7 -4.7 -4 -9.5 -8.3 c -5.7 -5 -11.5 -9.2 -11.5 -16 C 3 11.3 7.7 6.1 13.4 6.1 c 4.2 0 6.5 2 8.1 4.3 c 1.9 2.6 2.2 3.9 2.5 3.9 c 0.3 0 0.6 -1.3 2.5 -3.9 c 1.6 -2.3 3.9 -4.3 8.1 -4.3 m 0 -3 c -4.5 0 -7.9 1.8 -10.6 5.6 c -2.7 -3.7 -6.1 -5.5 -10.6 -5.5 C 6 3.1 0 9.6 0 17.6 c 0 7.3 5.4 12 10.6 16.5 c 0.6 0.5 1.3 1.1 1.9 1.7 l 2.3 2 c 4.4 3.9 6.6 5.9 7.6 6.5 c 0.5 0.3 1.1 0.5 1.6 0.5 c 0.6 0 1.1 -0.2 1.6 -0.5 c 1 -0.6 2.8 -2.2 7.8 -6.8 l 2 -1.8 c 0.7 -0.6 1.3 -1.2 2 -1.7 C 42.7 29.6 48 25 48 17.6 c 0 -8 -6 -14.5 -13.4 -14.5 Z")
  }
  else{
    $("#t1").attr("d","M 45.3 48 H 30 c -0.8 0 -1.5 -0.7 -1.5 -1.5 V 34.2 c 0 -2.6 -2 -4.6 -4.6 -4.6 s -4.6 2 -4.6 4.6 v 12.3 c 0 0.8 -0.7 1.5 -1.5 1.5 H 2.5 c -0.8 0 -1.5 -0.7 -1.5 -1.5 V 23 c 0 -0.4 0.2 -0.8 0.4 -1.1 L 22.9 0.4 c 0.6 -0.6 1.5 -0.6 2.1 0 l 21.5 21.5 c 0.4 0.4 0.6 1.1 0.3 1.6 c 0 0.1 -0.1 0.1 -0.1 0.2 v 22.8 c 0.1 0.8 -0.6 1.5 -1.4 1.5 Z m -13.8 -3 h 12.3 V 23.4 L 24 3.6 l -20 20 V 45 h 12.3 V 34.2 c 0 -4.3 3.3 -7.6 7.6 -7.6 s 7.6 3.3 7.6 7.6 V 45 Z")
    $("#t2").attr("d","M 47.8 3.8 c -0.3 -0.5 -0.8 -0.8 -1.3 -0.8 h -45 C 0.9 3.1 0.3 3.5 0.1 4 S 0 5.2 0.4 5.7 l 15.9 15.6 l 5.5 22.6 c 0.1 0.6 0.6 1 1.2 1.1 h 0.2 c 0.5 0 1 -0.3 1.3 -0.7 l 23.2 -39 c 0.4 -0.4 0.4 -1 0.1 -1.5 Z M 5.2 6.1 h 35.5 L 18 18.7 L 5.2 6.1 Z m 18.7 33.6 l -4.4 -18.4 L 42.4 8.6 L 23.9 39.7 Z")
    $("#t3").attr("d","M 24 0 C 10.8 0 0 10.8 0 24 s 10.8 24 24 24 s 24 -10.8 24 -24 S 37.2 0 24 0 Z m 0 45 C 12.4 45 3 35.6 3 24 S 12.4 3 24 3 s 21 9.4 21 21 s -9.4 21 -21 21 Z m 10.2 -33.2 l -14.8 7 c -0.3 0.1 -0.6 0.4 -0.7 0.7 l -7 14.8 c -0.3 0.6 -0.2 1.3 0.3 1.7 c 0.3 0.3 0.7 0.4 1.1 0.4 c 0.2 0 0.4 0 0.6 -0.1 l 14.8 -7 c 0.3 -0.1 0.6 -0.4 0.7 -0.7 l 7 -14.8 c 0.3 -0.6 0.2 -1.3 -0.3 -1.7 c -0.4 -0.5 -1.1 -0.6 -1.7 -0.3 Z m -7.4 15 l -5.5 -5.5 l 10.5 -5 l -5 10.5 Z")
    $("#t4").attr("d","M 34.6 3.1 c -4.5 0 -7.9 1.8 -10.6 5.6 c -2.7 -3.7 -6.1 -5.5 -10.6 -5.5 C 6 3.1 0 9.6 0 17.6 c 0 7.3 5.4 12 10.6 16.5 c 0.6 0.5 1.3 1.1 1.9 1.7 l 2.3 2 c 4.4 3.9 6.6 5.9 7.6 6.5 c 0.5 0.3 1.1 0.5 1.6 0.5 s 1.1 -0.2 1.6 -0.5 c 1 -0.6 2.8 -2.2 7.8 -6.8 l 2 -1.8 c 0.7 -0.6 1.3 -1.2 2 -1.7 C 42.7 29.6 48 25 48 17.6 c 0 -8 -6 -14.5 -13.4 -14.5 Z")
  }
});

// fill color icon heart card
$(".btnHeart").click(function(){
    var color = $(".iconHeart").attr("fill")
    if(color == "#ed4956"){
      $(this).toggleClass("ani")
      if($(this).hasClass("anime")){
        $(this).toggleClass("anime")
        $(this).toggleClass("anime")
      }else{
        $(this).toggleClass("anime")
      }
     
      $(".iconHeart").attr("d","M34.6 6.1c5.7 0 10.4 5.2 10.4 11.5 0 6.8-5.9 11-11.5 16S25 41.3 24 41.9c-1.1-.7-4.7-4-9.5-8.3-5.7-5-11.5-9.2-11.5-16C3 11.3 7.7 6.1 13.4 6.1c4.2 0 6.5 2 8.1 4.3 1.9 2.6 2.2 3.9 2.5 3.9.3 0 .6-1.3 2.5-3.9 1.6-2.3 3.9-4.3 8.1-4.3m0-3c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5.6 0 1.1-.2 1.6-.5 1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z")
      $(".iconHeart").attr("fill","#262626")
    }else{
      $(this).toggleClass("anime")
      $(this).toggleClass("ani")
      $(".iconHeart").attr("d","M 34.6 3.1 c -4.5 0 -7.9 1.8 -10.6 5.6 c -2.7 -3.7 -6.1 -5.5 -10.6 -5.5 C 6 3.1 0 9.6 0 17.6 c 0 7.3 5.4 12 10.6 16.5 c 0.6 0.5 1.3 1.1 1.9 1.7 l 2.3 2 c 4.4 3.9 6.6 5.9 7.6 6.5 c 0.5 0.3 1.1 0.5 1.6 0.5 s 1.1 -0.2 1.6 -0.5 c 1 -0.6 2.8 -2.2 7.8 -6.8 l 2 -1.8 c 0.7 -0.6 1.3 -1.2 2 -1.7 C 42.7 29.6 48 25 48 17.6 c 0 -8 -6 -14.5 -13.4 -14.5 Z")
      $(".iconHeart").attr("fill","#ed4956")
    }

})

// fill color icon save card
$(".savePost").click(function(){
  var color = $(".savePo").attr("d")
  var check = "M 43.5 48 c -0.4 0 -0.8 -0.2 -1.1 -0.4 L 24 28.9 L 5.6 47.6 c -0.4 0.4 -1.1 0.6 -1.6 0.3 c -0.6 -0.2 -1 -0.8 -1 -1.4 v -45 C 3 0.7 3.7 0 4.5 0 h 39 c 0.8 0 1.5 0.7 1.5 1.5 v 45 c 0 0.6 -0.4 1.2 -0.9 1.4 c -0.2 0.1 -0.4 0.1 -0.6 0.1 Z"
    if(color==check){  
      $(".savePo").attr("d","M43.5 48c-.4 0-.8-.2-1.1-.4L24 29 5.6 47.6c-.4.4-1.1.6-1.6.3-.6-.2-1-.8-1-1.4v-45C3 .7 3.7 0 4.5 0h39c.8 0 1.5.7 1.5 1.5v45c0 .6-.4 1.2-.9 1.4-.2.1-.4.1-.6.1zM24 26c.8 0 1.6.3 2.2.9l15.8 16V3H6v39.9l15.8-16c.6-.6 1.4-.9 2.2-.9z")
      $(".savePost").css("opacity","0.5")
    }else{
      $(".savePo").attr("d","M 43.5 48 c -0.4 0 -0.8 -0.2 -1.1 -0.4 L 24 28.9 L 5.6 47.6 c -0.4 0.4 -1.1 0.6 -1.6 0.3 c -0.6 -0.2 -1 -0.8 -1 -1.4 v -45 C 3 0.7 3.7 0 4.5 0 h 39 c 0.8 0 1.5 0.7 1.5 1.5 v 45 c 0 0.6 -0.4 1.2 -0.9 1.4 c -0.2 0.1 -0.4 0.1 -0.6 0.1 Z")
      $(".savePost").css("opacity","1")
    }
})


// const posts = document.querySelectorAll('.gallery-item');

// posts.forEach(post => {
// 	post.addEventListener('click', () => {
// 		//Get original image URL
// 		const imgUrl = post.firstElementChild.src.split("?")[0];
// 		//Open image in new tab
// 		window.open(imgUrl, '_blank');
// 	});
// });