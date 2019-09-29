db.objects.find({type: "Group"}).forEach(function(d) {
  if(typeof d.icon !== 'string') {
    return;
  }
  d.icon = {
    type: 'Image',
    mediaType: 'image/jpeg',
    url: d.icon
  };
  db.objects.save(d);
});
