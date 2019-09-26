db.objects.find({type: "Group"}).forEach(function(d){
  d.id = d.id.toLowerCase();
  db.objects.save(d);
});