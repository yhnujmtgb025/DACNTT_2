// scroll by button
$('.next-prev').each(function(){
  $(this).click(function(){
    var id = $(this).attr('id');
    if(id=="next"){
      $('#scroll').append($('#scroll').find('li:first-child'));     
    } else {
      $('#scroll').prepend($('#scroll').find('li:last-child')); 
    }
  })
})


// delete Card suggested
$(document).ready(function(){
  $(".close").click(function(){
   $(this).parent().parent().remove();
  });
});
