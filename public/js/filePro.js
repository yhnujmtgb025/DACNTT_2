$(".gallery-img").magnificPopup({
    delegate: 'a',
    type: 'image',
    gallery:{
      enabled: true
    }
  });

  $( "#Flash1" ).click(function() {
    alert( "Handler for .click() called." );
    $(".alert-success").css("color","red");
  });
