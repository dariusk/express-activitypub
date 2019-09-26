db.objects.find({type: "Group"}).forEach(function(d){
  d.id = d.id.toLowerCase();
  db.objects.save(d);
});
db.streams.find({"_meta._target": {$ne: null}}).forEach(function(d){
  d._meta._target = d._meta._target.toLowerCase();
  db.objects.save(d);
});
db.streams.find({actor: /gup\.pe/}).forEach(function(d){
  d.actor = d.actor.toLowerCase();
  db.streams.save(d);
});
