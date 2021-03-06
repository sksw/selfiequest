$('body').on('pagecontainershow', function() {
  $('#galleryList').infinitescroll({
      // required options
      navElement: '#nextPage',
      itemsToLoad: '.selfie'
  }, function(){
      // optional callback function
      $('#galleryList').listview('refresh');
      $('#galleryList').trigger('create');
      var dataID = null;

      
      $('.deleteButton').off('click');
      $('.deleteButton').on('click', function() {
        dataID = $(this).attr('data-value');
        $('#confirmPopup').popup('open');
      });
      
      
      $('#deleteConfirm').off('click');
      $('#deleteConfirm').on('click', function() {
        $.post('/deleteSelfie', { id: dataID },  function(response) {
          $('div[data-value="' + dataID +'"]').fadeOut(function() { $(this).remove(); });
          $('#confirmPopup').popup('close');
        });
      });
  });
});
