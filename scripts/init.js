// Initialize all JavaScript listeners here
$("#board_width").bind("change", NewGame);
$("#creature_curiosity").bind("change", function(event){UpdateCuriosity(event.value);});
$("#newGame").bind("click", NewGame);
$("#moveCreatures").bind("click", MoveCreatures);
$("#stopCreatures").bind("click", StopCreatures);
$("#randomMap").bind("click", RandomMap);
