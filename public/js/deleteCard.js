// scroll by button
var opa = document.getElementById('prev')
var ola = document.getElementById('next')
var container = document.getElementById('list');
var scrollBar = document.getElementById('scrollBar');
var x ;
var x1;
var temp;
function slide(direction){
  
  scrollCompleted = 0;

  var slideVar = setInterval(function(){
      if(direction == 'left'){  
          container.scrollLeft -= 58;
          x = container.scrollLeft 
          if(x==0){
            opa.style.opacity = "0";
          }else if(x<1300){
            ola.style.opacity = "0.2";
          }
      } else {
        container.scrollLeft += 58;
        x1 = container.scrollLeft 
        if( x1 > 1300){
          ola.style.opacity = "0";

        }else{
          opa.style.opacity = "0.2";
          ola.style.opacity = "0.2";
        }  
      }
      scrollCompleted += 10;
      if(scrollCompleted >= 100){
          window.clearInterval(slideVar);
      }
  }, 45);
}


// delete Card suggested
$(document).ready(function(){
  if ( $('#list ul li').length > 3 ) {
      ola.style.opacity = "0.2";
  }else{
    ola.style.opacity = "0";
  }
  $(".close").click(function(){
   $(this).parent().parent().remove();
   if ( $('#list ul li').length > 3 ) {
    ola.style.opacity = "0.2";
  }else if($('#list ul li').length == 0){
    scrollBar.style.display = "none";
  }else{
    scrollBar.classList.toggle("show");
    opa.style.opacity = "0";
    ola.style.opacity = "0";
  }
  });
});
