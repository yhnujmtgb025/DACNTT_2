
// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementsByClassName("action-icon");
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("cancelList")[0];
// When the user clicks the button, open the modal 
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
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}


// get input
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


  


