$(".gallery-img").magnificPopup({
    delegate: 'a',
    type: 'image',
    gallery:{
      enabled: true
    }
  });

 
        // update photo
        function uploadImage() {
            var data = new FormData();
            $.each($('#file')[0].files, function (i, file) {
                data.append('file-', file);
            });
            console.log($("#file").files)
            var ajax = new XMLHttpRequest();
            ajax.open("POST", "/myProfile/changePhoto", true);

            ajax.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                
                  var response = JSON.parse(this.responseText);
      
                  $("#photo").attr("src", response.data);

                
                }
            };
            
            ajax.send(data);

            return false;
        }                                                                                               
 
    

    


